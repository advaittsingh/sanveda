export type AdminAuthMode = 'password' | 'supabase' | 'none'

const SESSION_KEY = 'sanveda_admin_session'

export function getAdminAuthMode(): AdminAuthMode {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url?.trim() && key?.trim()) return 'supabase'
  return 'password'
}

export function isAdminSessionActive(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
