import { downloadCsv } from './adminExport'
import { getAuditLogs, type AuditLog } from './auditService'
import { isProductionDataMode } from './persistMeta'

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
  const failed = log.action.endsWith('_failed') || log.details?.status === 'failed'
  const severityRaw = String(log.details?.severity ?? (failed ? 'warning' : log.action === 'DELETE' ? 'critical' : 'info'))
  const severity = (['info', 'warning', 'critical', 'security'].includes(severityRaw) ? severityRaw : 'info') as AuditSeverity
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
    action: (log.action.replace(/_failed$/, '').toUpperCase() as AuditAction) || 'UPDATE',
    oldValue: String(log.details?.oldValue ?? '—'),
    newValue: String(log.details?.newValue ?? JSON.stringify(log.details)),
    severity,
    status: failed ? 'failed' : 'success',
    ip: String(log.details?.ip ?? '—'),
    device: String(log.details?.device ?? '—'),
    browser: String(log.details?.browser ?? '—'),
    sessionId: String(log.details?.sessionId ?? '—'),
    createdAt: log.createdAt,
  }
}

export async function getAuditDashboardData(): Promise<AuditDashboardData> {
  let logs: AuditLogEntry[] = []
  try {
    const legacy = await getAuditLogs(200)
    logs = legacy.map(enrichLegacyLog)
  } catch {
    logs = []
  }

  if (logs.length === 0 && !isProductionDataMode()) {
    logs = buildDemoLogs()
  }

  const today = new Date().toDateString()
  const todayCount = logs.filter((l) => new Date(l.createdAt).toDateString() === today).length
  const moduleCounts = new Map<string, number>()
  for (const log of logs) {
    moduleCounts.set(log.module, (moduleCounts.get(log.module) ?? 0) + 1)
  }
  const totalModule = [...moduleCounts.values()].reduce((a, b) => a + b, 0) || 1
  const actionsByModule = [...moduleCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value, pct: Math.round((value / totalModule) * 100) }))

  const financialLogs: FinancialAuditEntry[] = logs
    .filter((l) => ['donations', 'finance', 'expenses', 'tax_receipts', 'transactions'].includes(l.entityType))
    .slice(0, 8)
    .map((l) => ({
      id: l.id,
      date: new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      user: l.userName,
      action: `${l.action} ${l.object}`,
      amount: l.newValue,
      project: l.module,
      referenceId: l.entityId,
      severity: l.severity,
    }))

  const securityLogs: SecurityLogEntry[] = logs
    .filter((l) => l.action === 'LOGIN' || l.action === 'LOGOUT' || l.severity === 'security')
    .slice(0, 8)
    .map((l) => ({
      id: l.id,
      event: l.action,
      user: l.userName,
      device: l.device,
      ip: l.ip,
      result: l.status,
      createdAt: l.createdAt,
    }))

  return {
    logs,
    securityLogs: securityLogs.length ? securityLogs : (isProductionDataMode() ? [] : buildDemoLogs().slice(4, 5).map((l) => ({
      id: l.id, event: 'Login', user: l.userName, device: l.device, ip: l.ip, result: l.status, createdAt: l.createdAt,
    }))),
    financialLogs,
    volunteerLogs: logs.filter((l) => l.entityType === 'volunteers').slice(0, 5).map((l) => ({
      id: l.id,
      date: new Date(l.createdAt).toLocaleDateString('en-IN'),
      action: l.action,
      volunteer: l.object,
      module: l.module,
      user: l.userName,
    })),
    membershipLogs: logs.filter((l) => l.entityType === 'memberships').slice(0, 5).map((l) => ({
      id: l.id,
      date: new Date(l.createdAt).toLocaleDateString('en-IN'),
      action: l.action,
      member: l.object,
      user: l.userName,
    })),
    dataChanges: logs.filter((l) => l.action === 'UPDATE' || l.action === 'DELETE').slice(0, 5).map((l) => ({
      id: l.id,
      entity: l.object,
      original: l.oldValue,
      updated: l.newValue,
      changedBy: l.userName,
      approvedBy: '—',
      module: l.module,
      createdAt: l.createdAt,
    })),
    complianceReports: [
      { id: 'c1', name: 'NGO Annual Audit', description: 'Full annual activity and financial audit trail' },
      { id: 'c2', name: 'Donation Audit', description: 'All donation create, update, refund events' },
      { id: 'c3', name: 'Finance Audit', description: 'Expenses, approvals, reconciliations' },
    ],
    kpis: {
      totalLogs: logs.length,
      today: todayCount,
      criticalActions: logs.filter((l) => l.severity === 'critical').length,
      failedActions: logs.filter((l) => l.status === 'failed').length,
      activeAdmins: new Set(logs.map((l) => l.userName)).size,
      securityAlerts: logs.filter((l) => l.severity === 'security' || l.status === 'failed').length,
    },
    actionsByModule: actionsByModule.length ? actionsByModule : [{ label: 'System', value: logs.length, pct: 100 }],
    adminActivity: [],
    aiAlerts: logs.filter((l) => l.severity === 'critical' || l.status === 'failed').slice(0, 4).map((l, i) => ({
      id: String(i),
      message: `${l.action} on ${l.object} by ${l.userName}`,
      tone: l.severity === 'critical' ? 'critical' as const : 'warning' as const,
    })),
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
