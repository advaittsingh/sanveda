import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Download,
  Mail,
  Receipt,
  RefreshCcw,
  ShieldAlert,
  WalletCards,
} from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import TransactionAnalytics from '../../components/admin/transactions/TransactionAnalytics'
import AdminCard from '../../components/admin/ui/AdminCard'
import StatCard from '../../components/admin/ui/StatCard'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { formatIndianCompact } from '../../lib/formatIndian'
import {
  approveRefundRequest,
  contactDonor,
  exportTransactionsCsv,
  exportTransactionsPdf,
  getTransactionsDashboardData,
  markTransactionsSettled,
  requestTransactionRefund,
  retryTransaction,
  type TransactionFilterGateway,
  type TransactionFilterStatus,
  type TransactionFilters,
  type TransactionRange,
  type TransactionsDashboardData,
} from '../../lib/transactionOperationsService'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const DEFAULT_FILTERS: TransactionFilters = {
  status: 'all',
  gateway: 'all',
  range: '30d',
}

export default function TransactionsAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<TransactionsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeTransactionId, setActiveTransactionId] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getTransactionsDashboardData(filters))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  useEffect(() => {
    if (!dashboard) return
    if (!activeTransactionId) {
      setActiveTransactionId(dashboard.filteredTransactions[0]?.id ?? dashboard.allTransactions[0]?.id ?? '')
      return
    }
    const exists = dashboard.allTransactions.some((record) => record.id === activeTransactionId)
    if (!exists) setActiveTransactionId(dashboard.filteredTransactions[0]?.id ?? dashboard.allTransactions[0]?.id ?? '')
  }, [dashboard, activeTransactionId])

  const activeTransaction = useMemo(
    () => dashboard?.allTransactions.find((record) => record.id === activeTransactionId) ?? null,
    [dashboard, activeTransactionId],
  )

  if (!authed) {
    return (
      <AdminLogin
        title="Transactions"
        subtitle="Monitor payment processing, bank settlement and reconciliation."
      />
    )
  }

  if (loading || !dashboard) {
    return (
      <AdminShell title="Transactions" subtitle="Monitor payment processing, bank settlement and reconciliation.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const filteredTransactions = dashboard.filteredTransactions
  const allFilteredSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((transaction) => selectedIds.has(transaction.id))
  const selectedTransactions = dashboard.allTransactions.filter((transaction) => selectedIds.has(transaction.id))

  const act = async (fn: () => Promise<void>) => {
    await fn()
    await refresh()
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const headerActions = (
    <>
      <button type="button" className={adminBtnSecondary} onClick={() => exportTransactionsCsv(filteredTransactions)}>
        <Download size={14} className="mr-1.5" />
        Export CSV
      </button>
      <button type="button" className={adminBtnSecondary} onClick={() => exportTransactionsPdf(dashboard)}>
        <Download size={14} className="mr-1.5" />
        Export PDF
      </button>
      <button type="button" className={adminBtnSecondary} onClick={() => refresh()}>
        <RefreshCcw size={14} className="mr-1.5" />
        Refresh
      </button>
    </>
  )

  return (
    <AdminShell
      title="Transactions"
      subtitle="Monitor payment processing, bank settlement and reconciliation."
      actions={headerActions}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard label="Total Transactions" value={dashboard.kpis.totalTransactions} sub="in current filter window" icon={WalletCards} />
          <StatCard label="Successful" value={dashboard.kpis.successful} sub="captured and authorized" icon={BadgeCheck} accent="green" />
          <StatCard label="Pending" value={dashboard.kpis.pending} sub="awaiting confirmation" icon={Clock3} accent="secondary" />
          <StatCard label="Failed" value={dashboard.kpis.failed} sub="needs retry or outreach" icon={ShieldAlert} accent="secondary" />
          <StatCard label="Today's Volume" value={dashboard.kpis.todayVolume} prefix="₹" sub="successful volume today" icon={CircleDollarSign} accent="blue" />
          <StatCard label="Settlement Pending" value={dashboard.kpis.settlementPending} prefix="₹" sub="not yet in bank ledger" icon={Receipt} accent="secondary" />
        </div>

        <TransactionAnalytics
          volumeTrend={dashboard.volumeTrend}
          paymentMethodDistribution={dashboard.paymentMethodDistribution}
          settlementOverview={dashboard.settlementOverview}
        />

        <AdminCard>
          <div className="grid gap-4 xl:grid-cols-[220px_220px_1fr]">
            <label className="block">
              <span className={adminLabelClass}>Status</span>
              <select
                className={adminInputClass}
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as TransactionFilterStatus }))}
              >
                <option value="all">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>

            <label className="block">
              <span className={adminLabelClass}>Gateway</span>
              <select
                className={adminInputClass}
                value={filters.gateway}
                onChange={(event) => setFilters((prev) => ({ ...prev, gateway: event.target.value as TransactionFilterGateway }))}
              >
                <option value="all">All gateways</option>
                <option value="Razorpay">Razorpay</option>
                <option value="UPI">UPI</option>
                <option value="Bank">Bank</option>
              </select>
            </label>

            <div>
              <span className={adminLabelClass}>Date</span>
              <div className="flex flex-wrap gap-2">
                {([
                  ['today', 'Today'],
                  ['7d', '7D'],
                  ['30d', '30D'],
                  ['custom', 'Custom'],
                ] as [TransactionRange, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, range: value }))}
                    className={filters.range === value ? adminBtnPrimary : adminBtnSecondary}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filters.range === 'custom' ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={adminLabelClass}>From</span>
                <input
                  type="date"
                  className={adminInputClass}
                  value={filters.customStart ?? ''}
                  onChange={(event) => setFilters((prev) => ({ ...prev, customStart: event.target.value }))}
                />
              </label>
              <label className="block">
                <span className={adminLabelClass}>To</span>
                <input
                  type="date"
                  className={adminInputClass}
                  value={filters.customEnd ?? ''}
                  onChange={(event) => setFilters((prev) => ({ ...prev, customEnd: event.target.value }))}
                />
              </label>
            </div>
          ) : null}
        </AdminCard>

        <div className="grid gap-5 xl:grid-cols-[1.75fr_1fr]">
          <AdminCard>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#0B2C6B]">Transaction Ledger</h3>
                <p className="mt-0.5 text-xs text-slate-500">Payment operations view across gateway status, methods, and settlement state</p>
              </div>
            </div>

            {selectedIds.size > 0 ? (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                <span className="text-sm font-medium text-slate-600">{selectedIds.size} selected</span>
                <button
                  type="button"
                  className={adminBtnPrimary}
                  onClick={() => act(() => markTransactionsSettled(Array.from(selectedIds)))}
                >
                  Mark Settled
                </button>
                <button type="button" className={adminBtnSecondary} onClick={() => exportTransactionsCsv(selectedTransactions)}>
                  Export CSV
                </button>
                <button
                  type="button"
                  className={adminBtnSecondary}
                  onClick={() => act(async () => {
                    for (const record of selectedTransactions.filter((item) => item.status === 'failed')) {
                      await retryTransaction(record.id)
                    }
                  })}
                >
                  Retry Failed
                </button>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedIds(new Set(filteredTransactions.map((record) => record.id)))
                            } else {
                              setSelectedIds(new Set())
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-500">ID</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Donor</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Campaign</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Amount</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Method</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Gateway</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Date</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((record) => (
                      <tr
                        key={record.id}
                        className={`border-b border-[#E5E7EB] ${activeTransactionId === record.id ? 'bg-[#0B2C6B]/3' : 'bg-white'}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(record.id)}
                            onChange={() => toggleSelection(record.id)}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-[#0B2C6B]">{record.id}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[#0B2C6B]">{record.donorName}</p>
                            <p className="text-xs text-slate-500">{record.donorEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{record.campaign}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">{formatIndianCompact(record.amount)}</td>
                        <td className="px-4 py-3 text-slate-600">{record.method}</td>
                        <td className="px-4 py-3 text-slate-600">{record.gateway}</td>
                        <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(record.date)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" className={adminBtnSecondary} onClick={() => setActiveTransactionId(record.id)}>View</button>
                            {record.status === 'failed' ? (
                              <button type="button" className={adminBtnPrimary} onClick={() => act(() => retryTransaction(record.id))}>Retry</button>
                            ) : null}
                            {record.status === 'success' ? (
                              <button
                                type="button"
                                className={adminBtnSecondary}
                                onClick={() => act(() => requestTransactionRefund(record.id, 'Manual refund requested from transactions ledger.'))}
                              >
                                Refund
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className={adminBtnSecondary}
                              onClick={async () => {
                                await act(() => contactDonor(record.id))
                                window.location.href = `mailto:${record.donorEmail}`
                              }}
                            >
                              Contact
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AdminCard>

          <div className="space-y-5">
            <AdminCard>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#0B2C6B]">Failed Payments</h3>
                <p className="mt-0.5 text-xs text-slate-500">Retry queue for payment failures</p>
              </div>
              <div className="space-y-3">
                {dashboard.failedTransactions.map((record) => (
                  <div key={record.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#0B2C6B]">{record.id}</p>
                        <p className="text-xs text-slate-500">{formatIndianCompact(record.amount)} · {record.donorName}</p>
                      </div>
                      <AlertTriangle size={16} className="text-amber-600" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className={adminBtnPrimary} onClick={() => act(() => retryTransaction(record.id))}>
                        Retry
                      </button>
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        onClick={async () => {
                          await act(() => contactDonor(record.id))
                          window.location.href = `mailto:${record.donorEmail}`
                        }}
                      >
                        Contact Donor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#0B2C6B]">Reconciliation</h3>
                <p className="mt-0.5 text-xs text-slate-500">Gateway ledger vs bank settlement</p>
              </div>
              <div className="space-y-3">
                <MetricRow label="Gateway" value={formatIndianCompact(dashboard.reconciliation.gateway)} />
                <MetricRow label="Bank" value={formatIndianCompact(dashboard.reconciliation.bank)} />
                <MetricRow label="Difference" value={formatIndianCompact(dashboard.reconciliation.difference)} tone={dashboard.reconciliation.difference > 0 ? 'warning' : 'success'} />
              </div>
            </AdminCard>

            <AdminCard>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#0B2C6B]">Refund Requests</h3>
                <p className="mt-0.5 text-xs text-slate-500">Queue for approvals and donor follow-up</p>
              </div>
              <div className="space-y-3">
                {dashboard.refundRequests.map((record) => (
                  <div key={record.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#0B2C6B]">{record.donorName}</p>
                        <p className="text-xs text-slate-500">{formatIndianCompact(record.amount)} · {record.refundReason ?? 'Refund requested'}</p>
                      </div>
                      <StatusBadge status="requested" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className={adminBtnPrimary} onClick={() => act(() => approveRefundRequest(record.id))}>
                        Approve
                      </button>
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        onClick={async () => {
                          await act(() => contactDonor(record.id))
                          window.location.href = `mailto:${record.donorEmail}`
                        }}
                      >
                        Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#0B2C6B]">Audit Log</h3>
                <p className="mt-0.5 text-xs text-slate-500">Payment, settlement, and refund events</p>
              </div>
              <div className="space-y-3">
                {dashboard.auditLog.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-3">
                    <span className="w-14 shrink-0 text-xs font-semibold text-slate-400">{formatTime(item.at)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0B2C6B]">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            {activeTransaction ? (
              <AdminCard>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#0B2C6B]">Transaction Detail</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Selected payment, settlement, and refund metadata</p>
                </div>
                <div className="space-y-3">
                  <MetricRow label="Transaction ID" value={activeTransaction.id} />
                  <MetricRow label="Donor" value={activeTransaction.donorName} />
                  <MetricRow label="Campaign" value={activeTransaction.campaign} />
                  <MetricRow label="Amount" value={formatIndianCompact(activeTransaction.amount)} />
                  <MetricRow label="Method" value={activeTransaction.method} />
                  <MetricRow label="Gateway" value={activeTransaction.gateway} />
                  <MetricRow label="Settlement" value={activeTransaction.settlementStatus} />
                  <MetricRow label="Gateway Ref" value={activeTransaction.gatewayReference} />
                  <MetricRow label="Date" value={new Date(activeTransaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                  <div className="flex flex-wrap gap-2">
                    {activeTransaction.status === 'failed' ? (
                      <button type="button" className={adminBtnPrimary} onClick={() => act(() => retryTransaction(activeTransaction.id))}>
                        Retry Payment
                      </button>
                    ) : null}
                    {activeTransaction.status === 'success' ? (
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        onClick={() => act(() => requestTransactionRefund(activeTransaction.id, 'Refund requested from transaction detail panel.'))}
                      >
                        Request Refund
                      </button>
                    ) : null}
                    <button type="button" className={adminBtnSecondary} onClick={() => act(() => markTransactionsSettled([activeTransaction.id]))}>
                      Mark Settled
                    </button>
                    <button
                      type="button"
                      className={adminBtnSecondary}
                      onClick={async () => {
                        await act(() => contactDonor(activeTransaction.id))
                        window.location.href = `mailto:${activeTransaction.donorEmail}`
                      }}
                    >
                      <Mail size={14} className="mr-1.5" />
                      Contact Donor
                    </button>
                  </div>
                </div>
              </AdminCard>
            ) : null}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

function MetricRow({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'success' | 'warning'
}) {
  const valueClass =
    tone === 'success'
      ? 'text-emerald-700'
      : tone === 'warning'
        ? 'text-amber-700'
        : 'text-[#0B2C6B]'

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold capitalize ${valueClass}`}>{value}</span>
    </div>
  )
}
