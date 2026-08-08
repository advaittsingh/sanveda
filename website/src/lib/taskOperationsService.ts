import { dataApi } from './dataApiClient'
import { deliveryUrl } from './privateStorageClient'

export type TaskKind = 'volunteer' | 'intern'
export type TaskWorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskApprovalStatus = 'unreviewed' | 'approved' | 'rejected' | 'changes_requested'

export interface AdminTaskRow {
  id: string
  kind: TaskKind
  title: string
  dueDate: string | null
  status: TaskWorkflowStatus
  approvalStatus: TaskApprovalStatus
  approvalNotes: string | null
  approvedAt: string | null
  proofUrl: string | null
  proofName: string | null
  proofContentType: string | null
  assigneeId: string
  assigneeName: string
  assigneeEmail: string
  projectId: string | null
  projectTitle: string | null
  createdAt: string | null
}

export interface TaskFilters {
  search: string
  kind: 'all' | TaskKind
  status: 'all' | TaskWorkflowStatus
  approval: 'all' | TaskApprovalStatus | 'needs_review'
}

export const defaultTaskFilters: TaskFilters = {
  search: '',
  kind: 'all',
  status: 'all',
  approval: 'all',
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

function asApproval(value: unknown): TaskApprovalStatus {
  if (
    value === 'approved' ||
    value === 'rejected' ||
    value === 'changes_requested' ||
    value === 'unreviewed'
  ) {
    return value
  }
  return 'unreviewed'
}

function asStatus(value: unknown): TaskWorkflowStatus {
  if (value === 'in_progress' || value === 'completed' || value === 'cancelled' || value === 'pending') {
    return value
  }
  return 'pending'
}

export function canApproveTask(task: Pick<AdminTaskRow, 'status' | 'proofUrl'>): boolean {
  return task.status === 'completed' && Boolean(task.proofUrl)
}

export function needsReview(task: AdminTaskRow): boolean {
  return (
    task.status === 'completed' &&
    Boolean(task.proofUrl) &&
    task.approvalStatus === 'unreviewed'
  )
}

export function filterAdminTasks(tasks: AdminTaskRow[], filters: TaskFilters): AdminTaskRow[] {
  const q = filters.search.trim().toLowerCase()
  return tasks.filter((task) => {
    if (filters.kind !== 'all' && task.kind !== filters.kind) return false
    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (filters.approval === 'needs_review') {
      if (!needsReview(task)) return false
    } else if (filters.approval !== 'all' && task.approvalStatus !== filters.approval) {
      return false
    }
    if (!q) return true
    return (
      task.title.toLowerCase().includes(q) ||
      task.assigneeName.toLowerCase().includes(q) ||
      task.assigneeEmail.toLowerCase().includes(q) ||
      (task.projectTitle ?? '').toLowerCase().includes(q)
    )
  })
}

export async function getAdminTasks(options: {
  includeVolunteers: boolean
  includeInterns: boolean
}): Promise<AdminTaskRow[]> {
  const rows: AdminTaskRow[] = []

  if (options.includeVolunteers) {
    const { data: tasks, error } = await dataApi.table('volunteer_tasks').select('*').order('created_at', {
      ascending: false,
    })
    throwIfError(error)
    const volunteerTasks = (tasks ?? []) as Record<string, unknown>[]
    const volunteerIds = [
      ...new Set(volunteerTasks.map((row) => String(row.volunteer_application_id ?? '')).filter(Boolean)),
    ]
    const projectIds = [
      ...new Set(volunteerTasks.map((row) => (row.project_id ? String(row.project_id) : '')).filter(Boolean)),
    ]

    const [volunteers, projects] = await Promise.all([
      volunteerIds.length
        ? dataApi
            .table('volunteer_applications')
            .select('id,full_name,email')
            .in('id', volunteerIds)
            .then((result) => {
              throwIfError(result.error)
              return (result.data ?? []) as Record<string, unknown>[]
            })
        : Promise.resolve([] as Record<string, unknown>[]),
      projectIds.length
        ? dataApi
            .table('projects')
            .select('id,title')
            .in('id', projectIds)
            .then((result) => {
              throwIfError(result.error)
              return (result.data ?? []) as Record<string, unknown>[]
            })
        : Promise.resolve([] as Record<string, unknown>[]),
    ])

    const volunteerMap = new Map(volunteers.map((row) => [String(row.id), row]))
    const projectMap = new Map(projects.map((row) => [String(row.id), row]))

    for (const row of volunteerTasks) {
      const assigneeId = String(row.volunteer_application_id ?? '')
      const assignee = volunteerMap.get(assigneeId)
      const projectId = row.project_id ? String(row.project_id) : null
      rows.push({
        id: String(row.id),
        kind: 'volunteer',
        title: String(row.title ?? ''),
        dueDate: row.due_date ? String(row.due_date) : null,
        status: asStatus(row.status),
        approvalStatus: asApproval(row.approval_status),
        approvalNotes: row.approval_notes ? String(row.approval_notes) : null,
        approvedAt: row.approved_at ? String(row.approved_at) : null,
        proofUrl: row.proof_url ? String(row.proof_url) : null,
        proofName: row.proof_name ? String(row.proof_name) : null,
        proofContentType: row.proof_content_type ? String(row.proof_content_type) : null,
        assigneeId,
        assigneeName: assignee ? String(assignee.full_name ?? 'Volunteer') : 'Volunteer',
        assigneeEmail: assignee ? String(assignee.email ?? '') : '',
        projectId,
        projectTitle: projectId ? String(projectMap.get(projectId)?.title ?? '') : null,
        createdAt: row.created_at ? String(row.created_at) : null,
      })
    }
  }

  if (options.includeInterns) {
    const { data: tasks, error } = await dataApi.table('intern_tasks').select('*').order('created_at', {
      ascending: false,
    })
    throwIfError(error)
    const internTasks = (tasks ?? []) as Record<string, unknown>[]
    const internshipIds = [
      ...new Set(internTasks.map((row) => String(row.internship_id ?? '')).filter(Boolean)),
    ]

    const internships = internshipIds.length
      ? await dataApi
          .table('internships')
          .select('id,full_name,email')
          .in('id', internshipIds)
          .then((result) => {
            throwIfError(result.error)
            return (result.data ?? []) as Record<string, unknown>[]
          })
      : []

    const internshipMap = new Map(internships.map((row) => [String(row.id), row]))

    for (const row of internTasks) {
      const assigneeId = String(row.internship_id ?? '')
      const assignee = internshipMap.get(assigneeId)
      rows.push({
        id: String(row.id),
        kind: 'intern',
        title: String(row.title ?? ''),
        dueDate: row.due_date ? String(row.due_date) : null,
        status: asStatus(row.status),
        approvalStatus: asApproval(row.approval_status),
        approvalNotes: row.approval_notes ? String(row.approval_notes) : null,
        approvedAt: row.approved_at ? String(row.approved_at) : null,
        proofUrl: row.proof_url ? String(row.proof_url) : null,
        proofName: row.proof_name ? String(row.proof_name) : null,
        proofContentType: row.proof_content_type ? String(row.proof_content_type) : null,
        assigneeId,
        assigneeName: assignee ? String(assignee.full_name ?? 'Intern') : 'Intern',
        assigneeEmail: assignee ? String(assignee.email ?? '') : '',
        projectId: null,
        projectTitle: null,
        createdAt: row.created_at ? String(row.created_at) : null,
      })
    }
  }

  return rows.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
  })
}

export async function reviewAdminTask(params: {
  kind: TaskKind
  taskId: string
  approvalStatus: Exclude<TaskApprovalStatus, 'unreviewed'>
  notes?: string
}): Promise<void> {
  const { error } = await dataApi.call('review_task', {
    p_kind: params.kind,
    p_task_id: params.taskId,
    p_approval_status: params.approvalStatus,
    ...(params.notes?.trim() ? { p_notes: params.notes.trim() } : {}),
  })
  throwIfError(error)
}

export function taskProofHref(proofUrl?: string | null): string | undefined {
  return deliveryUrl(proofUrl ?? undefined)
}
