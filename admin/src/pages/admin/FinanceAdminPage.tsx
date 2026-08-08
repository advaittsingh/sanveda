import { useCallback, useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import FinanceAccountsPanel from '../../components/admin/finance/FinanceAccountsPanel'
import FinanceAiInsights from '../../components/admin/finance/FinanceAiInsights'
import FinanceAnalytics from '../../components/admin/finance/FinanceAnalytics'
import FinanceAuditLog from '../../components/admin/finance/FinanceAuditLog'
import FinanceBankAccounts from '../../components/admin/finance/FinanceBankAccounts'
import FinanceBudgetsPanel from '../../components/admin/finance/FinanceBudgetsPanel'
import FinanceFundAccounting from '../../components/admin/finance/FinanceFundAccounting'
import FinanceGrantsPanel from '../../components/admin/finance/FinanceGrantsPanel'
import FinanceKpiCards from '../../components/admin/finance/FinanceKpiCards'
import FinanceNav from '../../components/admin/finance/FinanceNav'
import FinanceReceivablesPayables from '../../components/admin/finance/FinanceReceivablesPayables'
import FinanceReportsPanel from '../../components/admin/finance/FinanceReportsPanel'
import FinanceTaxReceiptsPanel from '../../components/admin/finance/FinanceTaxReceiptsPanel'
import AdminCard from '../../components/admin/ui/AdminCard'
import ChartCard from '../../components/admin/ui/ChartCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getIncomeVsExpenses } from '../../lib/adminAnalytics'
import {
  exportExpensesCsv,
  exportIncomeCsv,
  getFinanceDashboardData,
  INCOME_CATEGORIES,
  type FinanceDashboardData,
  type FinanceTab,
  type IncomeCategory,
} from '../../lib/financeOperationsService'
import { EXPENSE_CATEGORIES, saveExpense, updateExpenseStatus } from '../../lib/expenseService'
import { saveIncomeRecord, type IncomeSource } from '../../lib/incomeService'

interface Props {
  defaultTab?: FinanceTab
}

const TAB_TITLES: Record<FinanceTab, { title: string; subtitle: string }> = {
  overview: { title: 'Finance Overview', subtitle: 'Fund accounting, KPIs, and NGO financial intelligence' },
  income: { title: 'Income', subtitle: 'Donations, grants, CSR, and revenue with project mapping' },
  expenses: { title: 'Expenses', subtitle: 'Programme expenses with approval workflow' },
  grants: { title: 'Grants', subtitle: 'Grant agreements, utilization, and reporting deadlines' },
  budgets: { title: 'Budgets', subtitle: 'Project and focus area budget tracking' },
  accounts: { title: 'Accounts', subtitle: 'Chart of accounts and fund structure' },
  receivables: { title: 'Receivables', subtitle: 'Outstanding income and CSR commitments' },
  payables: { title: 'Payables', subtitle: 'Vendor payments and obligations' },
  tax_receipts: { title: 'Tax Receipts', subtitle: '80G certificates and donor tax compliance' },
  reports: { title: 'Financial Reports', subtitle: 'Income statement, balance sheet, CSR and FCRA reports' },
  audit_logs: { title: 'Audit Logs', subtitle: 'Complete financial audit trail' },
}

function categoryToSource(cat: IncomeCategory): IncomeSource {
  if (cat === 'donations' || cat === 'monthly_giving' || cat === 'fundraising') return 'donation'
  if (cat === 'membership') return 'membership'
  if (cat === 'csr' || cat === 'corporate_sponsorship') return 'csr'
  if (cat === 'government_grants' || cat === 'international_grants') return 'grant'
  return 'other'
}

export default function FinanceAdminPage({ defaultTab = 'overview' }: Props) {
  const { authed } = useAdminAuth()
  const [tab, setTab] = useState<FinanceTab>(defaultTab)
  const [dashboard, setDashboard] = useState<FinanceDashboardData | null>(null)
  const [chartData, setChartData] = useState<Awaited<ReturnType<typeof getIncomeVsExpenses>>>([])
  const [loading, setLoading] = useState(true)
  const [expenseForm, setExpenseForm] = useState<{ category: string; description: string; amount: number }>({ category: EXPENSE_CATEGORIES[0], description: '', amount: 0 })
  const [incomeForm, setIncomeForm] = useState({ category: 'donations' as IncomeCategory, description: '', amount: 0 })

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [data, charts] = await Promise.all([getFinanceDashboardData(), getIncomeVsExpenses()])
      setDashboard(data)
      setChartData(charts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  useEffect(() => {
    setTab(defaultTab)
  }, [defaultTab])

  if (!authed) {
    return <AdminLogin title="Finance ERP" subtitle="Fund accounting, grants, budgets, and NGO compliance." />
  }

  const meta = TAB_TITLES[tab]

  return (
    <AdminShell title={meta.title} subtitle={meta.subtitle}>
      <FinanceNav active={tab} onChange={setTab} />

      {dashboard ? (
        <div className="space-y-6">
          <FinanceKpiCards kpis={dashboard.kpis} />

          {tab === 'overview' && (
            <>
              <FinanceFundAccounting restricted={dashboard.restrictedFunds} unrestricted={dashboard.unrestrictedFunds} />
              <ChartCard title="Income vs Expenses" subtitle="Monthly trends">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                    <Legend />
                    <Bar dataKey="value" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="value2" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <FinanceAnalytics
                incomeSourceDistribution={dashboard.incomeSourceDistribution}
                monthlyRevenue={dashboard.monthlyRevenue}
                budgetUtilization={dashboard.budgetUtilization}
              />
              <FinanceBankAccounts accounts={dashboard.bankAccounts} />
              <FinanceAiInsights insights={dashboard.aiInsights} />
            </>
          )}

          {tab === 'income' && (
            <>
              <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                <AdminCard>
                  <h3 className="mb-4 font-semibold text-[#0B2C6B]">Record Income</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      await saveIncomeRecord({ source: categoryToSource(incomeForm.category), description: incomeForm.description, amount: incomeForm.amount })
                      setIncomeForm({ category: 'donations', description: '', amount: 0 })
                      await refresh()
                    }}
                    className="space-y-3"
                  >
                    <label className="block">
                      <span className={adminLabelClass}>Category</span>
                      <select className={adminInputClass} value={incomeForm.category} onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value as IncomeCategory })}>
                        {INCOME_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </label>
                    <label className="block"><span className={adminLabelClass}>Description</span><input className={adminInputClass} value={incomeForm.description} onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })} required /></label>
                    <label className="block"><span className={adminLabelClass}>Amount (₹)</span><input type="number" className={adminInputClass} value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })} required /></label>
                    <button type="submit" className={adminBtnPrimary}>Add Income</button>
                  </form>
                </AdminCard>
                <AdminCard>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-[#0B2C6B]">Income Records</h3>
                    <button type="button" className={adminBtnSecondary} onClick={() => exportIncomeCsv(dashboard.income)}>Export</button>
                  </div>
                  <DataTable
                    data={dashboard.income}
                    keyFn={(i) => i.id}
                    loading={loading}
                    columns={[
                      { key: 'date', header: 'Date', render: (i) => i.dateLabel },
                      { key: 'type', header: 'Type', render: (i) => i.typeLabel },
                      { key: 'source', header: 'Source', render: (i) => i.source },
                      { key: 'project', header: 'Project', render: (i) => i.project ?? '—' },
                      { key: 'donor', header: 'Donor', render: (i) => i.donor ?? '—' },
                      { key: 'amount', header: 'Amount', render: (i) => `₹${i.amount.toLocaleString('en-IN')}` },
                      { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
                      { key: 'receipt', header: 'Receipt', render: (i) => i.receiptId ? <button type="button" className={adminBtnSecondary}>View</button> : '—' },
                    ]}
                  />
                </AdminCard>
              </div>
              <AdminCard>
                <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Donation Reconciliation</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs font-semibold uppercase text-slate-500">
                      <tr><th className="pb-2">Gateway</th><th className="pb-2">Method</th><th className="pb-2">UTR</th><th className="pb-2">Status</th><th className="pb-2">Fee</th></tr>
                    </thead>
                    <tbody>
                      {dashboard.income.filter((i) => i.gateway).map((i) => (
                        <tr key={i.id} className="border-t border-[#E5E7EB]">
                          <td className="py-2">{i.gateway}</td>
                          <td className="py-2">{i.paymentMethod}</td>
                          <td className="py-2 font-mono text-xs">{i.utr}</td>
                          <td className="py-2"><StatusBadge status={i.status} /></td>
                          <td className="py-2">₹{i.transactionFee?.toLocaleString('en-IN') ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminCard>
            </>
          )}

          {tab === 'expenses' && (
            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
              <AdminCard>
                <h3 className="mb-4 font-semibold text-[#0B2C6B]">Add Expense</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    await saveExpense(expenseForm)
                    setExpenseForm({ category: EXPENSE_CATEGORIES[0], description: '', amount: 0 })
                    await refresh()
                  }}
                  className="space-y-3"
                >
                  <label className="block"><span className={adminLabelClass}>Category</span>
                    <select className={adminInputClass} value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                      {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="block"><span className={adminLabelClass}>Description</span><input className={adminInputClass} value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} required /></label>
                  <label className="block"><span className={adminLabelClass}>Amount (₹)</span><input type="number" className={adminInputClass} value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} required /></label>
                  <button type="submit" className={adminBtnPrimary}>Add Expense</button>
                </form>
              </AdminCard>
              <AdminCard>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-[#0B2C6B]">Expense Records</h3>
                  <button type="button" className={adminBtnSecondary} onClick={() => exportExpensesCsv(dashboard.expenses)}>Export</button>
                </div>
                <DataTable
                  data={dashboard.expenses}
                  keyFn={(ex) => ex.id}
                  loading={loading}
                  columns={[
                    { key: 'date', header: 'Date', render: (ex) => ex.expenseDate },
                    { key: 'cat', header: 'Category', render: (ex) => ex.category },
                    { key: 'project', header: 'Project', render: (ex) => ex.project ?? '—' },
                    { key: 'focus', header: 'Focus Area', render: (ex) => ex.focusArea ?? '—' },
                    { key: 'desc', header: 'Description', render: (ex) => ex.description },
                    { key: 'amt', header: 'Amount', render: (ex) => `₹${ex.amount.toLocaleString('en-IN')}` },
                    { key: 'status', header: 'Status', render: (ex) => <StatusBadge status={ex.status} /> },
                    {
                      key: 'actions', header: '', render: (ex) => ex.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button type="button" className={adminBtnPrimary} onClick={async () => { await updateExpenseStatus(ex.id, 'approved'); await refresh() }}>Approve</button>
                          <button type="button" className={adminBtnSecondary} onClick={async () => { await updateExpenseStatus(ex.id, 'rejected'); await refresh() }}>Reject</button>
                        </div>
                      ) : null,
                    },
                  ]}
                />
              </AdminCard>
            </div>
          )}

          {tab === 'grants' && <FinanceGrantsPanel grants={dashboard.grants} />}
          {tab === 'budgets' && <FinanceBudgetsPanel budgets={dashboard.budgets} />}
          {tab === 'accounts' && (
            <>
              <FinanceAccountsPanel accounts={dashboard.chartOfAccounts} />
              <FinanceFundAccounting restricted={dashboard.restrictedFunds} unrestricted={dashboard.unrestrictedFunds} />
            </>
          )}
          {tab === 'receivables' && <FinanceReceivablesPayables receivables={dashboard.receivables} payables={dashboard.payables} mode="receivables" />}
          {tab === 'payables' && <FinanceReceivablesPayables receivables={dashboard.receivables} payables={dashboard.payables} mode="payables" />}
          {tab === 'tax_receipts' && <FinanceTaxReceiptsPanel />}
          {tab === 'reports' && <FinanceReportsPanel />}
          {tab === 'audit_logs' && <FinanceAuditLog logs={dashboard.auditLogs} />}
        </div>
      ) : loading ? (
        <AdminCard><p className="text-sm text-slate-500">Loading finance data…</p></AdminCard>
      ) : null}
    </AdminShell>
  )
}
