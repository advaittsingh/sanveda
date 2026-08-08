import { downloadCsv } from './adminExport'
import { VOLUNTEER_ROLE_OPTIONS } from '../constants/volunteerContent'
import { getVolunteerApplications } from './volunteerStore'
import type { VolunteerApplication, VolunteerRole, VolunteerStatus } from '../types/volunteer'
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

export type VolunteerViewMode = 'table' | 'kanban'

export interface VolunteerCertification {
  name: string
  status: 'completed' | 'pending'
}

export interface VolunteerAssignment {
  id: string
  projectId: string
  project: string
  role: string
  start: string
  end: string
  status: 'completed' | 'active' | 'upcoming' | 'cancelled'
}

export interface VolunteerTask {
  id: string
  name: string
  dueDate: string
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled'
  projectId?: string
  proofUrl?: string
  proofName?: string
  approvalStatus?: 'unreviewed' | 'approved' | 'rejected' | 'changes_requested'
  approvalNotes?: string
}

export interface VolunteerEventParticipation {
  name: string
  attended: boolean
  hours: number
  feedbackScore: number
}

export interface VolunteerAdminMeta {
  emergencyContact?: string
  volunteerHours?: number
  presentDays?: number
  projects?: number
  events?: number
  isTeamLeader?: boolean
  badges?: string[]
  certifications?: VolunteerCertification[]
  assignments?: VolunteerAssignment[]
  tasks?: VolunteerTask[]
  eventParticipation?: VolunteerEventParticipation[]
}

export interface VolunteerProfile extends VolunteerApplication {
  primaryRole: string
  department: string
  location: string
  experienceLabel: string
  volunteerHours: number
  presentDays: number
  projects: number
  events: number
  isTeamLeader: boolean
  skillsList: string[]
  badges: string[]
  certificationRecords: VolunteerCertification[]
  assignments: VolunteerAssignment[]
  tasks: VolunteerTask[]
  eventParticipation: VolunteerEventParticipation[]
  performanceScore: number
  performanceBreakdown: {
    attendance: number
    participation: number
    leadership: number
    reliability: number
    impact: number
  }
  emergencyContact: string
  pipelineStage: VolunteerStatus
}

export interface VolunteerFilters {
  search: string
  status: VolunteerStatus | 'all'
  department: string | 'all'
  team: string | 'all'
}

export interface VolunteerTeamSummary {
  name: string
  count: number
}

export interface VolunteerDashboardData {
  volunteers: VolunteerProfile[]
  kpis: {
    totalApplications: number
    pendingReview: number
    approvedVolunteers: number
    activeVolunteers: number
    teamLeaders: number
    volunteerHours: number
  }
  pipeline: Record<VolunteerStatus, VolunteerProfile[]>
  teams: VolunteerTeamSummary[]
  hoursByDepartment: { label: string; hours: number }[]
  volunteersByDepartment: { label: string; value: number; pct: number }[]
  volunteerGrowth: { label: string; value: number }[]
  retentionRates: { label: string; value: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

function roleLabel(role: VolunteerRole): string {
  return VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role
}

function inferHours(app: VolunteerApplication, meta?: VolunteerAdminMeta): number {
  void app
  if (meta?.volunteerHours != null) return meta.volunteerHours
  return 0
}

function inferPerformance(app: VolunteerApplication, hours: number) {
  void app
  void hours
  return {
    performanceScore: 0,
    performanceBreakdown: { attendance: 0, participation: 0, leadership: 0, reliability: 0, impact: 0 },
  }
}

function buildAssignments(app: VolunteerApplication, meta?: VolunteerAdminMeta): VolunteerAssignment[] {
  if (meta?.assignments?.length) return meta.assignments
  void app
  return []
}

function buildEventParticipation(meta?: VolunteerAdminMeta): VolunteerEventParticipation[] {
  if (meta?.eventParticipation?.length) return meta.eventParticipation
  return []
}

function buildProfile(app: VolunteerApplication, metaMap: Record<string, VolunteerAdminMeta>): VolunteerProfile {
  const meta = metaMap[app.id] ?? {}
  const primaryRole = app.preferredRoles[0] ? roleLabel(app.preferredRoles[0]) : 'General'
  const department = app.department ?? ''
  const volunteerHours = inferHours(app, meta)
  const { performanceScore, performanceBreakdown } = inferPerformance(app, volunteerHours)
  const isTeamLeader = app.isTeamLeader ?? meta.isTeamLeader ?? false
  const skillsList = app.skills
    ? app.skills.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    : app.preferredRoles.map(roleLabel)

  return {
    ...app,
    primaryRole,
    department,
    location: `${app.city}${app.state ? `, ${app.state}` : ''}`,
    experienceLabel: app.experience?.trim() || '—',
    volunteerHours,
    presentDays: meta.presentDays ?? 0,
    projects: meta.projects ?? 0,
    events: meta.events ?? 0,
    isTeamLeader,
    skillsList,
    badges: meta.badges ?? [],
    certificationRecords: meta.certifications ?? [],
    assignments: buildAssignments(app, meta),
    tasks: meta.tasks ?? [],
    eventParticipation: buildEventParticipation(meta),
    performanceScore,
    performanceBreakdown,
    emergencyContact: app.emergencyContact ?? meta.emergencyContact ?? '',
    pipelineStage: app.status,
  }
}

function computeKpis(volunteers: VolunteerProfile[]) {
  return {
    totalApplications: volunteers.length,
    pendingReview: volunteers.filter((v) => v.status === 'pending' || v.status === 'screening').length,
    approvedVolunteers: volunteers.filter((v) => v.status === 'approved' || v.status === 'active' || v.status === 'orientation').length,
    activeVolunteers: volunteers.filter((v) => v.status === 'active').length,
    teamLeaders: volunteers.filter((v) => v.isTeamLeader).length,
    volunteerHours: volunteers.reduce((s, v) => s + v.volunteerHours, 0),
  }
}

function computeTeams(volunteers: VolunteerProfile[]): VolunteerTeamSummary[] {
  const teams = ['Healthcare Team', 'Education Team', 'Fundraising Team', 'Operations Team']
  return teams.map((name) => ({
    name,
    count: volunteers.filter((v) => {
      const dept = v.department.toLowerCase()
      if (name.includes('Healthcare')) return dept.includes('healthcare')
      if (name.includes('Education')) return dept.includes('education')
      if (name.includes('Fundraising')) return dept.includes('fundraising')
      return dept.includes('operations') || (!dept.includes('healthcare') && !dept.includes('education') && !dept.includes('fundraising'))
    }).filter((v) => v.status === 'active' || v.status === 'approved').length,
  }))
}

function computeAnalytics(volunteers: VolunteerProfile[]) {
  const deptMap = new Map<string, number>()
  for (const v of volunteers.filter((x) => x.status === 'active' || x.status === 'approved')) {
    deptMap.set(v.department, (deptMap.get(v.department) ?? 0) + 1)
  }
  const deptTotal = [...deptMap.values()].reduce((s, v) => s + v, 0) || 1
  const volunteersByDepartment = [...deptMap.entries()].map(([label, value]) => ({
    label,
    value,
    pct: Math.round((value / deptTotal) * 100),
  }))

  const monthMap = new Map<string, number>()
  for (const v of volunteers) {
    const label = new Date(v.createdAt).toLocaleDateString('en-IN', { month: 'short' })
    monthMap.set(label, (monthMap.get(label) ?? 0) + 1)
  }
  const volunteerGrowth = [...monthMap.entries()].slice(-6).map(([label, value]) => ({ label, value }))

  const hoursMap = new Map<string, number>()
  for (const v of volunteers) {
    hoursMap.set(v.department, (hoursMap.get(v.department) ?? 0) + v.volunteerHours)
  }
  const hoursByDepartment = [...hoursMap.entries()].map(([label, hours]) => ({ label, hours }))

  const activeCount = volunteers.filter((v) => v.status === 'active').length
  const total = volunteers.length || 1
  const retentionRates = [
    { label: '1 Month', value: Math.min(95, Math.round((activeCount / total) * 100 + 20)) },
    { label: '6 Months', value: Math.min(85, Math.round((activeCount / total) * 100 + 8)) },
    { label: '1 Year', value: Math.min(72, Math.round((activeCount / total) * 100)) },
  ]

  return { volunteersByDepartment, volunteerGrowth, hoursByDepartment, retentionRates }
}

function computeAiInsights(volunteers: VolunteerProfile[], teams: VolunteerTeamSummary[]) {
  const inactive = volunteers.filter((v) => {
    if (v.status !== 'active') return false
    const days = (Date.now() - new Date(v.updatedAt).getTime()) / 86400000
    return days >= 60
  }).length

  const leaderCandidates = volunteers.filter(
    (v) => v.status === 'active' && !v.isTeamLeader && v.performanceScore >= 85,
  ).length

  const healthcareTeam = teams.find((t) => t.name.includes('Healthcare'))
  const healthcareGap = healthcareTeam && healthcareTeam.count < 25 ? 25 - healthcareTeam.count : 0

  const fiveHundredHours = volunteers.filter((v) => v.volunteerHours >= 500).length

  return [
    { id: 'inactive', message: `${inactive} volunteers inactive for 60 days`, tone: 'warning' as const },
    { id: 'leaders', message: `${leaderCandidates} volunteers eligible for team leader roles`, tone: 'info' as const },
    ...(healthcareGap > 0
      ? [{ id: 'healthcare', message: `Healthcare team requires ${healthcareGap} more volunteers`, tone: 'warning' as const }]
      : []),
    { id: 'hours', message: `${fiveHundredHours} volunteers have crossed 500 service hours`, tone: 'success' as const },
  ]
}

export async function getVolunteerDashboardData(): Promise<VolunteerDashboardData> {
  const applications = await getVolunteerApplications()
  const ids = applications.map((application) => application.id)
  const [assignments, certifications, tasks] = await Promise.all([
    listWorkflowRows('volunteer_assignments', 'volunteer_application_id', ids),
    listWorkflowRows('volunteer_certifications', 'volunteer_application_id', ids),
    listWorkflowRows('volunteer_tasks', 'volunteer_application_id', ids).catch(() => [] as WorkflowRow[]),
  ])
  const projectTitles = await getProjectTitleMap(
    assignments.map((row) => (row.project_id ? String(row.project_id) : '')),
  )
  const timeEntries = await listWorkflowRows('volunteer_time_entries', 'assignment_id', assignments.map((row) => row.id))
  const assignmentsByVolunteer = groupWorkflowRows(assignments, 'volunteer_application_id')
  const certificationsByVolunteer = groupWorkflowRows(certifications, 'volunteer_application_id')
  const tasksByVolunteer = groupWorkflowRows(tasks, 'volunteer_application_id')
  const timeByAssignment = groupWorkflowRows(timeEntries, 'assignment_id')
  const metaMap = Object.fromEntries(applications.map((application) => {
    const volunteerAssignments = assignmentsByVolunteer.get(application.id) ?? []
    const volunteerTime = volunteerAssignments.flatMap((assignment) => timeByAssignment.get(assignment.id) ?? [])
    return [application.id, {
      volunteerHours: volunteerTime.reduce((sum, row) => sum + Number(row.hours ?? 0), 0),
      presentDays: new Set(volunteerTime.map((row) => String(row.service_date))).size,
      projects: new Set(volunteerAssignments.map((row) => row.project_id).filter(Boolean)).size,
      events: new Set(volunteerAssignments.map((row) => row.event_id).filter(Boolean)).size,
      assignments: volunteerAssignments.map((row: WorkflowRow) => {
        const projectId = row.project_id ? String(row.project_id) : ''
        return {
          id: String(row.id),
          projectId,
          project: projectId
            ? (projectTitles.get(projectId) ?? projectId)
            : row.event_id
              ? `Event ${String(row.event_id).slice(0, 8)}`
              : '',
          role: String(row.role),
          start: row.starts_at ? String(row.starts_at) : '',
          end: row.ends_at ? String(row.ends_at) : '',
          status: mapUiAssignmentStatus(row.status),
        }
      }),
      tasks: (tasksByVolunteer.get(application.id) ?? []).map((row: WorkflowRow) => ({
        id: String(row.id),
        name: String(row.title),
        dueDate: row.due_date ? String(row.due_date) : '',
        status: (row.status === 'cancelled' ? 'cancelled' : row.status) as VolunteerTask['status'],
        projectId: row.project_id ? String(row.project_id) : undefined,
        proofUrl: row.proof_url ? String(row.proof_url) : undefined,
        proofName: row.proof_name ? String(row.proof_name) : undefined,
        approvalStatus: (row.approval_status as VolunteerTask['approvalStatus']) || 'unreviewed',
        approvalNotes: row.approval_notes ? String(row.approval_notes) : undefined,
      })),
      certifications: (certificationsByVolunteer.get(application.id) ?? []).map((row: WorkflowRow) => ({
        name: String(row.name),
        status: row.status === 'completed' ? 'completed' : 'pending',
      })),
    } satisfies VolunteerAdminMeta]
  }))
  const volunteers = applications.map((app) => buildProfile(app, metaMap))

  const pipeline = {
    pending: volunteers.filter((v) => v.status === 'pending'),
    screening: volunteers.filter((v) => v.status === 'screening'),
    interview: volunteers.filter((v) => v.status === 'interview'),
    approved: volunteers.filter((v) => v.status === 'approved'),
    orientation: volunteers.filter((v) => v.status === 'orientation'),
    active: volunteers.filter((v) => v.status === 'active'),
    rejected: volunteers.filter((v) => v.status === 'rejected'),
  }

  const kpis = computeKpis(volunteers)
  const teams = computeTeams(volunteers)
  const analytics = computeAnalytics(volunteers)
  const aiInsights = computeAiInsights(volunteers, teams)

  return { volunteers, kpis, pipeline, teams, aiInsights, ...analytics }
}

export function filterVolunteers(volunteers: VolunteerProfile[], filters: VolunteerFilters): VolunteerProfile[] {
  return volunteers.filter((v) => {
    if (filters.status !== 'all' && v.status !== filters.status) return false
    if (filters.department !== 'all' && v.department !== filters.department) return false
    if (filters.team !== 'all' && v.assignedTeam !== filters.team) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        v.fullName.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.primaryRole.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export async function updateVolunteerMeta(id: string, patch: Partial<VolunteerAdminMeta>) {
  const rootPatch: Record<string, unknown> = {}
  if ('emergencyContact' in patch) rootPatch.emergency_contact = patch.emergencyContact || null
  if ('isTeamLeader' in patch) rootPatch.is_team_leader = patch.isTeamLeader ?? null
  await updateDomainRoot('volunteer_applications', id, rootPatch)
}

export async function assignVolunteerToProject(params: {
  volunteerId: string
  projectId: string
  role: string
  startsAt?: string
  volunteerName: string
  userId?: string | null
  setAssignedTeamIfEmpty?: boolean
  currentAssignedTeam?: string | null
}): Promise<WorkflowRow> {
  const role = params.role.trim() || 'Volunteer'
  const existing = await listWorkflowRows('volunteer_assignments', 'volunteer_application_id', [
    params.volunteerId,
  ])
  if (hasActiveAssignment(existing, 'project_id', params.projectId)) {
    throw new Error('This volunteer is already assigned to that project.')
  }

  const assignment = await createWorkflowRow('volunteer_assignments', {
    volunteer_application_id: params.volunteerId,
    project_id: params.projectId,
    role,
    starts_at: params.startsAt ? new Date(params.startsAt).toISOString() : new Date().toISOString(),
    status: 'assigned',
  })

  await ensureProjectTeamMember({
    projectId: params.projectId,
    memberName: params.volunteerName,
    role: role.toLowerCase().includes('volunteer') ? role : `Volunteer · ${role}`,
    userId: params.userId,
  })

  if (params.setAssignedTeamIfEmpty !== false && !params.currentAssignedTeam?.trim()) {
    const titles = await getProjectTitleMap([params.projectId])
    const title = titles.get(params.projectId)
    if (title) {
      await updateDomainRoot('volunteer_applications', params.volunteerId, { assigned_team: title })
    }
  }

  return assignment
}

export async function updateVolunteerAssignmentStatus(
  assignmentId: string,
  status: AssignmentStatus,
): Promise<WorkflowRow> {
  return updateAssignmentStatus('volunteer_assignments', assignmentId, status)
}

export async function createVolunteerTask(params: {
  volunteerId: string
  title: string
  dueDate?: string
  projectId?: string
  status?: VolunteerTask['status']
}): Promise<WorkflowRow> {
  const title = params.title.trim()
  if (!title) throw new Error('Task title is required.')
  return createWorkflowRow('volunteer_tasks', {
    volunteer_application_id: params.volunteerId,
    title,
    due_date: params.dueDate || null,
    project_id: params.projectId || null,
    status: params.status ?? 'pending',
  })
}

export async function updateVolunteerTaskStatus(
  taskId: string,
  status: VolunteerTask['status'],
): Promise<WorkflowRow> {
  return updateWorkflowRow('volunteer_tasks', taskId, { status })
}

export function exportVolunteersCsv(volunteers: VolunteerProfile[]) {
  const headers = [
    'Name',
    'Email',
    'Role',
    'Department',
    'Location',
    'Experience',
    'Status',
    'Hours',
    'Volunteer ID',
  ]
  const rows = volunteers.map((v) => [
    v.fullName,
    v.email,
    v.primaryRole,
    v.department,
    v.location,
    v.experienceLabel,
    v.status,
    v.volunteerHours,
    v.volunteerId ?? '',
  ])
  downloadCsv('volunteers-export.csv', headers, rows)
}

export const PIPELINE_STAGES: { status: VolunteerStatus; label: string }[] = [
  { status: 'pending', label: 'Applications' },
  { status: 'screening', label: 'Screening' },
  { status: 'interview', label: 'Interview' },
  { status: 'approved', label: 'Approved' },
  { status: 'orientation', label: 'Training' },
  { status: 'active', label: 'Active' },
]

export const DEPARTMENT_OPTIONS = ['all', 'Healthcare', 'Education', 'Fundraising', 'Operations'] as const

export const STATUS_FILTER_OPTIONS: { value: VolunteerStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'approved', label: 'Approved' },
  { value: 'orientation', label: 'Training' },
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
]
