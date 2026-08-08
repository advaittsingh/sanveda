import { dataApi } from './dataApiClient'

export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  expenseDate: string
  status: ExpenseStatus
  reference?: string
  createdAt: string
  updatedAt: string
}

export const EXPENSE_CATEGORIES = [
  'Operations',
  'Program Delivery',
  'Medical Aid',
  'Education',
  'Sports',
  'Events',
  'Marketing',
  'Administration',
  'Other',
] as const

function rowToExpense(row: Record<string, unknown>): Expense {
  return {
    id: String(row.id),
    category: String(row.category),
    description: String(row.description),
    amount: Number(row.amount),
    expenseDate: String(row.expense_date).slice(0, 10),
    status: row.status as ExpenseStatus,
    reference: row.reference ? String(row.reference) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await dataApi
    .table('expenses')
    .select('*')
    .order('expense_date', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToExpense)
}

export async function saveExpense(input: Partial<Expense> & { category: string; description: string; amount: number }): Promise<Expense> {
  const now = new Date().toISOString()
  const expenseDate = input.expenseDate ?? now.slice(0, 10)

  const row = {
    category: input.category,
    description: input.description,
    amount: input.amount,
    expense_date: expenseDate,
    status: input.status ?? 'pending',
    reference: input.reference ?? null,
    updated_at: now,
  }
  if (input.id) {
    const { data, error } = await dataApi.table('expenses').update(row).eq('id', input.id).select().single()
    if (error) throw new Error(error.message)
    return rowToExpense(data)
  }
  const { data, error } = await dataApi.table('expenses').insert(row).select().single()
  if (error) throw new Error(error.message)
  return rowToExpense(data)
}

export async function updateExpenseStatus(id: string, status: ExpenseStatus): Promise<void> {
  const { error } = await dataApi
    .table('expenses')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
