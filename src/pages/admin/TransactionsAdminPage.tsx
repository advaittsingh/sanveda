import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Mail,
  MoreHorizontal,
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
  rejectRefundRequest,
  requestTransactionRefund,
  retryTransaction,
  type TransactionAuditLog,
  type TransactionFilterGateway,
  type TransactionFilterStatus,
  type TransactionFilters,
  type TransactionRange,
  type TransactionRecord,
  type TransactionsDashboardData,
} from '../../lib/transactionOperationsService'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatFullDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? '1 day ago' : `${days} days ago`
}

function failureReason(record: TransactionRecord) {
  return record.failureReason ?? record.auditLog.find((item) => item.title === 'Payment failed')?.detail ?? 'Payment authorization failed'
}

function refundRiskLabel(risk?: TransactionRecord['refundRisk']) {
  if (risk === 'high') return { label: 'High', emoji: '🔴' }
  if (risk === 'medium') return { label: 'Medium', emoji: '🟠' }
  return { label: 'Low', emoji: '🟢' }
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
  const [openMenuId, setOpenMenuId] = useState('')
  const [showReconciliation, setShowReconciliation] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)
  const reconciliationRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const closeMenu = () => setOpenMenuId('')
    document.addEventListener('click', closeMenu)
    return () => document.removeEventListener('click', closeMenu)
  }, [])

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
  const reconciliationRequired = dashboard.reconciliation.difference > 0
  const activityItems = showAllActivity ? dashboard.auditLog : dashboard.auditLog.slice(0, 4)

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

  const openReconciliation = () => {
    setShowReconciliation(true)
    requestAnimationFrame(() => reconciliationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
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
      <div className="space-y-5">
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
          onViewSettlements={openReconciliation}
        />

        <AdminCard className="!p-4">
          <div className="grid gap-3 xl:grid-cols-[180px_180px_1fr]">
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
            <div className="mt-3 grid gap-3 md:grid-cols-2">
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

        <div ref={reconciliationRef}>
          <ExpandablePanel
            title="Reconciliation"
            subtitle={reconciliationRequired ? 'Gateway and bank totals need review' : 'Gateway and bank totals are aligned'}
            open={showReconciliation}
            onToggle={() => setShowReconciliation((prev) => !prev)}
          >
            <div className="space-y-3">
              <MetricRow label="Gateway" value={formatIndianCompact(dashboard.reconciliation.gateway)} />
              <MetricRow label="Bank" value={formatIndianCompact(dashboard.reconciliation.bank)} />
              <MetricRow
                label="Difference"
                value={formatIndianCompact(dashboard.reconciliation.difference)}
                tone={reconciliationRequired ? 'warning' : 'success'}
              />
              <p className={`text-sm font-semibold ${reconciliationRequired ? 'text-amber-700' : 'text-emerald-700'}`}>
                {reconciliationRequired ? '⚠ Reconciliation required' : '✓ Reconciled'}
              </p>
            </div>
          </ExpandablePanel>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[1.65fr_1fr]">
          <AdminCard>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#0B2C6B]">Transaction Ledger</h3>
                <p className="mt-0.5 text-xs text-slate-500">Payment operations across gateway status, methods, and settlement</p>
              </div>
            </div>

            {selectedIds.size > 0 ? (
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2">
                <span className="text-sm font-medium text-slate-600">{selectedIds.size} selected</span>
                <button type="button" className={adminBtnPrimary} onClick={() => act(() => markTransactionsSettled(Array.from(selectedIds)))}>
                  Mark Settled
                </button>
                <button type="button" className={adminBtnSecondary} onClick={() => exportTransactionsCsv(selectedTransactions)}>
                  Export CSV
                </button>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                      <th className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={(event) => {
                            if (event.target.checked) setSelectedIds(new Set(filteredTransactions.map((record) => record.id)))
                            else setSelectedIds(new Set())
                          }}
                        />
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-slate-500">ID</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-500">Donor</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-500">Campaign</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-500">Amount</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-500">Method</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-500">Gateway</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-500">Status</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-500">Date</th>
                      <th className="px-3 py-2.5 font-semibold text-slate-500" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((record) => (
                      <tr
                        key={record.id}
                        className={`border-b border-[#E5E7EB] ${activeTransactionId === record.id ? 'bg-[#0B2C6B]/3' : 'bg-white'}`}
                      >
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={selectedIds.has(record.id)} onChange={() => toggleSelection(record.id)} />
                        </td>
                        <td className="px-3 py-2 font-medium text-[#0B2C6B]">{record.id}</td>
                        <td className="px-3 py-2 font-medium text-[#0B2C6B]">{record.donorName}</td>
                        <td className="max-w-[160px] truncate px-3 py-2 text-slate-600">{record.campaign}</td>
                        <td className="px-3 py-2 font-semibold text-emerald-700">{formatIndianCompact(record.amount)}</td>
                        <td className="px-3 py-2 text-slate-600">{record.method}</td>
                        <td className="px-3 py-2 text-slate-600">{record.gateway}</td>
                        <td className="px-3 py-2"><StatusBadge status={record.status} /></td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(record.date)}</td>
                        <td className="relative px-3 py-2">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-[#F8FAFC]"
                            onClick={(event) => {
                              event.stopPropagation()
                              setOpenMenuId((prev) => (prev === record.id ? '' : record.id))
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openMenuId === record.id ? (
                            <div
                              className="absolute right-3 top-10 z-20 min-w-[180px] rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <MenuItem onClick={() => { setActiveTransactionId(record.id); setOpenMenuId('') }}>View transaction</MenuItem>
                              {record.status === 'failed' ? (
                                <MenuItem onClick={() => { setOpenMenuId(''); act(() => retryTransaction(record.id)) }}>Retry payment</MenuItem>
                              ) : null}
                              {record.status === 'success' ? (
                                <MenuItem onClick={() => { setOpenMenuId(''); act(() => requestTransactionRefund(record.id, 'Manual refund requested from transactions ledger.')) }}>Refund</MenuItem>
                              ) : null}
                              <MenuItem onClick={async () => {
                                setOpenMenuId('')
                                await act(() => contactDonor(record.id))
                                window.location.href = `mailto:${record.donorEmail}`
                              }}
                              >
                                Contact donor
                              </MenuItem>
                              <MenuItem onClick={() => { setOpenMenuId(''); exportTransactionsCsv([record]) }}>Export receipt</MenuItem>
                              <MenuItem onClick={() => { setActiveTransactionId(record.id); setShowAllActivity(true); setOpenMenuId('') }}>Audit history</MenuItem>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AdminCard>

          <aside className="sticky top-6 max-h-[calc(100vh-3rem)] space-y-4 overflow-y-auto">
            <SidebarSection title="Failed Payments" subtitle="Incident queue">
              <div className="space-y-2">
                {dashboard.failedTransactions.length ? dashboard.failedTransactions.map((record) => (
                  <div key={record.id} className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#0B2C6B]">{record.id}</p>
                        <p className="text-sm font-medium text-slate-700">{record.donorName}</p>
                        <p className="text-sm font-semibold text-emerald-700">{formatIndianCompact(record.amount)}</p>
                        <p className="text-xs text-slate-500">{record.method} · {record.gateway}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          <span className="font-semibold text-slate-500">Failure:</span> {failureReason(record)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button type="button" className={adminBtnPrimary} onClick={() => act(() => retryTransaction(record.id))}>Retry</button>
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        onClick={async () => {
                          await act(() => contactDonor(record.id))
                          window.location.href = `mailto:${record.donorEmail}`
                        }}
                      >
                        Remind
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500">No failed payments in queue.</p>
                )}
              </div>
            </SidebarSection>

            <SidebarSection title="Refund Queue" subtitle="Approval workflow">
              <div className="space-y-2">
                {dashboard.refundRequests.length ? dashboard.refundRequests.map((record) => {
                  const risk = refundRiskLabel(record.refundRisk)
                  return (
                    <div key={record.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                      <p className="text-sm font-medium text-[#0B2C6B]">
                        {risk.emoji} {record.refundReason ?? 'Refund requested'}
                      </p>
                      <p className="text-sm font-semibold text-emerald-700">{formatIndianCompact(record.amount)}</p>
                      <p className="text-xs text-slate-500">
                        Requested: {record.refundRequestedAt ? timeAgo(record.refundRequestedAt) : timeAgo(record.date)}
                      </p>
                      <p className="text-xs text-slate-500">Risk: <span className="font-semibold">{risk.label}</span></p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" className={adminBtnPrimary} onClick={() => act(() => approveRefundRequest(record.id))}>Approve</button>
                        <button type="button" className={adminBtnSecondary} onClick={() => act(() => rejectRefundRequest(record.id))}>Reject</button>
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
                  )
                }) : (
                  <p className="text-xs text-slate-500">No refund requests pending.</p>
                )}
              </div>
            </SidebarSection>

            <SidebarSection title="Selected Transaction" subtitle="Inspector">
              {activeTransaction ? (
                <TransactionInspector
                  record={activeTransaction}
                  onRetry={() => act(() => retryTransaction(activeTransaction.id))}
                  onSettle={() => act(() => markTransactionsSettled([activeTransaction.id]))}
                  onRefund={() => act(() => requestTransactionRefund(activeTransaction.id, 'Refund requested from transaction inspector.'))}
                  onContact={async () => {
                    await act(() => contactDonor(activeTransaction.id))
                    window.location.href = `mailto:${activeTransaction.donorEmail}`
                  }}
                />
              ) : (
                <p className="text-xs text-slate-500">Select a transaction from the ledger.</p>
              )}
            </SidebarSection>

            <SidebarSection title="Recent Activity" subtitle="Payment operations feed">
              <div className="space-y-2">
                {activityItems.map((item) => (
                  <ActivityLine key={item.id} item={item} />
                ))}
              </div>
              {dashboard.auditLog.length > 4 ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-[#0E4FA8] hover:underline"
                  onClick={() => setShowAllActivity((prev) => !prev)}
                >
                  {showAllActivity ? 'Show less' : 'View all →'}
                </button>
              ) : null}
            </SidebarSection>
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}

function TransactionInspector({
  record,
  onRetry,
  onSettle,
  onRefund,
  onContact,
}: {
  record: TransactionRecord
  onRetry: () => void
  onSettle: () => void
  onRefund: () => void
  onContact: () => void
}) {
  const settlementLabel = record.settlementStatus === 'settled' ? 'Settled' : 'Pending Settlement'

  return (
    <div>
      <div className="border-b border-[#E5E7EB] pb-3">
        <p className="text-base font-bold text-[#0B2C6B]">{record.id}</p>
        <p className="text-2xl font-bold tracking-tight text-emerald-700">{formatIndianCompact(record.amount)}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{settlementLabel}</p>
        <div className="mt-2"><StatusBadge status={record.status} /></div>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <InspectorField label="Donor" value={record.donorName} />
        <InspectorField label="Campaign" value={record.campaign} />
        <InspectorField label="Method" value={`${record.method} via ${record.gateway}`} />
        <InspectorField label="Date" value={formatFullDate(record.date)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {record.status === 'failed' ? (
          <button type="button" className={adminBtnPrimary} onClick={onRetry}>Retry</button>
        ) : null}
        {record.status === 'success' ? (
          <button type="button" className={adminBtnSecondary} onClick={onRefund}>Refund</button>
        ) : null}
        <button type="button" className={adminBtnSecondary} onClick={onSettle}>Settle</button>
        <button type="button" className={adminBtnSecondary} onClick={onContact}>
          <Mail size={14} className="mr-1" />
          Contact
        </button>
      </div>
    </div>
  )
}

function InspectorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium text-[#0B2C6B]">{value}</p>
    </div>
  )
}

function ActivityLine({ item }: { item: TransactionAuditLog }) {
  const amountMatch = item.detail.match(/₹[\d.,]+[LKCr]*/)
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0E4FA8]" />
      <p className="text-slate-700">
        <span className="font-medium text-[#0B2C6B]">{item.title}</span>
        {amountMatch ? ` ${amountMatch[0]}` : ''}
      </p>
    </div>
  )
}

function SidebarSection({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <AdminCard className="!p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[#0B2C6B]">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      {children}
    </AdminCard>
  )
}

function ExpandablePanel({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string
  subtitle: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <AdminCard className="!p-0 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#F8FAFC]"
        onClick={onToggle}
      >
        <div>
          <h3 className="text-sm font-semibold text-[#0B2C6B]">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>
      {open ? <div className="border-t border-[#E5E7EB] px-4 py-3">{children}</div> : null}
    </AdminCard>
  )
}

function MenuItem({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-[#F8FAFC]"
      onClick={onClick}
    >
      {children}
    </button>
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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  )
}
