import { writeDevStorageList, allowLocalStoragePersistence } from './persistMeta'
import { withAudit } from './auditMiddleware'
import { downloadCsv } from './adminExport'
import { getAdminUsers, updateAdminRole, type AdminRole } from './rbacService'

export type RbacTab =
  | 'dashboard'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'departments'
  | 'teams'
  | 'approvals'
  | 'activity'
  | 'audit'
  | 'invitations'
  | 'security'
  | 'orgchart'
  | 'analytics'

export type SanvedaRole =
  | 'super_admin'
  | 'director'
  | 'fundraising_head'
  | 'campaign_manager'
  | 'finance_manager'
  | 'volunteer_manager'
  | 'membership_manager'
  | 'internship_manager'
  | 'program_manager'
  | 'event_manager'
  | 'content_manager'
  | 'auditor'
  | 'viewer'

export type UserStatus = 'active' | 'pending' | 'invited' | 'suspended'

export type LastLoginFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month'

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
  designation: string
  role: SanvedaRole
  roleLabel: string
  accessLevel: 'Full' | 'Limited' | 'Read-only'
  status: UserStatus
  lastLogin: string
  reportingManager?: string
  photo?: string
  createdAt: string
  twoFactorEnabled: boolean
  security: UserSecuritySettings
}

export interface UserSecuritySettings {
  twoFactor: boolean
  deviceRestriction: boolean
  sessionTimeout: string
  passwordExpiry: string
  loginAlerts: boolean
  ipWhitelist: boolean
}

export interface Department {
  id: string
  name: string
  headCount: number
  head?: string
}

export interface RoleDefinition {
  id: SanvedaRole | string
  name: string
  description: string
  modules: string[]
  accessLevel: 'Full' | 'Limited' | 'Read-only'
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

export interface ApprovalStep {
  id: string
  workflow: string
  steps: string[]
}

export interface ActivityLogEntry {
  id: string
  user: string
  action: string
  module: string
  time: string
  day: string
}

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

export interface PendingInvite {
  id: string
  email: string
  role: string
  department: string
  sentAt: string
}

export interface OrgChartNode {
  id: string
  label: string
  children?: OrgChartNode[]
}

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
  kpis: {
    totalAdmins: number
    activeUsers: number
    pendingInvites: number
    departments: number
  }
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

const META_KEY = 'sanveda_admin_user_meta'
const DEPT_META_KEY = 'sanveda_admin_departments'
const ROLE_META_KEY = 'sanveda_admin_custom_roles'

export const ACCESS_MODULES = [
  'Campaigns', 'Donations', 'Volunteers', 'Members', 'Finance', 'Reports', 'CMS', 'Settings',
] as const

export const RBAC_TABS: { value: RbacTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'users', label: 'Admin Users' },
  { value: 'roles', label: 'Roles' },
  { value: 'permissions', label: 'Permissions' },
  { value: 'departments', label: 'Departments' },
  { value: 'teams', label: 'Teams' },
  { value: 'approvals', label: 'Approval Flows' },
  { value: 'activity', label: 'Activity Logs' },
  { value: 'audit', label: 'Audit Logs' },
  { value: 'security', label: 'Security' },
  { value: 'invitations', label: 'Invitations' },
  { value: 'orgchart', label: 'Organization Chart' },
  { value: 'analytics', label: 'Analytics' },
]

export const DEPARTMENTS = [
  'Administration', 'Fundraising', 'Programs', 'Finance', 'Operations',
  'Volunteer Management', 'Communications', 'Legal', 'Technology',
] as const

export const SANVEDA_ROLES: { value: SanvedaRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'director', label: 'Director' },
  { value: 'fundraising_head', label: 'Fundraising Head' },
  { value: 'campaign_manager', label: 'Campaign Admin' },
  { value: 'finance_manager', label: 'Finance Manager' },
  { value: 'volunteer_manager', label: 'Volunteer Manager' },
  { value: 'membership_manager', label: 'Membership Manager' },
  { value: 'internship_manager', label: 'Internship Manager' },
  { value: 'program_manager', label: 'Project Manager' },
  { value: 'event_manager', label: 'Event Manager' },
  { value: 'content_manager', label: 'Content Manager' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'viewer', label: 'Viewer' },
]

const ROLE_LABEL = Object.fromEntries(SANVEDA_ROLES.map((r) => [r.value, r.label])) as Record<SanvedaRole, string>

const PERM_MODULES = ['Campaigns', 'Donations', 'Volunteers', 'Members', 'Finance', 'Reports', 'CMS', 'Settings']

function defaultSecurity(enabled = false): UserSecuritySettings {
  return {
    twoFactor: enabled,
    deviceRestriction: false,
    sessionTimeout: '8 hours',
    passwordExpiry: '90 days',
    loginAlerts: true,
    ipWhitelist: false,
  }
}

function buildRoleDefinitions(): RoleDefinition[] {
  return SANVEDA_ROLES.map((r) => {
    const accessLevel: RoleDefinition['accessLevel'] =
      r.value === 'super_admin' || r.value === 'director' ? 'Full'
        : r.value === 'auditor' || r.value === 'viewer' ? 'Read-only'
          : 'Limited'
    const modules =
      r.value === 'super_admin' ? ['*']
        : r.value === 'director' ? ['Campaigns', 'Donations', 'Finance', 'Reports', 'Approvals']
          : r.value === 'fundraising_head' || r.value === 'campaign_manager' ? ['Campaigns', 'Donations', 'Reports']
            : r.value === 'finance_manager' ? ['Finance', 'Reports', 'Tax Receipts']
              : r.value === 'volunteer_manager' ? ['Volunteers', 'Members', 'Internships']
                : r.value === 'content_manager' ? ['CMS', 'Blogs', 'Gallery']
                  : r.value === 'auditor' ? ['Finance', 'Reports', 'Audit']
                    : ['Dashboard']
    return {
      id: r.value,
      name: r.label,
      description: `${r.label} access for Sanveda NGO OS`,
      modules,
      accessLevel,
    }
  })
}

function defaultPermissions(role: SanvedaRole): ModulePermission[] {
  const full = PERM_MODULES.map((m) => ({
    module: m, view: true, create: true, edit: true, delete: true, approve: true, export: true,
  }))
  const limited = PERM_MODULES.map((m) => ({
    module: m,
    view: true,
    create: ['Campaigns', 'Donations', 'Volunteers'].includes(m),
    edit: ['Campaigns', 'Volunteers'].includes(m),
    delete: false,
    approve: m === 'Volunteers',
    export: ['Reports', 'Donations', 'Finance'].includes(m),
  }))
  const viewOnly = PERM_MODULES.map((m) => ({
    module: m, view: true, create: false, edit: false, delete: false, approve: false, export: false,
  }))

  if (role === 'super_admin' || role === 'director') return full
  if (role === 'auditor' || role === 'viewer') return viewOnly
  return limited
}

function buildDemoUsers(): AdminUserProfile[] {
  const now = new Date()
  return [
    {
      id: '1', userId: 'local-admin', employeeId: 'SV-001',
      firstName: 'Advait', lastName: 'Singh', name: 'Advait Singh',
      email: 'admin@sanveda.org', phone: '+91 98765 43210', department: 'Administration',
      designation: 'Founder', role: 'super_admin', roleLabel: 'Super Admin',
      accessLevel: 'Full', status: 'active', lastLogin: now.toISOString(), createdAt: now.toISOString(),
      twoFactorEnabled: true, security: defaultSecurity(true),
    },
    {
      id: '2', userId: 'user-2', employeeId: 'SV-002',
      firstName: 'Rahul', lastName: 'Sharma', name: 'Rahul Sharma',
      email: 'campaigns@sanveda.org', phone: '+91 98765 00001', department: 'Fundraising',
      designation: 'Manager', role: 'campaign_manager', roleLabel: 'Campaign Admin',
      accessLevel: 'Limited', status: 'active', lastLogin: new Date(now.getTime() - 86400000).toISOString(),
      reportingManager: 'Advait Singh', createdAt: now.toISOString(), twoFactorEnabled: false,
      security: defaultSecurity(false),
    },
    {
      id: '3', userId: 'user-3', employeeId: 'SV-003',
      firstName: 'Priya', lastName: 'Mehta', name: 'Priya Mehta',
      email: 'finance@sanveda.org', phone: '+91 98765 00002', department: 'Finance',
      designation: 'Finance Manager', role: 'finance_manager', roleLabel: 'Finance Manager',
      accessLevel: 'Limited', status: 'active', lastLogin: new Date(now.getTime() - 172800000).toISOString(),
      reportingManager: 'Advait Singh', createdAt: now.toISOString(), twoFactorEnabled: true,
      security: { ...defaultSecurity(true), deviceRestriction: true },
    },
    {
      id: '4', userId: 'user-4', employeeId: 'SV-004',
      firstName: 'Finance', lastName: 'Admin', name: 'Finance Admin',
      email: 'receipts@sanveda.org', phone: '+91 98765 00004', department: 'Finance',
      designation: 'Tax Receipts Officer', role: 'finance_manager', roleLabel: 'Finance Manager',
      accessLevel: 'Limited', status: 'active',
      lastLogin: new Date(new Date().setHours(8, 15, 0, 0)).toISOString(),
      createdAt: now.toISOString(), twoFactorEnabled: true, security: defaultSecurity(true),
    },
  ]
}

function readMeta(): AdminUserProfile[] | null {
  if (!allowLocalStoragePersistence()) return null
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminUserProfile[]
    return parsed.map((u) => ({
      ...u,
      employeeId: u.employeeId ?? `SV-${u.id.padStart(3, '0')}`,
      security: u.security ?? defaultSecurity(u.twoFactorEnabled),
    }))
  } catch {
    return null
  }
}

function writeMeta(users: AdminUserProfile[]) {
  writeDevStorageList(META_KEY, users)
}

function readCustomDepartments(): Department[] | null {
  if (!allowLocalStoragePersistence()) return null
  try {
    const raw = localStorage.getItem(DEPT_META_KEY)
    return raw ? (JSON.parse(raw) as Department[]) : null
  } catch {
    return null
  }
}

function readCustomRoles(): RoleDefinition[] | null {
  if (!allowLocalStoragePersistence()) return null
  try {
    const raw = localStorage.getItem(ROLE_META_KEY)
    return raw ? (JSON.parse(raw) as RoleDefinition[]) : null
  } catch {
    return null
  }
}

function mapLegacyRole(role: AdminRole): SanvedaRole {
  const map: Record<AdminRole, SanvedaRole> = {
    super_admin: 'super_admin',
    admin: 'director',
    finance: 'finance_manager',
    content: 'content_manager',
    volunteer: 'volunteer_manager',
  }
  return map[role] ?? 'viewer'
}

function mapToLegacyRole(role: SanvedaRole): AdminRole {
  if (role === 'super_admin') return 'super_admin'
  if (role === 'finance_manager') return 'finance'
  if (role === 'content_manager') return 'content'
  if (role === 'volunteer_manager') return 'volunteer'
  return 'admin'
}

export function getUserPermissions(role: SanvedaRole, permissions: Record<string, ModulePermission[]>): ModulePermission[] {
  return permissions[role] ?? defaultPermissions(role)
}

export function getUserModuleAccess(role: SanvedaRole, permissions: Record<string, ModulePermission[]>): string[] {
  if (role === 'super_admin' || role === 'director') return [...ACCESS_MODULES]
  const perms = getUserPermissions(role, permissions)
  return ACCESS_MODULES.filter((mod) => {
    const row = perms.find((p) => p.module === mod)
    return row?.view ?? false
  })
}

export async function getRbacDashboardData(): Promise<RbacDashboardData> {
  let users = readMeta()
  if (!users) {
    try {
      const legacy = await getAdminUsers()
      users = legacy.length
        ? legacy.map((u, i) => {
            const demo = buildDemoUsers()[i] ?? buildDemoUsers()[0]
            const mappedRole = mapLegacyRole(u.role)
            return {
              ...demo,
              userId: u.userId,
              email: u.email ?? demo.email,
              role: mappedRole,
              roleLabel: ROLE_LABEL[mappedRole] ?? mappedRole,
              createdAt: u.createdAt,
            }
          })
        : buildDemoUsers()
    } catch {
      users = buildDemoUsers()
    }
  }

  const customRoles = readCustomRoles() ?? []
  const roles = [...buildRoleDefinitions(), ...customRoles]
  const permissions = Object.fromEntries(
    SANVEDA_ROLES.map((r) => [r.value, defaultPermissions(r.value)]),
  ) as Record<string, ModulePermission[]>

  const customDepts = readCustomDepartments()
  const departments = customDepts ?? DEPARTMENTS.map((name, i) => ({
    id: String(i + 1),
    name,
    headCount: users.filter((u) => u.department === name).length || 1 + (i % 3),
    head: users.find((u) => u.department === name)?.name,
  }))

  const activeCount = users.filter((u) => u.status === 'active').length
  const pendingCount = users.filter((u) => u.status === 'invited' || u.status === 'pending').length

  return {
    users,
    departments,
    roles,
    permissions,
    approvalMatrix: [
      { id: '1', workflow: 'Campaign', steps: ['Campaign Draft', 'Campaign Manager', 'Director'] },
      { id: '2', workflow: 'Volunteer', steps: ['Volunteer Application', 'Volunteer Manager', 'Admin'] },
      { id: '3', workflow: 'Expense', steps: ['Expense Submitted', 'Finance Manager', 'Director'] },
    ],
    activityLogs: [
      { id: '1', user: 'Advait', action: 'Created campaign', module: 'Campaigns', time: '10:32 AM', day: 'Today' },
      { id: '2', user: 'Rahul', action: 'Approved volunteer', module: 'Volunteers', time: '09:45 AM', day: 'Today' },
      { id: '3', user: 'Finance Admin', action: 'Generated tax receipt', module: 'Finance', time: '08:15 AM', day: 'Today' },
    ],
    auditLogs: [
      {
        id: '1', user: 'Advait Singh', action: 'Edited Campaign', module: 'Campaigns',
        oldValue: 'Goal: ₹10,00,000', newValue: 'Goal: ₹15,00,000',
        ip: '122.xxx.xxx.xxx', browser: 'Chrome 124 / macOS', timestamp: '04 Jul 2026, 10:32 AM',
      },
      {
        id: '2', user: 'Rahul Sharma', action: 'Approved Volunteer', module: 'Volunteers',
        oldValue: 'Status: Pending', newValue: 'Status: Active',
        ip: '103.xxx.xxx.xxx', browser: 'Safari 17 / iOS', timestamp: '04 Jul 2026, 09:45 AM',
      },
      {
        id: '3', user: 'Finance Admin', action: 'Generated Tax Receipt', module: 'Finance',
        oldValue: '—', newValue: 'Receipt #TR-2026-0042',
        ip: '49.xxx.xxx.xxx', browser: 'Chrome 124 / Windows', timestamp: '04 Jul 2026, 08:15 AM',
      },
    ],
    pendingInvites: [
      { id: '1', email: 'content@sanveda.org', role: 'Content Manager', department: 'Communications', sentAt: '2 days ago' },
      { id: '2', email: 'auditor@sanveda.org', role: 'Auditor', department: 'Finance', sentAt: '5 days ago' },
    ],
    orgChart: {
      id: 'founder',
      label: 'Founder',
      children: [{
        id: 'director',
        label: 'Director',
        children: [
          { id: 'finance', label: 'Finance', children: [{ id: 'finance-staff', label: 'Staff' }] },
          { id: 'programs', label: 'Programs', children: [{ id: 'programs-staff', label: 'Staff' }] },
          { id: 'fundraising', label: 'Fundraising', children: [{ id: 'fundraising-staff', label: 'Staff' }] },
        ],
      }],
    },
    kpis: {
      totalAdmins: users.length,
      activeUsers: activeCount,
      pendingInvites: Math.max(pendingCount, 2),
      departments: departments.length,
    },
    activityByDepartment: [
      { label: 'Administration', value: 35, pct: 35 },
      { label: 'Fundraising', value: 30, pct: 30 },
      { label: 'Finance', value: 20, pct: 20 },
      { label: 'Operations', value: 15, pct: 15 },
    ],
    moduleUsage: [
      { label: 'Campaigns', value: 40, pct: 40 },
      { label: 'Finance', value: 25, pct: 25 },
      { label: 'Volunteers', value: 20, pct: 20 },
      { label: 'CMS', value: 15, pct: 15 },
    ],
    securitySettings: {
      twoFactor: true,
      googleLogin: true,
      otpLogin: true,
      ipRestriction: false,
      deviceRestriction: false,
      sessionTimeout: '8 hours',
      passwordPolicy: 'Min 12 chars, uppercase, number, symbol',
    },
    aiInsights: [
      { id: 'invites', message: `${Math.max(pendingCount, 2)} admin invites are pending acceptance.`, tone: 'warning' as const },
      { id: '2fa', message: `${users.filter((u) => !u.security?.twoFactor).length} admins have not enabled 2FA.`, tone: 'warning' as const },
      { id: 'kernel', message: 'This module is the NGO OS kernel — all module access flows from roles configured here.', tone: 'info' as const },
      { id: 'audit', message: 'All financial approvals are logged in the audit trail.', tone: 'success' as const },
    ],
  }
}

export function filterUsers(users: AdminUserProfile[], filters: RbacFilters): AdminUserProfile[] {
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now.getTime() - 86400000).toDateString()
  const weekAgo = now.getTime() - 7 * 86400000
  const monthAgo = now.getTime() - 30 * 86400000

  return users.filter((u) => {
    if (filters.department !== 'all' && u.department !== filters.department) return false
    if (filters.role !== 'all' && u.role !== filters.role) return false
    if (filters.status !== 'all' && u.status !== filters.status) return false
    if (filters.lastLogin !== 'all') {
      const d = new Date(u.lastLogin)
      if (filters.lastLogin === 'today' && d.toDateString() !== today) return false
      if (filters.lastLogin === 'yesterday' && d.toDateString() !== yesterday) return false
      if (filters.lastLogin === 'week' && d.getTime() < weekAgo) return false
      if (filters.lastLogin === 'month' && d.getTime() < monthAgo) return false
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        u.name.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || u.department.toLowerCase().includes(q)
        || u.designation.toLowerCase().includes(q)
        || u.employeeId.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export function exportUsersCsv(users: AdminUserProfile[]) {
  downloadCsv(
    'admin-users.csv',
    ['Name', 'Department', 'Designation', 'Role', 'Last Login', 'Status'],
    users.map((u) => [u.name, u.department, u.designation, u.roleLabel, formatLastLogin(u.lastLogin), u.status]),
  )
}

export async function saveAdminUser(input: Partial<AdminUserProfile> & { email: string; firstName: string; lastName: string }): Promise<AdminUserProfile> {
  return withAudit(input.id ? 'UPDATE' : 'CREATE', 'admin_users', input.id, async () => {
    const all = readMeta() ?? buildDemoUsers()
    const role = input.role ?? 'viewer'
    const record: AdminUserProfile = {
      id: input.id ?? crypto.randomUUID(),
      userId: input.userId ?? `user-${Date.now()}`,
      employeeId: input.employeeId ?? `SV-${String(all.length + 1).padStart(3, '0')}`,
      firstName: input.firstName,
      lastName: input.lastName,
      name: `${input.firstName} ${input.lastName}`.trim(),
      email: input.email,
      phone: input.phone ?? '',
      department: input.department ?? 'Administration',
      designation: input.designation ?? '',
      role,
      roleLabel: ROLE_LABEL[role] ?? role,
      accessLevel: input.accessLevel ?? (role === 'super_admin' || role === 'director' ? 'Full' : 'Limited'),
      status: input.status ?? 'invited',
      lastLogin: input.lastLogin ?? new Date().toISOString(),
      reportingManager: input.reportingManager,
      photo: input.photo,
      createdAt: input.createdAt ?? new Date().toISOString(),
      twoFactorEnabled: input.twoFactorEnabled ?? false,
      security: input.security ?? defaultSecurity(input.twoFactorEnabled ?? false),
    }

    const index = all.findIndex((u) => u.id === record.id)
    if (index >= 0) all[index] = { ...all[index], ...record }
    else all.unshift(record)
    writeMeta(all)

    try {
      await updateAdminRole(record.userId, mapToLegacyRole(role))
    } catch {
      // local-only mode
    }

    return record
  })
}

export async function deleteAdminUser(id: string): Promise<void> {
  return withAudit('DELETE', 'admin_users', id, async () => {
    const all = readMeta() ?? buildDemoUsers()
    writeMeta(all.filter((u) => u.id !== id))
  })
}

export function saveDepartment(name: string): Department {
  const existing = readCustomDepartments() ?? DEPARTMENTS.map((n, i) => ({
    id: String(i + 1), name: n, headCount: 0,
  }))
  const dept: Department = { id: crypto.randomUUID(), name, headCount: 0 }
  writeDevStorageList(DEPT_META_KEY, [...existing, dept])
  return dept
}

export function saveCustomRole(name: string, description: string): RoleDefinition {
  const existing = readCustomRoles() ?? []
  const role: RoleDefinition = {
    id: `custom_${Date.now()}`,
    name,
    description,
    modules: ['Dashboard'],
    accessLevel: 'Limited',
  }
  writeDevStorageList(ROLE_META_KEY, [...existing, role])
  return role
}

export function formatLastLogin(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today.getTime() - 86400000)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function parseRbacTab(value: string | null): RbacTab {
  const valid = RBAC_TABS.map((t) => t.value)
  return valid.includes(value as RbacTab) ? (value as RbacTab) : 'dashboard'
}
