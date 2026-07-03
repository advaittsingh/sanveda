import { downloadCsv } from './adminExport'
import { getAuditLogs, type AuditLog } from './auditService'

export type AuditTab =
  | 'dashboard'
  | 'activity'
  | 'security'
  | 'financial'
  | 'volunteer'
  | 'membership'
  | 'approvals'
  | 'datachanges'
  | 'compliance'
  | 'ai'
  | 'exports'
  | 'settings'

export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT'
  | 'EXPORT' | 'DOWNLOAD' | 'UPLOAD' | 'GENERATE' | 'SEND' | 'ASSIGN' | 'PUBLISH' | 'ARCHIVE'

export type AuditSeverity = 'info' | 'warning' | 'critical' | 'security'

export type AuditResult = 'success' | 'failed'

export type QuickFilter = 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'critical' | 'failed' | 'security'

export interface AuditLogEntry {
  id: string
  userId?: string
  userName: string
  role: string
  department: string
  module: string
  entityType: string
  entityId: string
  object: string
  action: AuditAction
  oldValue: string
  newValue: string
  severity: AuditSeverity
  status: AuditResult
  ip: string
  device: string
  browser: string
  sessionId: string
  createdAt: string
}

export interface SecurityLogEntry {
  id: string
  event: string
  user: string
  device: string
  ip: string
  result: AuditResult
  createdAt: string
}

export interface FinancialAuditEntry {
  id: string
  date: string
  user: string
  action: string
  amount: string
  project: string
  referenceId: string
  severity: AuditSeverity
}

export interface VolunteerAuditEntry {
  id: string
  date: string
  action: string
  volunteer: string
  module: string
  user: string
}

export interface MembershipAuditEntry {
  id: string
  date: string
  action: string
  member: string
  user: string
}

export interface DataChangeEntry {
  id: string
  entity: string
  original: string
  updated: string
  changedBy: string
  approvedBy: string
  module: string
  createdAt: string
}

export interface ComplianceReport {
  id: string
  name: string
  description: string
  lastGenerated?: string
}

export interface AuditFilters {
  search: string
  dateFrom: string
  dateTo: string
  user: string
  department: string | 'all'
  module: string | 'all'
  action: AuditAction | 'all'
  severity: AuditSeverity | 'all'
  status: AuditResult | 'all'
  ip: string
  quick: QuickFilter
}

export interface AuditDashboardData {
  logs: AuditLogEntry[]
  securityLogs: SecurityLogEntry[]
  financialLogs: FinancialAuditEntry[]
  volunteerLogs: VolunteerAuditEntry[]
  membershipLogs: MembershipAuditEntry[]
  dataChanges: DataChangeEntry[]
  complianceReports: ComplianceReport[]
  kpis: {
    totalLogs: number
    today: number
    criticalActions: number
    failedActions: number
    activeAdmins: number
    securityAlerts: number
  }
  actionsByModule: { label: string; value: number; pct: number }[]
  adminActivity: { label: string; value: number; pct: number }[]
  aiAlerts: { id: string; message: string; tone: 'info' | 'warning' | 'critical' }[]
}

export const AUDIT_TABS: { value: AuditTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'activity', label: 'Activity Logs' },
  { value: 'security', label: 'Security Logs' },
  { value: 'financial', label: 'Financial Logs' },
  { value: 'volunteer', label: 'Volunteer Logs' },
  { value: 'membership', label: 'Membership Logs' },
  { value: 'approvals', label: 'Approval Logs' },
  { value: 'datachanges', label: 'Data Changes' },
  { value: 'compliance', label: 'Compliance Reports' },
  { value: 'ai', label: 'AI Monitoring' },
  { value: 'exports', label: 'Exports' },
  { value: 'settings', label: 'Settings' },
]

export const AUDIT_MODULES = [
  'Campaigns', 'Donations', 'Monthly Giving', 'Transactions', 'Donors', 'Volunteers',
  'Members', 'Beneficiaries', 'Internships', 'Projects', 'Events', 'Gallery',
  'Documents', 'Enquiries', 'Finance', 'Tax Receipts', 'Blogs', 'CMS',
  'Testimonials', 'Admin Users', 'Settings',
] as const

export const AUDIT_ACTIONS: AuditAction[] = [
  'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT',
  'EXPORT', 'DOWNLOAD', 'UPLOAD', 'GENERATE', 'SEND', 'ASSIGN', 'PUBLISH', 'ARCHIVE',
]

export const AUDIT_DEPARTMENTS = [
  'Administration', 'Fundraising', 'Finance', 'Programs', 'Operations', 'Volunteer Management',
]

function buildDemoLogs(): AuditLogEntry[] {
  const base = new Date('2026-07-04T02:35:00')
  return [
    {
      id: '1', userName: 'Advait', role: 'Super Admin', department: 'Administration',
      module: 'Campaigns', entityType: 'campaign', entityId: '452', object: 'Save Child',
      action: 'CREATE', oldValue: '—', newValue: 'Campaign created',
      severity: 'info', status: 'success', ip: '122.xxx.xxx.xxx',
      device: 'MacBook Pro', browser: 'Chrome 124', sessionId: 'sess_a1b2c3',
      createdAt: base.toISOString(),
    },
    {
      id: '2', userName: 'Rahul', role: 'Campaign Admin', department: 'Fundraising',
      module: 'Volunteers', entityType: 'volunteer', entityId: '891', object: 'Priya Patel',
      action: 'APPROVE', oldValue: 'Status: Pending', newValue: 'Status: Active',
      severity: 'warning', status: 'success', ip: '103.xxx.xxx.xxx',
      device: 'iPhone 15', browser: 'Safari 17', sessionId: 'sess_d4e5f6',
      createdAt: new Date(base.getTime() - 3600000).toISOString(),
    },
    {
      id: '3', userName: 'Advait Singh', role: 'Super Admin', department: 'Administration',
      module: 'Campaigns', entityType: 'campaign', entityId: '452', object: 'Campaign #452',
      action: 'UPDATE', oldValue: 'Goal: ₹10,00,000', newValue: 'Goal: ₹15,00,000',
      severity: 'warning', status: 'success', ip: '122.xxx.xxx.xxx',
      device: 'MacBook Pro', browser: 'Chrome 124', sessionId: 'sess_a1b2c3',
      createdAt: new Date(base.getTime() - 7200000).toISOString(),
    },
    {
      id: '4', userName: 'Finance Admin', role: 'Finance Manager', department: 'Finance',
      module: 'Tax Receipts', entityType: 'receipt', entityId: 'TR-0042', object: 'Tax Receipt',
      action: 'DELETE', oldValue: 'Receipt #TR-0042', newValue: '—',
      severity: 'critical', status: 'success', ip: '49.xxx.xxx.xxx',
      device: 'Windows PC', browser: 'Chrome 124', sessionId: 'sess_g7h8i9',
      createdAt: new Date(base.getTime() - 86400000).toISOString(),
    },
    {
      id: '5', userName: 'Unknown', role: '—', department: '—',
      module: 'Admin Users', entityType: 'auth', entityId: '—', object: 'Login attempt',
      action: 'LOGIN', oldValue: '—', newValue: 'Authentication failed',
      severity: 'security', status: 'failed', ip: '180.xxx.xxx.xxx',
      device: 'Windows PC', browser: 'Firefox 125', sessionId: '—',
      createdAt: new Date(base.getTime() - 900000).toISOString(),
    },
    {
      id: '6', userName: 'Priya Mehta', role: 'Finance Manager', department: 'Finance',
      module: 'Finance', entityType: 'expense', entityId: 'EXP-2039', object: 'Healthcare Outreach',
      action: 'APPROVE', oldValue: 'Status: Pending', newValue: 'Status: Approved · ₹1,20,000',
      severity: 'critical', status: 'success', ip: '49.xxx.xxx.xxx',
      device: 'MacBook Air', browser: 'Chrome 124', sessionId: 'sess_j0k1l2',
      createdAt: new Date('2026-07-03T14:20:00').toISOString(),
    },
    {
      id: '7', userName: 'Admin', role: 'Super Admin', department: 'Administration',
      module: 'Donations', entityType: 'donation', entityId: '1054', object: 'Donation #1054',
      action: 'UPDATE', oldValue: '₹5,000', newValue: '₹50,000',
      severity: 'critical', status: 'success', ip: '122.xxx.xxx.xxx',
      device: 'MacBook Pro', browser: 'Chrome 124', sessionId: 'sess_m3n4o5',
      createdAt: new Date('2026-07-02T11:00:00').toISOString(),
    },
  ]
}

function enrichLegacyLog(log: AuditLog): AuditLogEntry {
  return {
    id: log.id,
    userId: log.userId,
    userName: String(log.details?.user ?? log.details?.userId ?? 'System'),
    role: String(log.details?.role ?? 'Admin'),
    department: String(log.details?.department ?? 'Administration'),
    module: log.entityType,
    entityType: log.entityType,
    entityId: log.entityId ?? '—',
    object: String(log.details?.object ?? log.entityId ?? log.entityType),
    action: (log.action.toUpperCase() as AuditAction) || 'UPDATE',
    oldValue: String(log.details?.oldValue ?? '—'),
    newValue: String(log.details?.newValue ?? JSON.stringify(log.details)),
    severity: 'info',
    status: 'success',
    ip: String(log.details?.ip ?? '—'),
    device: String(log.details?.device ?? '—'),
    browser: String(log.details?.browser ?? '—'),
    sessionId: String(log.details?.sessionId ?? '—'),
    createdAt: log.createdAt,
  }
}

export async function getAuditDashboardData(): Promise<AuditDashboardData> {
  let logs = buildDemoLogs()
  try {
    const legacy = await getAuditLogs(50)
    if (legacy.length) {
      const enriched = legacy.map(enrichLegacyLog)
      const ids = new Set(enriched.map((l) => l.id))
      logs = [...enriched, ...logs.filter((l) => !ids.has(l.id))]
    }
  } catch {
    // use demo data
  }

  const today = new Date().toDateString()
  const todayCount = logs.filter((l) => new Date(l.createdAt).toDateString() === today).length

  return {
    logs,
    securityLogs: [
      { id: 's1', event: 'Login', user: 'Admin', device: 'Mac', ip: '122.xxx.xxx.xxx', result: 'success', createdAt: logs[0].createdAt },
      { id: 's2', event: 'Login', user: 'Unknown', device: 'Windows', ip: '180.xxx.xxx.xxx', result: 'failed', createdAt: logs[4].createdAt },
      { id: 's3', event: 'Password Change', user: 'Rahul Sharma', device: 'iPhone', ip: '103.xxx.xxx.xxx', result: 'success', createdAt: logs[1].createdAt },
      { id: 's4', event: '2FA Activated', user: 'Priya Mehta', device: 'MacBook Air', ip: '49.xxx.xxx.xxx', result: 'success', createdAt: logs[5].createdAt },
      { id: 's5', event: 'Role Change', user: 'Advait Singh', device: 'MacBook Pro', ip: '122.xxx.xxx.xxx', result: 'success', createdAt: logs[2].createdAt },
    ],
    financialLogs: [
      { id: 'f1', date: '04 Jul 2026', user: 'Finance Admin', action: 'Tax receipt generated', amount: '₹25,000', project: 'Save Child', referenceId: 'TR-2026-0042', severity: 'info' },
      { id: 'f2', date: '03 Jul 2026', user: 'Finance Manager', action: 'Approved Expense', amount: '₹1,20,000', project: 'Healthcare Outreach', referenceId: 'EXP-2039', severity: 'critical' },
      { id: 'f3', date: '03 Jul 2026', user: 'System', action: 'Donation received', amount: '₹50,000', project: 'Cancer Treatment Fund', referenceId: 'DON-8821', severity: 'info' },
      { id: 'f4', date: '02 Jul 2026', user: 'Finance Manager', action: 'Refund processed', amount: '₹2,500', project: 'General Fund', referenceId: 'REF-112', severity: 'warning' },
      { id: 'f5', date: '01 Jul 2026', user: 'Finance Admin', action: 'Bank reconciliation', amount: '₹12,45,000', project: 'All Accounts', referenceId: 'RECON-JUL-01', severity: 'critical' },
    ],
    volunteerLogs: [
      { id: 'v1', date: '04 Jul 2026', action: 'Volunteer approved', volunteer: 'Priya Patel', module: 'Volunteers', user: 'Rahul Sharma' },
      { id: 'v2', date: '03 Jul 2026', action: 'Volunteer applied', volunteer: 'Aman Gupta', module: 'Volunteers', user: 'System' },
      { id: 'v3', date: '02 Jul 2026', action: 'Certificate generated', volunteer: 'Neha Singh', module: 'Volunteers', user: 'Aman Gupta' },
      { id: 'v4', date: '01 Jul 2026', action: 'Volunteer assigned', volunteer: 'Ravi Kumar', module: 'Events', user: 'Rahul Sharma' },
    ],
    membershipLogs: [
      { id: 'm1', date: '04 Jul 2026', action: 'Membership applied', member: 'Suresh Iyer', user: 'System' },
      { id: 'm2', date: '03 Jul 2026', action: 'Payment received', member: 'Kavita Rao', user: 'System' },
      { id: 'm3', date: '02 Jul 2026', action: 'Member approved', member: 'Deepak Jain', user: 'Admin' },
      { id: 'm4', date: '01 Jul 2026', action: 'Membership renewed', member: 'Anita Desai', user: 'System' },
    ],
    dataChanges: [
      { id: 'd1', entity: 'Donation #1054', original: '₹5,000', updated: '₹50,000', changedBy: 'Admin', approvedBy: 'Finance Head', module: 'Donations', createdAt: logs[6].createdAt },
      { id: 'd2', entity: 'Campaign #452', original: 'Goal: ₹10,00,000', updated: 'Goal: ₹15,00,000', changedBy: 'Advait Singh', approvedBy: 'Director', module: 'Campaigns', createdAt: logs[2].createdAt },
    ],
    complianceReports: [
      { id: 'c1', name: 'NGO Annual Audit', description: 'Full annual activity and financial audit trail', lastGenerated: '01 Jul 2026' },
      { id: 'c2', name: 'Donation Audit', description: 'All donation create, update, refund events', lastGenerated: '03 Jul 2026' },
      { id: 'c3', name: 'Finance Audit', description: 'Expenses, approvals, reconciliations', lastGenerated: '04 Jul 2026' },
      { id: 'c4', name: 'Volunteer Audit', description: 'Applications, approvals, certificates', lastGenerated: '02 Jul 2026' },
      { id: 'c5', name: 'Admin Activity Audit', description: 'All admin user actions across modules' },
      { id: 'c6', name: 'Security Audit', description: 'Login, auth, permission changes' },
      { id: 'c7', name: 'CSR Audit', description: 'Corporate partnership and CSR disbursement logs' },
      { id: 'c8', name: 'Tax Audit', description: '80G receipts, tax certificates, revocations' },
    ],
    kpis: {
      totalLogs: 128543,
      today: Math.max(todayCount, 342),
      criticalActions: logs.filter((l) => l.severity === 'critical').length || 18,
      failedActions: logs.filter((l) => l.status === 'failed').length || 5,
      activeAdmins: 12,
      securityAlerts: 2,
    },
    actionsByModule: [
      { label: 'Campaigns', value: 35, pct: 35 },
      { label: 'Finance', value: 25, pct: 25 },
      { label: 'Volunteers', value: 20, pct: 20 },
      { label: 'CMS', value: 10, pct: 10 },
      { label: 'Other', value: 10, pct: 10 },
    ],
    adminActivity: [
      { label: 'Advait', value: 42, pct: 42 },
      { label: 'Rahul', value: 28, pct: 28 },
      { label: 'Finance Team', value: 20, pct: 20 },
      { label: 'Others', value: 10, pct: 10 },
    ],
    aiAlerts: [
      { id: '1', message: 'Admin deleted 12 records in 3 minutes', tone: 'critical' },
      { id: '2', message: 'Unusual login from new device detected', tone: 'warning' },
      { id: '3', message: 'Expense approvals exceeded threshold this week', tone: 'warning' },
      { id: '4', message: 'Multiple failed logins detected from IP 180.xxx.xxx.xxx', tone: 'critical' },
      { id: '5', message: 'High-value donation edited — Donation #1054', tone: 'critical' },
    ],
  }
}

export function filterAuditLogs(logs: AuditLogEntry[], filters: AuditFilters): AuditLogEntry[] {
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now.getTime() - 86400000).toDateString()

  return logs.filter((l) => {
    if (filters.quick === 'today' && new Date(l.createdAt).toDateString() !== today) return false
    if (filters.quick === 'yesterday' && new Date(l.createdAt).toDateString() !== yesterday) return false
    if (filters.quick === 'last7' && new Date(l.createdAt).getTime() < now.getTime() - 7 * 86400000) return false
    if (filters.quick === 'last30' && new Date(l.createdAt).getTime() < now.getTime() - 30 * 86400000) return false
    if (filters.quick === 'critical' && l.severity !== 'critical') return false
    if (filters.quick === 'failed' && l.status !== 'failed') return false
    if (filters.quick === 'security' && l.severity !== 'security') return false

    if (filters.department !== 'all' && l.department !== filters.department) return false
    if (filters.module !== 'all' && l.module !== filters.module) return false
    if (filters.action !== 'all' && l.action !== filters.action) return false
    if (filters.severity !== 'all' && l.severity !== filters.severity) return false
    if (filters.status !== 'all' && l.status !== filters.status) return false
    if (filters.user.trim() && !l.userName.toLowerCase().includes(filters.user.toLowerCase())) return false
    if (filters.ip.trim() && !l.ip.includes(filters.ip.trim())) return false
    if (filters.dateFrom && new Date(l.createdAt) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(l.createdAt) > new Date(`${filters.dateTo}T23:59:59`)) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        l.userName.toLowerCase().includes(q)
        || l.module.toLowerCase().includes(q)
        || l.object.toLowerCase().includes(q)
        || l.action.toLowerCase().includes(q)
        || l.ip.includes(q)
      )
    }
    return true
  })
}

export function formatAuditTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', '')
}

export function formatAuditDetailTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export function exportAuditCsv(logs: AuditLogEntry[]) {
  downloadCsv(
    'audit-logs.csv',
    ['Time', 'User', 'Role', 'Action', 'Module', 'Object', 'Result', 'IP', 'Severity'],
    logs.map((l) => [
      formatAuditTime(l.createdAt), l.userName, l.role, l.action, l.module, l.object, l.status, l.ip, l.severity,
    ]),
  )
}

export function parseAuditTab(value: string | null): AuditTab {
  const valid = AUDIT_TABS.map((t) => t.value)
  return valid.includes(value as AuditTab) ? (value as AuditTab) : 'dashboard'
}

export const SEVERITY_LABELS: Record<AuditSeverity, string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
  security: 'Security',
}
