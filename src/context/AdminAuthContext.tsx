import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  clearAdminSession,
  getAdminAuthMode,
  isAdminSessionActive,
  setAdminSessionActive,
  type AdminAuthMode,
} from '../lib/adminAuth'
import { isDevPasswordAuthAllowed } from '../lib/persistMeta'
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase'
import { auditAction } from '../lib/auditMiddleware'

interface AdminAuthContextValue {
  authed: boolean
  loading: boolean
  error: string
  mode: AdminAuthMode
  loginWithPassword: (password: string) => boolean
  loginWithSupabase: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  setError: (msg: string) => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

async function validateSupabaseAdminSession(): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const client = requireSupabase()
  const { data: { session } } = await client.auth.getSession()
  if (!session?.user) return false
  const { data: adminRow } = await client
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()
  return Boolean(adminRow)
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mode = getAdminAuthMode()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (mode === 'supabase') {
          const valid = await validateSupabaseAdminSession()
          if (!cancelled) {
            if (valid) setAdminSessionActive()
            else clearAdminSession()
            setAuthed(valid)
          }
        } else {
          if (!cancelled) setAuthed(isAdminSessionActive())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [mode])

  const loginWithPassword = useCallback((password: string): boolean => {
    if (!isDevPasswordAuthAllowed()) {
      setError('Password login is disabled when Supabase is configured. Use admin email sign-in.')
      return false
    }
    const expected = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined
    if (expected && password === expected) {
      setAdminSessionActive()
      setAuthed(true)
      setError('')
      return true
    }
    setError('Invalid admin password')
    return false
  }, [])

  const loginWithSupabase = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const client = requireSupabase()
      const { data, error: signInError } = await client.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      const userId = data.user?.id
      if (!userId) throw new Error('Sign in failed')

      const { data: adminRow, error: adminError } = await client
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (adminError) throw adminError
      if (!adminRow) {
        await client.auth.signOut()
        throw new Error('This account does not have admin access')
      }

      setAdminSessionActive()
      setAuthed(true)
      setError('')
      await auditAction('LOGIN', 'auth', userId, { email })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed')
      return false
    }
  }, [])

  const signOut = useCallback(async () => {
    await auditAction('LOGOUT', 'auth', undefined, {})
    clearAdminSession()
    setAuthed(false)
    if (mode === 'supabase' && isSupabaseConfigured) {
      await requireSupabase().auth.signOut()
    }
  }, [mode])

  const value = useMemo(
    () => ({ authed, loading, error, mode, loginWithPassword, loginWithSupabase, signOut, setError }),
    [authed, loading, error, mode, loginWithPassword, loginWithSupabase, signOut],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
