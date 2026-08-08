import { dataApi } from './dataApiClient'
import { getExpenses } from './expenseService'

export type IncomeSource = 'donation' | 'membership' | 'grant' | 'csr' | 'other'

export interface IncomeRecord {
  id: string
  source: IncomeSource
  description: string
  amount: number
  incomeDate: string
  referenceId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

function rowToIncome(row: Record<string, unknown>): IncomeRecord {
  return {
    id: String(row.id),
    source: row.source as IncomeSource,
    description: String(row.description),
    amount: Number(row.amount),
    incomeDate: String(row.income_date).slice(0, 10),
    referenceId: row.reference_id ? String(row.reference_id) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export async function getIncomeRecords(): Promise<IncomeRecord[]> {
  const { data, error } = await dataApi
    .table('income_records')
    .select('*')
    .order('income_date', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToIncome)
}

export async function saveIncomeRecord(
  input: Partial<IncomeRecord> & { source: IncomeSource; description: string; amount: number },
): Promise<IncomeRecord> {
  const now = new Date().toISOString()
  const incomeDate = input.incomeDate ?? now.slice(0, 10)

  const row = {
    source: input.source,
    description: input.description,
    amount: input.amount,
    income_date: incomeDate,
    reference_id: input.referenceId ?? null,
    notes: input.notes ?? null,
    updated_at: now,
  }
  if (input.id) {
    const { data, error } = await dataApi.table('income_records').update(row).eq('id', input.id).select().single()
    if (error) throw new Error(error.message)
    return rowToIncome(data)
  }
  const { data, error } = await dataApi.table('income_records').insert(row).select().single()
  if (error) throw new Error(error.message)
  return rowToIncome(data)
}

export async function getFinancialSummary() {
  const [income, expenses] = await Promise.all([getIncomeRecords(), getExpenses()])

  const totalIncome = income.reduce((s, r) => s + r.amount, 0)
  const totalExpenses = expenses.filter((e) => e.status === 'approved' || e.status === 'paid').reduce((s, e) => s + e.amount, 0)
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount, 0)

  return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, pendingExpenses, incomeCount: income.length, expenseCount: expenses.length }
}
