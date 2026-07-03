import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  EXPENSE_CATEGORIES,
  getExpenses,
  saveExpense,
  updateExpenseStatus,
  type Expense,
} from '../../lib/expenseService'
import { getFinancialSummary, getIncomeRecords, saveIncomeRecord, type IncomeSource } from '../../lib/incomeService'

const INCOME_SOURCES: IncomeSource[] = ['donation', 'membership', 'grant', 'csr', 'other']

export default function FinanceAdminPage() {
  const { authed } = useAdminAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Awaited<ReturnType<typeof getIncomeRecords>>>([])
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getFinancialSummary>> | null>(null)
  const [expenseForm, setExpenseForm] = useState<{ category: string; description: string; amount: number }>({ category: EXPENSE_CATEGORIES[0], description: '', amount: 0 })
  const [incomeForm, setIncomeForm] = useState({ source: 'other' as IncomeSource, description: '', amount: 0 })

  const refresh = async () => {
    const [e, i, s] = await Promise.all([getExpenses(), getIncomeRecords(), getFinancialSummary()])
    setExpenses(e)
    setIncome(i)
    setSummary(s)
  }

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  if (!authed) {
    return <AdminLogin title="Finance Admin" subtitle="Track income, expenses, and financial reports." />
  }

  return (
    <AdminShell title="Finance Management" subtitle="Income records, expense tracking, and reports">
      {summary && (
        <div className="volunteer-admin-stats">
          <div><strong>₹{summary.totalIncome.toLocaleString('en-IN')}</strong><span>Total Income</span></div>
          <div><strong>₹{summary.totalExpenses.toLocaleString('en-IN')}</strong><span>Approved Expenses</span></div>
          <div><strong>₹{summary.netBalance.toLocaleString('en-IN')}</strong><span>Net Balance</span></div>
          <div><strong>₹{summary.pendingExpenses.toLocaleString('en-IN')}</strong><span>Pending Expenses</span></div>
        </div>
      )}

      <div className="volunteer-admin-layout">
        <div className="admin-form-panel">
          <h3>Add Expense</h3>
          <form onSubmit={async (e) => {
            e.preventDefault()
            await saveExpense(expenseForm)
            setExpenseForm({ category: EXPENSE_CATEGORIES[0], description: '', amount: 0 })
            await refresh()
          }}>
            <label className="volunteer-field"><span>Category</span>
              <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="volunteer-field"><span>Description</span><input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></label>
            <label className="volunteer-field"><span>Amount (₹)</span><input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} /></label>
            <button type="submit" className="volunteer-btn volunteer-btn-primary">Add Expense</button>
          </form>

          <h3 style={{ marginTop: 24 }}>Add Income</h3>
          <form onSubmit={async (e) => {
            e.preventDefault()
            await saveIncomeRecord(incomeForm)
            setIncomeForm({ source: 'other', description: '', amount: 0 })
            await refresh()
          }}>
            <label className="volunteer-field"><span>Source</span>
              <select value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value as IncomeSource })}>
                {INCOME_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="volunteer-field"><span>Description</span><input value={incomeForm.description} onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })} /></label>
            <label className="volunteer-field"><span>Amount (₹)</span><input type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })} /></label>
            <button type="submit" className="volunteer-btn volunteer-btn-primary">Add Income</button>
          </form>
        </div>

        <div className="volunteer-admin-table-wrap">
          <h3>Expenses</h3>
          <table className="volunteer-admin-table">
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {expenses.map((ex) => (
                <tr key={ex.id}>
                  <td>{ex.expenseDate}</td>
                  <td>{ex.category}</td>
                  <td>{ex.description}</td>
                  <td>₹{ex.amount.toLocaleString('en-IN')}</td>
                  <td>{ex.status}</td>
                  <td>
                    {ex.status === 'pending' && (
                      <>
                        <button type="button" onClick={async () => { await updateExpenseStatus(ex.id, 'approved'); await refresh() }}>Approve</button>
                        <button type="button" onClick={async () => { await updateExpenseStatus(ex.id, 'rejected'); await refresh() }}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: 24 }}>Income</h3>
          <table className="volunteer-admin-table">
            <thead><tr><th>Date</th><th>Source</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>
              {income.map((inc) => (
                <tr key={inc.id}>
                  <td>{inc.incomeDate}</td>
                  <td>{inc.source}</td>
                  <td>{inc.description}</td>
                  <td>₹{inc.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
