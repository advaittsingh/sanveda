import { dataApi } from './dataApiClient'
import { logAudit } from './auditService'

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'

export interface Project {
  id: string
  slug: string
  title: string
  description?: string
  focusArea?: string
  status: ProjectStatus
  budget: number
  spent: number
  beneficiariesCount: number
  startDate?: string
  endDate?: string
  managerName?: string
  progressPercent: number
  createdAt: string
  updatedAt: string
  projectCode?: string
  lifecycleStage?: string
  priority?: string
  location?: string
  receivedFunds?: number
  adminMeta: Record<string, unknown>
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    focusArea: row.focus_area ? String(row.focus_area) : undefined,
    status: row.status as ProjectStatus,
    budget: Number(row.budget ?? 0),
    spent: Number(row.spent ?? 0),
    beneficiariesCount: Number(row.beneficiaries_count ?? 0),
    startDate: row.start_date ? String(row.start_date).slice(0, 10) : undefined,
    endDate: row.end_date ? String(row.end_date).slice(0, 10) : undefined,
    managerName: row.manager_name ? String(row.manager_name) : undefined,
    progressPercent: Number(row.progress_percent ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    projectCode: row.project_code ? String(row.project_code) : undefined,
    lifecycleStage: row.lifecycle_stage ? String(row.lifecycle_stage) : undefined,
    priority: row.priority ? String(row.priority) : undefined,
    location: row.location ? String(row.location) : undefined,
    receivedFunds: row.received_funds == null ? undefined : Number(row.received_funds),
    adminMeta: row.admin_meta && typeof row.admin_meta === 'object' ? row.admin_meta as Record<string, unknown> : {},
  }
}

export async function getPublicProjects(): Promise<Project[]> {
  const { data, error } = await dataApi.publicTable('projects').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToProject)
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await dataApi.table('projects').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToProject)
}

export async function saveProject(input: Partial<Project> & { title: string; slug: string }): Promise<Project> {
  const now = new Date().toISOString()
  const row = {
    slug: input.slug,
    title: input.title,
    description: input.description ?? null,
    focus_area: input.focusArea ?? null,
    status: input.status ?? 'planning',
    budget: input.budget ?? 0,
    spent: input.spent ?? 0,
    beneficiaries_count: input.beneficiariesCount ?? 0,
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    manager_name: input.managerName ?? null,
    progress_percent: input.progressPercent ?? 0,
    project_code: input.projectCode ?? null,
    lifecycle_stage: input.lifecycleStage ?? null,
    priority: input.priority ?? null,
    location: input.location ?? null,
    received_funds: input.receivedFunds ?? null,
    admin_meta: input.adminMeta ?? {},
    updated_at: now,
  }

  if (input.id) {
    const { data, error } = await dataApi.table('projects').update(row).eq('id', input.id).select().single()
    if (error) throw new Error(error.message)
    await logAudit('update', 'project', input.id)
    return rowToProject(data)
  }
  const { data, error } = await dataApi.table('projects').insert(row).select().single()
  if (error) throw new Error(error.message)
  await logAudit('create', 'project', String(data.id))
  return rowToProject(data)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await dataApi.table('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logAudit('delete', 'project', id)
}
