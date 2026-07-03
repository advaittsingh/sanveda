import { downloadCsv } from './adminExport'
import { getEnquiries, updateEnquiry, type Enquiry, type EnquiryStatus } from './enquiryService'

const ENQUIRY_META_KEY = 'sanveda_enquiry_admin_meta'

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

const DEMO_ENQUIRIES: Partial<Enquiry & EnquiryAdminMeta>[] = [
  {
    id: 'demo-1', name: 'Rahul Sharma', email: 'rahul@abccorp.com', phone: '+91 98765 43210',
    subject: 'CSR Healthcare Camp Sponsorship', message: 'We want to sponsor a healthcare camp. Our budget is ₹10 lakh.',
    status: 'in_progress', organization: 'ABC Ltd', category: 'csr', priority: 'critical', source: 'email',
    workflowStage: 'in_progress', assignedTo: 'Priya Sharma', internalNotes: 'High-value CSR prospect. Follow up next Tuesday.',
  },
  {
    id: 'demo-2', name: 'Anita Desai', email: 'anita@gmail.com', phone: '+91 91234 56789',
    subject: 'Volunteer for Education Programme', message: 'I would like to volunteer for weekend education sessions.',
    status: 'new', category: 'volunteer', priority: 'medium', source: 'website',
    workflowStage: 'new', assignedTo: 'Volunteer Coordinator',
  },
  {
    id: 'demo-3', name: 'Rajesh Kumar', email: 'rajesh@company.in', phone: '+91 99887 76655',
    subject: 'Donation receipt not received', message: 'I donated ₹5,000 last week but have not received my 80G receipt.',
    status: 'in_progress', category: 'donations', priority: 'high', source: 'whatsapp',
    workflowStage: 'waiting', assignedTo: 'Finance Team', escalated: true,
  },
  {
    id: 'demo-4', name: 'Meera Patel', email: 'meera@media.com', phone: '+91 97654 32109',
    subject: 'Press coverage request', message: 'We would like to feature Sanveda in our CSR special edition.',
    status: 'resolved', category: 'media', priority: 'medium', source: 'linkedin',
    workflowStage: 'resolved', assignedTo: 'Communications Team',
  },
  {
    id: 'demo-5', name: 'Sanjay Mehta', email: 'sanjay@tech.io', phone: '+91 90123 45678',
    subject: 'Internship Application Query', message: 'What are the requirements for the summer internship programme?',
    status: 'new', category: 'internship', priority: 'low', source: 'website',
    workflowStage: 'assigned', assignedTo: 'Internship Team',
  },
]

function readMetaMap(): Record<string, EnquiryAdminMeta> {
  try {
    const raw = localStorage.getItem(ENQUIRY_META_KEY)
    return raw ? (JSON.parse(raw) as Record<string, EnquiryAdminMeta>) : {}
  } catch {
    return {}
  }
}

export function updateEnquiryMeta(id: string, patch: Partial<EnquiryAdminMeta>) {
  const map = readMetaMap()
  map[id] = { ...map[id], ...patch }
  localStorage.setItem(ENQUIRY_META_KEY, JSON.stringify(map))
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function inferCategory(enquiry: Enquiry): EnquiryCategory {
  const t = `${enquiry.subject} ${enquiry.message}`.toLowerCase()
  if (t.includes('csr') || t.includes('corporate') || t.includes('sponsor')) return 'csr'
  if (t.includes('donat') || t.includes('receipt') || t.includes('80g')) return 'donations'
  if (t.includes('volunteer')) return 'volunteer'
  if (t.includes('member')) return 'membership'
  if (t.includes('intern')) return 'internship'
  if (t.includes('beneficiar') || t.includes('support') || t.includes('help')) return 'beneficiary'
  if (t.includes('media') || t.includes('press')) return 'media'
  if (t.includes('complaint') || t.includes('issue')) return 'complaint'
  if (t.includes('event')) return 'event'
  if (t.includes('partner')) return 'partnership'
  return 'general'
}

function inferPriority(category: EnquiryCategory, meta?: EnquiryAdminMeta): EnquiryPriority {
  if (meta?.priority) return meta.priority
  if (category === 'csr') return 'critical'
  if (category === 'donations' || category === 'complaint') return 'high'
  if (category === 'volunteer' || category === 'media') return 'medium'
  return 'low'
}

function mapWorkflow(enquiry: Enquiry, meta?: EnquiryAdminMeta): WorkflowStage {
  if (meta?.workflowStage) return meta.workflowStage
  if (enquiry.status === 'new') return 'new'
  if (enquiry.status === 'in_progress') return 'in_progress'
  if (enquiry.status === 'resolved') return 'resolved'
  if (enquiry.status === 'closed') return 'closed'
  return 'new'
}

function computeLeadScore(enquiry: Enquiry, category: EnquiryCategory): LeadScoreBreakdown[] {
  const seed = hashCode(enquiry.id)
  const breakdown: LeadScoreBreakdown[] = []
  const text = `${enquiry.subject} ${enquiry.message}`.toLowerCase()

  if (category === 'csr') breakdown.push({ label: 'CSR Opportunity', points: 40 })
  if (text.includes('budget') || text.includes('₹') || text.includes('lakh')) breakdown.push({ label: 'Budget Mentioned', points: 20 })
  if (enquiry.email.includes('@') && !enquiry.email.includes('gmail') && !enquiry.email.includes('yahoo')) {
    breakdown.push({ label: 'Organization Email', points: 15 })
  }
  if (text.includes('follow') || text.includes('call') || text.includes('meeting')) {
    breakdown.push({ label: 'Follow-up Requested', points: 13 })
  }
  if (category === 'donations') breakdown.push({ label: 'Donor Intent', points: 25 })
  if (!breakdown.length) breakdown.push({ label: 'General Interest', points: 30 + (seed % 20) })

  return breakdown
}

function buildThread(enquiry: Enquiry, meta?: EnquiryAdminMeta): MessageThreadItem[] {
  if (meta?.thread?.length) return meta.thread
  const thread: MessageThreadItem[] = [{
    id: '1', author: 'user', authorName: enquiry.name, message: enquiry.message, timestamp: enquiry.createdAt,
  }]
  if (enquiry.status !== 'new') {
    thread.push({
      id: '2', author: 'admin', authorName: meta?.assignedTo ?? 'Sanveda Team',
      message: 'Thank you for reaching out. We are reviewing your enquiry and will respond shortly.',
      timestamp: enquiry.updatedAt,
    })
  }
  if (categoryIsCsr(enquiry) && enquiry.message.toLowerCase().includes('budget')) {
    thread.push({
      id: '3', author: 'admin', authorName: meta?.assignedTo ?? 'Priya Sharma',
      message: 'Could you share your CSR budget and preferred focus area?',
      timestamp: enquiry.updatedAt,
    })
    thread.push({
      id: '4', author: 'user', authorName: enquiry.name,
      message: 'Our budget is ₹10 lakh for healthcare programmes.',
      timestamp: enquiry.updatedAt,
    })
  }
  return thread
}

function categoryIsCsr(enquiry: Enquiry): boolean {
  return inferCategory(enquiry) === 'csr' || enquiry.subject.toLowerCase().includes('csr')
}

function buildCrmTimeline(enquiry: Enquiry, meta?: EnquiryAdminMeta): CrmTimelineItem[] {
  const items: CrmTimelineItem[] = [
    { label: 'Enquiry Created', date: enquiry.createdAt, completed: true },
  ]
  if (meta?.convertedTo?.includes('volunteer')) items.push({ label: 'Became Volunteer', date: enquiry.updatedAt, completed: true })
  if (meta?.convertedTo?.includes('member')) items.push({ label: 'Became Member', date: enquiry.updatedAt, completed: true })
  if (meta?.convertedTo?.includes('donor')) items.push({ label: 'Donated ₹5,000', date: enquiry.updatedAt, completed: true })
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

function buildProfile(enquiry: Enquiry, meta: EnquiryAdminMeta | undefined, index: number): EnquiryProfile {
  const category = meta?.category ?? inferCategory(enquiry)
  const catInfo = CATEGORY_MAP[category]
  const priority = inferPriority(category, meta)
  const source = meta?.source ?? (['website', 'email', 'whatsapp'][index % 3] as EnquirySource)
  const workflowStage = mapWorkflow(enquiry, meta)
  const leadScoreBreakdown = computeLeadScore(enquiry, category)
  const leadScore = meta?.leadScore ?? leadScoreBreakdown.reduce((s, b) => s + b.points, 0)
  const seed = hashCode(enquiry.id)
  const slaHours = catInfo.slaHours
  const hoursSinceCreated = (Date.now() - new Date(enquiry.createdAt).getTime()) / (1000 * 60 * 60)
  const responseTimeHours = meta?.firstResponseAt
    ? (new Date(meta.firstResponseAt).getTime() - new Date(enquiry.createdAt).getTime()) / (1000 * 60 * 60)
    : workflowStage !== 'new' ? 1.5 + (seed % 5) : undefined
  const slaCompliant = responseTimeHours !== undefined ? responseTimeHours <= slaHours : hoursSinceCreated <= slaHours
  const isOverdue = !slaCompliant && !['resolved', 'closed'].includes(workflowStage)

  return {
    id: enquiry.id,
    ticketId: `ENQ-${String(index + 1).padStart(3, '0')}`,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    organization: meta?.organization,
    subject: enquiry.subject,
    message: enquiry.message,
    category,
    categoryLabel: catInfo.label,
    priority,
    source,
    sourceLabel: SOURCE_LABEL[source],
    workflowStage,
    status: enquiry.status,
    assignedTo: meta?.assignedTo ?? catInfo.defaultTeam.split(' ')[0] + ' Sharma',
    assignedTeam: catInfo.defaultTeam,
    createdAt: enquiry.createdAt,
    createdLabel: formatCreatedLabel(enquiry.createdAt),
    updatedAt: enquiry.updatedAt,
    leadScore: Math.min(leadScore, 100),
    leadScoreBreakdown,
    slaHours,
    slaCompliant,
    responseTimeHours: responseTimeHours ? Math.round(responseTimeHours * 10) / 10 : undefined,
    resolutionTimeHours: workflowStage === 'resolved' ? 24 + (seed % 48) : undefined,
    isOverdue,
    isEscalated: meta?.escalated ?? (priority === 'critical' && isOverdue),
    internalNotes: meta?.internalNotes ?? enquiry.adminNotes ?? '',
    thread: buildThread(enquiry, meta),
    attachments: meta?.attachments ?? [
      { name: 'Proposal', type: 'pdf', uploaded: category === 'csr' },
      { name: 'Resume', type: 'pdf', uploaded: category === 'internship' || category === 'volunteer' },
      { name: 'CSR Deck', type: 'pdf', uploaded: category === 'csr' },
    ].filter((a) => a.uploaded),
    convertOptions: ['donor', 'volunteer', 'member', 'beneficiary', 'intern', 'corporate_partner'] as ConvertTarget[],
    crmTimeline: buildCrmTimeline(enquiry, meta),
  }
}

async function seedDemoIfEmpty(): Promise<Enquiry[]> {
  let enquiries = await getEnquiries()
  if (enquiries.length === 0) {
    const metaMap = readMetaMap()
    const now = new Date().toISOString()
    for (const demo of DEMO_ENQUIRIES) {
      const id = demo.id ?? crypto.randomUUID()
      enquiries.push({
        id,
        name: demo.name!,
        phone: demo.phone!,
        email: demo.email!,
        subject: demo.subject!,
        message: demo.message!,
        status: demo.status ?? 'new',
        adminNotes: demo.internalNotes,
        createdAt: new Date(Date.now() - hashCode(id) * 86400000).toISOString(),
        updatedAt: now,
      })
      metaMap[id] = {
        category: demo.category,
        priority: demo.priority,
        source: demo.source,
        workflowStage: demo.workflowStage,
        assignedTo: demo.assignedTo,
        organization: demo.organization,
        escalated: demo.escalated,
        internalNotes: demo.internalNotes,
      }
    }
    localStorage.setItem('sanveda_enquiries', JSON.stringify(enquiries))
    localStorage.setItem(ENQUIRY_META_KEY, JSON.stringify(metaMap))
  }
  return enquiries
}

function computeKpis(enquiries: EnquiryProfile[]) {
  const responseTimes = enquiries.filter((e) => e.responseTimeHours !== undefined).map((e) => e.responseTimeHours!)
  const avgResponse = responseTimes.length
    ? Math.round((responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length) * 10) / 10
    : 3.2

  const slaOk = enquiries.filter((e) => e.slaCompliant || ['resolved', 'closed'].includes(e.workflowStage)).length
  const slaTotal = enquiries.length || 1

  return {
    totalEnquiries: enquiries.length || 1245,
    newCount: enquiries.filter((e) => e.workflowStage === 'new').length || 87,
    inProgress: enquiries.filter((e) => ['assigned', 'in_progress', 'waiting'].includes(e.workflowStage)).length || 42,
    resolved: enquiries.filter((e) => ['resolved', 'closed'].includes(e.workflowStage)).length || 1056,
    escalated: enquiries.filter((e) => e.isEscalated).length || 15,
    avgResponseTimeHours: avgResponse,
    slaCompliancePct: Math.round((slaOk / slaTotal) * 100) || 94,
    overdueCount: enquiries.filter((e) => e.isOverdue).length || 8,
  }
}

function computeAnalytics(enquiries: EnquiryProfile[]) {
  const catMap = new Map<string, number>()
  for (const e of enquiries) catMap.set(e.categoryLabel, (catMap.get(e.categoryLabel) ?? 0) + 1)
  const total = enquiries.length || 1
  const categoryDistribution = [...catMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value)

  const monthlyTrends = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
    label,
    value: 40 + i * 25 + (hashCode(label) % 30),
  }))

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
    { id: 'csr', message: 'CSR enquiries have increased by 42% this quarter', tone: 'success' as const },
    { id: 'priority', message: `${highPriority || 8} high-priority tickets require immediate action`, tone: 'warning' as const },
    { id: 'sla', message: `Average response time ${kpis.avgResponseTimeHours} hrs — target exceeded by 1.2 hours on CSR tickets`, tone: 'warning' as const },
    { id: 'healthcare', message: 'Healthcare campaigns generated the most enquiries this month', tone: 'info' as const },
    { id: 'volunteer', message: `${volunteerAuto || 12} volunteer enquiries can be auto-approved based on criteria`, tone: 'success' as const },
  ]
}

export async function getEnquiryDashboardData(): Promise<EnquiryDashboardData> {
  const raw = await seedDemoIfEmpty()
  const metaMap = readMetaMap()
  const enquiries = raw.map((e, i) => buildProfile(e, metaMap[e.id], i))

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
  updateEnquiryMeta(id, metaPatch)
}
