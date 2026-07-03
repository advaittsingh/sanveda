import { useCallback, useEffect, useState } from 'react'
import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  FileSpreadsheet,
  Mail,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import AdminCard from '../../components/admin/ui/AdminCard'
import StatCard from '../../components/admin/ui/StatCard'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnDanger, adminBtnPrimary, adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import DonationAnalytics from '../../components/admin/donations/DonationAnalytics'
import DonationDetailDrawer from '../../components/admin/donations/DonationDetailDrawer'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  approveDonation,
  bulkGenerateReceipts,
  bulkSendReceipts,
  bulkVerifyDonations,
  exportDonationsCsv,
  getDonationDashboardData,
  markReceiptDownloaded,
  markReceiptSent,
  rejectDonation,
  requestDonationInfo,
  requestRefund,
  updateDonationNotes,
  type DonationDashboardData,
  type DonationOpsRecord,
} from '../../lib/donationOperationsService'
import { downloadReceipt, getDonationById } from '../../lib/donationService'
import { formatIndianCompact } from '../../lib/formatIndian'

export default function DonationsAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<DonationDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeDonation, setActiveDonation] = useState<DonationOpsRecord | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getDonationDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const selectedDonations = dashboard?.allDonations.filter((donation) => selectedIds.has(donation.id)) ?? []
  const allRecentSelected =
    dashboard?.recentDonations.length
      ? dashboard.recentDonations.every((donation) => selectedIds.has(donation.id))
      : false

  const bulkActions = [
    { label: 'Generate Receipts', run: async () => bulkGenerateReceipts(Array.from(selectedIds)), cls: adminBtnSecondary, icon: ReceiptText },
    { label: 'Send Email', run: async () => bulkSendReceipts(Array.from(selectedIds)), cls: adminBtnSecondary, icon: Mail },
    { label: 'Export CSV', run: async () => exportDonationsCsv(selectedDonations), cls: adminBtnSecondary, icon: FileSpreadsheet },
    { label: 'Mark Verified', run: async () => bulkVerifyDonations(Array.from(selectedIds)), cls: adminBtnPrimary, icon: BadgeCheck },
  ]

  if (!authed) {
    return <AdminLogin title="Donation Management" subtitle="View donation analytics and receipts." />
  }

  if (loading || !dashboard) {
    return (
      <AdminShell title="Donation Management" subtitle="Track donations, receipts, compliance, and donor operations">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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

  return (
    <AdminShell title="Donation Management" subtitle="Fundraising operations dashboard for revenue, receipts, reconciliation, and compliance">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard
            label="Total Raised"
            value={dashboard.kpis.totalRaised}
            prefix="₹"
            trend={dashboard.kpis.totalRaisedTrend}
            trendPositive={dashboard.kpis.totalRaisedPositive}
            icon={CircleDollarSign}
          />
          <StatCard label="Today's Donations" value={dashboard.kpis.today} prefix="₹" icon={Clock3} accent="secondary" />
          <StatCard label="This Month" value={dashboard.kpis.thisMonth} prefix="₹" icon={CircleDollarSign} accent="blue" />
          <StatCard label="Pending Verification" value={dashboard.kpis.pendingVerification} icon={BadgeCheck} accent="secondary" />
          <StatCard label="80G Receipts Pending" value={dashboard.kpis.receiptsPending} icon={ReceiptText} accent="green" />
          <StatCard label="Successful Transactions" value={dashboard.kpis.successfulTransactions} icon={ShieldCheck} accent="green" />
        </div>

        <DonationAnalytics
          donationsOverTime={dashboard.donationsOverTime}
          donationSources={dashboard.donationSources}
          campaignAllocation={dashboard.campaignAllocation}
        />

        <div className="grid gap-5 xl:grid-cols-3">
          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0B2C6B]">Pending Verification</h3>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {dashboard.pendingVerifications.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {dashboard.pendingVerifications.length ? dashboard.pendingVerifications.map((donation) => (
                <div key={donation.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <p className="font-medium text-[#0B2C6B]">{donation.donorLabel}</p>
                  <p className="text-xs text-slate-500">{donation.campaignTitle}</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">{formatIndianCompact(donation.amount)} · {donation.paymentMethod}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className={adminBtnPrimary} onClick={() => act(() => approveDonation(donation.id))}>Approve</button>
                    <button type="button" className={adminBtnDanger} onClick={() => act(() => rejectDonation(donation.id))}>Reject</button>
                    <button type="button" className={adminBtnSecondary} onClick={() => act(() => requestDonationInfo(donation.id))}>Request Info</button>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No donations are waiting for verification.</p>
              )}
            </div>
          </AdminCard>

          <AdminCard className="xl:col-span-2">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#0B2C6B]">Recent Donations</h3>
                <p className="mt-0.5 text-xs text-slate-500">Recent donations, tax receipts, and finance actions</p>
              </div>
              <button type="button" className={adminBtnSecondary} onClick={() => exportDonationsCsv(dashboard.allDonations)}>
                <FileSpreadsheet size={14} className="mr-1.5" />
                Export CSV
              </button>
            </div>

            {selectedIds.size > 0 && (
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
            )}

            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={allRecentSelected}
                          onChange={(e) => setSelectedIds(e.target.checked ? new Set(dashboard.recentDonations.map((d) => d.id)) : new Set())}
                          className="h-4 w-4 rounded"
                        />
                      </th>
                      {['Donor', 'Campaign', 'Amount', 'Payment', 'Tax', 'Status', 'Receipt', 'Actions'].map((header) => (
                        <th key={header} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentDonations.length ? dashboard.recentDonations.map((donation) => (
                      <tr
                        key={donation.id}
                        onClick={() => setActiveDonation(donation)}
                        className="cursor-pointer border-b border-[#E5E7EB]/80 last:border-0 hover:bg-[#F8FAFC]"
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(donation.id)}
                            onChange={() => toggleSelection(donation.id)}
                            className="h-4 w-4 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#0B2C6B]">{donation.donorLabel}</p>
                          <p className="text-xs text-slate-500">{donation.donorEmail ?? donation.donorPhone ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{donation.campaignTitle}</td>
                        <td className="px-4 py-3 font-semibold text-[#0B2C6B]">₹{donation.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-slate-700">{donation.paymentMethod}</td>
                        <td className="px-4 py-3 text-slate-700">{donation.taxExemption}</td>
                        <td className="px-4 py-3"><StatusBadge status={donation.status} /></td>
                        <td className="px-4 py-3 text-slate-700">{donation.receiptNumber ? 'PDF' : 'Pending'}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <button type="button" className={adminBtnSecondary} onClick={() => setActiveDonation(donation)}>View</button>
                            <button type="button" className={adminBtnSecondary} onClick={() => handleDownloadReceipt(donation.id)}>Receipt</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-sm text-slate-500">No donations recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <AdminCard>
            <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Top Donors</h3>
            <div className="space-y-3">
              {dashboard.topDonors.length ? dashboard.topDonors.map((donor) => (
                <div key={donor.label} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <div>
                    <p className="font-medium text-[#0B2C6B]">{donor.label}</p>
                    <p className="text-xs text-slate-500">{donor.donationCount} donations</p>
                  </div>
                  <p className="font-semibold text-emerald-700">{formatIndianCompact(donor.value)}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-500">Top donor insights will appear after completed donations.</p>
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Payment Reconciliation</h3>
            <div className="space-y-3">
              <MetricRow label="Razorpay / UPI Collected" value={formatIndianCompact(dashboard.reconciliation.collected)} />
              <MetricRow label="Received in Bank" value={formatIndianCompact(dashboard.reconciliation.received)} />
              <MetricRow label="Difference" value={formatIndianCompact(dashboard.reconciliation.difference)} highlight="text-amber-700" />
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Donation Funnel</h3>
            <div className="space-y-3">
              <FunnelRow label="Visitors" value={dashboard.funnel.visitors} total={dashboard.funnel.visitors} />
              <FunnelRow label="Clicked Donate" value={dashboard.funnel.clickedDonate} total={dashboard.funnel.visitors} />
              <FunnelRow label="Started Payment" value={dashboard.funnel.startedPayment} total={dashboard.funnel.visitors} />
              <FunnelRow label="Successful" value={dashboard.funnel.successful} total={dashboard.funnel.visitors} />
            </div>
          </AdminCard>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <AdminCard>
            <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">80G Receipts</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniMetric label="Generated" value={dashboard.taxReceipts.generated} />
              <MiniMetric label="Pending" value={dashboard.taxReceipts.pending} />
              <MiniMetric label="Sent" value={dashboard.taxReceipts.sent} />
              <MiniMetric label="Downloaded" value={dashboard.taxReceipts.downloaded} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={adminBtnSecondary} onClick={() => act(() => bulkGenerateReceipts(dashboard.allDonations.map((d) => d.id)))}>
                Generate Receipt
              </button>
              <button type="button" className={adminBtnSecondary} onClick={() => act(() => bulkSendReceipts(dashboard.allDonations.filter((d) => !!d.receiptNumber).map((d) => d.id)))}>
                Send Email
              </button>
              <button type="button" className={adminBtnSecondary} onClick={() => exportDonationsCsv(dashboard.allDonations)}>
                Download Report
              </button>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Compliance</h3>
            <div className="space-y-3">
              <MetricRow label="80G Generated" value={String(dashboard.compliance.eightyGGenerated)} />
              <MetricRow label="FCRA Donations" value={String(dashboard.compliance.fcraDonations)} />
              <MetricRow label="CSR Donations" value={String(dashboard.compliance.csrDonations)} />
              <MetricRow label="Pending Documents" value={String(dashboard.compliance.pendingDocuments)} highlight="text-amber-700" />
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Refund Management</h3>
            <div className="space-y-3">
              {dashboard.refunds.length ? dashboard.refunds.map((donation) => (
                <div key={donation.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#0B2C6B]">#{donation.id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-500">{donation.refundReason ?? 'Refund review'}</p>
                    </div>
                    <StatusBadge status={donation.status === 'refunded' ? 'refunded' : donation.refundStatus} />
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No refund requests right now.</p>
              )}
            </div>
          </AdminCard>
        </div>
      </div>

      <DonationDetailDrawer
        donation={activeDonation}
        onClose={() => setActiveDonation(null)}
        onSendReceipt={async (id) => act(() => markReceiptSent(id))}
        onDownloadReceipt={handleDownloadReceipt}
        onRefund={async (id, reason) => act(() => requestRefund(id, reason))}
        onSaveNotes={async (id, notes) => act(() => updateDonationNotes(id, notes))}
      />
    </AdminShell>
  )
}

function MetricRow({ label, value, highlight = 'text-[#0B2C6B]' }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight}`}>{value}</span>
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

function FunnelRow({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total > 0 ? Math.max(12, Math.round((value / total) * 100)) : 12
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-[#0B2C6B]">{value.toLocaleString('en-IN')}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
