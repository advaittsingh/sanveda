import { isSupabaseConfigured, requireSupabase } from './supabase'

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

const STORAGE_KEY = 'sanveda_expenses'

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

function readLocal(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Expense[]) : []
  } catch {
    return []
  }
}

function writeLocal(items: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function getExpenses(): Promise<Expense[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToExpense)
  }
  return readLocal().sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
}

export async function saveExpense(input: Partial<Expense> & { category: string; description: string; amount: number }): Promise<Expense> {
  const now = new Date().toISOString()
  const expenseDate = input.expenseDate ?? now.slice(0, 10)

  if (isSupabaseConfigured) {
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
      const { data, error } = await requireSupabase().from('expenses').update(row).eq('id', input.id).select().single()
      if (error) throw new Error(error.message)
      return rowToExpense(data)
    }

    const { data, error } = await requireSupabase().from('expenses').insert(row).select().single()
    if (error) throw new Error(error.message)
    return rowToExpense(data)
  }

  const all = readLocal()
  if (input.id) {
    const i = all.findIndex((e) => e.id === input.id)
    const updated = { ...all[i], ...input, expenseDate, updatedAt: now } as Expense
    all[i] = updated
    writeLocal(all)
    return updated
  }

  const created: Expense = {
    id: crypto.randomUUID(),
    category: input.category,
    description: input.description,
    amount: input.amount,
    expenseDate,
    status: input.status ?? 'pending',
    reference: input.reference,
    createdAt: now,
    updatedAt: now,
  }
  all.unshift(created)
  writeLocal(all)
  return created
}

export async function updateExpenseStatus(id: string, status: ExpenseStatus): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase()
      .from('expenses')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return
  }

  const all = readLocal()
  const i = all.findIndex((e) => e.id === id)
  if (i >= 0) {
    all[i] = { ...all[i], status, updatedAt: new Date().toISOString() }
    writeLocal(all)
  }
}
