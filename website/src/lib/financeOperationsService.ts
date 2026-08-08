import { downloadCsv } from './adminExport'
import { getExpenses, type Expense } from './expenseService'
import { getIncomeRecords, type IncomeRecord } from './incomeService'


export type FinanceTab =
  | 'overview'
  | 'income'
  | 'expenses'
  | 'grants'
  | 'budgets'
  | 'accounts'
  | 'receivables'
  | 'payables'
  | 'tax_receipts'
  | 'reports'
  | 'audit_logs'

export type IncomeCategory =
  | 'donations'
  | 'monthly_giving'
  | 'csr'
  | 'government_grants'
  | 'international_grants'
  | 'membership'
  | 'event_revenue'
  | 'corporate_sponsorship'
  | 'investment'
  | 'interest'
  | 'fundraising'
  | 'other'

export type IncomeStatus = 'received' | 'settled' | 'pending' | 'reconciled'
export type ApprovalStage = 'created' | 'submitted' | 'approved' | 'paid' | 'audited'

export interface IncomeProfile {
  id: string
  date: string
  dateLabel: string
  type: IncomeCategory
  typeLabel: string
  source: string
  project?: string
  focusArea?: string
  campaign?: string
  donor?: string
  amount: number
  status: IncomeStatus
  receiptId?: string
  gateway?: string
  paymentMethod?: string
  utr?: string
  settlementDate?: string
  transactionFee?: number
  fundType: 'restricted' | 'unrestricted'
  approvalStage: ApprovalStage
}

export interface GrantRecord {
  id: string
  name: string
  agency: string
  amount: number
  utilized: number
  remaining: number
  deadline?: string
  milestones: string[]
}

export interface FundBucket {
  name: string
  amount: number
  type: 'restricted' | 'unrestricted'
}

export interface BudgetRecord {
  id: string
  program: string
  focusArea: string
  budget: number
  allocated: number
  utilized: number
  remaining: number
  utilizationPct: number
}

export interface ReceivableRecord {
  id: string
  entity: string
  amount: number
  dueDate: string
  overdue: boolean
}

export interface PayableRecord {
  id: string
  vendor: string
  amount: number
  dueDate: string
  overdue: boolean
}

export interface BankAccount {
  id: string
  name: string
  opening: number
  credits: number
  debits: number
  closing: number
}

export interface ChartAccount {
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense' | 'grant' | 'restricted'
  balance: number
}

export interface AuditLogEntry {
  id: string
  user: string
  timestamp: string
  action: string
  oldValue?: string
  newValue?: string
  ip?: string
}

export interface ExpenseProfile extends Expense {
  project?: string
  focusArea?: string
  department?: string
  approvalStage: ApprovalStage
}

export interface FinanceDashboardData {
  income: IncomeProfile[]
  expenses: ExpenseProfile[]
  kpis: {
    totalIncome: number
    totalExpenses: number
    netBalance: number
    restrictedFunds: number
    unrestrictedFunds: number
    pendingReceivables: number
  }
  restrictedFunds: FundBucket[]
  unrestrictedFunds: FundBucket[]
  grants: GrantRecord[]
  budgets: BudgetRecord[]
  receivables: ReceivableRecord[]
  payables: PayableRecord[]
  bankAccounts: BankAccount[]
  chartOfAccounts: ChartAccount[]
  auditLogs: AuditLogEntry[]
  incomeSourceDistribution: { label: string; value: number; pct: number }[]
  monthlyRevenue: { label: string; value: number }[]
  budgetUtilization: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

export const FINANCE_TABS: { id: FinanceTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'income', label: 'Income' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'grants', label: 'Grants' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'receivables', label: 'Receivables' },
  { id: 'payables', label: 'Payables' },
  { id: 'tax_receipts', label: 'Tax Receipts' },
  { id: 'reports', label: 'Reports' },
  { id: 'audit_logs', label: 'Audit Logs' },
]

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: 'donations', label: 'Donations' },
  { value: 'monthly_giving', label: 'Monthly Giving' },
  { value: 'csr', label: 'CSR Funding' },
  { value: 'government_grants', label: 'Government Grants' },
  { value: 'international_grants', label: 'International Grants' },
  { value: 'membership', label: 'Membership Fees' },
  { value: 'event_revenue', label: 'Event Revenue' },
  { value: 'corporate_sponsorship', label: 'Corporate Sponsorship' },
  { value: 'investment', label: 'Investment Income' },
  { value: 'interest', label: 'Interest Income' },
  { value: 'fundraising', label: 'Fundraising Campaigns' },
  { value: 'other', label: 'Other Income' },
]

export const REPORT_TYPES = [
  'Income Statement',
  'Balance Sheet',
  'Cash Flow',
  'Fund Utilization',
  'CSR Reports',
  'FCRA Reports',
  'Grant Reports',
  'Project Financial Reports',
] as const

const CATEGORY_LABEL = Object.fromEntries(INCOME_CATEGORIES.map((c) => [c.value, c.label])) as Record<IncomeCategory, string>

function mapIncomeSource(source: string): IncomeCategory {
  const s = source.toLowerCase()
  if (s === 'donation') return 'donations'
  if (s === 'membership') return 'membership'
  if (s === 'grant') return 'government_grants'
  if (s === 'csr') return 'csr'
  return 'other'
}

function enrichIncome(record: IncomeRecord, index: number): IncomeProfile {
  void index
  const type = mapIncomeSource(record.source)

  return {
    id: record.id,
    date: record.incomeDate,
    dateLabel: new Date(record.incomeDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    type,
    typeLabel: CATEGORY_LABEL[type],
    source: record.description,
    amount: record.amount,
    status: 'received',
    fundType: type === 'csr' || type === 'government_grants' ? 'restricted' : 'unrestricted',
    approvalStage: 'paid',
  }
}

function enrichExpense(expense: Expense): ExpenseProfile {
  return {
    ...expense,
    approvalStage: expense.status === 'paid' ? 'paid' : expense.status === 'approved' ? 'approved' : 'submitted',
  }
}

function buildGrants(): GrantRecord[] {
  return []
}

function buildBudgets(): BudgetRecord[] {
  return []
}

function buildReceivables(): ReceivableRecord[] {
  return []
}

function buildPayables(): PayableRecord[] {
  return []
}

function buildBankAccounts(): BankAccount[] {
  return []
}

function buildChartOfAccounts(): ChartAccount[] {
  return []
}

function buildAuditLogs(): AuditLogEntry[] {
  return []
}

function computeKpis(income: IncomeProfile[], expenses: ExpenseProfile[]) {
  const totalIncome = income.reduce((s, r) => s + r.amount, 0)
  const totalExpenses = expenses.filter((e) => e.status === 'approved' || e.status === 'paid').reduce((s, e) => s + e.amount, 0)
  const restricted = income.filter((i) => i.fundType === 'restricted').reduce((s, r) => s + r.amount, 0)
  const unrestricted = income.filter((i) => i.fundType === 'unrestricted').reduce((s, r) => s + r.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    restrictedFunds: restricted,
    unrestrictedFunds: unrestricted,
    pendingReceivables: 0,
  }
}

function computeAnalytics(income: IncomeProfile[], budgets: BudgetRecord[]) {
  const typeMap = new Map<string, number>()
  for (const i of income) typeMap.set(i.typeLabel, (typeMap.get(i.typeLabel) ?? 0) + i.amount)
  const typeTotal = [...typeMap.values()].reduce((s, v) => s + v, 0) || 1
  const incomeSourceDistribution = [...typeMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / typeTotal) * 100) }))
    .sort((a, b) => b.value - a.value)

  const monthlyMap = new Map<string, number>()
  for (const record of income) {
    const label = record.date.slice(0, 7)
    monthlyMap.set(label, (monthlyMap.get(label) ?? 0) + record.amount)
  }
  const monthlyRevenue = [...monthlyMap].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value }))

  const budgetUtilization = budgets.map((b) => ({ label: b.focusArea, value: b.utilized, pct: b.utilizationPct }))

  return { incomeSourceDistribution, monthlyRevenue, budgetUtilization }
}

function computeAiInsights(budgets: BudgetRecord[]) {
  return budgets.length
    ? []
    : [{ id: 'empty', message: 'No finance records yet. Income and expenses will appear here once recorded.', tone: 'info' as const }]
}

export async function getFinanceDashboardData(): Promise<FinanceDashboardData> {
  const [rawIncome, rawExpenses] = await Promise.all([getIncomeRecords(), getExpenses()])
  const income = rawIncome.map(enrichIncome)
  const expenses = rawExpenses.map(enrichExpense)
  const restrictedFunds: FundBucket[] = []
  const unrestrictedFunds: FundBucket[] = []
  const grants = buildGrants()
  const budgets = buildBudgets()
  const receivables = buildReceivables()
  const payables = buildPayables()
  const bankAccounts = buildBankAccounts()
  const kpis = computeKpis(income, expenses)
  const chartOfAccounts = buildChartOfAccounts()
  const auditLogs = buildAuditLogs()
  const analytics = computeAnalytics(income, budgets)
  const aiInsights = computeAiInsights(budgets)

  return {
    income,
    expenses,
    kpis,
    restrictedFunds,
    unrestrictedFunds,
    grants,
    budgets,
    receivables,
    payables,
    bankAccounts,
    chartOfAccounts,
    auditLogs,
    aiInsights,
    ...analytics,
  }
}

export function exportIncomeCsv(income: IncomeProfile[]) {
  downloadCsv('income-export.csv',
    ['Date', 'Type', 'Source', 'Project', 'Donor', 'Amount', 'Status'],
    income.map((i) => [i.dateLabel, i.typeLabel, i.source, i.project ?? '', i.donor ?? '', i.amount, i.status]),
  )
}

export function exportExpensesCsv(expenses: ExpenseProfile[]) {
  downloadCsv('expenses-export.csv',
    ['Date', 'Category', 'Project', 'Description', 'Amount', 'Status'],
    expenses.map((e) => [e.expenseDate, e.category, e.project ?? '', e.description, e.amount, e.status]),
  )
}
