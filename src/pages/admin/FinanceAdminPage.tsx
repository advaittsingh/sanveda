import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import AdminCard from '../../components/admin/ui/AdminCard'
import ChartCard from '../../components/admin/ui/ChartCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatCard from '../../components/admin/ui/StatCard'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  EXPENSE_CATEGORIES,
  getExpenses,
  saveExpense,
  updateExpenseStatus,
  type Expense,
} from '../../lib/expenseService'
import { getFinancialSummary, getIncomeRecords, saveIncomeRecord, type IncomeSource } from '../../lib/incomeService'
import { getIncomeVsExpenses } from '../../lib/adminAnalytics'

const INCOME_SOURCES: IncomeSource[] = ['donation', 'membership', 'grant', 'csr', 'other']

interface Props {
  defaultTab?: 'overview' | 'income' | 'expenses'
}

export default function FinanceAdminPage({ defaultTab = 'overview' }: Props) {
  const { authed } = useAdminAuth()
  const [tab, setTab] = useState(defaultTab)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Awaited<ReturnType<typeof getIncomeRecords>>>([])
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getFinancialSummary>> | null>(null)
  const [chartData, setChartData] = useState<Awaited<ReturnType<typeof getIncomeVsExpenses>>>([])
  const [expenseForm, setExpenseForm] = useState<{ category: (typeof EXPENSE_CATEGORIES)[number]; description: string; amount: number }>({ category: EXPENSE_CATEGORIES[0], description: '', amount: 0 })
  const [incomeForm, setIncomeForm] = useState({ source: 'other' as IncomeSource, description: '', amount: 0 })

  const refresh = async () => {
    const [e, i, s, charts] = await Promise.all([getExpenses(), getIncomeRecords(), getFinancialSummary(), getIncomeVsExpenses()])
    setExpenses(e)
    setIncome(i)
    setSummary(s)
    setChartData(charts)
  }

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  useEffect(() => {
    setTab(defaultTab)
  }, [defaultTab])

  if (!authed) {
    return <AdminLogin title="Finance Dashboard" subtitle="Track income, expenses, and financial reports." />
  }

  const titles = {
    overview: { title: 'Finance Dashboard', subtitle: 'Income, expenses, and net balance overview' },
    income: { title: 'Income Records', subtitle: 'Track all income sources and grants' },
    expenses: { title: 'Expense Management', subtitle: 'Approve and track programme expenses' },
  }

  const tabs = (
    <div className="mb-6 flex flex-wrap gap-2">
      {(['overview', 'income', 'expenses'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTab(t)}
          className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
            tab === t ? 'bg-[#0B2C6B] text-white' : 'border border-[#E5E7EB] bg-white text-slate-600 hover:bg-[#F8FAFC]'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )

  return (
    <AdminShell title={titles[tab].title} subtitle={titles[tab].subtitle}>
      {tabs}

      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Income" value={summary.totalIncome} prefix="₹" accent="green" />
          <StatCard label="Total Expenses" value={summary.totalExpenses} prefix="₹" accent="secondary" />
          <StatCard label="Net Balance" value={summary.netBalance} prefix="₹" />
          <StatCard label="Pending Payments" value={summary.pendingExpenses} prefix="₹" />
        </div>
      )}

      {(tab === 'overview' || tab === 'expenses') && (
        <ChartCard title="Income vs Expenses" subtitle="Monthly trends" className="mb-6">
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
      )}

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        {(tab === 'overview' || tab === 'expenses') && (
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
                <select className={adminInputClass} value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as (typeof EXPENSE_CATEGORIES)[number] })}>
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block"><span className={adminLabelClass}>Description</span><input className={adminInputClass} value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></label>
              <label className="block"><span className={adminLabelClass}>Amount (₹)</span><input type="number" className={adminInputClass} value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} /></label>
              <button type="submit" className={adminBtnPrimary}>Add Expense</button>
            </form>
          </AdminCard>
        )}

        {(tab === 'overview' || tab === 'income') && (
          <AdminCard>
            <h3 className="mb-4 font-semibold text-[#0B2C6B]">Add Income</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                await saveIncomeRecord(incomeForm)
                setIncomeForm({ source: 'other', description: '', amount: 0 })
                await refresh()
              }}
              className="space-y-3"
            >
              <label className="block"><span className={adminLabelClass}>Source</span>
                <select className={adminInputClass} value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value as IncomeSource })}>
                  {INCOME_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block"><span className={adminLabelClass}>Description</span><input className={adminInputClass} value={incomeForm.description} onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })} /></label>
              <label className="block"><span className={adminLabelClass}>Amount (₹)</span><input type="number" className={adminInputClass} value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })} /></label>
              <button type="submit" className={adminBtnPrimary}>Add Income</button>
            </form>
          </AdminCard>
        )}

        {(tab === 'overview' || tab === 'expenses') && (
          <div className={tab === 'overview' ? 'xl:col-span-1' : 'xl:col-span-2'}>
            <DataTable
              data={expenses}
              keyFn={(ex) => ex.id}
              columns={[
                { key: 'date', header: 'Date', render: (ex) => ex.expenseDate },
                { key: 'cat', header: 'Category', render: (ex) => ex.category },
                { key: 'desc', header: 'Description', render: (ex) => ex.description },
                { key: 'amt', header: 'Amount', render: (ex) => `₹${ex.amount.toLocaleString('en-IN')}` },
                { key: 'status', header: 'Status', render: (ex) => <StatusBadge status={ex.status} /> },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (ex) =>
                    ex.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button type="button" className={adminBtnPrimary} onClick={async () => { await updateExpenseStatus(ex.id, 'approved'); await refresh() }}>Approve</button>
                        <button type="button" className={adminBtnSecondary} onClick={async () => { await updateExpenseStatus(ex.id, 'rejected'); await refresh() }}>Reject</button>
                      </div>
                    ) : null,
                },
              ]}
            />
          </div>
        )}

        {(tab === 'overview' || tab === 'income') && (
          <div className={tab === 'overview' ? 'xl:col-span-2' : 'xl:col-span-2'}>
            <DataTable
              data={income}
              keyFn={(inc) => inc.id}
              columns={[
                { key: 'date', header: 'Date', render: (inc) => inc.incomeDate },
                { key: 'source', header: 'Source', render: (inc) => inc.source },
                { key: 'desc', header: 'Description', render: (inc) => inc.description },
                { key: 'amt', header: 'Amount', render: (inc) => `₹${inc.amount.toLocaleString('en-IN')}` },
              ]}
            />
          </div>
        )}
      </div>
    </AdminShell>
  )
}
