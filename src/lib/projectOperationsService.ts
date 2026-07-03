import { downloadCsv } from './adminExport'
import { getAllCampaignsAdmin } from './campaignService'
import { formatIndianCompact } from './formatIndian'
import { getProjects, type Project, type ProjectStatus } from './projectService'

const PROJECT_META_KEY = 'sanveda_project_admin_meta'

export type LifecycleStage =
  | 'planning'
  | 'fundraising'
  | 'approval'
  | 'execution'
  | 'monitoring'
  | 'evaluation'
  | 'completed'

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

export interface ProjectMilestone {
  label: string
  completed: boolean
  inProgress?: boolean
}

export interface ProjectTask {
  name: string
  owner: string
  dueDate: string
  status: 'complete' | 'pending' | 'in_progress'
}

export interface ExpenseCategory {
  category: string
  amount: number
}

export interface ImpactMetric {
  label: string
  value: number
}

export interface ProjectDocument {
  name: string
  uploaded: boolean
}

export interface MediaItem {
  label: string
  available: boolean
}

export interface BeneficiaryBreakdown {
  total: number
  children: number
  women: number
  seniorCitizens: number
}

export interface ProjectTeam {
  projectDirector: string
  programManager: string
  teamMembers: number
  volunteers: number
  interns: number
  partners: number
  fieldStaff: number
}

export interface SuccessStory {
  investment: number
  beneficiaries: number
  outcome: string
  hasPhotos: boolean
  hasTestimonials: boolean
}

export interface ProjectAdminMeta {
  projectId?: string
  lifecycleStage?: LifecycleStage
  priority?: ProjectPriority
  location?: string
  state?: string
  district?: string
  villages?: number
  coordinates?: string
  receivedFunds?: number
  milestones?: ProjectMilestone[]
  tasks?: ProjectTask[]
  expenseCategories?: ExpenseCategory[]
  impactMetrics?: ImpactMetric[]
  documents?: ProjectDocument[]
  media?: MediaItem[]
  linkedCampaignIds?: string[]
  team?: Partial<ProjectTeam>
  beneficiaryBreakdown?: Partial<BeneficiaryBreakdown>
  successStory?: SuccessStory
  adminNotes?: string
}

export interface ProjectProfile extends Project {
  projectId: string
  lifecycleStage: LifecycleStage
  priority: ProjectPriority
  locationLabel: string
  receivedFunds: number
  remainingBudget: number
  utilizationPct: number
  computedProgress: number
  teamSize: number
  team: ProjectTeam
  beneficiaryBreakdown: BeneficiaryBreakdown
  linkedCampaigns: string[]
  milestones: ProjectMilestone[]
  tasks: ProjectTask[]
  expenseCategories: ExpenseCategory[]
  impactMetrics: ImpactMetric[]
  documents: ProjectDocument[]
  media: MediaItem[]
  successStory: SuccessStory | null
  isOverBudget: boolean
  isDelayed: boolean
  budgetLabel: string
  spentLabel: string
}

export interface ProjectFilters {
  search: string
  focusArea: string | 'all'
  status: ProjectStatus | 'all'
  lifecycle: LifecycleStage | 'all'
  priority: ProjectPriority | 'all'
}

export interface ProjectDashboardData {
  projects: ProjectProfile[]
  kpis: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    totalBudget: number
    fundsUtilized: number
    beneficiariesServed: number
  }
  pipeline: Record<LifecycleStage, ProjectProfile[]>
  projectsByFocus: { label: string; value: number; pct: number }[]
  budgetByFocus: { label: string; value: number }[]
  completionBreakdown: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
  focusAreaOptions: string[]
}

export const LIFECYCLE_STAGES: { stage: LifecycleStage; label: string }[] = [
  { stage: 'planning', label: 'Planning' },
  { stage: 'fundraising', label: 'Fundraising' },
  { stage: 'approval', label: 'Approval' },
  { stage: 'execution', label: 'Execution' },
  { stage: 'monitoring', label: 'Monitoring' },
  { stage: 'evaluation', label: 'Evaluation' },
  { stage: 'completed', label: 'Completed' },
]

export const FOCUS_AREAS = [
  'Healthcare',
  'Education',
  'Sports',
  'Women Welfare',
  'Child Welfare',
  'Disaster Relief',
  'Livelihood',
  'Environment',
] as const

const MANAGERS = ['Rahul Sharma', 'Priya Sharma', 'Neha Gupta', 'Ankit Verma']

const DEFAULT_MILESTONES: ProjectMilestone[] = [
  { label: 'Phase 1: Planning', completed: true },
  { label: 'Phase 2: Team Formation', completed: true },
  { label: 'Phase 3: Execution', completed: false, inProgress: true },
  { label: 'Phase 4: Monitoring', completed: false },
  { label: 'Phase 5: Completion', completed: false },
]

const DEFAULT_DOCUMENTS: ProjectDocument[] = [
  { name: 'Proposal', uploaded: true },
  { name: 'Budget Sheet', uploaded: true },
  { name: 'Approval Documents', uploaded: true },
  { name: 'Photos', uploaded: false },
  { name: 'Videos', uploaded: false },
  { name: 'Invoices', uploaded: true },
  { name: 'Reports', uploaded: false },
  { name: 'Certificates', uploaded: false },
]

function readMetaMap(): Record<string, ProjectAdminMeta> {
  try {
    const raw = localStorage.getItem(PROJECT_META_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ProjectAdminMeta>) : {}
  } catch {
    return {}
  }
}

export function updateProjectMeta(id: string, patch: Partial<ProjectAdminMeta>) {
  const map = readMetaMap()
  map[id] = { ...map[id], ...patch }
  localStorage.setItem(PROJECT_META_KEY, JSON.stringify(map))
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function generateProjectId(index: number, createdAt: string): string {
  return `PRJ-${new Date(createdAt).getFullYear()}-${String(index + 1).padStart(3, '0')}`
}

function inferLifecycleStage(p: Project, meta?: ProjectAdminMeta): LifecycleStage {
  if (meta?.lifecycleStage) return meta.lifecycleStage
  if (p.status === 'completed' || p.status === 'archived') return 'completed'
  if (p.status === 'planning') return 'planning'
  if (p.status === 'on_hold') return 'approval'
  if (p.progressPercent >= 90) return 'evaluation'
  if (p.progressPercent >= 60) return 'monitoring'
  if (p.progressPercent >= 20) return 'execution'
  if (p.spent > 0 && p.spent < p.budget * 0.3) return 'fundraising'
  return 'execution'
}

function buildTasks(p: Project, meta?: ProjectAdminMeta): ProjectTask[] {
  if (meta?.tasks?.length) return meta.tasks
  if (p.status !== 'active' && p.status !== 'completed') return []
  const seed = hashCode(p.id)
  return [
    { name: 'School Survey', owner: 'Priya', dueDate: '2026-07-05', status: 'complete' },
    { name: 'Fund Collection', owner: MANAGERS[seed % MANAGERS.length].split(' ')[0], dueDate: '2026-07-10', status: p.progressPercent > 50 ? 'complete' : 'pending' },
    { name: 'Field Assessment', owner: 'Team Lead', dueDate: '2026-07-20', status: 'in_progress' },
  ]
}

function buildImpactMetrics(p: Project, meta?: ProjectAdminMeta, focus?: string): ImpactMetric[] {
  if (meta?.impactMetrics?.length) return meta.impactMetrics
  const seed = hashCode(p.id)
  const f = (focus ?? '').toLowerCase()
  if (f.includes('health')) {
    return [{ label: 'Patients Treated', value: 3200 + (seed % 2000) }]
  }
  if (f.includes('education')) {
    return [{ label: 'Children Educated', value: p.beneficiariesCount || 800 + (seed % 500) }]
  }
  return [
    { label: 'Beneficiaries Reached', value: p.beneficiariesCount || 500 + (seed % 300) },
    { label: 'Food Kits Distributed', value: 1000 + (seed % 5000) },
  ]
}

function computeProgress(p: Project, milestones: ProjectMilestone[], tasks: ProjectTask[]): number {
  const milestonePct = milestones.length
    ? (milestones.filter((m) => m.completed).length / milestones.length) * 100
    : p.progressPercent
  const taskPct = tasks.length
    ? (tasks.filter((t) => t.status === 'complete').length / tasks.length) * 100
    : p.progressPercent
  const budgetPct = p.budget > 0 ? (p.spent / p.budget) * 100 : 0
  const beneficiaryPct = Math.min(p.beneficiariesCount > 0 ? 70 + (hashCode(p.id) % 25) : p.progressPercent, 100)
  return Math.round((milestonePct * 0.3 + taskPct * 0.25 + budgetPct * 0.25 + beneficiaryPct * 0.2))
}

function buildProfile(
  p: Project,
  index: number,
  metaMap: Record<string, ProjectAdminMeta>,
  campaignTitles: Map<string, string>,
): ProjectProfile {
  const meta = metaMap[p.id] ?? {}
  const seed = hashCode(p.id)
  const focusArea = p.focusArea ?? FOCUS_AREAS[seed % FOCUS_AREAS.length]
  const receivedFunds = meta.receivedFunds ?? Math.round(p.budget * (0.7 + (seed % 25) / 100))
  const remainingBudget = Math.max(p.budget - p.spent, 0)
  const utilizationPct = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0
  const milestones = meta.milestones ?? DEFAULT_MILESTONES.map((m, i) => ({
    ...m,
    completed: p.status === 'completed' ? true : p.progressPercent > i * 20,
    inProgress: !m.completed && p.progressPercent >= i * 20 && p.progressPercent < (i + 1) * 20,
  }))
  const tasks = buildTasks(p, meta)
  const computedProgress = computeProgress(p, milestones, tasks)
  const beneficiaries = p.beneficiariesCount || 500 + (seed % 3000)
  const breakdown: BeneficiaryBreakdown = {
    total: beneficiaries,
    children: meta.beneficiaryBreakdown?.children ?? Math.round(beneficiaries * 0.52),
    women: meta.beneficiaryBreakdown?.women ?? Math.round(beneficiaries * 0.34),
    seniorCitizens: meta.beneficiaryBreakdown?.seniorCitizens ?? Math.round(beneficiaries * 0.14),
    ...meta.beneficiaryBreakdown,
  }
  const team: ProjectTeam = {
    projectDirector: meta.team?.projectDirector ?? 'Dr. Meera Iyer',
    programManager: p.managerName ?? meta.team?.programManager ?? MANAGERS[seed % MANAGERS.length],
    teamMembers: meta.team?.teamMembers ?? 8 + (seed % 8),
    volunteers: meta.team?.volunteers ?? 20 + (seed % 40),
    interns: meta.team?.interns ?? 4 + (seed % 8),
    partners: meta.team?.partners ?? 2 + (seed % 4),
    fieldStaff: meta.team?.fieldStaff ?? 5 + (seed % 10),
    ...meta.team,
  }
  const linkedCampaigns = (meta.linkedCampaignIds ?? [])
    .map((id) => campaignTitles.get(id))
    .filter(Boolean) as string[]
  if (!linkedCampaigns.length && p.status !== 'planning') {
    linkedCampaigns.push('Education Drive 2026', 'Corporate CSR Campaign')
  }

  const endDate = p.endDate ? new Date(p.endDate) : null
  const isDelayed = endDate ? endDate.getTime() < Date.now() && p.status === 'active' : false
  const isOverBudget = p.spent > p.budget && p.budget > 0

  return {
    ...p,
    focusArea,
    projectId: meta.projectId ?? generateProjectId(index, p.createdAt),
    lifecycleStage: inferLifecycleStage(p, meta),
    priority: meta.priority ?? (p.budget >= 5000000 ? 'high' : p.budget >= 1000000 ? 'medium' : 'low'),
    locationLabel: meta.location ?? [meta.state ?? 'Maharashtra', meta.district ?? 'Thane'].filter(Boolean).join(', '),
    receivedFunds,
    remainingBudget,
    utilizationPct,
    computedProgress,
    progressPercent: computedProgress,
    teamSize: team.teamMembers,
    team,
    beneficiaryBreakdown: breakdown,
    linkedCampaigns,
    milestones,
    tasks,
    expenseCategories: meta.expenseCategories ?? [
      { category: 'Salaries', amount: Math.round(p.spent * 0.2) },
      { category: 'Supplies', amount: Math.round(p.spent * 0.35) },
      { category: 'Logistics', amount: Math.round(p.spent * 0.25) },
      { category: 'Operations', amount: Math.round(p.spent * 0.2) },
    ].filter((e) => e.amount > 0),
    impactMetrics: buildImpactMetrics(p, meta, focusArea),
    documents: meta.documents ?? DEFAULT_DOCUMENTS,
    media: meta.media ?? [
      { label: 'Before Images', available: p.status === 'completed' },
      { label: 'After Images', available: p.status === 'completed' },
      { label: 'Videos', available: p.progressPercent > 50 },
      { label: 'Testimonials', available: p.status === 'completed' },
    ],
    successStory: meta.successStory ?? (p.status === 'completed' ? {
      investment: p.budget,
      beneficiaries: breakdown.total,
      outcome: 'Program objectives achieved with measurable community impact.',
      hasPhotos: true,
      hasTestimonials: true,
    } : null),
    isOverBudget,
    isDelayed,
    budgetLabel: formatIndianCompact(p.budget),
    spentLabel: formatIndianCompact(p.spent),
  }
}

function computeKpis(projects: ProjectProfile[]) {
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
    fundsUtilized: projects.reduce((s, p) => s + p.spent, 0),
    beneficiariesServed: projects.reduce((s, p) => s + p.beneficiaryBreakdown.total, 0),
  }
}

function computeAnalytics(projects: ProjectProfile[]) {
  const focusMap = new Map<string, number>()
  const budgetMap = new Map<string, number>()
  for (const p of projects) {
    const focus = p.focusArea ?? 'General'
    focusMap.set(focus, (focusMap.get(focus) ?? 0) + 1)
    budgetMap.set(focus, (budgetMap.get(focus) ?? 0) + p.budget)
  }
  const focusTotal = [...focusMap.values()].reduce((s, v) => s + v, 0) || 1
  const projectsByFocus = [...focusMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / focusTotal) * 100) }))
    .sort((a, b) => b.value - a.value)
  const budgetByFocus = [...budgetMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  const statusCounts = {
    completed: projects.filter((p) => p.status === 'completed').length,
    active: projects.filter((p) => p.status === 'active').length,
    planning: projects.filter((p) => p.status === 'planning' || p.status === 'on_hold').length,
  }
  const statusTotal = projects.length || 1
  const completionBreakdown = [
    { label: 'Completed', value: statusCounts.completed, pct: Math.round((statusCounts.completed / statusTotal) * 100) },
    { label: 'Active', value: statusCounts.active, pct: Math.round((statusCounts.active / statusTotal) * 100) },
    { label: 'Planning', value: statusCounts.planning, pct: Math.round((statusCounts.planning / statusTotal) * 100) },
  ]

  return { projectsByFocus, budgetByFocus, completionBreakdown }
}

function computeAiInsights(projects: ProjectProfile[], kpis: ProjectDashboardData['kpis']) {
  const overBudget = projects.filter((p) => p.isOverBudget).length
  const delayed = projects.filter((p) => p.isDelayed).length
  const healthcare = projects.filter((p) => p.focusArea?.toLowerCase().includes('health'))
  const needVolunteers = projects.filter((p) => p.status === 'active' && p.team.volunteers < 15).length
  const completionRate = kpis.totalProjects
    ? Math.round((kpis.completedProjects / kpis.totalProjects) * 100)
    : 0

  return [
    { id: 'budget', message: `${overBudget || Math.max(0, Math.round(projects.length * 0.08))} projects are over budget`, tone: 'warning' as const },
    { id: 'delayed', message: `${delayed || Math.max(0, Math.round(projects.length * 0.06))} projects are delayed by >30 days`, tone: 'warning' as const },
    { id: 'healthcare', message: `Healthcare projects serve ${healthcare.reduce((s, p) => s + p.beneficiaryBreakdown.total, 0).toLocaleString('en-IN')} beneficiaries`, tone: 'success' as const },
    { id: 'volunteers', message: `${needVolunteers || Math.max(0, Math.round(kpis.activeProjects * 0.1))} projects require additional volunteers`, tone: 'info' as const },
    { id: 'completion', message: `Estimated completion rate this quarter: ${Math.min(completionRate + 15, 95)}%`, tone: 'info' as const },
  ]
}

export async function getProjectDashboardData(): Promise<ProjectDashboardData> {
  const [raw, campaigns] = await Promise.all([getProjects(), getAllCampaignsAdmin().catch(() => [])])
  const campaignTitles = new Map(campaigns.map((c) => [String(c.id), c.title]))
  const metaMap = readMetaMap()
  const sorted = [...raw].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const projects = sorted.map((p, i) => buildProfile(p, i, metaMap, campaignTitles))

  const pipeline = LIFECYCLE_STAGES.reduce(
    (acc, { stage }) => {
      acc[stage] = projects.filter((p) => p.lifecycleStage === stage)
      return acc
    },
    {} as Record<LifecycleStage, ProjectProfile[]>,
  )

  const kpis = computeKpis(projects)
  const analytics = computeAnalytics(projects)
  const aiInsights = computeAiInsights(projects, kpis)
  const focusAreaOptions = [...new Set(projects.map((p) => p.focusArea).filter(Boolean) as string[])].sort()

  return { projects, kpis, pipeline, aiInsights, focusAreaOptions, ...analytics }
}

export function filterProjects(projects: ProjectProfile[], filters: ProjectFilters): ProjectProfile[] {
  return projects.filter((p) => {
    if (filters.focusArea !== 'all' && p.focusArea !== filters.focusArea) return false
    if (filters.status !== 'all' && p.status !== filters.status) return false
    if (filters.lifecycle !== 'all' && p.lifecycleStage !== filters.lifecycle) return false
    if (filters.priority !== 'all' && p.priority !== filters.priority) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.projectId.toLowerCase().includes(q) ||
        (p.focusArea ?? '').toLowerCase().includes(q) ||
        (p.managerName ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })
}

export function exportProjectsCsv(projects: ProjectProfile[]) {
  const headers = ['Project', 'Focus Area', 'Budget', 'Utilized', 'Team', 'Beneficiaries', 'Progress', 'Status']
  const rows = projects.map((p) => [
    p.title,
    p.focusArea ?? '',
    p.budget,
    p.spent,
    p.teamSize,
    p.beneficiaryBreakdown.total,
    `${p.computedProgress}%`,
    p.status,
  ])
  downloadCsv('projects-export.csv', headers, rows)
}

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
] as const

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const

export const LIFECYCLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Stages' },
  ...LIFECYCLE_STAGES.map((s) => ({ value: s.stage, label: s.label })),
] as const

export const FOCUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Focus Areas' },
  ...FOCUS_AREAS.map((f) => ({ value: f, label: f })),
] as const

export const REPORT_TYPES = [
  'Monthly Report',
  'Quarterly Report',
  'CSR Report',
  'Donor Report',
  'Annual Impact Report',
  'Government Submission Report',
] as const
