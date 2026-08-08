import { dataApi } from './dataApiClient'
import {
  createWorkflowRow,
  listWorkflowRows,
  updateWorkflowRow,
  type WorkflowRow,
} from './domainWorkflowService'

export type AssignmentStatus = 'assigned' | 'active' | 'completed' | 'cancelled'

export interface ProjectOption {
  id: string
  title: string
  status: string
}

export async function listProjectOptions(includeInactive = false): Promise<ProjectOption[]> {
  const { data, error } = await dataApi.table('projects').select('id,title,status')
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as { id: string; title: string; status: string }[]
  return rows
    .filter((row) => includeInactive || !['archived'].includes(row.status))
    .map((row) => ({ id: row.id, title: row.title, status: row.status }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export async function getProjectTitleMap(projectIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(projectIds.filter(Boolean))]
  if (!unique.length) return new Map()
  const { data, error } = await dataApi.table('projects').select('id,title').in('id', unique)
  if (error) throw new Error(error.message)
  return new Map(((data ?? []) as { id: string; title: string }[]).map((row) => [row.id, row.title]))
}

/** Ensure a project_team row exists for this member name + role on the project. */
export async function ensureProjectTeamMember(params: {
  projectId: string
  memberName: string
  role: string
  userId?: string | null
}): Promise<WorkflowRow> {
  const existing = await listWorkflowRows('project_team', 'project_id', [params.projectId])
  const needleName = params.memberName.trim().toLowerCase()
  const needleRole = params.role.trim().toLowerCase()
  const match = existing.find(
    (row) =>
      String(row.member_name ?? '').trim().toLowerCase() === needleName &&
      String(row.role ?? '').trim().toLowerCase() === needleRole,
  )
  if (match) return match
  return createWorkflowRow('project_team', {
    project_id: params.projectId,
    member_name: params.memberName.trim(),
    role: params.role.trim(),
    user_id: params.userId ?? null,
    joined_on: new Date().toISOString().slice(0, 10),
  })
}

export function mapUiAssignmentStatus(dbStatus: unknown): 'completed' | 'active' | 'upcoming' | 'cancelled' {
  if (dbStatus === 'completed') return 'completed'
  if (dbStatus === 'active') return 'active'
  if (dbStatus === 'cancelled') return 'cancelled'
  return 'upcoming'
}

export function hasActiveAssignment(
  rows: WorkflowRow[],
  projectIdKey: string,
  projectId: string,
): boolean {
  return rows.some(
    (row) =>
      String(row[projectIdKey] ?? '') === projectId &&
      (row.status === 'assigned' || row.status === 'active'),
  )
}

export async function updateAssignmentStatus(
  table: 'volunteer_assignments' | 'internship_assignments',
  assignmentId: string,
  status: AssignmentStatus,
): Promise<WorkflowRow> {
  return updateWorkflowRow(table, assignmentId, {
    status,
    updated_at: new Date().toISOString(),
    ...(status === 'completed' || status === 'cancelled'
      ? { ends_at: new Date().toISOString() }
      : {}),
  })
}
