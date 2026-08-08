import { downloadCsv } from './adminExport'
import { getEnquiries, updateEnquiry, type Enquiry, type EnquiryStatus } from './enquiryService'
import { createWorkflowRow, groupWorkflowRows, listWorkflowRows, updateDomainRoot, type WorkflowRow } from './domainWorkflowService'

export type EnquiryCategory =
  | 'donations'
  | 'volunteer'
  | 'membership'
  | 'beneficiary'
  | 'internship'
  | 'partnership'
  | 'csr'
  | 'media'
  | 'complaint'
  | 'general'
  | 'technical'
  | 'event'

export type EnquiryPriority = 'critical' | 'high' | 'medium' | 'low'
export type EnquirySource = 'website' | 'whatsapp' | 'email' | 'instagram' | 'facebook' | 'linkedin' | 'phone' | 'referral' | 'walk_in'
export type WorkflowStage = 'new' | 'assigned' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
export type ConvertTarget = 'donor' | 'volunteer' | 'member' | 'beneficiary' | 'intern' | 'corporate_partner'

export interface MessageThreadItem {
  id: string
  author: 'user' | 'admin'
  authorName: string
  message: string
  timestamp: string
}

export interface AttachmentItem {
  name: string
  type: string
  uploaded: boolean
}

export interface CrmTimelineItem {
  label: string
  date: string
  completed: boolean
}

export interface LeadScoreBreakdown {
  label: string
  points: number
}

export interface EnquiryAdminMeta {
  category?: EnquiryCategory
  priority?: EnquiryPriority
  source?: EnquirySource
  workflowStage?: WorkflowStage
  assignedTo?: string
  organization?: string
  escalated?: boolean
  internalNotes?: string
  leadScore?: number
  slaHours?: number
  convertedTo?: ConvertTarget[]
  attachments?: AttachmentItem[]
  thread?: MessageThreadItem[]
  assignmentDate?: string
  firstResponseAt?: string
  resolvedAt?: string
}

export interface EnquiryProfile {
  id: string
  ticketId: string
  name: string
  email: string
  phone: string
  organization?: string
  subject: string
  message: string
  category: EnquiryCategory
  categoryLabel: string
  priority: EnquiryPriority
  source: EnquirySource
  sourceLabel: string
  workflowStage: WorkflowStage
  status: EnquiryStatus
  assignedTo: string
  assignedTeam: string
  createdAt: string
  createdLabel: string
  updatedAt: string
  leadScore: number
  leadScoreBreakdown: LeadScoreBreakdown[]
  slaHours: number
  slaCompliant: boolean
  responseTimeHours?: number
  resolutionTimeHours?: number
  isOverdue: boolean
  isEscalated: boolean
  internalNotes: string
  thread: MessageThreadItem[]
  attachments: AttachmentItem[]
  convertOptions: ConvertTarget[]
  crmTimeline: CrmTimelineItem[]
}

export interface EnquiryFilters {
  search: string
  category: EnquiryCategory | 'all'
  priority: EnquiryPriority | 'all'
  status: WorkflowStage | 'all'
  source: EnquirySource | 'all'
  assignedTo: string | 'all'
}

export interface EnquiryDashboardData {
  enquiries: EnquiryProfile[]
  kpis: {
    totalEnquiries: number
    newCount: number
    inProgress: number
    resolved: number
    escalated: number
    avgResponseTimeHours: number
    slaCompliancePct: number
    overdueCount: number
  }
  pipeline: Record<WorkflowStage, EnquiryProfile[]>
  categoryDistribution: { label: string; value: number; pct: number }[]
  monthlyTrends: { label: string; value: number }[]
  resolutionBreakdown: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

export const ENQUIRY_CATEGORIES: { value: EnquiryCategory; label: string; slaHours: number; defaultTeam: string }[] = [
  { value: 'donations', label: 'Donations', slaHours: 2, defaultTeam: 'Fundraising Team' },
  { value: 'volunteer', label: 'Volunteer', slaHours: 24, defaultTeam: 'Volunteer Coordinator' },
  { value: 'membership', label: 'Membership', slaHours: 24, defaultTeam: 'Membership Team' },
  { value: 'beneficiary', label: 'Beneficiary Support', slaHours: 12, defaultTeam: 'Programme Team' },
  { value: 'internship', label: 'Internship', slaHours: 48, defaultTeam: 'Internship Team' },
  { value: 'partnership', label: 'Partnership', slaHours: 24, defaultTeam: 'Partnerships Team' },
  { value: 'csr', label: 'CSR', slaHours: 4, defaultTeam: 'Fundraising Team' },
  { value: 'media', label: 'Media', slaHours: 12, defaultTeam: 'Communications Team' },
  { value: 'complaint', label: 'Complaint', slaHours: 12, defaultTeam: 'Support Team' },
  { value: 'general', label: 'General', slaHours: 48, defaultTeam: 'Admin' },
  { value: 'technical', label: 'Technical Support', slaHours: 8, defaultTeam: 'Tech Team' },
  { value: 'event', label: 'Event Registration', slaHours: 24, defaultTeam: 'Events Team' },
]

export const WORKFLOW_STAGES: { stage: WorkflowStage; label: string }[] = [
  { stage: 'new', label: 'New' },
  { stage: 'assigned', label: 'Assigned' },
  { stage: 'in_progress', label: 'In Progress' },
  { stage: 'waiting', label: 'Waiting' },
  { stage: 'resolved', label: 'Resolved' },
  { stage: 'closed', label: 'Closed' },
]

export const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const

export const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'phone', label: 'Phone' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk_in', label: 'Walk-in' },
] as const

export const CONVERT_TARGETS: { value: ConvertTarget; label: string }[] = [
  { value: 'donor', label: 'Donor' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'member', label: 'Member' },
  { value: 'beneficiary', label: 'Beneficiary' },
  { value: 'intern', label: 'Intern' },
  { value: 'corporate_partner', label: 'Corporate Partner' },
]

const CATEGORY_MAP = Object.fromEntries(ENQUIRY_CATEGORIES.map((c) => [c.value, c])) as Record<EnquiryCategory, typeof ENQUIRY_CATEGORIES[0]>
const SOURCE_LABEL = Object.fromEntries(SOURCE_OPTIONS.map((s) => [s.value, s.label])) as Record<EnquirySource, string>
const WORKFLOW_STAGE_SET = new Set<WorkflowStage>(WORKFLOW_STAGES.map((s) => s.stage))
const PRIORITY_SET = new Set<EnquiryPriority>(PRIORITY_OPTIONS.map((p) => p.value))
const SOURCE_SET = new Set<EnquirySource>(SOURCE_OPTIONS.map((s) => s.value))

/** Legacy / seed labels that do not match the admin category enum. */
const CATEGORY_ALIASES: Record<string, EnquiryCategory> = {
  volunteering: 'volunteer',
  volunteer_application: 'volunteer',
  donor_support: 'donations',
  donation: 'donations',
  donors: 'donations',
  partner: 'partnership',
  partners: 'partnership',
  support: 'general',
  other: 'general',
}

const WORKFLOW_ALIASES: Record<string, WorkflowStage> = {
  triage: 'new',
  open: 'new',
  engagement: 'in_progress',
  progressing: 'in_progress',
  resolution: 'resolved',
  done: 'resolved',
}

function normalizeCategory(raw?: string | null): EnquiryCategory {
  if (!raw) return 'general'
  if (raw in CATEGORY_MAP) return raw as EnquiryCategory
  return CATEGORY_ALIASES[raw] ?? 'general'
}

function normalizePriority(raw?: string | null): EnquiryPriority {
  if (raw && PRIORITY_SET.has(raw as EnquiryPriority)) return raw as EnquiryPriority
  return 'low'
}

function normalizeSource(raw?: string | null): EnquirySource {
  if (raw && SOURCE_SET.has(raw as EnquirySource)) return raw as EnquirySource
  return 'website'
}

function normalizeWorkflowStage(
  raw: string | undefined,
  enquiry: Enquiry,
  meta?: EnquiryAdminMeta,
): WorkflowStage {
  if (raw && WORKFLOW_STAGE_SET.has(raw as WorkflowStage)) return raw as WorkflowStage
  if (raw && WORKFLOW_ALIASES[raw]) return WORKFLOW_ALIASES[raw]
  return mapWorkflow(enquiry, meta)
}

async function listEnquiryWorkflow(
  table: 'enquiry_messages' | 'enquiry_assignments' | 'enquiry_sla_events' | 'enquiry_conversions',
  ids: string[],
): Promise<WorkflowRow[]> {
  try {
    return await listWorkflowRows(table, 'enquiry_id', ids)
  } catch (err) {
    console.warn(`[enquiries] failed to load ${table}; continuing without it`, err)
    return []
  }
}

export async function updateEnquiryMeta(id: string, patch: Partial<EnquiryAdminMeta>) {
  const rootPatch: Record<string, unknown> = {}
  if ('category' in patch) rootPatch.category = patch.category || null
  if ('priority' in patch) rootPatch.priority = patch.priority || null
  if ('source' in patch) rootPatch.source = patch.source || null
  if ('workflowStage' in patch) rootPatch.workflow_stage = patch.workflowStage || null
  if ('organization' in patch) rootPatch.organization = patch.organization || null
  if ('assignedTo' in patch) rootPatch.assigned_to = patch.assignedTo || null
  if ('assignedTeam' in patch) rootPatch.assigned_team = patch.assignedTeam || null
  if ('leadScore' in patch) rootPatch.lead_score = patch.leadScore ?? null
  if ('slaHours' in patch) rootPatch.sla_target_hours = patch.slaHours ?? null
  if ('escalated' in patch) rootPatch.escalated = patch.escalated ?? false
  await updateDomainRoot('enquiries', id, rootPatch)
}

function mapWorkflow(enquiry: Enquiry, meta?: EnquiryAdminMeta): WorkflowStage {
  if (meta?.workflowStage && WORKFLOW_STAGE_SET.has(meta.workflowStage)) return meta.workflowStage
  if (enquiry.status === 'new') return 'new'
  if (enquiry.status === 'in_progress') return 'in_progress'
  if (enquiry.status === 'resolved') return 'resolved'
  if (enquiry.status === 'closed') return 'closed'
  return 'new'
}

function computeLeadScore(enquiry: Enquiry, category: EnquiryCategory): LeadScoreBreakdown[] {
  const breakdown: LeadScoreBreakdown[] = []
  const text = `${enquiry.subject ?? ''} ${enquiry.message ?? ''}`.toLowerCase()
  const email = enquiry.email ?? ''

  if (category === 'csr') breakdown.push({ label: 'CSR Opportunity', points: 40 })
  if (text.includes('budget') || text.includes('₹') || text.includes('lakh')) breakdown.push({ label: 'Budget Mentioned', points: 20 })
  if (email.includes('@') && !email.includes('gmail') && !email.includes('yahoo')) {
    breakdown.push({ label: 'Organization Email', points: 15 })
  }
  if (text.includes('follow') || text.includes('call') || text.includes('meeting')) {
    breakdown.push({ label: 'Follow-up Requested', points: 13 })
  }
  if (category === 'donations') breakdown.push({ label: 'Donor Intent', points: 25 })
  return breakdown
}

function buildThread(enquiry: Enquiry, meta?: EnquiryAdminMeta): MessageThreadItem[] {
  if (meta?.thread?.length) return meta.thread
  const thread: MessageThreadItem[] = [{
    id: '1', author: 'user', authorName: enquiry.name, message: enquiry.message, timestamp: enquiry.createdAt,
  }]
  return thread
}

function buildCrmTimeline(enquiry: Enquiry, meta?: EnquiryAdminMeta): CrmTimelineItem[] {
  const items: CrmTimelineItem[] = [
    { label: 'Enquiry Created', date: enquiry.createdAt, completed: true },
  ]
  if (meta?.convertedTo?.includes('volunteer')) items.push({ label: 'Became Volunteer', date: enquiry.updatedAt, completed: true })
  if (meta?.convertedTo?.includes('member')) items.push({ label: 'Became Member', date: enquiry.updatedAt, completed: true })
  if (meta?.convertedTo?.includes('donor')) items.push({ label: 'Converted to donor', date: enquiry.updatedAt, completed: true })
  if (enquiry.status === 'resolved' || enquiry.status === 'closed') {
    items.push({ label: 'Enquiry Resolved', date: enquiry.updatedAt, completed: true })
  }
  return items
}

function formatCreatedLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

/** Exported for unit tests — keep Contact Us / seed rows render-safe. */
export function buildEnquiryProfile(
  enquiry: Enquiry,
  meta: EnquiryAdminMeta | undefined = undefined,
  index = 0,
): EnquiryProfile {
  void index
  const category = normalizeCategory(enquiry.category ?? meta?.category)
  const catInfo = CATEGORY_MAP[category] ?? CATEGORY_MAP.general
  const priority = normalizePriority(enquiry.priority ?? meta?.priority)
  const source = normalizeSource(enquiry.source ?? meta?.source)
  const workflowStage = normalizeWorkflowStage(enquiry.workflowStage ?? meta?.workflowStage, enquiry, meta)
  const leadScoreBreakdown = computeLeadScore(enquiry, category)
  const leadScore = meta?.leadScore ?? leadScoreBreakdown.reduce((s, b) => s + b.points, 0)
  const categorySla = catInfo.slaHours
  const slaHours = enquiry.slaTargetHours ?? meta?.slaHours ?? categorySla
  const createdMs = Date.parse(enquiry.createdAt)
  const hoursSinceCreated = Number.isFinite(createdMs)
    ? (Date.now() - createdMs) / (1000 * 60 * 60)
    : 0
  const responseTimeHours = meta?.firstResponseAt
    ? (new Date(meta.firstResponseAt).getTime() - (Number.isFinite(createdMs) ? createdMs : Date.now())) / (1000 * 60 * 60)
    : undefined
  const slaCompliant = responseTimeHours !== undefined ? responseTimeHours <= slaHours : hoursSinceCreated <= slaHours
  const isOverdue = !slaCompliant && !['resolved', 'closed'].includes(workflowStage)

  return {
    id: enquiry.id,
    ticketId: enquiry.ticketCode ?? '',
    name: enquiry.name || 'Unknown',
    email: enquiry.email || '',
    phone: enquiry.phone || '',
    organization: enquiry.organization ?? meta?.organization,
    subject: enquiry.subject || '(No subject)',
    message: enquiry.message || '',
    category,
    categoryLabel: catInfo.label,
    priority,
    source,
    sourceLabel: SOURCE_LABEL[source] ?? 'Website',
    workflowStage,
    status: enquiry.status,
    assignedTo: enquiry.assignedTo ?? meta?.assignedTo ?? 'Unassigned',
    assignedTeam: enquiry.assignedTeam ?? catInfo.defaultTeam,
    createdAt: enquiry.createdAt,
    createdLabel: formatCreatedLabel(enquiry.createdAt),
    updatedAt: enquiry.updatedAt,
    leadScore: enquiry.leadScore ?? Math.min(leadScore, 100),
    leadScoreBreakdown,
    slaHours,
    slaCompliant,
    responseTimeHours: responseTimeHours !== undefined ? Math.round(responseTimeHours * 10) / 10 : undefined,
    resolutionTimeHours: meta?.resolvedAt && Number.isFinite(createdMs)
      ? Math.round((new Date(meta.resolvedAt).getTime() - createdMs) / 360000) / 10
      : undefined,
    isOverdue,
    isEscalated: Boolean(enquiry.escalated),
    internalNotes: meta?.internalNotes ?? enquiry.adminNotes ?? '',
    thread: buildThread(enquiry, meta),
    attachments: meta?.attachments ?? [],
    convertOptions: ['donor', 'volunteer', 'member', 'beneficiary', 'intern', 'corporate_partner'] as ConvertTarget[],
    crmTimeline: buildCrmTimeline(enquiry, meta),
  }
}

function computeKpis(enquiries: EnquiryProfile[]) {
  const responseTimes = enquiries.filter((e) => e.responseTimeHours !== undefined).map((e) => e.responseTimeHours!)
  const avgResponse = responseTimes.length
    ? Math.round((responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length) * 10) / 10
    : 0

  const slaOk = enquiries.filter((e) => e.slaCompliant || ['resolved', 'closed'].includes(e.workflowStage)).length
  const slaTotal = enquiries.length || 1

  return {
    totalEnquiries: enquiries.length,
    newCount: enquiries.filter((e) => e.workflowStage === 'new').length,
    inProgress: enquiries.filter((e) => ['assigned', 'in_progress', 'waiting'].includes(e.workflowStage)).length,
    resolved: enquiries.filter((e) => ['resolved', 'closed'].includes(e.workflowStage)).length,
    escalated: enquiries.filter((e) => e.isEscalated).length,
    avgResponseTimeHours: avgResponse,
    slaCompliancePct: Math.round((slaOk / slaTotal) * 100),
    overdueCount: enquiries.filter((e) => e.isOverdue).length,
  }
}

function computeAnalytics(enquiries: EnquiryProfile[]) {
  const catMap = new Map<string, number>()
  for (const e of enquiries) catMap.set(e.categoryLabel, (catMap.get(e.categoryLabel) ?? 0) + 1)
  const total = enquiries.length || 1
  const categoryDistribution = [...catMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value)

  const monthMap = new Map<string, number>()
  for (const enquiry of enquiries) {
    const label = enquiry.createdAt.slice(0, 7)
    monthMap.set(label, (monthMap.get(label) ?? 0) + 1)
  }
  const monthlyTrends = [...monthMap].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value }))

  const resolved = enquiries.filter((e) => ['resolved', 'closed'].includes(e.workflowStage)).length
  const open = enquiries.filter((e) => ['new', 'assigned', 'in_progress', 'waiting'].includes(e.workflowStage)).length
  const escalated = enquiries.filter((e) => e.isEscalated).length
  const resTotal = resolved + open + escalated || 1

  const resolutionBreakdown = [
    { label: 'Resolved', value: resolved, pct: Math.round((resolved / resTotal) * 100) },
    { label: 'Open', value: open, pct: Math.round((open / resTotal) * 100) },
    { label: 'Escalated', value: escalated, pct: Math.round((escalated / resTotal) * 100) },
  ]

  return { categoryDistribution, monthlyTrends, resolutionBreakdown }
}

function computeAiInsights(enquiries: EnquiryProfile[], kpis: EnquiryDashboardData['kpis']) {
  const highPriority = enquiries.filter((e) => e.priority === 'critical' || e.priority === 'high')
    .filter((e) => !['resolved', 'closed'].includes(e.workflowStage)).length
  const volunteerAuto = enquiries.filter((e) => e.category === 'volunteer' && e.workflowStage === 'new').length

  return [
    ...(enquiries.length === 0
      ? [{ id: 'empty', message: 'No enquiries yet. Submissions from the public site will appear here.', tone: 'info' as const }]
      : []),
    ...(highPriority > 0
      ? [{ id: 'priority', message: `${highPriority} high-priority ticket(s) require action.`, tone: 'warning' as const }]
      : []),
    ...(volunteerAuto > 0
      ? [{ id: 'volunteer', message: `${volunteerAuto} new volunteer enquiry(ies) awaiting review.`, tone: 'info' as const }]
      : []),
    ...(kpis.overdueCount > 0
      ? [{ id: 'overdue', message: `${kpis.overdueCount} enquiry(ies) are overdue on SLA.`, tone: 'warning' as const }]
      : []),
  ]
}

export async function getEnquiryDashboardData(): Promise<EnquiryDashboardData> {
  const raw = await getEnquiries()
  const ids = raw.map((enquiry) => enquiry.id)
  const [messages, assignments, slaEvents, conversions] = await Promise.all([
    listEnquiryWorkflow('enquiry_messages', ids),
    listEnquiryWorkflow('enquiry_assignments', ids),
    listEnquiryWorkflow('enquiry_sla_events', ids),
    listEnquiryWorkflow('enquiry_conversions', ids),
  ])
  const messagesByEnquiry = groupWorkflowRows(messages, 'enquiry_id')
  const assignmentsByEnquiry = groupWorkflowRows(assignments, 'enquiry_id')
  const slaByEnquiry = groupWorkflowRows(slaEvents, 'enquiry_id')
  const conversionsByEnquiry = groupWorkflowRows(conversions, 'enquiry_id')
  const metaMap = Object.fromEntries(raw.map((enquiry) => {
    const assignment = (assignmentsByEnquiry.get(enquiry.id) ?? [])
      .filter((row) => !row.ended_at)
      .sort((a, b) => String(b.assigned_at).localeCompare(String(a.assigned_at)))[0]
    const events = slaByEnquiry.get(enquiry.id) ?? []
    return [enquiry.id, {
      assignedTo: assignment?.assigned_name ? String(assignment.assigned_name) : enquiry.assignedTo,
      assignmentDate: assignment?.assigned_at ? String(assignment.assigned_at) : undefined,
      firstResponseAt: events.find((row) => row.event_type === 'first_response')?.occurred_at as string | undefined,
      resolvedAt: events.find((row) => row.event_type === 'resolved')?.occurred_at as string | undefined,
      thread: (messagesByEnquiry.get(enquiry.id) ?? []).map((row: WorkflowRow) => ({
        id: String(row.id),
        author: row.author_type === 'admin' ? 'admin' as const : 'user' as const,
        authorName: row.author_name ? String(row.author_name) : '',
        message: row.message == null ? '' : String(row.message),
        timestamp: row.sent_at == null ? enquiry.createdAt : String(row.sent_at),
      })),
      convertedTo: (conversionsByEnquiry.get(enquiry.id) ?? [])
        .filter((row) => row.status !== 'cancelled')
        .map((row) => row.target_type as ConvertTarget),
    } satisfies EnquiryAdminMeta]
  }))
  const enquiries = raw.map((e, i) => buildEnquiryProfile(e, metaMap[e.id], i))

  const pipeline = WORKFLOW_STAGES.reduce((acc, { stage }) => {
    acc[stage] = enquiries.filter((e) => e.workflowStage === stage)
    return acc
  }, {} as Record<WorkflowStage, EnquiryProfile[]>)

  const kpis = computeKpis(enquiries)
  const analytics = computeAnalytics(enquiries)
  const aiInsights = computeAiInsights(enquiries, kpis)

  return { enquiries, kpis, pipeline, aiInsights, ...analytics }
}

export function filterEnquiries(enquiries: EnquiryProfile[], filters: EnquiryFilters): EnquiryProfile[] {
  return enquiries.filter((e) => {
    if (filters.category !== 'all' && e.category !== filters.category) return false
    if (filters.priority !== 'all' && e.priority !== filters.priority) return false
    if (filters.status !== 'all' && e.workflowStage !== filters.status) return false
    if (filters.source !== 'all' && e.source !== filters.source) return false
    if (filters.assignedTo !== 'all' && e.assignedTo !== filters.assignedTo) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.ticketId.toLowerCase().includes(q) ||
        e.categoryLabel.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export function exportEnquiriesCsv(enquiries: EnquiryProfile[]) {
  const headers = ['Ticket', 'Name', 'Category', 'Priority', 'Assigned To', 'Status', 'Source', 'Created']
  const rows = enquiries.map((e) => [
    e.ticketId,
    e.name,
    e.categoryLabel,
    e.priority,
    e.assignedTo,
    e.workflowStage,
    e.sourceLabel,
    e.createdLabel,
  ])
  downloadCsv('enquiries-export.csv', headers, rows)
}

export async function saveEnquiryProfile(
  id: string,
  patch: Partial<EnquiryAdminMeta> & { status?: EnquiryStatus; adminNotes?: string },
) {
  if (patch.status || patch.adminNotes) {
    await updateEnquiry(id, { status: patch.status, adminNotes: patch.adminNotes ?? patch.internalNotes })
  }
  const { status: _s, adminNotes: _n, ...metaPatch } = patch
  await updateEnquiryMeta(id, metaPatch)
  for (const target of patch.convertedTo ?? []) {
    const existing = await listWorkflowRows('enquiry_conversions', 'enquiry_id', [id])
    if (!existing.some((row) => row.target_type === target)) {
      await createWorkflowRow('enquiry_conversions', { enquiry_id: id, target_type: target, status: 'pending' })
    }
  }
}
