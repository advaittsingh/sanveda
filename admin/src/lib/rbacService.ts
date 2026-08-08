import { dataApi } from './dataApiClient'

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

export interface CurrentAdminAccess {
  role: string
  permissions: string[]
}

export function hasActionPermission(
  access: CurrentAdminAccess | null,
  module: string,
  action = 'view',
): boolean {
  if (!access) return false
  if (access.permissions.includes('*')) return true
  const normalizedModule = module === 'users' || module === 'admin' ? 'admin_users' : module
  const keys = new Set(access.permissions)
  const persisted = keys.has(`${normalizedModule}.${action}`)
    || keys.has(`${normalizedModule}.manage`)
    || (action === 'view' && (keys.has(`${normalizedModule}.read`) || keys.has(`${normalizedModule}.write`)))
    || ((action === 'create' || action === 'edit') && keys.has(`${normalizedModule}.write`))
  if (persisted) return true
  if (action !== 'view' || access.permissions.length > 0) return false
  if (!Object.hasOwn(ROLE_PERMISSIONS, access.role)) return false
  return canAccess(access.role as AdminRole, normalizedModule)
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await dataApi
    .table('admin_users')
    .select('user_id, email, role, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    userId: String(row.user_id),
    email: row.email ? String(row.email) : undefined,
    role: (row.role as AdminRole) ?? 'admin',
    createdAt: String(row.created_at),
  }))
}

export async function updateAdminRole(userId: string, role: AdminRole): Promise<void> {
  const { data: roleRow, error: roleError } = await dataApi
    .table('admin_roles')
    .select('id, key')
    .eq('key', role)
    .maybeSingle()
  if (roleError) throw new Error(roleError.message)
  if (!roleRow) throw new Error(`Role "${role}" is not configured`)

  const { error } = await dataApi
    .table('admin_users')
    .update({ role: roleRow.key, role_id: roleRow.id })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function getCurrentAdminAccess(): Promise<CurrentAdminAccess | null> {
  const { data, error } = await dataApi.call<CurrentAdminAccess>('current_admin_access')
  if (error) throw new Error(error.message)
  if (!data || typeof data !== 'object') return null
  const value = data as { role?: unknown; permissions?: unknown }
  if (typeof value.role !== 'string' || !Array.isArray(value.permissions)) return null
  return {
    role: value.role,
    permissions: value.permissions.filter((permission): permission is string => typeof permission === 'string'),
  }
}

export async function getCurrentAdminRole(): Promise<AdminRole> {
  const access = await getCurrentAdminAccess()
  return (access?.role as AdminRole | undefined) ?? 'admin'
}
