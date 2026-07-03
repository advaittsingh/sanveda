import { isSupabaseConfigured, requireSupabase } from './supabase'
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
}

const STORAGE_KEY = 'sanveda_projects'

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
  }
}

function readLocal(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeLocal(items: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function getPublicProjects(): Promise<Project[]> {
  const all = await getProjects()
  return all.filter((p) => p.status === 'active' || p.status === 'completed')
}

export async function getProjects(): Promise<Project[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase().from('projects').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToProject)
  }
  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
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
    updated_at: now,
  }

  if (isSupabaseConfigured) {
    if (input.id) {
      const { data, error } = await requireSupabase().from('projects').update(row).eq('id', input.id).select().single()
      if (error) throw new Error(error.message)
      await logAudit('update', 'project', input.id)
      return rowToProject(data)
    }
    const { data, error } = await requireSupabase().from('projects').insert(row).select().single()
    if (error) throw new Error(error.message)
    await logAudit('create', 'project', String(data.id))
    return rowToProject(data)
  }

  const created: Project = {
    id: input.id ?? crypto.randomUUID(),
    slug: input.slug,
    title: input.title,
    description: input.description,
    focusArea: input.focusArea,
    status: input.status ?? 'planning',
    budget: input.budget ?? 0,
    spent: input.spent ?? 0,
    beneficiariesCount: input.beneficiariesCount ?? 0,
    startDate: input.startDate,
    endDate: input.endDate,
    managerName: input.managerName,
    progressPercent: input.progressPercent ?? 0,
    createdAt: now,
    updatedAt: now,
  }
  const all = readLocal()
  if (input.id) {
    const i = all.findIndex((p) => p.id === input.id)
    all[i] = { ...all[i], ...created }
  } else {
    all.unshift(created)
  }
  writeLocal(all)
  return created
}

export async function deleteProject(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await requireSupabase().from('projects').delete().eq('id', id)
    await logAudit('delete', 'project', id)
    return
  }
  writeLocal(readLocal().filter((p) => p.id !== id))
}
