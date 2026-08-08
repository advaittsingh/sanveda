import { readPersistedMetaMap, writePersistedMetaMap } from './persistMeta'
import { withAudit } from './auditMiddleware'
import { downloadCsv } from './adminExport'
import { getExpenses, saveExpense, updateExpenseStatus, type Expense, type ExpenseStatus } from './expenseService'

const EXPENSE_META_KEY = 'sanveda_expense_admin_meta'

export type ExpenseCategory =
  | 'program'
  | 'beneficiary'
  | 'medical'
  | 'education'
  | 'volunteer'
  | 'internship'
  | 'travel'
  | 'events'
  | 'marketing'
  | 'operations'
  | 'office'
  | 'legal'
  | 'audit'
  | 'technology'
  | 'csr'
  | 'emergency'

export type ExpenseWorkflowStage =
  | 'created'
  | 'submitted'
  | 'manager_approval'
  | 'finance_approval'
  | 'paid'
  | 'audited'

export type PaymentMethod = 'upi' | 'bank_transfer' | 'cheque' | 'cash'
export type PaymentStatus = 'paid' | 'pending' | 'cleared' | 'failed'

export interface ExpenseAdminMeta {
  category?: ExpenseCategory
  workflowStage?: ExpenseWorkflowStage
  project?: string
  focusArea?: string
  campaign?: string
  vendor?: string
  approvedBy?: string
  beneficiary?: string
  grant?: string
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  utr?: string
  hasInvoice?: boolean
  hasReceipt?: boolean
}

export interface ExpenseProfile {
  id: string
  expenseId: string
  date: string
  dateLabel: string
  category: ExpenseCategory
  categoryLabel: string
  legacyCategory: string
  description: string
  project: string
  focusArea: string
  campaign?: string
  vendor: string
  vendorType: string
  amount: number
  approvedBy?: string
  status: ExpenseStatus
  workflowStage: ExpenseWorkflowStage
  beneficiary?: string
  grant?: string
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  utr?: string
  hasInvoice: boolean
  hasReceipt: boolean
  budgetWarning?: string
}

export interface VendorRecord {
  id: string
  name: string
  type: string
  totalSpend: number
  gst?: string
}

export interface BudgetControl {
  project: string
  budget: number
  spent: number
  remaining: number
  utilizationPct: number
  warning?: string
}

export interface GrantUtilization {
  name: string
  allocated: number
  utilized: number
  remaining: number
}

export interface ExpenseAuditEntry {
  id: string
  user: string
  date: string
  action: string
  oldValue?: string
  newValue?: string
  comments?: string
}

export interface ExpenseFilters {
  search: string
  category: ExpenseCategory | 'all'
  status: ExpenseStatus | 'all'
  project: string | 'all'
  vendor: string | 'all'
}

export interface ExpenseDashboardData {
  expenses: ExpenseProfile[]
  kpis: {
    totalExpenses: number
    approvedExpenses: number
    pendingApprovals: number
    budgetUtilizationPct: number
    overduePayments: number
    activeVendors: number
  }
  vendors: VendorRecord[]
  budgetControls: BudgetControl[]
  grantUtilization: GrantUtilization[]
  auditLogs: ExpenseAuditEntry[]
  categoryDistribution: { label: string; value: number; pct: number }[]
  monthlySpending: { label: string; value: number }[]
  budgetUtilization: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'program', label: 'Program Expenses' },
  { value: 'beneficiary', label: 'Beneficiary Support' },
  { value: 'medical', label: 'Medical Expenses' },
  { value: 'education', label: 'Educational Support' },
  { value: 'volunteer', label: 'Volunteer Expenses' },
  { value: 'internship', label: 'Internship Stipends' },
  { value: 'travel', label: 'Travel' },
  { value: 'events', label: 'Events' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'office', label: 'Office Administration' },
  { value: 'legal', label: 'Legal' },
  { value: 'audit', label: 'Audit' },
  { value: 'technology', label: 'Technology' },
  { value: 'csr', label: 'CSR Activities' },
  { value: 'emergency', label: 'Emergency Relief' },
]

export const WORKFLOW_STAGES: { stage: ExpenseWorkflowStage; label: string }[] = [
  { stage: 'created', label: 'Created' },
  { stage: 'submitted', label: 'Submitted' },
  { stage: 'manager_approval', label: 'Manager Approval' },
  { stage: 'finance_approval', label: 'Finance Approval' },
  { stage: 'paid', label: 'Paid' },
  { stage: 'audited', label: 'Audited' },
]

export const EXPENSE_REPORT_TYPES = [
  'Fund Utilization Report',
  'Grant Utilization Report',
  'CSR Spend Report',
  'Project Expense Report',
  'Beneficiary Expense Report',
  'Audit Report',
  'Annual Financial Statement',
] as const

const CATEGORY_LABEL = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.value, c.label])) as Record<ExpenseCategory, string>

function readMetaMap(): Record<string, ExpenseAdminMeta> {
  return readPersistedMetaMap<ExpenseAdminMeta>('sanveda_expense_admin_meta')
}

export function updateExpenseMeta(id: string, patch: Partial<ExpenseAdminMeta>) {
  const map = readMetaMap()
  map[id] = { ...map[id], ...patch }
  writePersistedMetaMap(EXPENSE_META_KEY, map)
}

function inferCategory(expense: Expense): ExpenseCategory {
  const c = expense.category.toLowerCase()
  const d = expense.description.toLowerCase()
  if (c.includes('medical') || d.includes('medicine') || d.includes('hospital')) return 'medical'
  if (c.includes('education') || d.includes('school')) return 'education'
  if (c.includes('event')) return 'events'
  if (c.includes('marketing')) return 'marketing'
  if (c.includes('program')) return 'program'
  if (d.includes('beneficiar')) return 'beneficiary'
  if (d.includes('volunteer')) return 'volunteer'
  if (d.includes('travel')) return 'travel'
  return 'operations'
}

function mapWorkflow(status: ExpenseStatus, meta?: ExpenseAdminMeta): ExpenseWorkflowStage {
  if (meta?.workflowStage) return meta.workflowStage
  if (status === 'paid') return 'paid'
  if (status === 'approved') return 'finance_approval'
  if (status === 'pending') return 'submitted'
  if (status === 'rejected') return 'created'
  return 'submitted'
}

function buildProfile(expense: Expense, meta: ExpenseAdminMeta | undefined, index: number): ExpenseProfile {
  const category = meta?.category ?? inferCategory(expense)
  const vendor = meta?.vendor ?? ''

  return {
    id: expense.id,
    expenseId: `EXP-${String(index + 1).padStart(4, '0')}`,
    date: expense.expenseDate,
    dateLabel: new Date(expense.expenseDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    category,
    categoryLabel: CATEGORY_LABEL[category],
    legacyCategory: expense.category,
    description: expense.description,
    project: meta?.project ?? '',
    focusArea: meta?.focusArea ?? '',
    campaign: meta?.campaign,
    vendor,
    vendorType: '',
    amount: expense.amount,
    approvedBy: meta?.approvedBy,
    status: expense.status,
    workflowStage: mapWorkflow(expense.status, meta),
    beneficiary: meta?.beneficiary,
    grant: meta?.grant,
    paymentMethod: meta?.paymentMethod,
    paymentStatus: meta?.paymentStatus,
    utr: meta?.utr,
    hasInvoice: meta?.hasInvoice ?? false,
    hasReceipt: meta?.hasReceipt ?? false,
  }
}

function buildVendors(expenses: ExpenseProfile[]): VendorRecord[] {
  const map = new Map<string, number>()
  for (const e of expenses) {
    if (e.vendor) map.set(e.vendor, (map.get(e.vendor) ?? 0) + e.amount)
  }
  return [...map.entries()].map(([name, totalSpend], i) => ({
    id: String(i + 1),
    name,
    type: 'vendor',
    totalSpend,
  }))
}

function buildBudgetControls(): BudgetControl[] {
  return []
}

function buildGrantUtilization(): GrantUtilization[] {
  return []
}

function buildAuditLogs(): ExpenseAuditEntry[] {
  return []
}

function computeKpis(expenses: ExpenseProfile[]) {
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const approved = expenses.filter((e) => e.status === 'approved' || e.status === 'paid').reduce((s, e) => s + e.amount, 0)
  const pending = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount, 0)
  return {
    totalExpenses: total,
    approvedExpenses: approved,
    pendingApprovals: pending,
    budgetUtilizationPct: 0,
    overduePayments: 0,
    activeVendors: new Set(expenses.map((e) => e.vendor).filter(Boolean)).size,
  }
}

function computeAnalytics(expenses: ExpenseProfile[], budgets: BudgetControl[]) {
  const catMap = new Map<string, number>()
  for (const e of expenses) catMap.set(e.categoryLabel, (catMap.get(e.categoryLabel) ?? 0) + e.amount)
  const total = [...catMap.values()].reduce((s, v) => s + v, 0) || 1
  const categoryDistribution = [...catMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value)

  const monthlyMap = new Map<string, number>()
  for (const expense of expenses) {
    const label = expense.date.slice(0, 7)
    monthlyMap.set(label, (monthlyMap.get(label) ?? 0) + expense.amount)
  }
  const monthlySpending = [...monthlyMap].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value }))

  const budgetUtilization = budgets.map((b) => ({
    label: b.project.replace(' Programme', '').replace(' Initiative', '').replace(' Development', ''),
    value: b.spent,
    pct: b.utilizationPct,
  }))

  return { categoryDistribution, monthlySpending, budgetUtilization }
}

function computeAiInsights(expenses: ExpenseProfile[]) {
  return expenses.length
    ? []
    : [{ id: 'empty', message: 'No expenses recorded yet. Track programme expenses with approval workflows.', tone: 'info' as const }]
}

export async function getExpenseDashboardData(): Promise<ExpenseDashboardData> {
  const raw = await getExpenses()
  const metaMap = readMetaMap()
  const expenses = raw.map((e, i) => buildProfile(e, metaMap[e.id], i))
  const vendors = buildVendors(expenses)
  const budgetControls = buildBudgetControls()
  const grantUtilization = buildGrantUtilization()
  const auditLogs = buildAuditLogs()
  const kpis = computeKpis(expenses)
  const analytics = computeAnalytics(expenses, budgetControls)
  const aiInsights = computeAiInsights(expenses)

  return {
    expenses,
    kpis,
    vendors,
    budgetControls,
    grantUtilization,
    auditLogs,
    aiInsights,
    ...analytics,
  }
}

export function filterExpenses(expenses: ExpenseProfile[], filters: ExpenseFilters): ExpenseProfile[] {
  return expenses.filter((e) => {
    if (filters.category !== 'all' && e.category !== filters.category) return false
    if (filters.status !== 'all' && e.status !== filters.status) return false
    if (filters.project !== 'all' && e.project !== filters.project) return false
    if (filters.vendor !== 'all' && e.vendor !== filters.vendor) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        e.description.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.project.toLowerCase().includes(q) ||
        e.expenseId.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export function exportExpensesCsv(expenses: ExpenseProfile[]) {
  downloadCsv(
    'expenses-export.csv',
    ['Date', 'Project', 'Category', 'Vendor', 'Amount', 'Approved By', 'Status'],
    expenses.map((e) => [e.dateLabel, e.project, e.categoryLabel, e.vendor, e.amount, e.approvedBy ?? '—', e.status]),
  )
}

export async function approveExpense(id: string) {
  return withAudit('APPROVE', 'expenses', id, async () => {
    await updateExpenseStatus(id, 'approved')
    updateExpenseMeta(id, { workflowStage: 'finance_approval', approvedBy: 'Admin' })
  })
}

export async function rejectExpense(id: string) {
  return withAudit('REJECT', 'expenses', id, async () => {
    await updateExpenseStatus(id, 'rejected')
    updateExpenseMeta(id, { workflowStage: 'created' })
  })
}

export async function markExpensePaid(id: string) {
  return withAudit('UPDATE', 'expenses', id, async () => {
    await updateExpenseStatus(id, 'paid')
    updateExpenseMeta(id, { workflowStage: 'paid', paymentStatus: 'paid' })
  })
}

export { saveExpense }
