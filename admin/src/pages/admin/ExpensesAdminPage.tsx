import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import ExpenseAddModal from '../../components/admin/expenses/ExpenseAddModal'
import ExpenseAiInsights from '../../components/admin/expenses/ExpenseAiInsights'
import ExpenseAnalytics from '../../components/admin/expenses/ExpenseAnalytics'
import ExpenseFiltersPanel from '../../components/admin/expenses/ExpenseFiltersPanel'
import ExpenseKpiCards from '../../components/admin/expenses/ExpenseKpiCards'
import ExpenseProfileDrawer from '../../components/admin/expenses/ExpenseProfileDrawer'
import { ExpenseAuditLog, ExpenseBudgetControls, ExpenseGrantUtilization, ExpenseVendorsPanel } from '../../components/admin/expenses/ExpenseSupportPanels'
import ExpenseToolbar, { ExpenseEmptyState } from '../../components/admin/expenses/ExpenseToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  approveExpense,
  exportExpensesCsv,
  filterExpenses,
  getExpenseDashboardData,
  markExpensePaid,
  rejectExpense,
  EXPENSE_REPORT_TYPES,
  type ExpenseDashboardData,
  type ExpenseFilters,
  type ExpenseProfile,
} from '../../lib/expenseOperationsService'

const defaultFilters: ExpenseFilters = {
  search: '',
  category: 'all',
  status: 'all',
  project: 'all',
  vendor: 'all',
}

export default function ExpensesAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<ExpenseDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [activeExpense, setActiveExpense] = useState<ExpenseProfile | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getExpenseDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filtered = useMemo(() => {
    if (!dashboard) return []
    return filterExpenses(dashboard.expenses, filters)
  }, [dashboard, filters])

  const projects = useMemo(() => dashboard ? [...new Set(dashboard.expenses.map((e) => e.project))] : [], [dashboard])
  const vendors = useMemo(() => dashboard ? [...new Set(dashboard.expenses.map((e) => e.vendor))] : [], [dashboard])

  const handleAction = async (action: () => Promise<void>) => {
    if (!activeExpense) return
    await action()
    await refresh()
    const updated = (await getExpenseDashboardData()).expenses.find((e) => e.id === activeExpense.id)
    if (updated) setActiveExpense(updated)
  }

  if (!authed) {
    return (
      <AdminLogin
        title="Expense Management"
        subtitle="Financial operations, procurement, vendor management, and project budget controls."
      />
    )
  }

  return (
    <AdminShell
      title="Expense Management"
      subtitle="NGO financial operations & procurement — trace every rupee from grant to beneficiary impact."
    >
      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading expense data…</p></AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <ExpenseKpiCards kpis={dashboard.kpis} />

          <AdminCard>
            <ExpenseToolbar
              onAdd={() => setShowAddModal(true)}
              onUploadInvoice={() => window.alert('Invoice upload connects to document repository and OCR extraction.')}
              onApprove={() => window.alert('Bulk approve pending expenses matching approval criteria.')}
              onExport={() => exportExpensesCsv(filtered)}
              onGenerateReport={() => window.alert(`Generate: ${EXPENSE_REPORT_TYPES.join(', ')}`)}
              search={filters.search}
              onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((v) => !v)}
            />
          </AdminCard>

          {showFilters ? (
            <ExpenseFiltersPanel filters={filters} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} projects={projects} vendors={vendors} />
          ) : null}

          <AdminCard>
            {filtered.length === 0 ? (
              <ExpenseEmptyState onAdd={() => setShowAddModal(true)} />
            ) : (
              <DataTable
                data={filtered}
                keyFn={(e) => e.id}
                onRowClick={setActiveExpense}
                selectedKey={activeExpense?.id}
                loading={loading}
                columns={[
                  { key: 'date', header: 'Date', render: (e) => e.dateLabel },
                  { key: 'project', header: 'Project', render: (e) => e.project },
                  { key: 'category', header: 'Category', render: (e) => e.categoryLabel },
                  { key: 'vendor', header: 'Vendor', render: (e) => e.vendor },
                  { key: 'amount', header: 'Amount', render: (e) => `₹${e.amount.toLocaleString('en-IN')}` },
                  { key: 'approved', header: 'Approved By', render: (e) => e.approvedBy ?? 'Pending' },
                  { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} /> },
                  { key: 'receipt', header: 'Receipt', render: (e) => e.hasReceipt ? <button type="button" className={adminBtnSecondary} onClick={(ev) => { ev.stopPropagation(); setActiveExpense(e) }}>View</button> : '—' },
                ]}
              />
            )}
          </AdminCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <ExpenseBudgetControls budgets={dashboard.budgetControls} />
            <ExpenseGrantUtilization grants={dashboard.grantUtilization} />
          </div>

          <ExpenseVendorsPanel vendors={dashboard.vendors} />

          <ExpenseAnalytics
            categoryDistribution={dashboard.categoryDistribution}
            monthlySpending={dashboard.monthlySpending}
            budgetUtilization={dashboard.budgetUtilization}
          />

          <ExpenseAuditLog logs={dashboard.auditLogs} />
          <ExpenseAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <ExpenseProfileDrawer
        expense={activeExpense}
        onClose={() => setActiveExpense(null)}
        onApprove={() => handleAction(() => approveExpense(activeExpense!.id))}
        onReject={() => handleAction(() => rejectExpense(activeExpense!.id))}
        onMarkPaid={() => handleAction(() => markExpensePaid(activeExpense!.id))}
      />

      <ExpenseAddModal open={showAddModal} onClose={() => setShowAddModal(false)} onSaved={refresh} />
    </AdminShell>
  )
}
