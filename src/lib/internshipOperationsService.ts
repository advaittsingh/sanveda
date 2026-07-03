import { downloadCsv } from './adminExport'
import { getInternships, type Internship, type InternshipStatus } from './internshipService'

const INTERN_META_KEY = 'sanveda_intern_admin_meta'

export type PipelineStage =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'selected'
  | 'offer_sent'
  | 'onboarding'
  | 'active'
  | 'completed'

export type InternshipMode = 'remote' | 'hybrid' | 'onsite'
export type AlumniOutcome = 'volunteer' | 'member' | 'employee' | 'lor' | 'placed' | 'mentor' | 'donor'

export interface InternTask {
  name: string
  dueDate: string
  status: 'completed' | 'in_progress' | 'pending'
  score: number | null
}

export interface PerformanceMetric {
  label: string
  score: number
}

export interface StipendRecord {
  month: string
  amount: number
  status: 'paid' | 'pending'
}

export interface Deliverable {
  label: string
  completed: boolean
}

export interface InternAdminMeta {
  internId?: string
  dob?: string
  address?: string
  emergencyContact?: string
  cgpa?: string
  graduationYear?: string
  branch?: string
  pipelineStage?: PipelineStage
  mentor?: string
  mode?: InternshipMode
  stipend?: number
  weeklyMeetings?: number
  progressScore?: number
  tasks?: InternTask[]
  performance?: PerformanceMetric[]
  deliverables?: Deliverable[]
  stipendRecords?: StipendRecord[]
  alumniOutcomes?: AlumniOutcome[]
  attendancePct?: number
  workingHours?: number
  meetingsAttended?: number
  assignmentsCompleted?: number
}

export interface InternProfile extends Internship {
  internId: string
  programLabel: string
  durationLabel: string
  mentor: string
  performanceScore: number
  pipelineStage: PipelineStage
  mode: InternshipMode
  stipend: number
  weeklyMeetings: number
  progressScore: number
  tasks: InternTask[]
  performance: PerformanceMetric[]
  deliverables: Deliverable[]
  stipendRecords: StipendRecord[]
  alumniOutcomes: AlumniOutcome[]
  attendancePct: number
  workingHours: number
  meetingsAttended: number
  assignmentsCompleted: number
  unifiedRoles: { role: string; detail: string }[]
  isAlumni: boolean
  hasCertificate: boolean
}

export interface InternFilters {
  search: string
  department: string | 'all'
  status: InternshipStatus | 'all'
  program: string | 'all'
  university: string | 'all'
}

export interface InternshipDashboardData {
  interns: InternProfile[]
  programs: string[]
  kpis: {
    totalApplications: number
    pendingReview: number
    selectedInterns: number
    activeInterns: number
    completedInternships: number
    certificatesIssued: number
  }
  pipeline: Record<PipelineStage, InternProfile[]>
  applicationsByDepartment: { label: string; value: number; pct: number }[]
  universityDistribution: { label: string; value: number }[]
  completionFunnel: { label: string; value: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
  alumniStats: {
    totalAlumni: number
    outcomes: { label: string; count: number }[]
  }
  departmentOptions: string[]
  universityOptions: string[]
}

export const INTERNSHIP_PROGRAMS = [
  'Healthcare Internship',
  'Education Internship',
  'Fundraising Internship',
  'Operations Internship',
  'Technology Internship',
  'Social Media Internship',
  'Research Internship',
  'Community Outreach Internship',
] as const

export const CASE_STAGES: { stage: PipelineStage; label: string }[] = [
  { stage: 'applied', label: 'Applied' },
  { stage: 'screening', label: 'Screening' },
  { stage: 'interview', label: 'Interview' },
  { stage: 'selected', label: 'Selected' },
  { stage: 'offer_sent', label: 'Offer Sent' },
  { stage: 'onboarding', label: 'Onboarding' },
  { stage: 'active', label: 'Active' },
  { stage: 'completed', label: 'Completed' },
]

const MENTORS = ['Rahul Sharma', 'Neha Jain', 'Priya Sharma', 'Ankit Verma', 'Sneha Reddy']

const DEFAULT_TASKS: Omit<InternTask, 'status' | 'score'>[] = [
  { name: 'NGO Website', dueDate: '2026-07-15' },
  { name: 'Fundraising Research', dueDate: '2026-07-30' },
  { name: 'Community Outreach Report', dueDate: '2026-08-15' },
]

const DEFAULT_PERFORMANCE: PerformanceMetric[] = [
  { label: 'Communication', score: 90 },
  { label: 'Technical Skills', score: 88 },
  { label: 'Teamwork', score: 94 },
  { label: 'Leadership', score: 85 },
  { label: 'Initiative', score: 92 },
]

const DEFAULT_DELIVERABLES: Deliverable[] = [
  { label: 'Reports', completed: true },
  { label: 'Presentations', completed: true },
  { label: 'Research Papers', completed: false },
  { label: 'Documentation', completed: true },
  { label: 'Project Files', completed: true },
  { label: 'Portfolio Links', completed: false },
]

function readMetaMap(): Record<string, InternAdminMeta> {
  try {
    const raw = localStorage.getItem(INTERN_META_KEY)
    return raw ? (JSON.parse(raw) as Record<string, InternAdminMeta>) : {}
  } catch {
    return {}
  }
}

export function writeInternMeta(id: string, patch: Partial<InternAdminMeta>) {
  const map = readMetaMap()
  map[id] = { ...map[id], ...patch }
  localStorage.setItem(INTERN_META_KEY, JSON.stringify(map))
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function generateInternId(index: number, createdAt: string): string {
  const year = new Date(createdAt).getFullYear()
  return `INT-${year}-${String(index + 1).padStart(3, '0')}`
}

function formatDuration(weeks?: number): string {
  if (!weeks) return '3 Months'
  if (weeks >= 20) return '6 Months'
  if (weeks >= 10) return '3 Months'
  return `${weeks} Weeks`
}

function inferProgram(dept?: string): string {
  if (!dept) return 'Operations Internship'
  const d = dept.toLowerCase()
  if (d.includes('health')) return 'Healthcare Internship'
  if (d.includes('education') || d.includes('outreach')) return 'Education Internship'
  if (d.includes('fund') || d.includes('partner')) return 'Fundraising Internship'
  if (d.includes('tech') || d.includes('develop')) return 'Technology Internship'
  if (d.includes('social') || d.includes('media') || d.includes('marketing')) return 'Social Media Internship'
  if (d.includes('research')) return 'Research Internship'
  if (d.includes('community')) return 'Community Outreach Internship'
  return 'Operations Internship'
}

function inferPipelineStage(i: Internship, meta?: InternAdminMeta): PipelineStage {
  if (meta?.pipelineStage) return meta.pipelineStage
  if (i.status === 'completed') return 'completed'
  if (i.status === 'active') {
    const days = i.startDate
      ? (Date.now() - new Date(i.startDate).getTime()) / 86400000
      : 999
    return days < 14 ? 'onboarding' : 'active'
  }
  if (i.status === 'approved') return 'selected'
  if (i.status === 'review') return i.motivation ? 'interview' : 'screening'
  if (i.status === 'pending') return 'applied'
  return 'applied'
}

function buildTasks(meta?: InternAdminMeta, active = false): InternTask[] {
  if (meta?.tasks?.length) return meta.tasks
  if (!active) return []
  return DEFAULT_TASKS.map((t, idx) => ({
    ...t,
    status: idx === 0 ? 'completed' as const : idx === 1 ? 'in_progress' as const : 'pending' as const,
    score: idx === 0 ? 95 : null,
  }))
}

function buildStipendRecords(i: Internship, meta?: InternAdminMeta, stipend = 0): StipendRecord[] {
  if (meta?.stipendRecords?.length) return meta.stipendRecords
  if (!stipend || i.status !== 'active' && i.status !== 'completed') return []
  const months = ['Jan', 'Feb', 'Mar']
  return months.map((month) => ({ month, amount: stipend, status: 'paid' as const }))
}

function getUnifiedRoles(i: Internship): { role: string; detail: string }[] {
  const roles: { role: string; detail: string }[] = [{ role: 'Intern', detail: i.preferredDepartment ?? 'Internship programme' }]
  const email = i.email.toLowerCase()

  try {
    const volunteers = JSON.parse(localStorage.getItem('sanveda_volunteers') ?? '[]') as { email?: string; status?: string }[]
    if (volunteers.some((v) => v.email?.toLowerCase() === email && v.status === 'active')) {
      roles.push({ role: 'Volunteer', detail: 'Active volunteer' })
    }
  } catch { /* ignore */ }

  try {
    const members = JSON.parse(localStorage.getItem('sanveda_memberships') ?? '[]') as { email?: string; tier?: string; status?: string }[]
    const m = members.find((x) => x.email?.toLowerCase() === email)
    if (m?.status === 'active') roles.push({ role: 'Member', detail: `${m.tier ?? 'Standard'} member` })
  } catch { /* ignore */ }

  if (i.status === 'completed') {
    roles.push({ role: 'Alumni', detail: 'Internship completed' })
  }

  return roles
}

function buildProfile(i: Internship, index: number, metaMap: Record<string, InternAdminMeta>): InternProfile {
  const meta = metaMap[i.id] ?? {}
  const seed = hashCode(i.id)
  const mentor = meta.mentor ?? MENTORS[seed % MENTORS.length]
  const isActive = i.status === 'active'
  const isCompleted = i.status === 'completed'
  const performance = meta.performance ?? DEFAULT_PERFORMANCE.map((p) => ({
    ...p,
    score: p.score - (seed % 8) + (isCompleted ? 3 : 0),
  }))
  const performanceScore = Math.round(performance.reduce((s, p) => s + p.score, 0) / performance.length)
  const stipend = meta.stipend ?? (isActive || isCompleted ? 10000 : 0)
  const progressScore = meta.progressScore ?? (isActive || isCompleted ? 85 + (seed % 12) : 0)

  return {
    ...i,
    internId: meta.internId ?? generateInternId(index, i.createdAt),
    programLabel: inferProgram(i.preferredDepartment),
    durationLabel: formatDuration(i.durationWeeks),
    mentor,
    performanceScore,
    pipelineStage: inferPipelineStage(i, meta),
    mode: meta.mode ?? (['remote', 'hybrid', 'onsite'][seed % 3] as InternshipMode),
    stipend,
    weeklyMeetings: meta.weeklyMeetings ?? (isActive ? 8 + (seed % 8) : 0),
    progressScore,
    tasks: buildTasks(meta, isActive || isCompleted),
    performance,
    deliverables: meta.deliverables ?? DEFAULT_DELIVERABLES.map((d, idx) => ({
      ...d,
      completed: isCompleted || (isActive && idx < 3),
    })),
    stipendRecords: buildStipendRecords(i, meta, stipend),
    alumniOutcomes: meta.alumniOutcomes ?? (isCompleted
      ? (['lor', 'volunteer'] as AlumniOutcome[]).slice(0, 1 + (seed % 2))
      : []),
    attendancePct: meta.attendancePct ?? (isActive || isCompleted ? 88 + (seed % 10) : 0),
    workingHours: meta.workingHours ?? (isActive || isCompleted ? 120 + (seed % 60) : 0),
    meetingsAttended: meta.meetingsAttended ?? (isActive || isCompleted ? 18 + (seed % 12) : 0),
    assignmentsCompleted: meta.assignmentsCompleted ?? (isActive || isCompleted ? 12 + (seed % 10) : 0),
    unifiedRoles: getUnifiedRoles(i),
    isAlumni: isCompleted,
    hasCertificate: Boolean(i.certificateNumber),
  }
}

function computeKpis(interns: InternProfile[]) {
  return {
    totalApplications: interns.length,
    pendingReview: interns.filter((i) => i.status === 'pending' || i.status === 'review').length,
    selectedInterns: interns.filter((i) => ['approved', 'active', 'completed'].includes(i.status)).length,
    activeInterns: interns.filter((i) => i.status === 'active').length,
    completedInternships: interns.filter((i) => i.status === 'completed').length,
    certificatesIssued: interns.filter((i) => i.certificateNumber).length,
  }
}

function computeAnalytics(interns: InternProfile[]) {
  const deptMap = new Map<string, number>()
  for (const i of interns) {
    const dept = i.preferredDepartment ?? 'General'
    deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1)
  }
  const deptTotal = [...deptMap.values()].reduce((s, v) => s + v, 0) || 1
  const applicationsByDepartment = [...deptMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / deptTotal) * 100) }))
    .sort((a, b) => b.value - a.value)

  const uniMap = new Map<string, number>()
  for (const i of interns) {
    const uni = i.university ?? 'Unknown'
    uniMap.set(uni, (uniMap.get(uni) ?? 0) + 1)
  }
  const universityDistribution = [...uniMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const applied = interns.length
  const selected = interns.filter((i) => ['approved', 'active', 'completed'].includes(i.status)).length
  const completed = interns.filter((i) => i.status === 'completed').length

  const completionFunnel = [
    { label: 'Applied', value: applied },
    { label: 'Selected', value: selected },
    { label: 'Completed', value: completed },
  ]

  return { applicationsByDepartment, universityDistribution, completionFunnel }
}

function computeAlumniStats(interns: InternProfile[]) {
  const alumni = interns.filter((i) => i.isAlumni)
  const outcomeLabels: Record<AlumniOutcome, string> = {
    volunteer: 'Volunteer',
    member: 'Member',
    employee: 'Employee',
    lor: 'Received LOR',
    placed: 'Placed Elsewhere',
    mentor: 'Mentor',
    donor: 'Donor',
  }
  const counts = new Map<string, number>()
  for (const a of alumni) {
    for (const o of a.alumniOutcomes) {
      counts.set(outcomeLabels[o], (counts.get(outcomeLabels[o]) ?? 0) + 1)
    }
  }
  return {
    totalAlumni: alumni.length,
    outcomes: [...counts.entries()].map(([label, count]) => ({ label, count })),
  }
}

function computeAiInsights(interns: InternProfile[], kpis: InternshipDashboardData['kpis']) {
  const dueEval = interns.filter((i) => i.status === 'active' && i.progressScore >= 80).length
  const leadership = interns.filter((i) => i.performanceScore >= 90 && i.status === 'active').length
  const techCompleted = interns.filter((i) => i.preferredDepartment?.toLowerCase().includes('tech') && i.status === 'completed').length
  const techTotal = interns.filter((i) => i.preferredDepartment?.toLowerCase().includes('tech')).length || 1
  const mentorFollowUp = interns.filter((i) => i.status === 'active' && i.weeklyMeetings < 6).length
  const fullTime = interns.filter((i) => i.status === 'active' && i.performanceScore >= 92).length

  return [
    { id: 'eval', message: `${dueEval || Math.max(1, Math.round(kpis.activeInterns * 0.15))} interns are due for evaluation`, tone: 'warning' as const },
    { id: 'leadership', message: `${leadership || Math.max(0, Math.round(kpis.activeInterns * 0.05))} interns qualify for leadership roles`, tone: 'success' as const },
    { id: 'tech', message: `Technology department has ${Math.round((techCompleted / techTotal) * 100)}% completion rate`, tone: 'info' as const },
    { id: 'mentor', message: `${mentorFollowUp || Math.max(0, Math.round(kpis.activeInterns * 0.1))} interns need mentor follow-up`, tone: 'warning' as const },
    { id: 'fulltime', message: `${fullTime || Math.max(0, Math.round(kpis.activeInterns * 0.03))} interns are eligible for full-time conversion`, tone: 'info' as const },
  ]
}

export async function getInternshipDashboardData(): Promise<InternshipDashboardData> {
  const raw = await getInternships()
  const metaMap = readMetaMap()
  const sorted = [...raw].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const interns = sorted.map((i, idx) => buildProfile(i, idx, metaMap))

  const pipeline = CASE_STAGES.reduce(
    (acc, { stage }) => {
      acc[stage] = interns.filter((i) => i.pipelineStage === stage)
      return acc
    },
    {} as Record<PipelineStage, InternProfile[]>,
  )

  const kpis = computeKpis(interns)
  const analytics = computeAnalytics(interns)
  const aiInsights = computeAiInsights(interns, kpis)
  const alumniStats = computeAlumniStats(interns)

  const departmentOptions = [...new Set(interns.map((i) => i.preferredDepartment).filter(Boolean) as string[])].sort()
  const universityOptions = [...new Set(interns.map((i) => i.university).filter(Boolean) as string[])].sort()

  return {
    interns,
    programs: [...INTERNSHIP_PROGRAMS],
    kpis,
    pipeline,
    aiInsights,
    alumniStats,
    departmentOptions,
    universityOptions,
    ...analytics,
  }
}

export function filterInterns(interns: InternProfile[], filters: InternFilters): InternProfile[] {
  return interns.filter((i) => {
    if (filters.department !== 'all' && i.preferredDepartment !== filters.department) return false
    if (filters.status !== 'all' && i.status !== filters.status) return false
    if (filters.program !== 'all' && i.programLabel !== filters.program) return false
    if (filters.university !== 'all' && i.university !== filters.university) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        i.fullName.toLowerCase().includes(q) ||
        i.internId.toLowerCase().includes(q) ||
        (i.university ?? '').toLowerCase().includes(q) ||
        (i.preferredDepartment ?? '').toLowerCase().includes(q) ||
        i.mentor.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export function exportInternsCsv(interns: InternProfile[]) {
  const headers = ['Name', 'Intern ID', 'University', 'Program', 'Duration', 'Mentor', 'Status', 'Performance', 'Email']
  const rows = interns.map((i) => [
    i.fullName,
    i.internId,
    i.university ?? '',
    i.programLabel,
    i.durationLabel,
    i.mentor,
    i.status,
    i.performanceScore,
    i.email,
  ])
  downloadCsv('interns-export.csv', headers, rows)
}

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'review', label: 'Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
] as const

export const PROGRAM_FILTER_OPTIONS = [
  { value: 'all', label: 'All Programs' },
  ...INTERNSHIP_PROGRAMS.map((p) => ({ value: p, label: p })),
] as const

export const ALUMNI_OUTCOME_LABELS: Record<AlumniOutcome, string> = {
  volunteer: 'Converted to Volunteer',
  member: 'Converted to Member',
  employee: 'Joined Full-time',
  lor: 'Received LOR',
  placed: 'Placed Elsewhere',
  mentor: 'Became Mentor',
  donor: 'Became Donor',
}
