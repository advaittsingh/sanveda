import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authClient, type ClientSession } from '../lib/authClient'
import { endAuthSession } from '../lib/signOut'

export interface AuthProfile {
  fullName: string
  phone: string
}

interface AuthContextValue {
  user: ClientSession['user'] | null
  session: ClientSession['session'] | null
  profile: AuthProfile | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string): Promise<AuthProfile | null> {
  void userId
  const response = await fetch('/api/me/profile', { credentials: 'include' })
  if (!response.ok) return null
  return response.json() as Promise<AuthProfile>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending, refetch } = authClient.useSession()
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const user = data?.user ?? null
  const session = data?.session ?? null

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    setProfile(await fetchProfile(user.id))
  }, [user])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password })
    if (error) throw new Error(error.message)
    await refetch()
  }, [refetch])

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: fullName,
    })
    if (error) throw new Error(error.message)
    await refetch()
    const profileResponse = await fetch('/api/me/profile', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone: phone ?? '' }),
    })
    if (!profileResponse.ok) {
      throw new Error('Account created, but the profile could not be saved')
    }
    setProfile(await profileResponse.json() as AuthProfile)
  }, [refetch])

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const { error } = await authClient.resetPassword({ token, newPassword })
    if (error) throw new Error(error.message)
  }, [])

  const signOut = useCallback(async () => {
    await endAuthSession()
    setProfile(null)
    await refetch()
  }, [refetch])

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading: isPending,
      isConfigured: true,
      signIn,
      signUp,
      resetPassword,
      signOut,
      refreshProfile,
    }),
    [user, session, profile, isPending, signIn, signUp, resetPassword, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
