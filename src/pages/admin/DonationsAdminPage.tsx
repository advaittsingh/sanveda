import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AlertCircle,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  FileSpreadsheet,
  Mail,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import DonationAnalytics from '../../components/admin/donations/DonationAnalytics'
import DonationDetailDrawer from '../../components/admin/donations/DonationDetailDrawer'
import DonationEmptyState from '../../components/admin/donations/DonationEmptyState'
import DonationsTable from '../../components/admin/donations/DonationsTable'
import AdminCard from '../../components/admin/ui/AdminCard'
import StatCard from '../../components/admin/ui/StatCard'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnDanger, adminBtnPrimary, adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  approveDonation,
  approveRefund,
  bulkGenerateReceipts,
  bulkSendReceipts,
  bulkVerifyDonations,
  exportDonationsCsv,
  getDonationDashboardData,
  markReceiptDownloaded,
  markReceiptSent,
  rejectDonation,
  rejectRefund,
  requestDonationInfo,
  requestRefund,
  updateDonationNotes,
  type DonationDashboardData,
  type DonationOpsRecord,
  type DonationRange,
} from '../../lib/donationOperationsService'
import { downloadReceipt, getDonationById } from '../../lib/donationService'
import { formatIndianCompact } from '../../lib/formatIndian'

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
  )
}

export default function DonationsAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<DonationDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeDonation, setActiveDonation] = useState<DonationOpsRecord | null>(null)
  const [range, setRange] = useState<DonationRange>('30d')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDashboard(await getDonationDashboardData(range))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donation data')
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const pendingRefundId = useMemo(() => {
    if (!activeDonation) return undefined
    return dashboard?.refunds.find((r) => r.donationId === activeDonation.id && r.status === 'pending')?.id
  }, [activeDonation, dashboard?.refunds])

  if (!authed) {
    return <AdminLogin title="Donation Management" subtitle="View donation analytics and receipts." />
  }

  const act = async (fn: () => Promise<void>) => {
    await fn()
    await refresh()
  }

  const handleDownloadReceipt = async (id: string) => {
    await markReceiptDownloaded(id)
    const donation = await getDonationById(id)
    if (donation) downloadReceipt(donation)
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

  const toggleSelectAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      if (allSelected) return new Set([...prev].filter((id) => !ids.includes(id)))
      return new Set([...prev, ...ids])
    })
  }

  const headerActions = (
    <>
      {([
        ['today', 'Today'],
        ['7d', '7D'],
        ['30d', '30D'],
        ['quarter', 'Quarter'],
        ['year', 'Year'],
      ] as [DonationRange, string][]).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setRange(value)}
          className={range === value ? adminBtnPrimary : adminBtnSecondary}
        >
          {label}
        </button>
      ))}
      <button type="button" className={adminBtnSecondary} onClick={refresh} disabled={loading}>
        <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      {dashboard ? (
        <button type="button" className={adminBtnSecondary} onClick={() => exportDonationsCsv(dashboard.allDonations)}>
          <FileSpreadsheet size={14} className="mr-1.5" />
          Export CSV
        </button>
      ) : null}
    </>
  )

  if (error && !dashboard) {
    return (
      <AdminShell title="Donation Management" subtitle="Fundraising operations dashboard" actions={headerActions}>
        <DonationEmptyState
          icon={AlertCircle}
          title="Could not load donations"
          description={error}
          actionLabel="Retry"
          onAction={refresh}
        />
      </AdminShell>
    )
  }

  const selectedDonations = dashboard?.allDonations.filter((d) => selectedIds.has(d.id)) ?? []
  const hasDonations = (dashboard?.allDonations.length ?? 0) > 0

  const bulkActions: { label: string; run: () => Promise<void>; cls: string; icon: LucideIcon }[] = [
    { label: 'Generate Receipts', run: async () => bulkGenerateReceipts(Array.from(selectedIds)), cls: adminBtnSecondary, icon: ReceiptText },
    { label: 'Send Email', run: async () => bulkSendReceipts(Array.from(selectedIds)), cls: adminBtnSecondary, icon: Mail },
    { label: 'Export Selected', run: async () => exportDonationsCsv(selectedDonations), cls: adminBtnSecondary, icon: FileSpreadsheet },
    { label: 'Mark Verified', run: async () => bulkVerifyDonations(Array.from(selectedIds)), cls: adminBtnPrimary, icon: BadgeCheck },
  ]

  return (
    <AdminShell
      title="Donation Management"
      subtitle="Fundraising operations — revenue, receipts, reconciliation, and compliance"
      actions={headerActions}
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Partial refresh failed: {error}
          </div>
        ) : null}

        {dashboard?.alerts.length ? (
          <div className="flex flex-wrap gap-2">
            {dashboard.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  alert.tone === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-sky-50 text-sky-800'
                }`}
              >
                {alert.tone === 'warning' ? '⚠' : 'ℹ'} {alert.message}
              </div>
            ))}
          </div>
        ) : null}

        {loading && !dashboard ? <KpiSkeleton /> : dashboard ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard label="Total Raised" value={dashboard.kpis.totalRaised} prefix="₹" trend={dashboard.kpis.totalRaisedTrend} trendPositive={dashboard.kpis.totalRaisedPositive} sub="vs previous period" icon={CircleDollarSign} />
            <StatCard label="Today's Donations" value={dashboard.kpis.today} prefix="₹" sub="incoming today" icon={Clock3} accent="secondary" />
            <StatCard label="This Month" value={dashboard.kpis.thisMonth} prefix="₹" sub="month to date" icon={CircleDollarSign} accent="blue" />
            <StatCard label="Pending Verification" value={dashboard.kpis.pendingVerification} sub="needs ops action" icon={BadgeCheck} accent="secondary" />
            <StatCard label="80G Receipts Pending" value={dashboard.kpis.receiptsPending} sub="receipt queue" icon={ReceiptText} accent="green" />
            <StatCard label="Successful Transactions" value={dashboard.kpis.successfulTransactions} sub="completed payments" icon={ShieldCheck} accent="green" />
          </div>
        ) : null}

        {!hasDonations && !loading ? (
          <DonationEmptyState
            title="No donations yet"
            description="When donors contribute through campaigns or the donate page, transactions, receipts, and analytics will appear here."
          />
        ) : dashboard ? (
          <>
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Operations</h2>
              <div className="grid gap-5 xl:grid-cols-[1.05fr_1.95fr]">
                <AdminCard className="min-h-[320px]">
                  <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Today's Activity</h3>
                  {dashboard.activity.length ? (
                    <div className="space-y-3">
                      {dashboard.activity.map((item) => (
                        <div key={item.id} className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-3">
                          <span className="w-14 shrink-0 text-xs font-semibold text-slate-400">{item.time}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0B2C6B]">{item.title}</p>
                            {item.subtitle ? <p className="text-xs text-slate-500">{item.subtitle}</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <DonationEmptyState title="Quiet day" description="No donation activity recorded today." />
                  )}
                </AdminCard>

                <AdminCard className="min-h-[320px]">
                  <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Operations Queue</h3>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <QueueSection
                      title="Pending Verification"
                      count={dashboard.pendingVerifications.length}
                      empty="No donations awaiting verification."
                    >
                      {dashboard.pendingVerifications.slice(0, 5).map((donation) => (
                        <QueueItem key={donation.id} donation={donation}>
                          <button type="button" className={adminBtnPrimary} onClick={() => act(() => approveDonation(donation.id))}>Approve</button>
                          <button type="button" className={adminBtnDanger} onClick={() => act(() => rejectDonation(donation.id))}>Reject</button>
                          <button type="button" className={adminBtnSecondary} onClick={() => act(() => requestDonationInfo(donation.id))}>Request Info</button>
                        </QueueItem>
                      ))}
                    </QueueSection>

                    <QueueSection
                      title="Failed Payments"
                      count={dashboard.failedPayments.length}
                      empty="No failed payments."
                    >
                      {dashboard.failedPayments.slice(0, 5).map((donation) => (
                        <QueueItem key={donation.id} donation={donation}>
                          <button type="button" className={adminBtnSecondary} onClick={() => setActiveDonation(donation)}>Review</button>
                        </QueueItem>
                      ))}
                    </QueueSection>
                  </div>
                </AdminCard>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Analytics</h2>
              <DonationAnalytics
                donationsOverTime={dashboard.donationsOverTime}
                donationSources={dashboard.donationSources}
                campaignAllocation={dashboard.campaignAllocation}
                averageDonation={dashboard.analytics.averageDonation}
                repeatDonorRate={dashboard.analytics.repeatDonorRate}
                hasData={dashboard.kpis.successfulTransactions > 0}
              />
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">All Donations</h2>
              <AdminCard>
                {selectedIds.size > 0 ? (
                  <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                    <span className="text-sm font-medium text-slate-600">{selectedIds.size} selected</span>
                    {bulkActions.map((action) => {
                      const Icon = action.icon
                      return (
                        <button key={action.label} type="button" className={action.cls} onClick={() => act(action.run)}>
                          <Icon size={14} className="mr-1.5" />
                          {action.label}
                        </button>
                      )
                    })}
                  </div>
                ) : null}

                <DonationsTable
                  donations={dashboard.allDonations}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelection}
                  onToggleSelectAll={toggleSelectAll}
                  onRowClick={setActiveDonation}
                  onDownloadReceipt={handleDownloadReceipt}
                  loading={loading}
                />
              </AdminCard>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Finance & Compliance</h2>
              <div className="grid gap-5 xl:grid-cols-3">
                <AdminCard>
                  <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Payment Reconciliation</h3>
                  {dashboard.reconciliation.collected > 0 || dashboard.reconciliationHistory.length > 0 ? (
                    <div className="space-y-4">
                      <Metric label="Gateway Collected" value={formatIndianCompact(dashboard.reconciliation.collected)} />
                      <Metric label="Bank Settled" value={formatIndianCompact(dashboard.reconciliation.received)} />
                      <Metric label="Variance" value={formatIndianCompact(dashboard.reconciliation.difference)} warning={dashboard.reconciliation.difference > 0} />
                      <p className={`text-sm font-semibold ${dashboard.reconciliation.status === 'warning' ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {dashboard.reconciliation.status === 'warning' ? 'Settlement variance detected' : 'Reconciled'}
                      </p>
                    </div>
                  ) : (
                    <DonationEmptyState title="No settlement data" description="Reconciliation records appear when Razorpay settlements are synced." />
                  )}
                </AdminCard>

                <AdminCard>
                  <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Payment Funnel</h3>
                  {dashboard.paymentFunnel.started > 0 ? (
                    <div className="space-y-3">
                      <FunnelRow label="Payment Attempts" value={dashboard.paymentFunnel.started} total={dashboard.paymentFunnel.started} />
                      <FunnelRow label="Pending" value={dashboard.paymentFunnel.pending} total={dashboard.paymentFunnel.started} />
                      <FunnelRow label="Failed" value={dashboard.paymentFunnel.failed} total={dashboard.paymentFunnel.started} />
                      <FunnelRow label="Successful" value={dashboard.paymentFunnel.successful} total={dashboard.paymentFunnel.started} />
                    </div>
                  ) : (
                    <DonationEmptyState title="No payment attempts" description="Funnel metrics are computed from real donation statuses." />
                  )}
                </AdminCard>

                <AdminCard>
                  <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">80G Receipts</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniMetric label="Generated" value={dashboard.taxReceipts.generated} />
                    <MiniMetric label="Pending" value={dashboard.taxReceipts.pending} />
                    <MiniMetric label="Sent" value={dashboard.taxReceipts.sent} />
                    <MiniMetric label="Downloaded" value={dashboard.taxReceipts.downloaded} />
                  </div>
                  {dashboard.taxReceipts.generated + dashboard.taxReceipts.pending > 0 ? (
                    <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-500">Receipt coverage</span>
                        <span className="font-semibold text-[#0B2C6B]">{dashboard.receiptProgress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${dashboard.receiptProgress}%` }} />
                      </div>
                    </div>
                  ) : null}
                </AdminCard>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <AdminCard>
                  <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Compliance</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ComplianceChip label="80G" value={`${dashboard.compliance.eightyGGenerated} receipts`} status={dashboard.compliance.eightyGStatus} />
                    <ComplianceChip label="FCRA" value={`${dashboard.compliance.fcraDonations} donations`} status={dashboard.compliance.fcraStatus} />
                    <ComplianceChip label="CSR" value={`${dashboard.compliance.csrDonations} donations`} status={dashboard.compliance.csrStatus} />
                    <ComplianceChip label="Documents" value={`${dashboard.compliance.pendingDocuments} pending`} status={dashboard.compliance.pendingDocuments > 0 ? 'warning' : 'compliant'} />
                  </div>
                </AdminCard>

                <AdminCard>
                  <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Refund Management</h3>
                  {dashboard.refunds.length ? (
                    <div className="space-y-3">
                      {dashboard.refunds.map((refund) => {
                        const record = dashboard.allDonations.find((d) => d.id === refund.donationId)
                        return (
                          <div key={refund.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-[#0B2C6B]">{record?.donorLabel ?? refund.donationId.slice(0, 8)}</p>
                                <p className="text-xs text-slate-500">{refund.reason}</p>
                                <p className="text-xs text-slate-400">₹{refund.amount.toLocaleString('en-IN')}</p>
                              </div>
                              <StatusBadge status={refund.status} />
                            </div>
                            {refund.status === 'pending' ? (
                              <div className="mt-3 flex gap-2">
                                <button type="button" className={adminBtnPrimary} onClick={() => act(() => approveRefund(refund.id, refund.donationId))}>Approve</button>
                                <button type="button" className={adminBtnDanger} onClick={() => act(() => rejectRefund(refund.id, refund.donationId))}>Reject</button>
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <DonationEmptyState title="No refund requests" description="Refund workflows appear when finance submits or approves refund requests." />
                  )}
                </AdminCard>
              </div>
            </section>

            {dashboard.topDonors.length > 0 ? (
              <AdminCard>
                <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Top Donors · {range.toUpperCase()}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {dashboard.topDonors.map((donor) => (
                    <div key={donor.label} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                      <p className="font-medium text-[#0B2C6B]">{donor.label}</p>
                      <p className="text-xs text-slate-500">{donor.donationCount} donations</p>
                      <p className="mt-1 font-semibold text-emerald-700">{formatIndianCompact(donor.value)}</p>
                    </div>
                  ))}
                </div>
              </AdminCard>
            ) : null}
          </>
        ) : null}
      </div>

      <DonationDetailDrawer
        donation={activeDonation}
        onClose={() => setActiveDonation(null)}
        onSendReceipt={async (id) => act(() => markReceiptSent(id))}
        onDownloadReceipt={handleDownloadReceipt}
        onRefund={async (id, reason) => act(() => requestRefund(id, reason))}
        onSaveNotes={async (id, notes) => act(() => updateDonationNotes(id, notes))}
        onApproveRefund={async (refundId, donationId) => act(() => approveRefund(refundId, donationId))}
        onRejectRefund={async (refundId, donationId) => act(() => rejectRefund(refundId, donationId))}
        pendingRefundId={pendingRefundId}
      />
    </AdminShell>
  )
}

function QueueSection({
  title,
  count,
  empty,
  children,
}: {
  title: string
  count: number
  empty: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{count}</span>
      </div>
      <div className="space-y-3">
        {count ? children : <p className="text-sm text-slate-500">{empty}</p>}
      </div>
    </div>
  )
}

function QueueItem({ donation, children }: { donation: DonationOpsRecord; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-[#0B2C6B]">{donation.donorLabel}</p>
          <p className="text-xs text-slate-500">{donation.campaignTitle}</p>
        </div>
        <p className="text-sm font-semibold text-emerald-700">{formatIndianCompact(donation.amount)}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#0B2C6B]">{value}</p>
    </div>
  )
}

function Metric({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${warning ? 'border-amber-200 bg-amber-50/50' : 'border-[#E5E7EB] bg-[#F8FAFC]'}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${warning ? 'text-amber-700' : 'text-[#0B2C6B]'}`}>{value}</p>
    </div>
  )
}

function FunnelRow({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total > 0 ? Math.max(8, Math.round((value / total) * 100)) : 0
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-lg font-bold text-[#0B2C6B]">{value.toLocaleString('en-IN')}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

function ComplianceChip({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: 'compliant' | 'warning' | 'unknown'
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${
        status === 'warning' ? 'text-amber-700' : status === 'unknown' ? 'text-slate-500' : 'text-emerald-700'
      }`}>
        {status === 'warning' ? '⚠ Needs review' : status === 'unknown' ? '— No data' : '✓ Compliant'}
      </p>
      <p className="mt-1 text-xs text-slate-500">{value}</p>
    </div>
  )
}
