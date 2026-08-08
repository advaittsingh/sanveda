import { downloadCsv } from './adminExport'
import { getAllCampaignsAdmin } from './campaignService'
import { FOCUS_AREAS as SITE_FOCUS_AREAS } from '../constants/focusAreas'
import { formatIndianCompact } from './formatIndian'
import { getProjects, type Project, type ProjectStatus } from './projectService'
import {
  createWorkflowRow,
  groupWorkflowRows,
  listWorkflowRows,
  updateDomainRoot,
  updateWorkflowRow,
  type WorkflowRow,
} from './domainWorkflowService'
import { ensureProjectTeamMember } from './assignmentOperations'
import { assignInternToProject } from './internshipOperationsService'
import { assignVolunteerToProject } from './volunteerOperationsService'

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
  id: string
  name: string
  owner: string
  dueDate: string
  status: 'complete' | 'pending' | 'in_progress' | 'blocked' | 'cancelled'
}

export interface ProjectTeamMember {
  id: string
  name: string
  role: string
  joinedOn?: string
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
  teamRoster?: ProjectTeamMember[]
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
  teamRoster: ProjectTeamMember[]
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

export const FOCUS_AREAS = SITE_FOCUS_AREAS.map((area) => area.tabLabel)

export async function updateProjectMeta(id: string, patch: Partial<ProjectAdminMeta>) {
  const rootPatch: Record<string, unknown> = {}
  if ('projectId' in patch) rootPatch.project_code = patch.projectId || null
  if ('lifecycleStage' in patch) rootPatch.lifecycle_stage = patch.lifecycleStage || null
  if ('priority' in patch) rootPatch.priority = patch.priority || null
  if ('location' in patch) rootPatch.location = patch.location || null
  if ('receivedFunds' in patch) rootPatch.received_funds = patch.receivedFunds ?? null
  if ('adminNotes' in patch) rootPatch.admin_meta = { adminNotes: patch.adminNotes ?? null }
  await updateDomainRoot('projects', id, rootPatch)
}

export async function addProjectTeamMember(params: {
  projectId: string
  memberType: 'volunteer' | 'intern' | 'other'
  memberName: string
  role: string
  /** Required when memberType is volunteer or intern */
  personId?: string
  userId?: string | null
  currentAssignedTeam?: string | null
}): Promise<void> {
  const role = params.role.trim() || (
    params.memberType === 'volunteer' ? 'Volunteer' : params.memberType === 'intern' ? 'Intern' : 'Team Member'
  )
  const name = params.memberName.trim()
  if (!name) throw new Error('Member name is required.')

  if (params.memberType === 'volunteer') {
    if (!params.personId) throw new Error('Select a volunteer.')
    await assignVolunteerToProject({
      volunteerId: params.personId,
      projectId: params.projectId,
      role,
      volunteerName: name,
      userId: params.userId,
      currentAssignedTeam: params.currentAssignedTeam,
    })
    return
  }

  if (params.memberType === 'intern') {
    if (!params.personId) throw new Error('Select an intern.')
    await assignInternToProject({
      internshipId: params.personId,
      projectId: params.projectId,
      role,
      internName: name,
      userId: params.userId,
    })
    return
  }

  await ensureProjectTeamMember({
    projectId: params.projectId,
    memberName: name,
    role,
    userId: params.userId,
  })
}

export async function createProjectTask(params: {
  projectId: string
  title: string
  dueDate?: string
  assignedName?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
}): Promise<WorkflowRow> {
  const title = params.title.trim()
  if (!title) throw new Error('Task title is required.')
  return createWorkflowRow('project_tasks', {
    project_id: params.projectId,
    title,
    due_date: params.dueDate || null,
    assigned_name: params.assignedName?.trim() || null,
    status: params.status ?? 'pending',
  })
}

export async function updateProjectTaskStatus(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled',
): Promise<WorkflowRow> {
  return updateWorkflowRow('project_tasks', taskId, {
    status,
    updated_at: new Date().toISOString(),
  })
}

function buildTasks(p: Project, meta?: ProjectAdminMeta): ProjectTask[] {
  void p
  if (meta?.tasks?.length) return meta.tasks
  return []
}

function buildImpactMetrics(p: Project, meta?: ProjectAdminMeta, focus?: string): ImpactMetric[] {
  if (meta?.impactMetrics?.length) return meta.impactMetrics
  void p
  void focus
  return []
}

function computeProgress(p: Project, milestones: ProjectMilestone[], tasks: ProjectTask[]): number {
  const milestonePct = milestones.length
    ? (milestones.filter((m) => m.completed).length / milestones.length) * 100
    : p.progressPercent
  const taskPct = tasks.length
    ? (tasks.filter((t) => t.status === 'complete').length / tasks.length) * 100
    : p.progressPercent
  const budgetPct = p.budget > 0 ? (p.spent / p.budget) * 100 : 0
  return Math.round((milestonePct * 0.4 + taskPct * 0.3 + budgetPct * 0.3))
}

function buildProfile(
  p: Project,
  index: number,
  metaMap: Record<string, ProjectAdminMeta>,
  campaignTitles: Map<string, string>,
): ProjectProfile {
  void index
  const meta = { ...(p.adminMeta as ProjectAdminMeta), ...(metaMap[p.id] ?? {}) }
  const focusArea = p.focusArea ?? ''
  const receivedFunds = meta.receivedFunds ?? 0
  const remainingBudget = Math.max(p.budget - p.spent, 0)
  const utilizationPct = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0
  const milestones = meta.milestones ?? []
  const tasks = buildTasks(p, meta)
  const computedProgress = computeProgress(p, milestones, tasks)
  const beneficiaries = p.beneficiariesCount
  const breakdown: BeneficiaryBreakdown = {
    total: beneficiaries,
    children: meta.beneficiaryBreakdown?.children ?? 0,
    women: meta.beneficiaryBreakdown?.women ?? 0,
    seniorCitizens: meta.beneficiaryBreakdown?.seniorCitizens ?? 0,
    ...meta.beneficiaryBreakdown,
  }
  const team: ProjectTeam = {
    projectDirector: meta.team?.projectDirector ?? '',
    programManager: p.managerName ?? meta.team?.programManager ?? '',
    teamMembers: meta.team?.teamMembers ?? 0,
    volunteers: meta.team?.volunteers ?? 0,
    interns: meta.team?.interns ?? 0,
    partners: meta.team?.partners ?? 0,
    fieldStaff: meta.team?.fieldStaff ?? 0,
    ...meta.team,
  }
  const linkedCampaigns = (meta.linkedCampaignIds ?? [])
    .map((id) => campaignTitles.get(id))
    .filter(Boolean) as string[]
  const endDate = p.endDate ? new Date(p.endDate) : null
  const isDelayed = endDate ? endDate.getTime() < Date.now() && p.status === 'active' : false
  const isOverBudget = p.spent > p.budget && p.budget > 0

  return {
    ...p,
    focusArea,
    projectId: p.projectCode ?? meta.projectId ?? '',
    lifecycleStage: (p.lifecycleStage as LifecycleStage | undefined) ?? meta.lifecycleStage ?? 'planning',
    priority: (p.priority as ProjectPriority | undefined) ?? meta.priority ?? 'low',
    locationLabel: p.location ?? meta.location ?? '',
    receivedFunds,
    remainingBudget,
    utilizationPct,
    computedProgress,
    progressPercent: computedProgress,
    teamSize: team.teamMembers,
    team,
    teamRoster: meta.teamRoster ?? [],
    beneficiaryBreakdown: breakdown,
    linkedCampaigns,
    milestones,
    tasks,
    expenseCategories: meta.expenseCategories ?? [],
    impactMetrics: buildImpactMetrics(p, meta, focusArea),
    documents: meta.documents ?? [],
    media: meta.media ?? [],
    successStory: meta.successStory ?? null,
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
  const completionRate = kpis.totalProjects
    ? Math.round((kpis.completedProjects / kpis.totalProjects) * 100)
    : 0

  return [
    { id: 'budget', message: `${overBudget} projects are over budget`, tone: 'warning' as const },
    { id: 'delayed', message: `${delayed} active projects are past their stored end date`, tone: 'warning' as const },
    { id: 'completion', message: `Recorded project completion rate: ${completionRate}%`, tone: 'info' as const },
  ]
}

export async function getProjectDashboardData(): Promise<ProjectDashboardData> {
  const [raw, campaigns] = await Promise.all([getProjects(), getAllCampaignsAdmin().catch(() => [])])
  const campaignTitles = new Map(campaigns.map((c) => [String(c.id), c.title]))
  const ids = raw.map((p) => p.id)
  const [milestones, tasks, funding, teamRows] = await Promise.all([
    listWorkflowRows('project_milestones', 'project_id', ids),
    listWorkflowRows('project_tasks', 'project_id', ids),
    listWorkflowRows('project_funding', 'project_id', ids),
    listWorkflowRows('project_team', 'project_id', ids),
  ])
  const milestonesByProject = groupWorkflowRows(milestones, 'project_id')
  const tasksByProject = groupWorkflowRows(tasks, 'project_id')
  const fundingByProject = groupWorkflowRows(funding, 'project_id')
  const teamByProject = groupWorkflowRows(teamRows, 'project_id')
  const metaMap = Object.fromEntries(raw.map((project) => {
    const projectMilestones = milestonesByProject.get(project.id) ?? []
    const projectTasks = tasksByProject.get(project.id) ?? []
    const members = teamByProject.get(project.id) ?? []
    const countRole = (needle: string) => members.filter((row) => String(row.role ?? '').toLowerCase().includes(needle)).length
    return [project.id, {
      milestones: projectMilestones.map((row: WorkflowRow) => ({
        label: String(row.title),
        completed: row.status === 'completed',
        inProgress: row.status === 'in_progress',
      })),
      tasks: projectTasks.map((row: WorkflowRow) => ({
        id: String(row.id),
        name: String(row.title),
        owner: row.assigned_name
          ? String(row.assigned_name)
          : row.assigned_to
            ? String(row.assigned_to)
            : '',
        dueDate: row.due_date ? String(row.due_date) : '',
        status:
          row.status === 'completed'
            ? 'complete'
            : row.status === 'in_progress'
              ? 'in_progress'
              : row.status === 'blocked'
                ? 'blocked'
                : row.status === 'cancelled'
                  ? 'cancelled'
                  : 'pending',
      })),
      receivedFunds: fundingByProject.get(project.id)?.reduce((sum, row) => sum + Number(row.amount ?? 0), 0)
        ?? project.receivedFunds ?? 0,
      team: {
        projectDirector: String(members.find((row) => String(row.role).toLowerCase().includes('director'))?.member_name ?? ''),
        programManager: String(members.find((row) => String(row.role).toLowerCase().includes('manager'))?.member_name ?? ''),
        teamMembers: members.length,
        volunteers: countRole('volunteer'),
        interns: countRole('intern'),
        partners: countRole('partner'),
        fieldStaff: countRole('field'),
      },
      teamRoster: members.map((row: WorkflowRow) => ({
        id: String(row.id),
        name: String(row.member_name ?? ''),
        role: String(row.role ?? ''),
        joinedOn: row.joined_on ? String(row.joined_on) : undefined,
      })),
    } satisfies ProjectAdminMeta]
  }))
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
