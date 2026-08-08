import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { authClient } from '../lib/authClient'
import { auditAction } from '../lib/auditMiddleware'
import { endAuthSession } from '../lib/signOut'

export type AdminLoginResult = 'admin' | 'portal' | false

interface AdminAuthContextValue {
  authed: boolean
  loading: boolean
  error: string
  configured: boolean
  login: (email: string, password: string) => Promise<AdminLoginResult>
  signOut: () => Promise<void>
  setError: (msg: string) => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

async function validateAdminSession(recordLogin = false): Promise<boolean> {
  const response = await fetch('/api/admin/session', {
    method: recordLogin ? 'POST' : 'GET',
    credentials: 'include',
  })
  return response.ok
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending } = authClient.useSession()
  const location = useLocation()
  const onAdminRoute = location.pathname.startsWith('/admin')
  // Depend on a stable id — session object identity can churn and re-trigger effects.
  const sessionUserId = sessionData?.user?.id ?? null
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    // Do not probe admin APIs on public pages, and clear stale admin UI auth so
    // admin data loaders cannot keep firing after leaving /admin.
    if (!onAdminRoute) {
      setAuthed(false)
      setLoading(false)
      return
    }

    // Keep a distinct loading state while the session cookie is resolving so
    // route guards never flash AdminLogin as if the user were logged out.
    if (isPending) {
      setLoading(true)
      return
    }

    if (!sessionUserId) {
      setAuthed(false)
      setLoading(false)
      return
    }

    setLoading(true)
    const validate = async () => {
      try {
        const valid = await validateAdminSession()
        if (!cancelled) setAuthed((prev) => (prev === valid ? prev : valid))
      } catch {
        if (!cancelled) setAuthed(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void validate()
    return () => {
      cancelled = true
    }
  }, [isPending, sessionUserId, onAdminRoute])

  const login = useCallback(async (email: string, password: string): Promise<AdminLoginResult> => {
    try {
      const { data, error: signInError } = await authClient.signIn.email({ email, password })
      if (signInError) throw new Error(signInError.message)
      const userId = data?.user.id
      if (!userId) throw new Error('Sign in failed')

      if (await validateAdminSession(true)) {
        setAuthed(true)
        setError('')
        await auditAction('LOGIN', 'auth', userId, {
          email,
          user: data?.user.name?.trim() || email,
        }).catch(() => undefined)
        return 'admin'
      }

      // Volunteers/interns share Better Auth accounts but are not admin_users —
      // send them to the self-service portal instead of treating this as a hard failure.
      const { resolvePostLoginDestination } = await import('../lib/servicePortalService')
      const destination = await resolvePostLoginDestination().catch(() => 'donor' as const)
      if (destination === 'portal') {
        setAuthed(false)
        setError('')
        return 'portal'
      }

      await endAuthSession().catch(() => undefined)
      throw new Error(
        'This account does not have active admin access. Volunteers and interns can sign in at /login for My Service Portal.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed')
      return false
    }
  }, [])

  const signOut = useCallback(async () => {
    await auditAction('LOGOUT', 'auth', undefined, {}).catch(() => undefined)
    await endAuthSession()
    setAuthed(false)
    setError('')
  }, [])

  const value = useMemo(
    () => ({ authed, loading, error, configured: true, login, signOut, setError }),
    [authed, loading, error, login, signOut],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
