import { downloadCsv } from './adminExport'
import { getBeneficiaries, type Beneficiary, type BeneficiaryStatus } from './beneficiaryService'
import { formatIndianCompact } from './formatIndian'
import { groupWorkflowRows, listWorkflowRows, updateDomainRoot, type WorkflowRow } from './domainWorkflowService'

export type CaseStage =
  | 'registered'
  | 'verification'
  | 'assessment'
  | 'approved'
  | 'support_released'
  | 'monitoring'
  | 'completed'

export type BeneficiaryCategory =
  | 'Healthcare'
  | 'Education'
  | 'Women Empowerment'
  | 'Child Welfare'
  | 'Senior Citizens'
  | 'Disability Support'
  | 'Sports Development'
  | 'Livelihood Programs'
  | 'Disaster Relief'
  | 'Scholarships'

export type DocumentStatus = 'uploaded' | 'pending_review' | 'verified' | 'approved'
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface BeneficiaryDocument {
  name: string
  status: DocumentStatus
}

export interface FinancialAssistance {
  date: string
  amount: number
  type: string
  approvedBy: string
}

export interface SupportItem {
  type: string
  quantity: number
  value: number
}

export interface FamilyMember {
  name: string
  relation: string
}

export interface OutcomeRecord {
  label: string
  status: string
  completed: boolean
}

export interface SuccessStory {
  before: string
  after: string
  testimonial: string
  impactScore: number
}

export interface UnifiedRole {
  role: string
  detail: string
}

export interface BeneficiaryAdminMeta {
  beneficiaryId?: string
  dob?: string
  gender?: string
  aadhaar?: string
  guardian?: string
  pinCode?: string
  photoUrl?: string
  pipelineStage?: CaseStage
  caseWorker?: string
  assignedTeam?: string
  priority?: PriorityLevel
  programs?: string[]
  documents?: BeneficiaryDocument[]
  financialAssistance?: FinancialAssistance[]
  supportItems?: SupportItem[]
  familyMembers?: FamilyMember[]
  familyIncome?: number
  outcomes?: OutcomeRecord[]
  successStory?: SuccessStory
  adminNotes?: string
}

export interface BeneficiaryProfile extends Beneficiary {
  beneficiaryId: string
  categoryLabel: string
  programLabel: string
  locationLabel: string
  supportReceived: number
  lastUpdatedLabel: string
  pipelineStage: CaseStage
  caseWorker: string
  assignedTeam: string
  priority: PriorityLevel
  programs: string[]
  documents: BeneficiaryDocument[]
  financialAssistance: FinancialAssistance[]
  supportItems: SupportItem[]
  familyMembers: FamilyMember[]
  familyIncome: number
  familySupportTotal: number
  outcomes: OutcomeRecord[]
  impactScore: number
  successStory: SuccessStory | null
  unifiedRoles: UnifiedRole[]
  needsFollowUp: boolean
}

export interface BeneficiaryFilters {
  search: string
  category: BeneficiaryCategory | 'all'
  status: BeneficiaryStatus | 'all'
  program: string | 'all'
  location: string | 'all'
  priority: PriorityLevel | 'all'
}

export interface BeneficiaryDashboardData {
  beneficiaries: BeneficiaryProfile[]
  kpis: {
    totalBeneficiaries: number
    activeCases: number
    programsRunning: number
    totalSupportProvided: number
    thisMonthAdded: number
    successStories: number
  }
  pipeline: Record<CaseStage, BeneficiaryProfile[]>
  geographic: { city: string; count: number }[]
  supportDistribution: { type: string; quantity: number; value: number }[]
  beneficiariesByProgram: { label: string; value: number; pct: number }[]
  monthlyGrowth: { label: string; value: number }[]
  supportByType: { label: string; value: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
  programOptions: string[]
  locationOptions: string[]
}

export const BENEFICIARY_CATEGORIES: BeneficiaryCategory[] = [
  'Healthcare',
  'Education',
  'Women Empowerment',
  'Child Welfare',
  'Senior Citizens',
  'Disability Support',
  'Sports Development',
  'Livelihood Programs',
  'Disaster Relief',
  'Scholarships',
]

export const CASE_STAGES: { stage: CaseStage; label: string }[] = [
  { stage: 'registered', label: 'Registered' },
  { stage: 'verification', label: 'Verification' },
  { stage: 'assessment', label: 'Assessment' },
  { stage: 'approved', label: 'Approved' },
  { stage: 'support_released', label: 'Support Released' },
  { stage: 'monitoring', label: 'Monitoring' },
  { stage: 'completed', label: 'Completed' },
]

function inferCategory(b: Beneficiary): string {
  if (b.category?.trim()) return b.category
  return 'Uncategorized'
}

function inferPipelineStage(b: Beneficiary, meta?: BeneficiaryAdminMeta): CaseStage {
  if (meta?.pipelineStage) return meta.pipelineStage
  if (b.status === 'completed' || b.status === 'archived') return 'completed'
  if (b.status === 'on_hold') return 'verification'
  const days = (Date.now() - new Date(b.createdAt).getTime()) / 86400000
  if (days < 7) return 'registered'
  if (days < 21) return 'assessment'
  if (b.supportAmount > 0 && days < 90) return 'support_released'
  if (b.status === 'active') return 'monitoring'
  return 'approved'
}

function buildFinancialAssistance(b: Beneficiary, meta?: BeneficiaryAdminMeta): FinancialAssistance[] {
  if (meta?.financialAssistance?.length) return meta.financialAssistance
  if (b.supportAmount <= 0) return []
  return [{
    date: b.lastSupportDate ?? b.createdAt,
    amount: b.supportAmount,
    type: b.supportType ?? 'Unspecified',
    approvedBy: '',
  }]
}

function buildSupportItems(b: Beneficiary, meta?: BeneficiaryAdminMeta, total = 0): SupportItem[] {
  if (meta?.supportItems?.length) return meta.supportItems
  if (total <= 0) return []
  void b
  return []
}

function buildFamily(b: Beneficiary, meta?: BeneficiaryAdminMeta): FamilyMember[] {
  if (meta?.familyMembers?.length) return meta.familyMembers
  void b
  return []
}

function computeImpactScore(outcomes: OutcomeRecord[]): number {
  if (!outcomes.length) return 0
  const completed = outcomes.filter((o) => o.completed).length
  return Math.round((completed / outcomes.length) * 100)
}

function buildOutcomes(b: Beneficiary, meta?: BeneficiaryAdminMeta): OutcomeRecord[] {
  if (meta?.outcomes?.length) return meta.outcomes
  void b
  return []
}

function buildSuccessStory(b: Beneficiary, meta?: BeneficiaryAdminMeta, support = 0): SuccessStory | null {
  if (meta?.successStory) return meta.successStory
  void b
  void support
  return null
}

function getUnifiedRoles(b: Beneficiary): UnifiedRole[] {
  const roles: UnifiedRole[] = [{ role: 'Beneficiary', detail: b.program ?? 'Program beneficiary' }]
  const email = b.email?.toLowerCase()

  void email
  return roles
}

function formatLastUpdated(updatedAt: string): string {
  const diff = Date.now() - new Date(updatedAt).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function buildProfile(
  b: Beneficiary,
  index: number,
  metaMap: Record<string, BeneficiaryAdminMeta>,
): BeneficiaryProfile {
  void index
  const meta = { ...(b.adminMeta as BeneficiaryAdminMeta), ...(metaMap[b.id] ?? {}) }
  const categoryLabel = inferCategory(b)
  const programs = meta.programs?.length
    ? meta.programs
    : [b.program ?? categoryLabel].filter(Boolean)
  const financialAssistance = buildFinancialAssistance(b, meta)
  const supportReceived = financialAssistance.reduce((s, f) => s + f.amount, 0) || b.supportAmount
  const supportItems = buildSupportItems(b, meta, supportReceived)
  const familyMembers = buildFamily(b, meta)
  const outcomes = buildOutcomes(b, meta)
  const impactScore = computeImpactScore(outcomes)
  const pipelineStage = inferPipelineStage(b, meta)
  return {
    ...b,
    beneficiaryId: b.beneficiaryCode ?? meta.beneficiaryId ?? '',
    categoryLabel,
    programLabel: programs[0] ?? '—',
    locationLabel: [b.city, b.state].filter(Boolean).join(', ') || '—',
    supportReceived,
    lastUpdatedLabel: formatLastUpdated(b.updatedAt),
    pipelineStage: (b.pipelineStage as CaseStage | undefined) ?? pipelineStage,
    caseWorker: b.caseWorker ?? meta.caseWorker ?? '',
    assignedTeam: b.assignedTeam ?? meta.assignedTeam ?? '',
    priority: (b.priority as PriorityLevel | undefined) ?? meta.priority ?? 'low',
    programs,
    documents: meta.documents ?? [],
    financialAssistance,
    supportItems,
    familyMembers,
    familyIncome: b.familyIncome ?? meta.familyIncome ?? 0,
    familySupportTotal: supportReceived,
    outcomes,
    impactScore,
    successStory: buildSuccessStory(b, meta, supportReceived),
    unifiedRoles: getUnifiedRoles(b),
    needsFollowUp: outcomes.some((outcome) => outcome.status === 'follow_up'),
  }
}

function computeKpis(profiles: BeneficiaryProfile[]) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    totalBeneficiaries: profiles.length,
    activeCases: profiles.filter((b) => b.status === 'active' || b.status === 'on_hold').length,
    programsRunning: new Set(profiles.flatMap((b) => b.programs)).size,
    totalSupportProvided: profiles.reduce((s, b) => s + b.supportReceived, 0),
    thisMonthAdded: profiles.filter((b) => new Date(b.createdAt) >= monthStart).length,
    successStories: profiles.filter((b) => b.successStory).length,
  }
}

function computeGeographic(profiles: BeneficiaryProfile[]) {
  const map = new Map<string, number>()
  for (const b of profiles) {
    const city = b.city ?? 'Unknown'
    map.set(city, (map.get(city) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

function computeSupportDistribution(profiles: BeneficiaryProfile[]) {
  const map = new Map<string, { quantity: number; value: number }>()
  for (const b of profiles) {
    for (const item of b.supportItems) {
      const existing = map.get(item.type) ?? { quantity: 0, value: 0 }
      map.set(item.type, {
        quantity: existing.quantity + item.quantity,
        value: existing.value + item.value,
      })
    }
  }
  return [...map.entries()].map(([type, data]) => ({ type, ...data }))
}

function computeAnalytics(profiles: BeneficiaryProfile[]) {
  const programMap = new Map<string, number>()
  for (const b of profiles) {
    for (const p of b.programs) {
      programMap.set(p, (programMap.get(p) ?? 0) + 1)
    }
  }
  const programTotal = [...programMap.values()].reduce((s, v) => s + v, 0) || 1
  const beneficiariesByProgram = [...programMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / programTotal) * 100) }))
    .sort((a, b) => b.value - a.value)

  const monthMap = new Map<string, number>()
  for (const b of profiles) {
    const label = new Date(b.createdAt).toLocaleDateString('en-IN', { month: 'short' })
    monthMap.set(label, (monthMap.get(label) ?? 0) + 1)
  }
  const monthlyGrowth = [...monthMap.entries()].slice(-6).map(([label, value]) => ({ label, value }))

  const supportMap = new Map<string, number>()
  for (const b of profiles) {
    for (const f of b.financialAssistance) {
      supportMap.set(f.type, (supportMap.get(f.type) ?? 0) + f.amount)
    }
  }
  const supportByType = [...supportMap.entries()].map(([label, value]) => ({ label, value }))

  return { beneficiariesByProgram, monthlyGrowth, supportByType }
}

function computeAiInsights(profiles: BeneficiaryProfile[], kpis: BeneficiaryDashboardData['kpis']) {
  const followUp = profiles.filter((b) => b.needsFollowUp).length
  const incompleteHealthcare = profiles.filter(
    (b) => b.categoryLabel === 'Healthcare' && b.pipelineStage !== 'completed' && b.status === 'active',
  ).length
  const educationCompleted = profiles.filter((b) => b.categoryLabel === 'Education' && b.status === 'completed').length
  const educationTotal = profiles.filter((b) => b.categoryLabel === 'Education').length || 1
  const educationRate = Math.round((educationCompleted / educationTotal) * 100)
  return [
    { id: 'followup', message: `${followUp} beneficiaries have a recorded follow-up requirement`, tone: 'warning' as const },
    { id: 'healthcare', message: `${incompleteHealthcare} active healthcare cases remain incomplete`, tone: 'warning' as const },
    { id: 'education', message: `Education support success rate is ${educationRate}%`, tone: 'success' as const },
    { id: 'disbursed', message: `${formatIndianCompact(kpis.totalSupportProvided)} total recorded assistance`, tone: 'info' as const },
  ]
}

export async function getBeneficiaryDashboardData(): Promise<BeneficiaryDashboardData> {
  const raw = await getBeneficiaries()
  const ids = raw.map((beneficiary) => beneficiary.id)
  const [household, assistance, outcomes] = await Promise.all([
    listWorkflowRows('beneficiary_household_members', 'beneficiary_id', ids),
    listWorkflowRows('beneficiary_support', 'beneficiary_id', ids),
    listWorkflowRows('beneficiary_outcomes', 'beneficiary_id', ids),
  ])
  const householdByBeneficiary = groupWorkflowRows(household, 'beneficiary_id')
  const assistanceByBeneficiary = groupWorkflowRows(assistance, 'beneficiary_id')
  const outcomesByBeneficiary = groupWorkflowRows(outcomes, 'beneficiary_id')
  const metaMap = Object.fromEntries(raw.map((beneficiary) => [
    beneficiary.id,
    {
      familyMembers: (householdByBeneficiary.get(beneficiary.id) ?? []).map((row: WorkflowRow) => ({
        name: String(row.full_name),
        relation: String(row.relationship),
      })),
      financialAssistance: (assistanceByBeneficiary.get(beneficiary.id) ?? []).map((row: WorkflowRow) => ({
        date: String(row.provided_on),
        amount: Number(row.amount ?? 0),
        type: String(row.support_type),
        approvedBy: row.provided_by ? String(row.provided_by) : '',
      })),
      supportItems: (assistanceByBeneficiary.get(beneficiary.id) ?? []).map((row: WorkflowRow) => ({
        type: String(row.support_type),
        quantity: Number(row.quantity ?? 0),
        value: Number(row.amount ?? 0),
      })),
      outcomes: (outcomesByBeneficiary.get(beneficiary.id) ?? []).map((row: WorkflowRow) => ({
        label: String(row.label),
        status: row.status ? String(row.status) : '',
        completed: row.completed === true,
      })),
    } satisfies BeneficiaryAdminMeta,
  ]))
  const sorted = [...raw].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const beneficiaries = sorted.map((b, i) => buildProfile(b, i, metaMap))

  const pipeline = CASE_STAGES.reduce(
    (acc, { stage }) => {
      acc[stage] = beneficiaries.filter((b) => b.pipelineStage === stage)
      return acc
    },
    {} as Record<CaseStage, BeneficiaryProfile[]>,
  )

  const kpis = computeKpis(beneficiaries)
  const geographic = computeGeographic(beneficiaries)
  const supportDistribution = computeSupportDistribution(beneficiaries)
  const analytics = computeAnalytics(beneficiaries)
  const aiInsights = computeAiInsights(beneficiaries, kpis)

  const programOptions = [...new Set(beneficiaries.flatMap((b) => b.programs))].sort()
  const locationOptions = [...new Set(beneficiaries.map((b) => b.city).filter(Boolean) as string[])].sort()

  return {
    beneficiaries,
    kpis,
    pipeline,
    geographic,
    supportDistribution,
    aiInsights,
    programOptions,
    locationOptions,
    ...analytics,
  }
}

export function filterBeneficiaries(
  beneficiaries: BeneficiaryProfile[],
  filters: BeneficiaryFilters,
): BeneficiaryProfile[] {
  return beneficiaries.filter((b) => {
    if (filters.category !== 'all' && b.categoryLabel !== filters.category) return false
    if (filters.status !== 'all' && b.status !== filters.status) return false
    if (filters.program !== 'all' && !b.programs.includes(filters.program)) return false
    if (filters.location !== 'all' && b.city !== filters.location) return false
    if (filters.priority !== 'all' && b.priority !== filters.priority) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        b.fullName.toLowerCase().includes(q) ||
        b.beneficiaryId.toLowerCase().includes(q) ||
        b.programLabel.toLowerCase().includes(q) ||
        b.categoryLabel.toLowerCase().includes(q) ||
        (b.city ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })
}

export async function updateBeneficiaryMeta(id: string, patch: Partial<BeneficiaryAdminMeta>) {
  const rootPatch: Record<string, unknown> = {}
  if ('beneficiaryId' in patch) rootPatch.beneficiary_code = patch.beneficiaryId || null
  if ('pipelineStage' in patch) rootPatch.pipeline_stage = patch.pipelineStage || null
  if ('priority' in patch) rootPatch.priority = patch.priority || null
  if ('caseWorker' in patch) rootPatch.case_worker = patch.caseWorker || null
  if ('assignedTeam' in patch) rootPatch.assigned_team = patch.assignedTeam || null
  if ('familyIncome' in patch) rootPatch.family_income = patch.familyIncome ?? null
  if ('adminNotes' in patch) rootPatch.admin_meta = { adminNotes: patch.adminNotes ?? null }
  await updateDomainRoot('beneficiaries', id, rootPatch)
}

export function exportBeneficiariesCsv(beneficiaries: BeneficiaryProfile[]) {
  const headers = [
    'Name', 'Beneficiary ID', 'Program', 'Category', 'Support Received',
    'Location', 'Status', 'Case Worker', 'Last Updated',
  ]
  const rows = beneficiaries.map((b) => [
    b.fullName,
    b.beneficiaryId,
    b.programLabel,
    b.categoryLabel,
    b.supportReceived,
    b.locationLabel,
    b.status,
    b.caseWorker,
    b.lastUpdatedLabel,
  ])
  downloadCsv('beneficiaries-export.csv', headers, rows)
}

export const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  ...BENEFICIARY_CATEGORIES.map((c) => ({ value: c, label: c })),
] as const

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'archived', label: 'Archived' },
] as const

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  uploaded: 'Uploaded',
  pending_review: 'Pending Review',
  verified: 'Verified',
  approved: 'Approved',
}
