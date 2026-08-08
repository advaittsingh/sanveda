import { downloadCsv } from './adminExport'
import { getInternships, type Internship, type InternshipStatus } from './internshipService'
import {
  createWorkflowRow,
  groupWorkflowRows,
  listWorkflowRows,
  updateDomainRoot,
  updateWorkflowRow,
  type WorkflowRow,
} from './domainWorkflowService'
import {
  ensureProjectTeamMember,
  getProjectTitleMap,
  hasActiveAssignment,
  mapUiAssignmentStatus,
  updateAssignmentStatus,
  type AssignmentStatus,
} from './assignmentOperations'

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
export type AlumniOutcome =
  | 'volunteer'
  | 'member'
  | 'employee'
  | 'lor'
  | 'placed'
  | 'mentor'
  | 'donor'

export interface InternTask {
  id: string
  name: string
  dueDate: string
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled'
  score: number | null
  proofUrl?: string
  proofName?: string
  approvalStatus?: 'unreviewed' | 'approved' | 'rejected' | 'changes_requested'
  approvalNotes?: string
}

export interface InternProjectAssignment {
  id: string
  projectId: string
  project: string
  role: string
  start: string
  end: string
  status: 'completed' | 'active' | 'upcoming' | 'cancelled'
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
  projectAssignments?: InternProjectAssignment[]
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
  projectAssignments: InternProjectAssignment[]
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

export async function writeInternMeta(id: string, patch: Partial<InternAdminMeta>) {
  const rootPatch: Record<string, unknown> = {}
  if ('internId' in patch) rootPatch.intern_code = patch.internId || null
  if ('pipelineStage' in patch) rootPatch.pipeline_stage = patch.pipelineStage || null
  if ('mentor' in patch) rootPatch.mentor_name = patch.mentor || null
  if ('mode' in patch) rootPatch.mode = patch.mode || null
  if ('stipend' in patch) rootPatch.stipend_amount = patch.stipend ?? null
  await updateDomainRoot('internships', id, rootPatch)
}

export async function assignInternToProject(params: {
  internshipId: string
  projectId: string
  role: string
  startsAt?: string
  internName: string
  userId?: string | null
}): Promise<WorkflowRow> {
  const role = params.role.trim() || 'Intern'
  const existing = await listWorkflowRows('internship_assignments', 'internship_id', [
    params.internshipId,
  ])
  if (hasActiveAssignment(existing, 'project_id', params.projectId)) {
    throw new Error('This intern is already assigned to that project.')
  }

  const assignment = await createWorkflowRow('internship_assignments', {
    internship_id: params.internshipId,
    project_id: params.projectId,
    role,
    starts_at: params.startsAt ? new Date(params.startsAt).toISOString() : new Date().toISOString(),
    status: 'assigned',
  })

  await ensureProjectTeamMember({
    projectId: params.projectId,
    memberName: params.internName,
    role: role.toLowerCase().includes('intern') ? role : `Intern · ${role}`,
    userId: params.userId,
  })

  return assignment
}

export async function updateInternshipAssignmentStatus(
  assignmentId: string,
  status: AssignmentStatus,
): Promise<WorkflowRow> {
  return updateAssignmentStatus('internship_assignments', assignmentId, status)
}

export async function createInternTask(params: {
  internshipId: string
  title: string
  dueDate?: string
  status?: InternTask['status']
}): Promise<WorkflowRow> {
  const title = params.title.trim()
  if (!title) throw new Error('Task title is required.')
  return createWorkflowRow('intern_tasks', {
    internship_id: params.internshipId,
    title,
    due_date: params.dueDate || null,
    status: params.status ?? 'pending',
  })
}

export async function updateInternTaskStatus(
  taskId: string,
  status: InternTask['status'],
): Promise<WorkflowRow> {
  return updateWorkflowRow('intern_tasks', taskId, { status })
}

function formatDuration(weeks?: number): string {
  if (!weeks) return '3 Months'
  if (weeks >= 20) return '6 Months'
  if (weeks >= 10) return '3 Months'
  return `${weeks} Weeks`
}

function inferPipelineStage(i: Internship, meta?: InternAdminMeta): PipelineStage {
  if (meta?.pipelineStage) return meta.pipelineStage
  if (i.status === 'completed') return 'completed'
  if (i.status === 'active') {
    const days = i.startDate ? (Date.now() - new Date(i.startDate).getTime()) / 86400000 : 999
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
  return []
}

function buildStipendRecords(i: Internship, meta?: InternAdminMeta, stipend = 0): StipendRecord[] {
  if (meta?.stipendRecords?.length) return meta.stipendRecords
  if (!stipend || (i.status !== 'active' && i.status !== 'completed')) return []
  return []
}

function getUnifiedRoles(i: Internship): { role: string; detail: string }[] {
  const roles: { role: string; detail: string }[] = [
    { role: 'Intern', detail: i.preferredDepartment ?? 'Internship programme' },
  ]
  const email = i.email.toLowerCase()

  void email

  if (i.status === 'completed') {
    roles.push({ role: 'Alumni', detail: 'Internship completed' })
  }

  return roles
}

function buildProfile(
  i: Internship,
  index: number,
  metaMap: Record<string, InternAdminMeta>,
): InternProfile {
  void index
  const meta = metaMap[i.id] ?? {}
  const mentor = i.mentorName ?? meta.mentor ?? ''
  const isActive = i.status === 'active'
  const isCompleted = i.status === 'completed'
  const performance = meta.performance ?? []
  const performanceScore = performance.length
    ? Math.round(performance.reduce((s, p) => s + p.score, 0) / performance.length)
    : 0
  const stipend = meta.stipend ?? 0
  const progressScore = meta.progressScore ?? 0

  return {
    ...i,
    internId: i.internCode ?? meta.internId ?? '',
    programLabel: i.programName ?? '',
    durationLabel: formatDuration(i.durationWeeks),
    mentor,
    performanceScore,
    pipelineStage: (i.pipelineStage as PipelineStage | undefined) ?? inferPipelineStage(i, meta),
    mode: (i.mode as InternshipMode | undefined) ?? meta.mode ?? 'remote',
    stipend: i.stipendAmount ?? stipend,
    weeklyMeetings: meta.weeklyMeetings ?? 0,
    progressScore,
    tasks: buildTasks(meta, isActive || isCompleted),
    projectAssignments: meta.projectAssignments ?? [],
    performance,
    deliverables: meta.deliverables ?? [],
    stipendRecords: buildStipendRecords(i, meta, stipend),
    alumniOutcomes: meta.alumniOutcomes ?? [],
    attendancePct: meta.attendancePct ?? 0,
    workingHours: meta.workingHours ?? 0,
    meetingsAttended: meta.meetingsAttended ?? 0,
    assignmentsCompleted: meta.assignmentsCompleted ?? 0,
    unifiedRoles: getUnifiedRoles(i),
    isAlumni: isCompleted,
    hasCertificate: Boolean(i.certificateNumber),
  }
}

function computeKpis(interns: InternProfile[]) {
  return {
    totalApplications: interns.length,
    pendingReview: interns.filter((i) => i.status === 'pending' || i.status === 'review').length,
    selectedInterns: interns.filter((i) => ['approved', 'active', 'completed'].includes(i.status))
      .length,
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
  const selected = interns.filter((i) =>
    ['approved', 'active', 'completed'].includes(i.status),
  ).length
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

function computeAiInsights(interns: InternProfile[]) {
  const dueEval = interns.filter((i) => i.status === 'active' && i.progressScore >= 80).length
  const leadership = interns.filter((i) => i.performanceScore >= 90 && i.status === 'active').length
  const techCompleted = interns.filter(
    (i) => i.preferredDepartment?.toLowerCase().includes('tech') && i.status === 'completed',
  ).length
  const techTotal =
    interns.filter((i) => i.preferredDepartment?.toLowerCase().includes('tech')).length || 1
  const mentorFollowUp = interns.filter((i) => i.status === 'active' && i.weeklyMeetings < 6).length
  const fullTime = interns.filter((i) => i.status === 'active' && i.performanceScore >= 92).length

  return [
    {
      id: 'eval',
      message: `${dueEval} active interns have recorded progress of at least 80%`,
      tone: 'warning' as const,
    },
    {
      id: 'leadership',
      message: `${leadership} active interns have recorded performance of at least 90`,
      tone: 'success' as const,
    },
    {
      id: 'tech',
      message: `Technology department has ${Math.round((techCompleted / techTotal) * 100)}% completion rate`,
      tone: 'info' as const,
    },
    {
      id: 'mentor',
      message: `${mentorFollowUp} active interns have fewer than six recorded mentor sessions`,
      tone: 'warning' as const,
    },
    {
      id: 'fulltime',
      message: `${fullTime} active interns have recorded performance of at least 92`,
      tone: 'info' as const,
    },
  ]
}

export async function getInternshipDashboardData(): Promise<InternshipDashboardData> {
  const raw = await getInternships()
  const ids = raw.map((intern) => intern.id)
  const [tasks, mentoring, attendance, stipends, assignments] = await Promise.all([
    listWorkflowRows('intern_tasks', 'internship_id', ids),
    listWorkflowRows('intern_mentoring_sessions', 'internship_id', ids),
    listWorkflowRows('intern_attendance', 'internship_id', ids),
    listWorkflowRows('intern_stipends', 'internship_id', ids),
    listWorkflowRows('internship_assignments', 'internship_id', ids).catch(() => [] as WorkflowRow[]),
  ])
  const projectTitles = await getProjectTitleMap(
    assignments.map((row) => (row.project_id ? String(row.project_id) : '')),
  )
  const tasksByIntern = groupWorkflowRows(tasks, 'internship_id')
  const mentoringByIntern = groupWorkflowRows(mentoring, 'internship_id')
  const attendanceByIntern = groupWorkflowRows(attendance, 'internship_id')
  const stipendsByIntern = groupWorkflowRows(stipends, 'internship_id')
  const assignmentsByIntern = groupWorkflowRows(assignments, 'internship_id')
  const metaMap = Object.fromEntries(
    raw.map((intern) => {
      const attendanceRows = attendanceByIntern.get(intern.id) ?? []
      const attended = attendanceRows.filter((row) => row.attended === true)
      return [
        intern.id,
        {
          tasks: (tasksByIntern.get(intern.id) ?? []).map((row: WorkflowRow) => ({
            id: String(row.id),
            name: String(row.title),
            dueDate: row.due_date ? String(row.due_date) : '',
            status: (row.status === 'cancelled' ? 'cancelled' : row.status) as InternTask['status'],
            score: row.score == null ? null : Number(row.score),
            proofUrl: row.proof_url ? String(row.proof_url) : undefined,
            proofName: row.proof_name ? String(row.proof_name) : undefined,
            approvalStatus: (row.approval_status as InternTask['approvalStatus']) || 'unreviewed',
            approvalNotes: row.approval_notes ? String(row.approval_notes) : undefined,
          })),
          projectAssignments: (assignmentsByIntern.get(intern.id) ?? []).map((row: WorkflowRow) => {
            const projectId = String(row.project_id ?? '')
            return {
              id: String(row.id),
              projectId,
              project: projectTitles.get(projectId) ?? projectId,
              role: String(row.role),
              start: row.starts_at ? String(row.starts_at) : '',
              end: row.ends_at ? String(row.ends_at) : '',
              status: mapUiAssignmentStatus(row.status),
            }
          }),
          stipendRecords: (stipendsByIntern.get(intern.id) ?? []).map((row: WorkflowRow) => ({
            month: String(row.period_start),
            amount: Number(row.amount),
            status: row.status === 'paid' ? 'paid' : 'pending',
          })),
          weeklyMeetings: mentoringByIntern.get(intern.id)?.length ?? 0,
          meetingsAttended:
            mentoringByIntern.get(intern.id)?.filter((row) => row.attended === true).length ?? 0,
          attendancePct: attendanceRows.length
            ? Math.round((attended.length / attendanceRows.length) * 100)
            : 0,
          workingHours: attended.reduce((sum, row) => sum + Number(row.hours ?? 0), 0),
          assignmentsCompleted: (tasksByIntern.get(intern.id) ?? []).filter(
            (row) => row.status === 'completed',
          ).length,
        } satisfies InternAdminMeta,
      ]
    }),
  )
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
  const aiInsights = computeAiInsights(interns)
  const alumniStats = computeAlumniStats(interns)

  const departmentOptions = [
    ...new Set(interns.map((i) => i.preferredDepartment).filter(Boolean) as string[]),
  ].sort()
  const universityOptions = [
    ...new Set(interns.map((i) => i.university).filter(Boolean) as string[]),
  ].sort()

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
  const headers = [
    'Name',
    'Intern ID',
    'University',
    'Program',
    'Duration',
    'Mentor',
    'Status',
    'Performance',
    'Email',
  ]
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
