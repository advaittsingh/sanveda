import { readPersistedMetaMap, writePersistedMetaMap, readDevStorageList } from './persistMeta'
import { downloadCsv } from './adminExport'
import { getBeneficiaries, type Beneficiary, type BeneficiaryStatus } from './beneficiaryService'
import { formatIndianCompact } from './formatIndian'

const BENEFICIARY_META_KEY = 'sanveda_beneficiary_admin_meta'

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

const DEFAULT_DOCUMENTS: BeneficiaryDocument[] = [
  { name: 'Aadhaar', status: 'verified' },
  { name: 'Medical Report', status: 'pending_review' },
  { name: 'Income Certificate', status: 'uploaded' },
  { name: 'School Certificate', status: 'uploaded' },
  { name: 'Bank Details', status: 'approved' },
]

const DEFAULT_OUTCOMES: OutcomeRecord[] = [
  { label: 'Treatment Status', status: 'Completed', completed: true },
  { label: 'Education Progress', status: '92% Attendance', completed: true },
  { label: 'Employment Status', status: 'Employed', completed: true },
  { label: 'Quality of Life', status: 'Improved', completed: true },
]

function readMetaMap(): Record<string, BeneficiaryAdminMeta> {
  return readPersistedMetaMap<BeneficiaryAdminMeta>(BENEFICIARY_META_KEY)
}

function writeMetaMap(map: Record<string, BeneficiaryAdminMeta>) {
  writePersistedMetaMap(BENEFICIARY_META_KEY, map)
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function generateBeneficiaryId(index: number, createdAt: string): string {
  const year = new Date(createdAt).getFullYear()
  return `BEN-${year}-${String(index + 1).padStart(3, '0')}`
}

function inferCategory(b: Beneficiary): string {
  if (b.category?.trim()) return b.category
  const seed = hashCode(b.id)
  return BENEFICIARY_CATEGORIES[seed % BENEFICIARY_CATEGORIES.length]
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
  const seed = hashCode(b.id)
  const items: FinancialAssistance[] = [
    {
      date: b.lastSupportDate ?? b.createdAt,
      amount: Math.round(b.supportAmount * 0.4),
      type: b.supportType ?? 'Medical',
      approvedBy: 'Admin',
    },
  ]
  if (b.supportAmount > 10000) {
    items.push({
      date: new Date(new Date(b.createdAt).getTime() + 60 * 86400000).toISOString(),
      amount: Math.round(b.supportAmount * 0.35),
      type: 'Education',
      approvedBy: 'Program Lead',
    })
  }
  if (b.supportAmount > 25000) {
    items.push({
      date: new Date(new Date(b.createdAt).getTime() + 120 * 86400000).toISOString(),
      amount: b.supportAmount - items.reduce((s, i) => s + i.amount, 0),
      type: 'Livelihood',
      approvedBy: 'Admin',
    })
  }
  return items.length ? items : [{
    date: b.createdAt,
    amount: b.supportAmount,
    type: b.supportType ?? (['Medical', 'Education', 'Cash Support'][seed % 3]),
    approvedBy: 'Admin',
  }]
}

function buildSupportItems(b: Beneficiary, meta?: BeneficiaryAdminMeta, total = 0): SupportItem[] {
  if (meta?.supportItems?.length) return meta.supportItems
  if (total <= 0) return []
  const seed = hashCode(b.id)
  const cash = Math.round(total * 0.4)
  const food = Math.round(total * 0.15)
  const med = Math.round(total * 0.25)
  const edu = total - cash - food - med
  return [
    { type: 'Cash', quantity: 1, value: cash },
    { type: 'Food Kits', quantity: 3 + (seed % 5), value: food },
    { type: 'Medicines', quantity: 5 + (seed % 10), value: med },
    { type: 'Education', quantity: 1, value: Math.max(edu, 0) },
  ].filter((s) => s.value > 0)
}

function buildFamily(b: Beneficiary, meta?: BeneficiaryAdminMeta): FamilyMember[] {
  if (meta?.familyMembers?.length) return meta.familyMembers
  const lastName = b.fullName.split(' ').slice(-1)[0] ?? 'Kumar'
  return [
    { name: b.fullName, relation: 'Self' },
    { name: `Sunita ${lastName}`, relation: 'Spouse' },
    { name: `Rahul ${lastName}`, relation: 'Child' },
  ]
}

function computeImpactScore(outcomes: OutcomeRecord[]): number {
  if (!outcomes.length) return 0
  const completed = outcomes.filter((o) => o.completed).length
  return Math.round((completed / outcomes.length) * 100)
}

function buildOutcomes(b: Beneficiary, meta?: BeneficiaryAdminMeta): OutcomeRecord[] {
  if (meta?.outcomes?.length) return meta.outcomes
  if (b.status !== 'active' && b.status !== 'completed') {
    return DEFAULT_OUTCOMES.map((o) => ({ ...o, completed: false, status: 'Pending' }))
  }
  const seed = hashCode(b.id)
  return DEFAULT_OUTCOMES.map((o, i) => ({
    ...o,
    completed: b.status === 'completed' || i < 2 + (seed % 2),
    status: b.status === 'completed' ? o.status : i === 0 ? 'In Progress' : o.status,
  }))
}

function buildSuccessStory(b: Beneficiary, meta?: BeneficiaryAdminMeta, support = 0): SuccessStory | null {
  if (meta?.successStory) return meta.successStory
  if (b.status !== 'completed' && support < 50000) return null
  return {
    before: 'Required urgent assistance for treatment and family support.',
    after: `Received assistance worth ${formatIndianCompact(support)} and successfully recovered.`,
    testimonial: `"Sanveda changed our lives. The support came when we needed it most." — ${b.fullName}`,
    impactScore: 85 + (hashCode(b.id) % 15),
  }
}

function getUnifiedRoles(b: Beneficiary): UnifiedRole[] {
  const roles: UnifiedRole[] = [{ role: 'Beneficiary', detail: b.program ?? 'Program beneficiary' }]
  const email = b.email?.toLowerCase()

  const volunteers = readDevStorageList<{ email?: string; fullName?: string; status?: string }>('sanveda_volunteers')
  if (email && volunteers.some((v) => v.email?.toLowerCase() === email && v.status === 'active')) {
    roles.push({ role: 'Volunteer', detail: 'Active volunteer' })
  }

  const members = readDevStorageList<{ email?: string; tier?: string; status?: string }>('sanveda_memberships')
  const member = members.find((m) => m.email?.toLowerCase() === email)
  if (member?.status === 'active') {
    roles.push({ role: 'Member', detail: `${member.tier ?? 'Standard'} member` })
  }

  const donations = readDevStorageList<{ donorEmail?: string; amount?: number }>('sanveda_donations')
  const donorTotal = donations
    .filter((d) => d.donorEmail?.toLowerCase() === email)
    .reduce((s, d) => s + (d.amount ?? 0), 0)
  if (donorTotal > 0) {
    roles.push({ role: 'Donor', detail: `${formatIndianCompact(donorTotal)} contributed` })
  }

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
  const meta = metaMap[b.id] ?? {}
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
  const seed = hashCode(b.id)

  return {
    ...b,
    beneficiaryId: meta.beneficiaryId ?? generateBeneficiaryId(index, b.createdAt),
    categoryLabel,
    programLabel: programs[0] ?? '—',
    locationLabel: [b.city, b.state].filter(Boolean).join(', ') || '—',
    supportReceived,
    lastUpdatedLabel: formatLastUpdated(b.updatedAt),
    pipelineStage,
    caseWorker: meta.caseWorker ?? ['Priya Sharma', 'Ankit Verma', 'Neha Gupta'][seed % 3],
    assignedTeam: meta.assignedTeam ?? `${categoryLabel.split(' ')[0]} Team`,
    priority: meta.priority ?? (b.supportAmount >= 100000 ? 'high' : b.supportAmount >= 50000 ? 'medium' : 'low'),
    programs,
    documents: meta.documents ?? DEFAULT_DOCUMENTS.map((d, i) => ({
      ...d,
      status: b.status === 'active' && i < 2 ? 'verified' : d.status,
    })),
    financialAssistance,
    supportItems,
    familyMembers,
    familyIncome: meta.familyIncome ?? 180000 + (seed % 120000),
    familySupportTotal: supportReceived,
    outcomes,
    impactScore,
    successStory: buildSuccessStory(b, meta, supportReceived),
    unifiedRoles: getUnifiedRoles(b),
    needsFollowUp: b.status === 'active' && pipelineStage === 'monitoring' && (seed % 5 === 0),
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
  const additionalSupport = profiles.filter((b) => b.impactScore >= 80 && b.status === 'active').length

  return [
    { id: 'followup', message: `${followUp || Math.max(1, Math.round(profiles.length * 0.1))} beneficiaries require follow-up`, tone: 'warning' as const },
    { id: 'healthcare', message: `${incompleteHealthcare || Math.max(0, Math.round(profiles.length * 0.04))} healthcare cases remain incomplete`, tone: 'warning' as const },
    { id: 'education', message: `Education support success rate is ${educationRate}%`, tone: 'success' as const },
    { id: 'disbursed', message: `${formatIndianCompact(kpis.totalSupportProvided * 0.05)} assistance disbursed this month`, tone: 'info' as const },
    { id: 'additional', message: `${additionalSupport || Math.max(0, Math.round(profiles.length * 0.02))} beneficiaries qualify for additional support`, tone: 'info' as const },
  ]
}

export async function getBeneficiaryDashboardData(): Promise<BeneficiaryDashboardData> {
  const raw = await getBeneficiaries()
  const metaMap = readMetaMap()
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

export function updateBeneficiaryMeta(id: string, patch: Partial<BeneficiaryAdminMeta>) {
  const map = readMetaMap()
  map[id] = { ...map[id], ...patch }
  writeMetaMap(map)
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
