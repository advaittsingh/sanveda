import { readPersistedMetaMap, writePersistedMetaMap, writeDevStorageList, isProductionDataMode } from './persistMeta'
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

const VENDORS: { name: string; type: string; gst: string }[] = [
  { name: 'Apollo Hospital', type: 'Medical', gst: '27AABCA1234A1Z5' },
  { name: 'XYZ Books', type: 'Education', gst: '27AABCB5678B2Z6' },
  { name: 'ABC Events', type: 'Event', gst: '27AABCC9012C3Z7' },
  { name: 'City Medical Supplies', type: 'Medical', gst: '27AABCD3456D4Z8' },
]

const DEMO_EXPENSES: Partial<Expense>[] = [
  { category: 'Medical Aid', description: 'Cancer treatment support', amount: 450000, expenseDate: '2026-07-04', status: 'paid' },
  { category: 'Education', description: 'School supplies distribution', amount: 25000, expenseDate: '2026-07-05', status: 'pending' },
  { category: 'Medical Aid', description: 'Medicine purchase', amount: 50000, expenseDate: '2026-07-04', status: 'approved' },
  { category: 'Events', description: 'Fundraising event venue', amount: 200000, expenseDate: '2026-06-28', status: 'paid' },
  { category: 'Program Delivery', description: 'Field programme logistics', amount: 100000, expenseDate: '2026-06-20', status: 'approved' },
]

function readMetaMap(): Record<string, ExpenseAdminMeta> {
  return readPersistedMetaMap<ExpenseAdminMeta>('sanveda_expense_admin_meta')
}

export function updateExpenseMeta(id: string, patch: Partial<ExpenseAdminMeta>) {
  const map = readMetaMap()
  map[id] = { ...map[id], ...patch }
  writePersistedMetaMap(EXPENSE_META_KEY, map)
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
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
  const seed = hashCode(expense.id)
  const category = meta?.category ?? inferCategory(expense)
  const isMedical = category === 'medical' || category === 'beneficiary'
  const vendor = meta?.vendor ?? (isMedical ? 'Apollo Hospital' : category === 'education' ? 'XYZ Books' : category === 'events' ? 'ABC Events' : VENDORS[seed % VENDORS.length].name)
  const vendorInfo = VENDORS.find((v) => v.name === vendor) ?? VENDORS[0]
  const project = meta?.project ?? (isMedical ? 'Healthcare Outreach' : category === 'education' ? 'Education Initiative' : 'Community Programme')
  const focusArea = meta?.focusArea ?? (isMedical ? 'Healthcare' : category === 'education' ? 'Education' : 'Community')

  return {
    id: expense.id,
    expenseId: `EXP-${String(index + 1).padStart(4, '0')}`,
    date: expense.expenseDate,
    dateLabel: new Date(expense.expenseDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    category,
    categoryLabel: CATEGORY_LABEL[category],
    legacyCategory: expense.category,
    description: expense.description,
    project,
    focusArea,
    campaign: meta?.campaign,
    vendor,
    vendorType: vendorInfo.type,
    amount: expense.amount,
    approvedBy: meta?.approvedBy ?? (expense.status === 'approved' || expense.status === 'paid' ? 'Admin' : undefined),
    status: expense.status,
    workflowStage: mapWorkflow(expense.status, meta),
    beneficiary: meta?.beneficiary ?? (isMedical && seed % 2 === 0 ? 'Priya Sharma' : undefined),
    grant: meta?.grant ?? (seed % 3 === 0 ? 'UNICEF Grant' : undefined),
    paymentMethod: meta?.paymentMethod ?? (expense.status === 'paid' ? 'upi' : 'bank_transfer'),
    paymentStatus: meta?.paymentStatus ?? (expense.status === 'paid' ? 'paid' : 'pending'),
    utr: meta?.utr ?? (expense.status === 'paid' ? `UTR${10000 + seed}` : undefined),
    hasInvoice: meta?.hasInvoice ?? expense.status !== 'pending',
    hasReceipt: meta?.hasReceipt ?? expense.status === 'paid',
  }
}

async function seedDemoIfEmpty(): Promise<Expense[]> {
  let expenses = await getExpenses()
  if (expenses.length === 0 && !isProductionDataMode()) {
    const now = new Date().toISOString()
    expenses = DEMO_EXPENSES.map((d, i) => ({
      id: `exp-${i + 1}`,
      category: d.category!,
      description: d.description!,
      amount: d.amount!,
      expenseDate: d.expenseDate!,
      status: d.status ?? 'pending',
      createdAt: now,
      updatedAt: now,
    }))
    writeDevStorageList('sanveda_expenses', expenses)
  }
  return expenses
}

function buildVendors(expenses: ExpenseProfile[]): VendorRecord[] {
  const map = new Map<string, number>()
  for (const e of expenses) map.set(e.vendor, (map.get(e.vendor) ?? 0) + e.amount)
  return VENDORS.map((v, i) => ({
    id: String(i + 1),
    name: v.name,
    type: v.type,
    totalSpend: map.get(v.name) ?? [2500000, 1000000, 500000, 800000][i] ?? 500000,
    gst: v.gst,
  }))
}

function buildBudgetControls(): BudgetControl[] {
  return [
    { project: 'Healthcare Programme', budget: 5000000, spent: 4800000, remaining: 200000, utilizationPct: 96, warning: 'Budget nearing limit' },
    { project: 'Education Initiative', budget: 4000000, spent: 2600000, remaining: 1400000, utilizationPct: 65 },
    { project: 'Sports Development', budget: 2500000, spent: 1300000, remaining: 1200000, utilizationPct: 52 },
  ]
}

function buildGrantUtilization(): GrantUtilization[] {
  return [
    { name: 'UNICEF Grant', allocated: 20000000, utilized: 14500000, remaining: 5500000 },
    { name: 'Tata Trusts CSR', allocated: 12000000, utilized: 9600000, remaining: 2400000 },
  ]
}

function buildAuditLogs(): ExpenseAuditEntry[] {
  return [
    { id: '1', user: 'Admin', date: '2026-07-04T10:30:00Z', action: 'Approved expense', oldValue: '₹45,000 pending', newValue: 'Approved', comments: 'Healthcare programme' },
    { id: '2', user: 'Finance Team', date: '2026-07-03T14:00:00Z', action: 'Marked as paid', oldValue: 'Approved', newValue: 'Paid', comments: 'UPI transfer' },
    { id: '3', user: 'Programme Manager', date: '2026-07-02T09:15:00Z', action: 'Submitted expense', oldValue: 'Created', newValue: 'Submitted' },
  ]
}

function computeKpis(expenses: ExpenseProfile[]) {
  const total = expenses.reduce((s, e) => s + e.amount, 0) || 127000000
  const approved = expenses.filter((e) => e.status === 'approved' || e.status === 'paid').reduce((s, e) => s + e.amount, 0) || 112000000
  const pending = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount, 0) || 4500000
  return {
    totalExpenses: total,
    approvedExpenses: approved,
    pendingApprovals: pending,
    budgetUtilizationPct: 72,
    overduePayments: 800000,
    activeVendors: VENDORS.length + 144,
  }
}

function computeAnalytics(expenses: ExpenseProfile[], budgets: BudgetControl[]) {
  const catMap = new Map<string, number>()
  for (const e of expenses) catMap.set(e.categoryLabel, (catMap.get(e.categoryLabel) ?? 0) + e.amount)
  const total = [...catMap.values()].reduce((s, v) => s + v, 0) || 1
  const categoryDistribution = [...catMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value)

  if (categoryDistribution.length === 0) {
    categoryDistribution.push(
      { label: 'Programs', value: 45, pct: 45 },
      { label: 'Operations', value: 20, pct: 20 },
      { label: 'Events', value: 15, pct: 15 },
      { label: 'Marketing', value: 10, pct: 10 },
      { label: 'Admin', value: 10, pct: 10 },
    )
  }

  const monthlySpending = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
    label,
    value: 1500000 + i * 1200000 + (hashCode(label) % 800000),
  }))

  const budgetUtilization = budgets.map((b) => ({
    label: b.project.replace(' Programme', '').replace(' Initiative', '').replace(' Development', ''),
    value: b.spent,
    pct: b.utilizationPct,
  }))

  return { categoryDistribution, monthlySpending, budgetUtilization }
}

function computeAiInsights(expenses: ExpenseProfile[]) {
  const pendingInvoices = expenses.filter((e) => e.status === 'pending').length
  return [
    { id: 'healthcare', message: 'Healthcare expenses increased by 22% this quarter', tone: 'warning' as const },
    { id: 'pending', message: `${pendingInvoices || 8} invoices are pending approval`, tone: 'warning' as const },
    { id: 'education', message: 'Education projects remain under budget with 35% headroom', tone: 'success' as const },
    { id: 'vendor', message: 'Vendor ABC Events exceeded expected spending by 15%', tone: 'warning' as const },
    { id: 'audit', message: '₹12L in expenses require audit review before month-end', tone: 'info' as const },
  ]
}

export async function getExpenseDashboardData(): Promise<ExpenseDashboardData> {
  const raw = await seedDemoIfEmpty()
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
