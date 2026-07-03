import { isSupabaseConfigured, requireSupabase } from './supabase'

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
}

const STORAGE_KEY = 'sanveda_beneficiaries'

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
  }
}

function readLocal(): Beneficiary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Beneficiary[]) : []
  } catch {
    return []
  }
}

function writeLocal(items: Beneficiary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function getBeneficiaries(): Promise<Beneficiary[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('beneficiaries')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToBeneficiary)
  }
  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function saveBeneficiary(input: Partial<Beneficiary> & { fullName: string }): Promise<Beneficiary> {
  const now = new Date().toISOString()

  if (isSupabaseConfigured) {
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
    }

    if (input.id) {
      const { data, error } = await requireSupabase().from('beneficiaries').update(row).eq('id', input.id).select().single()
      if (error) throw new Error(error.message)
      return rowToBeneficiary(data)
    }

    const { data, error } = await requireSupabase().from('beneficiaries').insert(row).select().single()
    if (error) throw new Error(error.message)
    return rowToBeneficiary(data)
  }

  const all = readLocal()
  if (input.id) {
    const i = all.findIndex((b) => b.id === input.id)
    const updated = { ...all[i], ...input, updatedAt: now } as Beneficiary
    all[i] = updated
    writeLocal(all)
    return updated
  }

  const created: Beneficiary = {
    id: crypto.randomUUID(),
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    address: input.address,
    city: input.city,
    state: input.state,
    category: input.category,
    program: input.program,
    supportType: input.supportType,
    notes: input.notes,
    status: input.status ?? 'active',
    supportAmount: input.supportAmount ?? 0,
    lastSupportDate: input.lastSupportDate,
    createdAt: now,
    updatedAt: now,
  }
  all.unshift(created)
  writeLocal(all)
  return created
}

export async function deleteBeneficiary(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase().from('beneficiaries').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }
  writeLocal(readLocal().filter((b) => b.id !== id))
}
