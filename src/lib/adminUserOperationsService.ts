import { downloadCsv } from './adminExport'
import { getAdminUsers, updateAdminRole, type AdminRole } from './rbacService'

export type RbacTab =
  | 'dashboard'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'departments'
  | 'approvals'
  | 'activity'
  | 'audit'
  | 'invitations'
  | 'security'
  | 'analytics'
  | 'settings'

export type SanvedaRole =
  | 'super_admin'
  | 'director'
  | 'fundraising_manager'
  | 'campaign_manager'
  | 'finance_manager'
  | 'finance_executive'
  | 'volunteer_manager'
  | 'membership_manager'
  | 'internship_manager'
  | 'program_manager'
  | 'event_manager'
  | 'content_manager'
  | 'csr_manager'
  | 'legal_officer'
  | 'auditor'
  | 'viewer'

export type UserStatus = 'active' | 'pending' | 'invited' | 'suspended'

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export'

export interface AdminUserProfile {
  id: string
  userId: string
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
}

export interface Department {
  id: string
  name: string
  headCount: number
}

export interface RoleDefinition {
  id: SanvedaRole
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
  timestamp: string
}

export interface AuditLogEntry {
  id: string
  date: string
  admin: string
  action: string
  detail: string
  ip: string
}

export interface PendingInvite {
  id: string
  email: string
  role: string
  department: string
  sentAt: string
}

export interface RbacFilters {
  search: string
  department: string | 'all'
  role: SanvedaRole | 'all'
  status: UserStatus | 'all'
}

export interface RbacDashboardData {
  users: AdminUserProfile[]
  departments: Department[]
  roles: RoleDefinition[]
  permissions: Record<SanvedaRole, ModulePermission[]>
  approvalMatrix: ApprovalStep[]
  activityLogs: ActivityLogEntry[]
  auditLogs: AuditLogEntry[]
  pendingInvites: PendingInvite[]
  kpis: {
    totalAdmins: number
    superAdmins: number
    activeUsers: number
    pendingInvites: number
    departments: number
    lastLoginToday: number
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

export const RBAC_TABS: { value: RbacTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'users', label: 'Admin Users' },
  { value: 'roles', label: 'Roles' },
  { value: 'permissions', label: 'Permissions' },
  { value: 'departments', label: 'Departments' },
  { value: 'approvals', label: 'Approvals' },
  { value: 'activity', label: 'Activity Logs' },
  { value: 'audit', label: 'Audit Logs' },
  { value: 'invitations', label: 'Invitations' },
  { value: 'security', label: 'Security' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'settings', label: 'Settings' },
]

export const DEPARTMENTS = [
  'Administration', 'Fundraising', 'Finance', 'Volunteer Management', 'Membership',
  'Programs', 'Media', 'Legal', 'Operations', 'Technology',
] as const

export const SANVEDA_ROLES: { value: SanvedaRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'director', label: 'NGO Director' },
  { value: 'fundraising_manager', label: 'Fundraising Manager' },
  { value: 'campaign_manager', label: 'Campaign Manager' },
  { value: 'finance_manager', label: 'Finance Manager' },
  { value: 'finance_executive', label: 'Finance Officer' },
  { value: 'volunteer_manager', label: 'Volunteer Manager' },
  { value: 'membership_manager', label: 'Membership Manager' },
  { value: 'internship_manager', label: 'Internship Manager' },
  { value: 'program_manager', label: 'Program Manager' },
  { value: 'event_manager', label: 'Event Manager' },
  { value: 'content_manager', label: 'Content Manager' },
  { value: 'csr_manager', label: 'CSR Manager' },
  { value: 'legal_officer', label: 'Legal Officer' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'viewer', label: 'Viewer' },
]

const ROLE_LABEL = Object.fromEntries(SANVEDA_ROLES.map((r) => [r.value, r.label])) as Record<SanvedaRole, string>

const MODULES = ['Campaigns', 'Donations', 'Finance', 'Reports', 'Volunteers', 'CMS', 'Gallery', 'Beneficiaries']

function buildRoleDefinitions(): RoleDefinition[] {
  return [
    { id: 'super_admin', name: 'Super Admin', description: 'Full access to everything', modules: ['*'], accessLevel: 'Full' },
    { id: 'director', name: 'NGO Director', description: 'Campaigns, donations, finance, reports, approvals', modules: ['Campaigns', 'Donations', 'Finance', 'Reports'], accessLevel: 'Full' },
    { id: 'fundraising_manager', name: 'Fundraising Manager', description: 'Campaigns, donors, transactions, reports', modules: ['Campaigns', 'Donations', 'Reports'], accessLevel: 'Limited' },
    { id: 'finance_executive', name: 'Finance Officer', description: 'Income, expenses, tax receipts, reports', modules: ['Finance', 'Reports', 'Tax Receipts'], accessLevel: 'Limited' },
    { id: 'volunteer_manager', name: 'Volunteer Manager', description: 'Volunteers, members, internships, certificates', modules: ['Volunteers', 'Membership', 'Internships'], accessLevel: 'Limited' },
    { id: 'content_manager', name: 'Content Manager', description: 'Blogs, CMS, gallery, testimonials', modules: ['Blogs', 'CMS', 'Gallery', 'Testimonials'], accessLevel: 'Limited' },
    { id: 'auditor', name: 'Auditor', description: 'Read-only access to finance and audit logs', modules: ['Finance', 'Reports', 'Audit'], accessLevel: 'Read-only' },
    { id: 'viewer', name: 'Viewer', description: 'View-only dashboard access', modules: ['Dashboard'], accessLevel: 'Read-only' },
  ]
}

function defaultPermissions(role: SanvedaRole): ModulePermission[] {
  const full = MODULES.map((m) => ({ module: m, view: true, create: true, edit: true, delete: true, export: true }))
  const viewExport = MODULES.map((m) => ({ module: m, view: true, create: false, edit: false, delete: false, export: m === 'Reports' || m === 'Donations' }))
  const viewOnly = MODULES.map((m) => ({ module: m, view: true, create: false, edit: false, delete: false, export: false }))

  if (role === 'super_admin' || role === 'director') return full
  if (role === 'auditor' || role === 'viewer') return viewOnly
  return viewExport
}

function buildDemoUsers(): AdminUserProfile[] {
  const now = new Date()
  return [
    {
      id: '1', userId: 'local-admin', firstName: 'Advait', lastName: 'Singh', name: 'Advait Singh',
      email: 'admin@sanveda.org', phone: '+91 98765 43210', department: 'Administration',
      designation: 'Founder & CEO', role: 'super_admin', roleLabel: 'Super Admin',
      accessLevel: 'Full', status: 'active', lastLogin: now.toISOString(), createdAt: now.toISOString(), twoFactorEnabled: true,
    },
    {
      id: '2', userId: 'user-2', firstName: 'Rahul', lastName: 'Sharma', name: 'Rahul Sharma',
      email: 'campaigns@sanveda.org', phone: '+91 98765 00001', department: 'Fundraising',
      designation: 'Campaign Manager', role: 'campaign_manager', roleLabel: 'Campaign Manager',
      accessLevel: 'Limited', status: 'active', lastLogin: new Date(now.getTime() - 86400000).toISOString(),
      reportingManager: 'Advait Singh', createdAt: now.toISOString(), twoFactorEnabled: false,
    },
    {
      id: '3', userId: 'user-3', firstName: 'Priya', lastName: 'Mehta', name: 'Priya Mehta',
      email: 'finance@sanveda.org', phone: '+91 98765 00002', department: 'Finance',
      designation: 'Finance Officer', role: 'finance_executive', roleLabel: 'Finance Officer',
      accessLevel: 'Limited', status: 'active', lastLogin: new Date(now.getTime() - 172800000).toISOString(),
      reportingManager: 'Advait Singh', createdAt: now.toISOString(), twoFactorEnabled: true,
    },
    {
      id: '4', userId: 'user-4', firstName: 'Aman', lastName: 'Gupta', name: 'Aman Gupta',
      email: 'volunteers@sanveda.org', phone: '+91 98765 00003', department: 'Volunteer Management',
      designation: 'Volunteer Manager', role: 'volunteer_manager', roleLabel: 'Volunteer Manager',
      accessLevel: 'Limited', status: 'active', lastLogin: new Date(now.getTime() - 3600000).toISOString(),
      createdAt: now.toISOString(), twoFactorEnabled: false,
    },
  ]
}

function readMeta(): AdminUserProfile[] | null {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? (JSON.parse(raw) as AdminUserProfile[]) : null
  } catch {
    return null
  }
}

function writeMeta(users: AdminUserProfile[]) {
  localStorage.setItem(META_KEY, JSON.stringify(users))
}

function mapLegacyRole(role: AdminRole): SanvedaRole {
  const map: Record<AdminRole, SanvedaRole> = {
    super_admin: 'super_admin',
    admin: 'director',
    finance: 'finance_executive',
    content: 'content_manager',
    volunteer: 'volunteer_manager',
  }
  return map[role] ?? 'viewer'
}

function mapToLegacyRole(role: SanvedaRole): AdminRole {
  if (role === 'super_admin') return 'super_admin'
  if (role === 'finance_executive' || role === 'finance_manager') return 'finance'
  if (role === 'content_manager') return 'content'
  if (role === 'volunteer_manager') return 'volunteer'
  return 'admin'
}

export async function getRbacDashboardData(): Promise<RbacDashboardData> {
  let users = readMeta()
  if (!users) {
    try {
      const legacy = await getAdminUsers()
      users = legacy.length
        ? legacy.map((u, i) => {
            const demo = buildDemoUsers()[i] ?? buildDemoUsers()[0]
            return {
              ...demo,
              userId: u.userId,
              email: u.email ?? demo.email,
              role: mapLegacyRole(u.role),
              roleLabel: ROLE_LABEL[mapLegacyRole(u.role)],
              createdAt: u.createdAt,
            }
          })
        : buildDemoUsers()
    } catch {
      users = buildDemoUsers()
    }
  }

  const roles = buildRoleDefinitions()
  const permissions = Object.fromEntries(
    SANVEDA_ROLES.slice(0, 8).map((r) => [r.value, defaultPermissions(r.value)]),
  ) as Record<SanvedaRole, ModulePermission[]>

  return {
    users,
    departments: DEPARTMENTS.map((name, i) => ({ id: String(i + 1), name, headCount: 2 + (i % 4) })),
    roles,
    permissions,
    approvalMatrix: [
      { id: '1', workflow: 'Volunteer Approval', steps: ['Volunteer Application', 'Volunteer Manager', 'Director'] },
      { id: '2', workflow: 'Expense Approval', steps: ['Expense Submitted', 'Finance Officer', 'Director'] },
      { id: '3', workflow: 'Campaign Approval', steps: ['Campaign Draft', 'Fundraising Head', 'Super Admin'] },
    ],
    activityLogs: [
      { id: '1', user: 'Advait Singh', action: 'Created Campaign', module: 'Campaigns', timestamp: '2 mins ago' },
      { id: '2', user: 'Rahul Sharma', action: 'Approved Volunteer', module: 'Volunteers', timestamp: '15 mins ago' },
      { id: '3', user: 'Priya Mehta', action: 'Exported Finance Report', module: 'Finance', timestamp: '1 hour ago' },
    ],
    auditLogs: [
      { id: '1', date: '04 Jul 2026', admin: 'Advait Singh', action: 'Approved donation', detail: 'Donation: ₹50,000', ip: '122.xxx.xxx.xxx' },
      { id: '2', date: '03 Jul 2026', admin: 'Rahul Sharma', action: 'Updated campaign', detail: 'Campaign: Cancer Treatment Fund', ip: '103.xxx.xxx.xxx' },
    ],
    pendingInvites: [
      { id: '1', email: 'newadmin@sanveda.org', role: 'Content Manager', department: 'Media', sentAt: '2 days ago' },
      { id: '2', email: 'auditor@sanveda.org', role: 'Auditor', department: 'Finance', sentAt: '5 days ago' },
    ],
    kpis: {
      totalAdmins: Math.max(users.length, 18),
      superAdmins: Math.max(users.filter((u) => u.role === 'super_admin').length, 2),
      activeUsers: Math.max(users.filter((u) => u.status === 'active').length, 15),
      pendingInvites: 3,
      departments: DEPARTMENTS.length,
      lastLoginToday: Math.max(users.filter((u) => {
        const d = new Date(u.lastLogin)
        return d.toDateString() === new Date().toDateString()
      }).length, 12),
    },
    activityByDepartment: [
      { label: 'Super Admin', value: 35, pct: 35 },
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
      { id: 'invites', message: '3 admin invites are pending acceptance.', tone: 'warning' as const },
      { id: '2fa', message: '2 admins have not enabled 2FA — security review recommended.', tone: 'warning' as const },
      { id: 'activity', message: 'Fundraising team generated 30% of admin activity this week.', tone: 'info' as const },
      { id: 'audit', message: 'All financial approvals logged in audit trail.', tone: 'success' as const },
    ],
  }
}

export function filterUsers(users: AdminUserProfile[], filters: RbacFilters): AdminUserProfile[] {
  return users.filter((u) => {
    if (filters.department !== 'all' && u.department !== filters.department) return false
    if (filters.role !== 'all' && u.role !== filters.role) return false
    if (filters.status !== 'all' && u.status !== filters.status) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q)
    }
    return true
  })
}

export function exportUsersCsv(users: AdminUserProfile[]) {
  downloadCsv(
    'admin-users.csv',
    ['Name', 'Email', 'Department', 'Role', 'Access', 'Last Login', 'Status'],
    users.map((u) => [u.name, u.email, u.department, u.roleLabel, u.accessLevel, u.lastLogin, u.status]),
  )
}

export async function saveAdminUser(input: Partial<AdminUserProfile> & { email: string; firstName: string; lastName: string }): Promise<AdminUserProfile> {
  const all = readMeta() ?? buildDemoUsers()
  const role = input.role ?? 'viewer'
  const record: AdminUserProfile = {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId ?? `user-${Date.now()}`,
    firstName: input.firstName,
    lastName: input.lastName,
    name: `${input.firstName} ${input.lastName}`.trim(),
    email: input.email,
    phone: input.phone ?? '',
    department: input.department ?? 'Administration',
    designation: input.designation ?? '',
    role,
    roleLabel: ROLE_LABEL[role],
    accessLevel: input.accessLevel ?? (role === 'super_admin' || role === 'director' ? 'Full' : 'Limited'),
    status: input.status ?? 'invited',
    lastLogin: input.lastLogin ?? new Date().toISOString(),
    reportingManager: input.reportingManager,
    photo: input.photo,
    createdAt: input.createdAt ?? new Date().toISOString(),
    twoFactorEnabled: input.twoFactorEnabled ?? false,
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
}

export async function deleteAdminUser(id: string): Promise<void> {
  const all = readMeta() ?? buildDemoUsers()
  writeMeta(all.filter((u) => u.id !== id))
}

export function formatLastLogin(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today.getTime() - 86400000)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
