import { dataApi } from './dataApiClient'

export type WorkflowTable =
  | 'project_milestones'
  | 'project_tasks'
  | 'project_funding'
  | 'project_team'
  | 'beneficiary_household_members'
  | 'beneficiary_support'
  | 'beneficiary_outcomes'
  | 'volunteer_assignments'
  | 'volunteer_tasks'
  | 'volunteer_time_entries'
  | 'volunteer_certifications'
  | 'intern_mentoring_sessions'
  | 'intern_tasks'
  | 'intern_attendance'
  | 'intern_stipends'
  | 'internship_assignments'
  | 'membership_payments'
  | 'membership_participation'
  | 'event_agenda'
  | 'event_staffing'
  | 'event_sponsorships'
  | 'event_attendance'
  | 'event_feedback'
  | 'donor_profiles'
  | 'donor_communications'
  | 'donor_tasks'
  | 'enquiry_messages'
  | 'enquiry_assignments'
  | 'enquiry_sla_events'
  | 'enquiry_conversions'

export type WorkflowRow = Record<string, unknown> & { id: string }

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export async function listWorkflowRows(
  table: WorkflowTable,
  foreignKey?: string,
  foreignIds: string[] = [],
): Promise<WorkflowRow[]> {
  let query = dataApi.table(table).select('*')
  if (foreignKey && foreignIds.length) query = query.in(foreignKey, foreignIds)
  if (foreignKey && !foreignIds.length) return []
  const { data, error } = await query
  throwIfError(error)
  return (data ?? []) as WorkflowRow[]
}

export async function createWorkflowRow(
  table: WorkflowTable,
  values: Record<string, unknown>,
): Promise<WorkflowRow> {
  const { data, error } = await dataApi.table(table).insert(values).select('*').single()
  throwIfError(error)
  return data as WorkflowRow
}

export async function updateWorkflowRow(
  table: WorkflowTable,
  id: string,
  patch: Record<string, unknown>,
): Promise<WorkflowRow> {
  const { data, error } = await dataApi.table(table).update(patch).eq('id', id).select('*').single()
  throwIfError(error)
  return data as WorkflowRow
}

export async function deleteWorkflowRow(table: WorkflowTable, id: string): Promise<void> {
  const { error } = await dataApi.table(table).delete().eq('id', id)
  throwIfError(error)
}

export async function updateDomainRoot(
  table: 'projects' | 'beneficiaries' | 'volunteer_applications' | 'internships' | 'memberships' | 'events' | 'enquiries',
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const { error } = await dataApi.table(table).update(patch).eq('id', id)
  throwIfError(error)
}

export function groupWorkflowRows(rows: WorkflowRow[], foreignKey: string): Map<string, WorkflowRow[]> {
  const grouped = new Map<string, WorkflowRow[]>()
  for (const row of rows) {
    const key = String(row[foreignKey] ?? '')
    if (!key) continue
    const values = grouped.get(key) ?? []
    values.push(row)
    grouped.set(key, values)
  }
  return grouped
}
