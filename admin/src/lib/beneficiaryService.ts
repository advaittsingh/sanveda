import { dataApi } from './dataApiClient'

export type BeneficiaryStatus = 'active' | 'completed' | 'on_hold' | 'archived'

export interface Beneficiary {
  id: string
  fullName: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  category?: string
  program?: string
  supportType?: string
  notes?: string
  status: BeneficiaryStatus
  supportAmount: number
  lastSupportDate?: string
  createdAt: string
  updatedAt: string
  beneficiaryCode?: string
  pipelineStage?: string
  priority?: string
  caseWorker?: string
  assignedTeam?: string
  familyIncome?: number
  adminMeta: Record<string, unknown>
}

function rowToBeneficiary(row: Record<string, unknown>): Beneficiary {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    phone: row.phone ? String(row.phone) : undefined,
    email: row.email ? String(row.email) : undefined,
    address: row.address ? String(row.address) : undefined,
    city: row.city ? String(row.city) : undefined,
    state: row.state ? String(row.state) : undefined,
    category: row.category ? String(row.category) : undefined,
    program: row.program ? String(row.program) : undefined,
    supportType: row.support_type ? String(row.support_type) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    status: row.status as BeneficiaryStatus,
    supportAmount: Number(row.support_amount ?? 0),
    lastSupportDate: row.last_support_date ? String(row.last_support_date) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    beneficiaryCode: row.beneficiary_code ? String(row.beneficiary_code) : undefined,
    pipelineStage: row.pipeline_stage ? String(row.pipeline_stage) : undefined,
    priority: row.priority ? String(row.priority) : undefined,
    caseWorker: row.case_worker ? String(row.case_worker) : undefined,
    assignedTeam: row.assigned_team ? String(row.assigned_team) : undefined,
    familyIncome: row.family_income == null ? undefined : Number(row.family_income),
    adminMeta: row.admin_meta && typeof row.admin_meta === 'object' ? row.admin_meta as Record<string, unknown> : {},
  }
}

export async function getBeneficiaries(): Promise<Beneficiary[]> {
  const { data, error } = await dataApi
    .table('beneficiaries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToBeneficiary)
}

export async function saveBeneficiary(input: Partial<Beneficiary> & { fullName: string }): Promise<Beneficiary> {
  const now = new Date().toISOString()

  const row = {
    full_name: input.fullName,
    phone: input.phone ?? null,
    email: input.email ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    category: input.category ?? null,
    program: input.program ?? null,
    support_type: input.supportType ?? null,
    notes: input.notes ?? null,
    status: input.status ?? 'active',
    support_amount: input.supportAmount ?? 0,
    last_support_date: input.lastSupportDate ?? null,
    updated_at: now,
    beneficiary_code: input.beneficiaryCode ?? null,
    pipeline_stage: input.pipelineStage ?? null,
    priority: input.priority ?? null,
    case_worker: input.caseWorker ?? null,
    assigned_team: input.assignedTeam ?? null,
    family_income: input.familyIncome ?? null,
    admin_meta: input.adminMeta ?? {},
  }
  if (input.id) {
    const { data, error } = await dataApi.table('beneficiaries').update(row).eq('id', input.id).select().single()
    if (error) throw new Error(error.message)
    return rowToBeneficiary(data)
  }
  const { data, error } = await dataApi.table('beneficiaries').insert(row).select().single()
  if (error) throw new Error(error.message)
  return rowToBeneficiary(data)
}

export async function deleteBeneficiary(id: string): Promise<void> {
  const { error } = await dataApi.table('beneficiaries').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
