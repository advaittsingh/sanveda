import { writeDevStorageList } from './persistMeta'
import { downloadCsv } from './adminExport'
import { formatIndianCompact } from './formatIndian'
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

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function mapIncomeSource(source: string): IncomeCategory {
  const s = source.toLowerCase()
  if (s === 'donation') return 'donations'
  if (s === 'membership') return 'membership'
  if (s === 'grant') return 'government_grants'
  if (s === 'csr') return 'csr'
  return 'other'
}

function enrichIncome(record: IncomeRecord, index: number): IncomeProfile {
  const seed = hashCode(record.id)
  const type = mapIncomeSource(record.source)
  const isCsr = type === 'csr'
  const isDonation = type === 'donations' || record.source === 'donation'

  return {
    id: record.id,
    date: record.incomeDate,
    dateLabel: new Date(record.incomeDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    type,
    typeLabel: CATEGORY_LABEL[type],
    source: isCsr ? 'ABC Ltd' : isDonation ? 'Website' : record.description.split(' ')[0] || 'Sanveda',
    project: isCsr ? 'Healthcare Outreach' : isDonation ? 'Education' : 'General Programme',
    focusArea: isCsr ? 'Healthcare' : isDonation ? 'Education' : 'Community',
    campaign: isDonation ? 'Save Lives Campaign' : undefined,
    donor: isCsr ? 'ABC Ltd' : isDonation ? 'Rahul Sharma' : undefined,
    amount: record.amount,
    status: seed % 3 === 0 ? 'settled' : 'received',
    receiptId: isDonation ? `RCP-${1000 + index}` : undefined,
    gateway: isDonation ? 'Razorpay' : undefined,
    paymentMethod: isDonation ? 'UPI' : undefined,
    utr: isDonation ? `TXN${1000 + seed}` : undefined,
    settlementDate: isDonation ? record.incomeDate : undefined,
    transactionFee: isDonation ? Math.round(record.amount * 0.02) : undefined,
    fundType: isCsr || type === 'government_grants' ? 'restricted' : 'unrestricted',
    approvalStage: 'paid',
  }
}

function enrichExpense(expense: Expense): ExpenseProfile {
  const seed = hashCode(expense.id)
  const focusAreas = ['Healthcare', 'Education', 'Sports', 'Community']
  return {
    ...expense,
    project: expense.category === 'Medical Aid' ? 'Healthcare Outreach' : `${expense.category} Programme`,
    focusArea: focusAreas[seed % focusAreas.length],
    department: expense.category,
    approvalStage: expense.status === 'paid' ? 'paid' : expense.status === 'approved' ? 'approved' : 'submitted',
  }
}

const DEMO_INCOME: Partial<IncomeRecord>[] = [
  { source: 'csr', description: 'ABC Ltd CSR Healthcare', amount: 1000000, incomeDate: '2026-07-04' },
  { source: 'donation', description: 'Website donation', amount: 5000, incomeDate: '2026-07-05' },
  { source: 'grant', description: 'UNICEF Grant', amount: 20000000, incomeDate: '2026-06-01' },
  { source: 'membership', description: 'Annual membership fees', amount: 250000, incomeDate: '2026-05-15' },
  { source: 'donation', description: 'Monthly giving', amount: 12000, incomeDate: '2026-07-01' },
]

async function seedDemoData(): Promise<{ income: IncomeRecord[]; expenses: Expense[] }> {
  let income = await getIncomeRecords()
  let expenses = await getExpenses()

  if (income.length === 0) {
    const now = new Date().toISOString()
    income = DEMO_INCOME.map((d, i) => ({
      id: `inc-${i + 1}`,
      source: d.source as IncomeRecord['source'],
      description: d.description!,
      amount: d.amount!,
      incomeDate: d.incomeDate!,
      createdAt: now,
      updatedAt: now,
    }))
    writeDevStorageList('sanveda_income', income)
  }

  return { income, expenses }
}

function buildGrants(): GrantRecord[] {
  return [
    { id: '1', name: 'Healthcare Grant', agency: 'UNICEF', amount: 20000000, utilized: 14000000, remaining: 6000000, deadline: '2026-12-31', milestones: ['Q1 Report', 'Mid-year audit', 'Final utilization'] },
    { id: '2', name: 'Education CSR', agency: 'Tata Trusts', amount: 12000000, utilized: 9600000, remaining: 2400000, deadline: '2026-09-30', milestones: ['Scholarship disbursement', 'Impact report'] },
    { id: '3', name: 'Disaster Relief', agency: 'Red Cross', amount: 7500000, utilized: 5200000, remaining: 2300000, deadline: '2026-08-15', milestones: ['Relief distribution', 'Beneficiary report'] },
  ]
}

function buildBudgets(): BudgetRecord[] {
  return [
    { id: '1', program: 'Healthcare Programme', focusArea: 'Healthcare', budget: 5000000, allocated: 5000000, utilized: 3500000, remaining: 1500000, utilizationPct: 70 },
    { id: '2', program: 'Education Initiative', focusArea: 'Education', budget: 4000000, allocated: 4000000, utilized: 3280000, remaining: 720000, utilizationPct: 82 },
    { id: '3', program: 'Sports Development', focusArea: 'Sports', budget: 2500000, allocated: 2500000, utilized: 1525000, remaining: 975000, utilizationPct: 61 },
  ]
}

function buildReceivables(): ReceivableRecord[] {
  return [
    { id: '1', entity: 'CSR Partner — ABC Ltd', amount: 1000000, dueDate: '2026-07-15', overdue: false },
    { id: '2', entity: 'Government Grant Disbursement', amount: 5000000, dueDate: '2026-08-01', overdue: false },
    { id: '3', entity: 'Corporate Sponsor', amount: 800000, dueDate: '2026-06-20', overdue: true },
  ]
}

function buildPayables(): PayableRecord[] {
  return [
    { id: '1', vendor: 'City Hospital', amount: 300000, dueDate: '2026-07-10', overdue: false },
    { id: '2', vendor: 'Event Vendor', amount: 100000, dueDate: '2026-07-07', overdue: false },
    { id: '3', vendor: 'Medical Supplies Co.', amount: 450000, dueDate: '2026-06-25', overdue: true },
  ]
}

function buildBankAccounts(): BankAccount[] {
  return [
    { id: '1', name: 'Main Account', opening: 15000000, credits: 8500000, debits: 6200000, closing: 17300000 },
    { id: '2', name: 'CSR Account', opening: 5000000, credits: 3200000, debits: 2100000, closing: 6100000 },
    { id: '3', name: 'FCRA Account', opening: 8000000, credits: 1200000, debits: 800000, closing: 8400000 },
    { id: '4', name: 'Operations Account', opening: 2000000, credits: 900000, debits: 1100000, closing: 1800000 },
    { id: '5', name: 'Emergency Relief Account', opening: 3000000, credits: 500000, debits: 200000, closing: 3300000 },
  ]
}

function buildChartOfAccounts(totalIncome: number, totalExpenses: number): ChartAccount[] {
  return [
    { code: '1000', name: 'Assets', type: 'asset', balance: totalIncome * 0.6 },
    { code: '2000', name: 'Liabilities', type: 'liability', balance: totalExpenses * 0.15 },
    { code: '3000', name: 'Equity', type: 'equity', balance: totalIncome - totalExpenses },
    { code: '4000', name: 'Income', type: 'income', balance: totalIncome },
    { code: '5000', name: 'Expenses', type: 'expense', balance: totalExpenses },
    { code: '4100', name: 'Grants', type: 'grant', balance: 47500000 },
    { code: '4200', name: 'Restricted Funds', type: 'restricted', balance: 83000000 },
  ]
}

function buildAuditLogs(): AuditLogEntry[] {
  return [
    { id: '1', user: 'Admin', timestamp: '2026-07-04T10:30:00Z', action: 'Edited Healthcare Budget', oldValue: '₹40L', newValue: '₹50L', ip: '192.168.1.1' },
    { id: '2', user: 'Finance Team', timestamp: '2026-07-03T14:00:00Z', action: 'Approved CSR Income', oldValue: 'Pending', newValue: 'Received', ip: '192.168.1.5' },
    { id: '3', user: 'Admin', timestamp: '2026-07-02T09:15:00Z', action: 'Reconciled Razorpay Settlement', oldValue: '—', newValue: '₹1.2L', ip: '192.168.1.1' },
  ]
}

function computeKpis(income: IncomeProfile[], expenses: ExpenseProfile[]) {
  const totalIncome = income.reduce((s, r) => s + r.amount, 0) || 184000000
  const totalExpenses = expenses.filter((e) => e.status === 'approved' || e.status === 'paid').reduce((s, e) => s + e.amount, 0) || 127000000
  const restricted = income.filter((i) => i.fundType === 'restricted').reduce((s, r) => s + r.amount, 0) || 83000000
  const unrestricted = income.filter((i) => i.fundType === 'unrestricted').reduce((s, r) => s + r.amount, 0) || 31000000

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    restrictedFunds: restricted,
    unrestrictedFunds: unrestricted,
    pendingReceivables: buildReceivables().filter((r) => !r.overdue).reduce((s, r) => s + r.amount, 0) || 4200000,
  }
}

function computeAnalytics(income: IncomeProfile[], budgets: BudgetRecord[]) {
  const typeMap = new Map<string, number>()
  for (const i of income) typeMap.set(i.typeLabel, (typeMap.get(i.typeLabel) ?? 0) + i.amount)
  const typeTotal = [...typeMap.values()].reduce((s, v) => s + v, 0) || 1
  const incomeSourceDistribution = [...typeMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / typeTotal) * 100) }))
    .sort((a, b) => b.value - a.value)

  const monthlyRevenue = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
    label,
    value: 2000000 + i * 1500000 + (hashCode(label) % 1000000),
  }))

  const budgetUtilization = budgets.map((b) => ({ label: b.focusArea, value: b.utilized, pct: b.utilizationPct }))

  return { incomeSourceDistribution, monthlyRevenue, budgetUtilization }
}

function computeAiInsights(budgets: BudgetRecord[]) {
  const healthcare = budgets.find((b) => b.focusArea === 'Healthcare')
  const overdueRecv = 1800000

  return [
    { id: 'healthcare', message: `Healthcare budget utilization reached ${healthcare?.utilizationPct ?? 87}%`, tone: 'warning' as const },
    { id: 'csr', message: 'CSR income increased by 42% compared to last quarter', tone: 'success' as const },
    { id: 'receivables', message: `₹${formatIndianCompact(overdueRecv)} receivables are overdue`, tone: 'warning' as const },
    { id: 'education', message: 'Education projects have the highest ROI at 82% budget efficiency', tone: 'info' as const },
    { id: 'grants', message: '3 grants require reporting submissions this month', tone: 'warning' as const },
  ]
}

export async function getFinanceDashboardData(): Promise<FinanceDashboardData> {
  const { income: rawIncome, expenses: rawExpenses } = await seedDemoData()
  const income = rawIncome.map(enrichIncome)
  const expenses = rawExpenses.map(enrichExpense)

  const restrictedFunds: FundBucket[] = [
    { name: 'Healthcare Grant', amount: 5000000, type: 'restricted' },
    { name: 'Education CSR', amount: 12000000, type: 'restricted' },
    { name: 'Disaster Relief', amount: 7500000, type: 'restricted' },
  ]
  const unrestrictedFunds: FundBucket[] = [
    { name: 'General Donations', amount: 18000000, type: 'unrestricted' },
    { name: 'Operations', amount: 8000000, type: 'unrestricted' },
    { name: 'Admin Budget', amount: 5000000, type: 'unrestricted' },
  ]

  const grants = buildGrants()
  const budgets = buildBudgets()
  const receivables = buildReceivables()
  const payables = buildPayables()
  const bankAccounts = buildBankAccounts()
  const kpis = computeKpis(income, expenses)
  const chartOfAccounts = buildChartOfAccounts(kpis.totalIncome, kpis.totalExpenses)
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
