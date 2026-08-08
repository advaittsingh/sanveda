import { downloadCsv } from './adminExport'
import { dataApi } from './dataApiClient'

export type RbacTab =
  | 'dashboard' | 'users' | 'roles' | 'permissions' | 'departments' | 'teams'
  | 'approvals' | 'activity' | 'audit' | 'invitations' | 'security' | 'orgchart' | 'analytics'

export type SanvedaRole =
  | 'super_admin' | 'admin' | 'finance' | 'content' | 'volunteer'
  | 'director' | 'fundraising_head' | 'campaign_manager'
  | 'finance_manager' | 'volunteer_manager' | 'membership_manager'
  | 'internship_manager' | 'program_manager' | 'event_manager'
  | 'content_manager' | 'auditor' | 'viewer'

export type UserStatus = 'active' | 'pending' | 'invited' | 'suspended'
export type LastLoginFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month'

export interface UserSecuritySettings {
  twoFactor: boolean
  deviceRestriction: boolean
  sessionTimeout: string
  passwordExpiry: string
  loginAlerts: boolean
  ipWhitelist: boolean
}

export interface AdminUserProfile {
  id: string
  userId: string
  employeeId: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  department: string
  departmentId?: string
  designation: string
  role: SanvedaRole
  roleId?: string
  roleLabel: string
  accessLevel: 'Full' | 'Limited' | 'Read-only'
  status: UserStatus
  lastLogin: string
  reportingManager?: string
  reportingManagerId?: string
  photo?: string
  createdAt: string
  twoFactorEnabled: boolean
  security: UserSecuritySettings
}

export interface Department {
  id: string
  name: string
  headCount: number
  head?: string
  inviteCount: number
}

export interface RoleDefinition {
  /** Role key used for permissions lookup (e.g. super_admin). */
  id: SanvedaRole | string
  /** Database UUID for mutations. */
  dbId: string
  key: string
  name: string
  description: string
  modules: string[]
  accessLevel: 'Full' | 'Limited' | 'Read-only'
  /** System-seeded roles appear under Predefined; user-created under Custom. */
  isSystem: boolean
  assignedCount: number
  inviteCount: number
}

export interface ModulePermission {
  module: string
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  approve: boolean
  export: boolean
}

export interface ApprovalStep { id: string; workflow: string; steps: string[] }
export interface ActivityLogEntry { id: string; user: string; action: string; module: string; time: string; day: string }
export interface AuditLogEntry {
  id: string
  user: string
  action: string
  module: string
  oldValue: string
  newValue: string
  ip: string
  browser: string
  timestamp: string
}
export interface PendingInvite { id: string; email: string; role: string; department: string; sentAt: string }
export interface OrgChartNode { id: string; label: string; children?: OrgChartNode[] }
export interface RbacFilters {
  search: string
  department: string | 'all'
  role: SanvedaRole | 'all'
  status: UserStatus | 'all'
  lastLogin: LastLoginFilter
}

export interface RbacDashboardData {
  users: AdminUserProfile[]
  departments: Department[]
  roles: RoleDefinition[]
  permissions: Record<string, ModulePermission[]>
  approvalMatrix: ApprovalStep[]
  activityLogs: ActivityLogEntry[]
  auditLogs: AuditLogEntry[]
  pendingInvites: PendingInvite[]
  orgChart: OrgChartNode
  kpis: { totalAdmins: number; activeUsers: number; pendingInvites: number; departments: number }
  activityByDepartment: { label: string; value: number; pct: number }[]
  moduleUsage: { label: string; value: number; pct: number }[]
  securitySettings: {
    twoFactor: boolean
    googleLogin: boolean
    otpLogin: boolean
    ipRestriction: boolean
    deviceRestriction: boolean
    sessionTimeout: string
    passwordPolicy: string
  }
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

/** Canonical modules shown on Permissions + Access tabs (key matches DB / rbac checks). */
export const ACCESS_MODULE_CATALOG = [
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'donations', label: 'Donations' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'memberships', label: 'Members' },
  { key: 'finance', label: 'Finance' },
  { key: 'reports', label: 'Reports' },
  { key: 'content', label: 'CMS' },
  { key: 'settings', label: 'Settings' },
] as const

/** Display labels for Access-tab chips (same order as ACCESS_MODULE_CATALOG). */
export const ACCESS_MODULES = ACCESS_MODULE_CATALOG.map((module) => module.label)

/**
 * When a role has no rows in admin_role_permissions, mirror the API legacy module
 * grants used by requirePermission / admin_has_permission.
 */
const LEGACY_ROLE_MODULES: Record<string, string[]> = {
  finance: ['donations', 'finance', 'beneficiaries', 'audit', 'reports'],
  content: ['campaigns', 'blogs', 'gallery', 'events', 'content'],
  volunteer: ['volunteers', 'internships', 'enquiries'],
}

const ALL_MATRIX_ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export'] as const

export const RBAC_TABS: { value: RbacTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' }, { value: 'users', label: 'Admin Users' },
  { value: 'roles', label: 'Roles' }, { value: 'permissions', label: 'Permissions' },
  { value: 'departments', label: 'Departments' }, { value: 'teams', label: 'Teams' },
  { value: 'approvals', label: 'Approval Flows' }, { value: 'activity', label: 'Activity Logs' },
  { value: 'audit', label: 'Audit Logs' }, { value: 'security', label: 'Security' },
  { value: 'invitations', label: 'Invitations' }, { value: 'orgchart', label: 'Organization Chart' },
  { value: 'analytics', label: 'Analytics' },
]

// Kept for existing filter call sites; persisted departments are used for all data and mutations.
export const DEPARTMENTS: readonly string[] = []
export const SANVEDA_ROLES: { value: SanvedaRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' }, { value: 'director', label: 'Director' },
  { value: 'fundraising_head', label: 'Fundraising Head' }, { value: 'campaign_manager', label: 'Campaign Admin' },
  { value: 'finance_manager', label: 'Finance Manager' }, { value: 'volunteer_manager', label: 'Volunteer Manager' },
  { value: 'membership_manager', label: 'Membership Manager' }, { value: 'internship_manager', label: 'Internship Manager' },
  { value: 'program_manager', label: 'Project Manager' }, { value: 'event_manager', label: 'Event Manager' },
  { value: 'content_manager', label: 'Content Manager' }, { value: 'auditor', label: 'Auditor' },
  { value: 'viewer', label: 'Viewer' },
]

type JsonRecord = Record<string, unknown>

function objectValue(value: unknown): JsonRecord {
  if (Array.isArray(value)) return objectValue(value[0])
  return value && typeof value === 'object' ? value as JsonRecord : {}
}

function defaultSecurity(value?: unknown): UserSecuritySettings {
  const settings = objectValue(value)
  return {
    twoFactor: Boolean(settings.twoFactor),
    deviceRestriction: Boolean(settings.deviceRestriction),
    sessionTimeout: typeof settings.sessionTimeout === 'string' ? settings.sessionTimeout : '8 hours',
    passwordExpiry: typeof settings.passwordExpiry === 'string' ? settings.passwordExpiry : '90 days',
    loginAlerts: settings.loginAlerts !== false,
    ipWhitelist: Boolean(settings.ipWhitelist),
  }
}

function permissionRows(value: unknown): { module: string; action: string }[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((link) => {
    const nested = objectValue(objectValue(link).admin_permissions)
    const flat = objectValue(link)
    const module = typeof nested.module === 'string'
      ? nested.module
      : typeof flat.module === 'string'
        ? flat.module
        : null
    const action = typeof nested.action === 'string'
      ? nested.action
      : typeof flat.action === 'string'
        ? flat.action
        : null
    return module && action ? [{ module: module.toLowerCase(), action: action.toLowerCase() }] : []
  })
}

function accessLevel(rows: { action: string }[], roleKey: string): RoleDefinition['accessLevel'] {
  if (roleKey === 'super_admin' || roleKey === 'admin') return 'Full'
  if (rows.length > 0 && rows.every((row) => ['view', 'read'].includes(row.action))) return 'Read-only'
  return 'Limited'
}

function deniedPermission(module: string): ModulePermission {
  return {
    module, view: false, create: false, edit: false, delete: false, approve: false, export: false,
  }
}

function fullPermission(module: string): ModulePermission {
  return {
    module, view: true, create: true, edit: true, delete: true, approve: true, export: true,
  }
}

function applyPermissionActions(
  base: ModulePermission[],
  rows: { module: string; action: string }[],
): ModulePermission[] {
  const byModule = new Map(base.map((row) => [row.module, { ...row }]))
  for (const { module, action } of rows) {
    const current = byModule.get(module) ?? deniedPermission(module)
    const manage = action === 'manage'
    const write = action === 'write'
    if (manage || write || action === 'view' || action === 'read') current.view = true
    if (manage || write || action === 'create') current.create = true
    if (manage || write || action === 'edit') current.edit = true
    if (manage || action === 'delete') current.delete = true
    if (manage || action === 'approve') current.approve = true
    if (manage || action === 'export') current.export = true
    byModule.set(module, current)
  }
  const catalogKeys = new Set<string>(ACCESS_MODULE_CATALOG.map((module) => module.key))
  const ordered = ACCESS_MODULE_CATALOG.map(
    (module) => byModule.get(module.key) ?? deniedPermission(module.key),
  )
  const extras = [...byModule.keys()]
    .filter((key) => !catalogKeys.has(key))
    .sort()
    .map((key) => byModule.get(key) ?? deniedPermission(key))
  return [...ordered, ...extras]
}

/**
 * Effective permissions for UI matrices — same rules as current_admin_access /
 * admin_has_permission: super_admin/admin are full access; otherwise use
 * persisted admin_role_permissions, else legacy role module grants.
 */
export function buildEffectivePermissionMatrix(
  roleKey: string,
  explicitRows: { module: string; action: string }[] = [],
): ModulePermission[] {
  const catalogKeys = ACCESS_MODULE_CATALOG.map((module) => module.key)
  const catalogKeySet = new Set<string>(catalogKeys)
  const extraModules = [...new Set(
    explicitRows.map((row) => row.module).filter((module) => !catalogKeySet.has(module)),
  )].sort()
  const modules = [...catalogKeys, ...extraModules]

  if (roleKey === 'super_admin' || roleKey === 'admin') {
    return modules.map(fullPermission)
  }

  if (explicitRows.length > 0) {
    return applyPermissionActions(modules.map(deniedPermission), explicitRows)
  }

  const legacyModules = LEGACY_ROLE_MODULES[roleKey]
  if (legacyModules?.length) {
    const synthetic = legacyModules.flatMap((module) =>
      ALL_MATRIX_ACTIONS.map((action) => ({ module, action })),
    )
    return applyPermissionActions(modules.map(deniedPermission), synthetic)
  }

  return modules.map(deniedPermission)
}

export function modulePermissionLabel(moduleKey: string): string {
  const catalog = ACCESS_MODULE_CATALOG.find((module) => module.key === moduleKey)
  if (catalog) return catalog.label
  return moduleKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function profileFromRow(row: JsonRecord, usersById: Map<string, string>): AdminUserProfile {
  const profile = objectValue(row.profiles)
  const department = objectValue(row.admin_departments)
  const role = objectValue(row.admin_roles)
  const name = String(profile.full_name || row.email || 'Admin')
  const parts = name.trim().split(/\s+/)
  const roleKey = String(role.key || row.role || 'viewer') as SanvedaRole
  const security = defaultSecurity(row.security_settings)
  return {
    id: String(row.user_id),
    userId: String(row.user_id),
    employeeId: String(row.employee_id || ''),
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
    name,
    email: String(row.email || ''),
    phone: String(profile.phone || ''),
    department: String(department.name || ''),
    departmentId: row.department_id ? String(row.department_id) : undefined,
    designation: String(row.designation || ''),
    role: roleKey,
    roleId: row.role_id ? String(row.role_id) : undefined,
    roleLabel: String(role.name || roleKey.replace(/_/g, ' ')),
    accessLevel: roleKey === 'super_admin' || roleKey === 'admin' ? 'Full' : 'Limited',
    status: String(row.status || (row.is_active ? 'active' : 'suspended')) as UserStatus,
    lastLogin: String(row.last_login_at || row.created_at),
    reportingManagerId: row.reporting_manager_id ? String(row.reporting_manager_id) : undefined,
    reportingManager: row.reporting_manager_id ? usersById.get(String(row.reporting_manager_id)) : undefined,
    photo: profile.avatar_url ? String(profile.avatar_url) : undefined,
    createdAt: String(row.created_at),
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    security: { ...security, twoFactor: Boolean(row.two_factor_enabled) },
  }
}

function auditUser(details: unknown): string {
  const data = objectValue(details)
  if (typeof data.user === 'string' && data.user.trim()) return data.user.trim()
  if (typeof data.email === 'string' && data.email.trim()) return data.email.trim()
  return 'Admin'
}

export function getUserPermissions(role: SanvedaRole, permissions: Record<string, ModulePermission[]>): ModulePermission[] {
  return permissions[role] ?? buildEffectivePermissionMatrix(role)
}

export function getUserModuleAccess(role: SanvedaRole, permissions: Record<string, ModulePermission[]>): string[] {
  return getUserPermissions(role, permissions)
    .filter((row) => row.view)
    .map((row) => modulePermissionLabel(row.module))
}

export async function getRbacDashboardData(): Promise<RbacDashboardData> {
  const { data: dashboard, error } = await dataApi.call<{
    users: JsonRecord[]; profiles: JsonRecord[]; roles: JsonRecord[]; departments: JsonRecord[]
    invitations: JsonRecord[]; audit: JsonRecord[]; workflows: JsonRecord[]
  }>('rbac_dashboard')
  if (error) throw new Error(error.message)
  const usersResult = { data: dashboard.users }
  const profilesResult = { data: dashboard.profiles }
  const rolesResult = { data: dashboard.roles }
  const departmentsResult = { data: dashboard.departments }
  const invitationsResult = { data: dashboard.invitations }
  const auditResult = { data: dashboard.audit }
  const workflowsResult = { data: dashboard.workflows }

  const rawUsers = (usersResult.data ?? []) as unknown as JsonRecord[]
  const profiles = new Map(((profilesResult.data ?? []) as unknown as JsonRecord[])
    .map((profile) => [String(profile.id), profile]))
  for (const row of rawUsers) row.profiles = profiles.get(String(row.user_id)) ?? {}
  const names = new Map(rawUsers.map((row) => {
    const profile = objectValue(row.profiles)
    return [String(row.user_id), String(profile.full_name || row.email || 'Admin')]
  }))
  const users = rawUsers.map((row) => profileFromRow(row, names))

  const rawInvites = (invitationsResult.data ?? []) as unknown as JsonRecord[]
  const permissions: Record<string, ModulePermission[]> = {}
  const roles = ((rolesResult.data ?? []) as unknown as JsonRecord[]).map((row): RoleDefinition => {
    const key = String(row.key)
    const dbId = String(row.id)
    const rows = permissionRows(row.admin_role_permissions)
    const matrix = buildEffectivePermissionMatrix(key, rows)
    permissions[key] = matrix
    return {
      id: key,
      dbId,
      key,
      name: String(row.name),
      description: String(row.description || ''),
      modules: matrix.filter((permission) => permission.view).map((permission) => modulePermissionLabel(permission.module)),
      accessLevel: accessLevel(rows, key),
      isSystem:
        row.is_system === true
        || row.is_system === 'true'
        || ['super_admin', 'admin', 'finance', 'content', 'volunteer'].includes(key),
      assignedCount: users.filter((user) => user.roleId === dbId).length,
      inviteCount: rawInvites.filter((invite) => String(invite.role_id || '') === dbId).length,
    }
  })

  const departments = ((departmentsResult.data ?? []) as unknown as JsonRecord[]).map((row): Department => {
    const id = String(row.id)
    const members = users.filter((user) => user.departmentId === id)
    return {
      id,
      name: String(row.name),
      headCount: members.length,
      head: members[0]?.name,
      inviteCount: rawInvites.filter((invite) => String(invite.department_id || '') === id).length,
    }
  })
  const pendingInvites = rawInvites.map((row): PendingInvite => ({
    id: String(row.id),
    email: String(row.email),
    role: String(objectValue(row.admin_roles).name || ''),
    department: String(objectValue(row.admin_departments).name || ''),
    sentAt: String(row.last_sent_at),
  }))
  const auditLogs = ((auditResult.data ?? []) as unknown as JsonRecord[]).map((row): AuditLogEntry => ({
    id: String(row.id),
    user: names.get(String(row.user_id)) || auditUser(row.details),
    action: String(row.action),
    module: String(row.entity_type),
    oldValue: row.old_data ? JSON.stringify(row.old_data) : '—',
    newValue: row.new_data ? JSON.stringify(row.new_data) : '—',
    ip: String(row.ip_address || '—'),
    browser: String(row.browser || '—'),
    timestamp: String(row.occurred_at),
  }))
  const activityLogs = auditLogs.slice(0, 20).map((row): ActivityLogEntry => {
    const date = new Date(row.timestamp)
    return {
      id: row.id, user: row.user, action: row.action, module: row.module,
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      day: date.toLocaleDateString('en-IN'),
    }
  })
  const approvalMatrix = ((workflowsResult.data ?? []) as unknown as JsonRecord[]).map((row): ApprovalStep => ({
    id: String(row.id),
    workflow: String(row.name),
    steps: Array.isArray(row.steps)
      ? row.steps.map((step) => String(objectValue(step).name || step))
      : [],
  }))
  const activeUsers = users.filter((user) => user.status === 'active').length
  const activityByDepartment = departments.map((department) => ({
    label: department.name,
    value: department.headCount,
    pct: users.length ? Math.round((department.headCount / users.length) * 100) : 0,
  }))
  const moduleCounts = new Map<string, number>()
  for (const entry of activityLogs) moduleCounts.set(entry.module, (moduleCounts.get(entry.module) ?? 0) + 1)
  const moduleTotal = activityLogs.length
  const moduleUsage = [...moduleCounts].map(([label, value]) => ({
    label, value, pct: moduleTotal ? Math.round((value / moduleTotal) * 100) : 0,
  }))

  return {
    users, departments, roles, permissions, approvalMatrix, activityLogs, auditLogs, pendingInvites,
    orgChart: {
      id: 'organization', label: 'Sanveda',
      children: departments.map((department) => ({
        id: department.id, label: department.name,
        children: users.filter((user) => user.departmentId === department.id)
          .map((user) => ({ id: user.id, label: user.name })),
      })),
    },
    kpis: { totalAdmins: users.length, activeUsers, pendingInvites: pendingInvites.length, departments: departments.length },
    activityByDepartment,
    moduleUsage,
    securitySettings: {
      twoFactor: users.length > 0 && users.every((user) => user.twoFactorEnabled),
      googleLogin: false, otpLogin: false, ipRestriction: false, deviceRestriction: false,
      sessionTimeout: 'Configured in Better Auth',
      passwordPolicy: 'Configured in Better Auth',
    },
    aiInsights: [
      ...(pendingInvites.length
        ? [{ id: 'invites', message: `${pendingInvites.length} admin invite(s) pending acceptance.`, tone: 'warning' as const }]
        : []),
      ...(users.some((user) => !user.twoFactorEnabled)
        ? [{ id: '2fa', message: `${users.filter((user) => !user.twoFactorEnabled).length} admin(s) have not enabled 2FA.`, tone: 'warning' as const }]
        : []),
    ],
  }
}

export function filterUsers(users: AdminUserProfile[], filters: RbacFilters): AdminUserProfile[] {
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now.getTime() - 86_400_000).toDateString()
  const weekAgo = now.getTime() - 7 * 86_400_000
  const monthAgo = now.getTime() - 30 * 86_400_000
  return users.filter((user) => {
    if (filters.department !== 'all' && user.department !== filters.department) return false
    if (filters.role !== 'all' && user.role !== filters.role) return false
    if (filters.status !== 'all' && user.status !== filters.status) return false
    if (filters.lastLogin !== 'all') {
      const date = new Date(user.lastLogin)
      if (filters.lastLogin === 'today' && date.toDateString() !== today) return false
      if (filters.lastLogin === 'yesterday' && date.toDateString() !== yesterday) return false
      if (filters.lastLogin === 'week' && date.getTime() < weekAgo) return false
      if (filters.lastLogin === 'month' && date.getTime() < monthAgo) return false
    }
    if (!filters.search.trim()) return true
    const query = filters.search.toLowerCase()
    return [user.name, user.email, user.department, user.designation, user.employeeId]
      .some((value) => value.toLowerCase().includes(query))
  })
}

export function exportUsersCsv(users: AdminUserProfile[]) {
  downloadCsv(
    'admin-users.csv',
    ['Name', 'Department', 'Designation', 'Role', 'Last Login', 'Status'],
    users.map((user) => [user.name, user.department, user.designation, user.roleLabel, formatLastLogin(user.lastLogin), user.status]),
  )
}

async function resolveRoleAndDepartment(roleKey: string, departmentName: string) {
  const [roleResult, departmentResult] = await Promise.all([
    dataApi.table('admin_roles').select('id,key,name').eq('key', roleKey).maybeSingle(),
    departmentName
      ? dataApi.table('admin_departments').select('id,name').eq('name', departmentName).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])
  if (roleResult.error) throw new Error(roleResult.error.message)
  if (!roleResult.data) throw new Error(`Role "${roleKey}" is not configured`)
  if (departmentResult.error) throw new Error(departmentResult.error.message)
  if (departmentName && !departmentResult.data) throw new Error(`Department "${departmentName}" is not configured`)
  return { role: roleResult.data, department: departmentResult.data }
}

export async function saveAdminUser(
  input: Partial<AdminUserProfile> & { email: string; firstName: string; lastName: string },
): Promise<AdminUserProfile> {
  const roleKey = String(input.role ?? 'viewer')
  const { role, department } = await resolveRoleAndDepartment(roleKey, input.department ?? '')

  if (!input.id) {
    const inviteResponse = await fetch('/api/admin/invite', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        roleKey,
        departmentId: department?.id ?? null,
        designation: input.designation ?? '',
      }),
    })
    const response = objectValue(await inviteResponse.json())
    if (!inviteResponse.ok || response.success !== true) {
      throw new Error(String(response.message || response.error || 'Admin invitation failed'))
    }
    return {
      ...input,
      id: String(response.userId),
      userId: String(response.userId),
      employeeId: '',
      name: `${input.firstName} ${input.lastName}`.trim(),
      department: input.department ?? '',
      designation: input.designation ?? '',
      role: roleKey as SanvedaRole,
      roleId: String(role.id),
      roleLabel: String(role.name),
      accessLevel: roleKey === 'super_admin' ? 'Full' : 'Limited',
      status: 'invited',
      phone: input.phone ?? '',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
      security: defaultSecurity(),
    }
  }

  const updates = {
    role: role.key,
    role_id: role.id,
    department_id: department?.id ?? null,
    designation: input.designation ?? null,
    reporting_manager_id: input.reportingManagerId ?? null,
    status: input.status ?? 'active',
    is_active: input.status !== 'suspended',
    employee_id: input.employeeId || null,
    two_factor_enabled: input.twoFactorEnabled ?? false,
    security_settings: input.security ?? {},
  }
  const { error: adminError } = await dataApi.table('admin_users').update(updates).eq('user_id', input.id)
  if (adminError) throw new Error(adminError.message)
  const { error: profileError } = await dataApi.table('profiles').upsert({
    id: input.id,
    full_name: `${input.firstName} ${input.lastName}`.trim(),
    phone: input.phone ?? null,
    avatar_url: input.photo ?? null,
  }, { onConflict: 'id' })
  if (profileError) throw new Error(profileError.message)
  return { ...input, id: input.id, userId: input.id } as AdminUserProfile
}

export async function deleteAdminUser(id: string): Promise<void> {
  const { error } = await dataApi.table('admin_users').delete().eq('user_id', id)
  if (error) throw new Error(error.message)
}

function keyFromName(name: string): string {
  const key = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  if (!/^[a-z][a-z0-9_]*$/.test(key)) throw new Error('Name must begin with a letter')
  return key
}

function assignmentBlockMessage(label: string, name: string, adminCount: number, inviteCount: number): string {
  const parts: string[] = []
  if (adminCount > 0) parts.push(`${adminCount} admin user${adminCount === 1 ? '' : 's'}`)
  if (inviteCount > 0) parts.push(`${inviteCount} pending invitation${inviteCount === 1 ? '' : 's'}`)
  return `Cannot delete ${label} "${name}" — it is assigned to ${parts.join(' and ')}. Reassign them first.`
}

export async function saveDepartment(name: string): Promise<Department> {
  const { data, error } = await dataApi.table('admin_departments')
    .insert({ key: keyFromName(name), name: name.trim() }).select('id,name').single()
  if (error) throw new Error(error.message)
  return { id: String(data.id), name: String(data.name), headCount: 0, inviteCount: 0 }
}

export async function updateDepartment(id: string, name: string): Promise<Department> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Department name is required')
  const { data, error } = await dataApi.table('admin_departments')
    .update({ name: trimmed })
    .eq('id', id)
    .select('id,name')
    .single()
  if (error) throw new Error(error.message)
  return { id: String(data.id), name: String(data.name), headCount: 0, inviteCount: 0 }
}

export async function deleteDepartment(
  id: string,
  options?: { reassignToDepartmentId?: string },
): Promise<void> {
  const { data: department, error: deptError } = await dataApi.table('admin_departments')
    .select('id,name')
    .eq('id', id)
    .maybeSingle()
  if (deptError) throw new Error(deptError.message)
  if (!department) throw new Error('Department not found')

  const [{ data: assignedUsers, error: usersError }, { data: invites, error: invitesError }] = await Promise.all([
    dataApi.table('admin_users').select('user_id').eq('department_id', id),
    dataApi.table('admin_invitations').select('id').eq('department_id', id).eq('status', 'pending'),
  ])
  if (usersError) throw new Error(usersError.message)
  if (invitesError) throw new Error(invitesError.message)

  const adminCount = (assignedUsers ?? []).length
  const inviteCount = (invites ?? []).length
  const reassignTo = options?.reassignToDepartmentId?.trim()

  if ((adminCount > 0 || inviteCount > 0) && !reassignTo) {
    throw new Error(assignmentBlockMessage('department', String(department.name), adminCount, inviteCount))
  }

  if (reassignTo) {
    if (reassignTo === id) throw new Error('Choose a different department for reassignment.')
    const { data: target, error: targetError } = await dataApi.table('admin_departments')
      .select('id')
      .eq('id', reassignTo)
      .maybeSingle()
    if (targetError) throw new Error(targetError.message)
    if (!target) throw new Error('Replacement department not found')

    const { error: reassignUsersError } = await dataApi.table('admin_users')
      .update({ department_id: reassignTo })
      .eq('department_id', id)
    if (reassignUsersError) throw new Error(reassignUsersError.message)

    const { error: reassignInvitesError } = await dataApi.table('admin_invitations')
      .update({ department_id: reassignTo })
      .eq('department_id', id)
    if (reassignInvitesError) throw new Error(reassignInvitesError.message)
  }

  const { error } = await dataApi.table('admin_departments').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function saveCustomRole(name: string, description: string): Promise<RoleDefinition> {
  const { data, error } = await dataApi.table('admin_roles')
    .insert({ key: keyFromName(name), name: name.trim(), description: description.trim() })
    .select('id,key,name,description,is_system')
    .single()
  if (error) throw new Error(error.message)
  const key = String(data.key)
  return {
    id: key,
    dbId: String(data.id),
    key,
    name: String(data.name),
    description: String(data.description || ''),
    modules: [],
    accessLevel: 'Limited',
    isSystem: false,
    assignedCount: 0,
    inviteCount: 0,
  }
}

export async function updateCustomRole(dbId: string, name: string, description: string): Promise<void> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Role name is required')
  const { error } = await dataApi.table('admin_roles')
    .update({ name: trimmed, description: description.trim() })
    .eq('id', dbId)
  if (error) throw new Error(error.message)
}

export async function deleteRole(
  roleDbId: string,
  options?: { reassignToRoleDbId?: string },
): Promise<void> {
  const { data: role, error: roleError } = await dataApi.table('admin_roles')
    .select('id,key,name,is_system')
    .eq('id', roleDbId)
    .maybeSingle()
  if (roleError) throw new Error(roleError.message)
  if (!role) throw new Error('Role not found')
  if (role.is_system === true || role.is_system === 'true' || role.key === 'super_admin') {
    throw new Error(`System role "${role.name}" cannot be deleted.`)
  }

  const [{ data: assignedUsers, error: usersError }, { data: invites, error: invitesError }] = await Promise.all([
    dataApi.table('admin_users').select('user_id').eq('role_id', roleDbId),
    dataApi.table('admin_invitations').select('id').eq('role_id', roleDbId),
  ])
  if (usersError) throw new Error(usersError.message)
  if (invitesError) throw new Error(invitesError.message)

  const adminCount = (assignedUsers ?? []).length
  const inviteCount = (invites ?? []).length
  const reassignTo = options?.reassignToRoleDbId?.trim()

  if ((adminCount > 0 || inviteCount > 0) && !reassignTo) {
    throw new Error(assignmentBlockMessage('role', String(role.name), adminCount, inviteCount))
  }

  if (reassignTo) {
    if (reassignTo === roleDbId) throw new Error('Choose a different role for reassignment.')
    const { data: target, error: targetError } = await dataApi.table('admin_roles')
      .select('id,key')
      .eq('id', reassignTo)
      .maybeSingle()
    if (targetError) throw new Error(targetError.message)
    if (!target) throw new Error('Replacement role not found')

    const { error: reassignUsersError } = await dataApi.table('admin_users')
      .update({ role_id: target.id, role: target.key })
      .eq('role_id', roleDbId)
    if (reassignUsersError) throw new Error(reassignUsersError.message)

    const { error: reassignInvitesError } = await dataApi.table('admin_invitations')
      .update({ role_id: target.id })
      .eq('role_id', roleDbId)
    if (reassignInvitesError) throw new Error(reassignInvitesError.message)
  }

  const { error } = await dataApi.table('admin_roles').delete().eq('id', roleDbId)
  if (error) throw new Error(error.message)
}

export async function saveRolePermissions(roleKey: string, rows: ModulePermission[]): Promise<void> {
  const actions: (keyof Omit<ModulePermission, 'module'>)[] = [
    'view', 'create', 'edit', 'delete', 'approve', 'export',
  ]
  const permissions = rows.flatMap((row) => actions
    .filter((action) => row[action])
    .map((action) => ({ module: row.module.toLowerCase(), action })))
  const { error } = await dataApi.call('set_admin_role_permissions', {
    p_role_key: roleKey,
    p_permissions: permissions,
  })
  if (error) throw new Error(error.message)
}

export function formatLastLogin(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Never'
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today.getTime() - 86_400_000)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function parseRbacTab(value: string | null): RbacTab {
  const valid = RBAC_TABS.map((tab) => tab.value)
  return valid.includes(value as RbacTab) ? value as RbacTab : 'dashboard'
}
