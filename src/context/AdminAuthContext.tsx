import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  clearAdminSession,
  getAdminAuthMode,
  isAdminSessionActive,
  type AdminAuthMode,
} from '../lib/adminAuth'
import { ADMIN_PASSWORD, isSupabaseConfigured, requireSupabase } from '../lib/supabase'

interface AdminAuthContextValue {
  authed: boolean
  error: string
  mode: AdminAuthMode
  loginWithPassword: (password: string) => boolean
  loginWithSupabase: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  setError: (msg: string) => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(isAdminSessionActive)
  const [error, setError] = useState('')
  const mode = getAdminAuthMode()

  useEffect(() => {
    setAuthed(isAdminSessionActive())
  }, [])

  const loginWithPassword = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('sanveda_admin_session', '1')
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

      sessionStorage.setItem('sanveda_admin_session', '1')
      setAuthed(true)
      setError('')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed')
      return false
    }
  }, [])

  const signOut = useCallback(async () => {
    clearAdminSession()
    setAuthed(false)
    if (mode === 'supabase' && isSupabaseConfigured) {
      await requireSupabase().auth.signOut()
    }
  }, [mode])

  const value = useMemo(
    () => ({ authed, error, mode, loginWithPassword, loginWithSupabase, signOut, setError }),
    [authed, error, mode, loginWithPassword, loginWithSupabase, signOut],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
