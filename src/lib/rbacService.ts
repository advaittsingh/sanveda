import { isSupabaseConfigured, requireSupabase } from './supabase'

export type AdminRole = 'super_admin' | 'admin' | 'finance' | 'content' | 'volunteer'

export interface AdminUser {
  userId: string
  email?: string
  role: AdminRole
  createdAt: string
}

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ['*'],
  admin: ['campaigns', 'blogs', 'donations', 'memberships', 'volunteers', 'enquiries', 'beneficiaries', 'finance', 'internships', 'projects', 'events', 'gallery', 'documents', 'content', 'users', 'audit', 'settings', 'focus_areas'],
  finance: ['donations', 'finance', 'beneficiaries', 'audit'],
  content: ['campaigns', 'blogs', 'gallery', 'events', 'content'],
  volunteer: ['volunteers', 'internships', 'enquiries'],
}

export function canAccess(role: AdminRole, module: string): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? []
  return perms.includes('*') || perms.includes(module)
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('admin_users')
      .select('user_id, role, created_at, profiles(email)')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map((row) => ({
      userId: String(row.user_id),
      email: (row.profiles as { email?: string } | null)?.email,
      role: (row.role as AdminRole) ?? 'admin',
      createdAt: String(row.created_at),
    }))
  }

  return [{ userId: 'local-admin', email: 'admin@local', role: 'super_admin', createdAt: new Date().toISOString() }]
}

export async function updateAdminRole(userId: string, role: AdminRole): Promise<void> {
  if (!isSupabaseConfigured) return

  const { error } = await requireSupabase()
    .from('admin_users')
    .update({ role })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function getCurrentAdminRole(): Promise<AdminRole> {
  if (!isSupabaseConfigured) return 'super_admin'

  const { data: { user } } = await requireSupabase().auth.getUser()
  if (!user) return 'admin'

  const { data, error } = await requireSupabase()
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) return 'admin'
  return (data.role as AdminRole) ?? 'admin'
}
