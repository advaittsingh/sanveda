import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CircleDollarSign,
  Download,
  HeartHandshake,
  Mail,
  RefreshCcw,
  Repeat,
  TrendingUp,
  UserPlus,
  UserRoundX,
} from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import MonthlyGivingAnalytics from '../../components/admin/monthly-giving/MonthlyGivingAnalytics'
import AdminCard from '../../components/admin/ui/AdminCard'
import StatCard from '../../components/admin/ui/StatCard'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnDanger, adminBtnPrimary, adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { formatIndianCompact } from '../../lib/formatIndian'
import {
  cancelSubscriber,
  exportMonthlyGivingCsv,
  exportMonthlyGivingPdf,
  getMonthlyGivingDashboardData,
  markSubscriberContacted,
  pauseSubscriber,
  resumeSubscriber,
  retryFailedRenewal,
  updateSubscriberNotes,
  type MonthlyGivingDashboardData,
} from '../../lib/monthlyGivingService'

function formatMonth(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { month: 'short' })
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function donorInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function rankLabel(index: number) {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `${index + 1}.`
}

function renewalUrgency(nextBillingDate: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(nextBillingDate).getTime()) / 86400000))
  if (days < 3) return { days, tone: 'green' as const }
  if (days <= 7) return { days, tone: 'yellow' as const }
  return { days, tone: 'red' as const }
}

const urgencyStyles = {
  green: 'border-emerald-200 bg-emerald-50',
  yellow: 'border-amber-200 bg-amber-50',
  red: 'border-red-200 bg-red-50',
}

const urgencyDot = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
}

export default function MonthlyGivingAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<MonthlyGivingDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>('')
  const [noteDraft, setNoteDraft] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getMonthlyGivingDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  useEffect(() => {
    if (!dashboard) return
    if (!selectedId) {
      setSelectedId(dashboard.recentSubscribers[0]?.id ?? dashboard.subscribers[0]?.id ?? '')
      return
    }
    const exists = dashboard.subscribers.some((subscriber) => subscriber.id === selectedId)
    if (!exists) setSelectedId(dashboard.recentSubscribers[0]?.id ?? dashboard.subscribers[0]?.id ?? '')
  }, [dashboard, selectedId])

  const selectedSubscriber = useMemo(
    () => dashboard?.subscribers.find((subscriber) => subscriber.id === selectedId) ?? null,
    [dashboard, selectedId],
  )

  useEffect(() => {
    setNoteDraft(selectedSubscriber?.notes ?? '')
  }, [selectedSubscriber])

  if (!authed) {
    return (
      <AdminLogin
        title="Monthly Giving"
        subtitle="Manage recurring donations, subscriber retention, renewals and donor lifetime value."
      />
    )
  }

  if (loading || !dashboard) {
    return (
      <AdminShell
        title="Monthly Giving"
        subtitle="Manage recurring donations, subscriber retention, renewals and donor lifetime value."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const act = async (fn: () => Promise<void>) => {
    await fn()
    await refresh()
  }

  const headerActions = (
    <>
      <button type="button" className={adminBtnSecondary} onClick={() => exportMonthlyGivingCsv(dashboard.subscribers)}>
        <Download size={14} className="mr-1.5" />
        Export CSV
      </button>
      <button type="button" className={adminBtnSecondary} onClick={() => exportMonthlyGivingPdf(dashboard)}>
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
      title="Monthly Giving"
      subtitle="Manage recurring donations, subscriber retention, renewals and donor lifetime value."
      actions={headerActions}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard
            label="Active Subscribers"
            value={dashboard.kpis.activeSubscribers}
            trend={dashboard.kpis.subscriberTrend}
            trendPositive={dashboard.kpis.subscriberTrendPositive}
            sub="current recurring base"
            icon={Repeat}
          />
          <StatCard
            label="Monthly Recurring Revenue"
            value={dashboard.kpis.monthlyRecurringRevenue}
            prefix="₹"
            trend={dashboard.kpis.revenueTrend}
            trendPositive={dashboard.kpis.revenueTrendPositive}
            sub="predictable monthly income"
            icon={CircleDollarSign}
            accent="green"
          />
          <StatCard label="New This Month" value={dashboard.kpis.newThisMonth} sub="fresh recurring signups" icon={UserPlus} accent="blue" />
          <StatCard label="Cancelled" value={dashboard.kpis.cancelledThisMonth} sub="lost subscribers this month" icon={UserRoundX} accent="secondary" />
          <StatCard label="Renewal Rate" value={dashboard.kpis.renewalRate} suffix="%" sub="successful billing recoveries" icon={TrendingUp} accent="green" />
          <StatCard label="Lifetime Value" value={dashboard.kpis.lifetimeValue} prefix="₹" sub="average recurring donor value" icon={HeartHandshake} accent="secondary" />
        </div>

        <MonthlyGivingAnalytics
          revenueTrend={dashboard.revenueTrend}
          subscriberGrowth={dashboard.subscriberGrowth}
        />

        <div className="grid gap-5 xl:grid-cols-4">
          <div className="grid gap-4 md:grid-cols-3 xl:col-span-3">
            {dashboard.planSummaries.map((plan) => (
              <AdminCard key={plan.id} className="p-0">
                <div className="border-b border-[#E5E7EB] px-5 py-4">
                  <p className="text-sm font-semibold text-[#0B2C6B]">{plan.name}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-[#0B2C6B]">₹{plan.amount}/month</p>
                </div>
                <div className="grid gap-3 px-5 py-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subscribers</span>
                    <span className="font-semibold text-[#0B2C6B]">{plan.subscribers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">MRR</span>
                    <span className="font-semibold text-emerald-700">{formatIndianCompact(plan.mrr)}</span>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>

          <AdminCard>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#0B2C6B]">Churn Analytics</h3>
              <p className="mt-0.5 text-xs text-slate-500">Retention health of recurring supporters</p>
            </div>
            <div className="space-y-3">
              <MetricTile label="Current Churn" value={`${dashboard.churn.currentChurn}%`} tone="warning" />
              <MetricTile label="Retention" value={`${dashboard.churn.retention}%`} tone="success" />
              <MetricTile label="Renewals" value={`${dashboard.churn.renewals}%`} tone="primary" />
            </div>
          </AdminCard>
        </div>

        <AdminCard>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0B2C6B]">Recent Subscribers</h3>
              <p className="mt-0.5 text-xs text-slate-500">Recurring donor roster with renewals and retention actions</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <th className="px-4 py-3 font-semibold text-slate-500">Donor</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Plan</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Amount</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Start</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Next Billing</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentSubscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className={`border-b border-[#E5E7EB] ${selectedId === subscriber.id ? 'bg-[#0B2C6B]/3' : 'bg-white'}`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-[#0B2C6B]">{subscriber.donorName}</p>
                          <p className="text-xs text-slate-500">{subscriber.donorEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{subscriber.planId}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">{formatIndianCompact(subscriber.amount)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatMonth(subscriber.startDate)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatMonth(subscriber.nextBillingDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={subscriber.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={adminBtnSecondary} onClick={() => setSelectedId(subscriber.id)}>View</button>
                          {subscriber.status === 'paused' ? (
                            <button type="button" className={adminBtnPrimary} onClick={() => act(() => resumeSubscriber(subscriber.id))}>Resume</button>
                          ) : subscriber.status !== 'cancelled' ? (
                            <button type="button" className={adminBtnSecondary} onClick={() => act(() => pauseSubscriber(subscriber.id))}>Pause</button>
                          ) : null}
                          {subscriber.status !== 'cancelled' ? (
                            <button type="button" className={adminBtnDanger} onClick={() => act(() => cancelSubscriber(subscriber.id))}>Cancel</button>
                          ) : null}
                          <button
                            type="button"
                            className={adminBtnSecondary}
                            onClick={async () => {
                              await act(() => markSubscriberContacted(subscriber.id))
                              window.location.href = `mailto:${subscriber.donorEmail}`
                            }}
                          >
                            Email
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

        <div className="grid gap-5 lg:grid-cols-2">
          <AdminCard>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#0B2C6B]">Failed Renewals</h3>
              <p className="mt-0.5 text-xs text-slate-500">Subscribers waiting for billing recovery</p>
            </div>
            <div className="space-y-3">
              {dashboard.failedRenewals.length ? dashboard.failedRenewals.map((subscriber) => {
                const urgency = renewalUrgency(subscriber.nextBillingDate)
                return (
                  <div
                    key={subscriber.id}
                    className={`rounded-xl border p-3 ${urgencyStyles[urgency.tone]}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${urgencyDot[urgency.tone]}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#0B2C6B]">{subscriber.donorName}</p>
                        <p className="text-sm font-semibold text-slate-700">{formatIndianCompact(subscriber.amount)} due</p>
                        <p className="text-xs text-slate-500">{formatShortDate(subscriber.nextBillingDate)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 pl-5">
                      <button type="button" className={adminBtnPrimary} onClick={() => act(() => retryFailedRenewal(subscriber.id))}>
                        Retry
                      </button>
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        onClick={async () => {
                          await act(() => markSubscriberContacted(subscriber.id))
                          window.location.href = `mailto:${subscriber.donorEmail}`
                        }}
                      >
                        Reminder
                      </button>
                    </div>
                  </div>
                )
              }) : (
                <p className="text-sm text-slate-500">No failed renewals in the queue.</p>
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#0B2C6B]">Top Subscribers</h3>
              <p className="mt-0.5 text-xs text-slate-500">Highest recurring donor lifetime value</p>
            </div>
            <div className="space-y-2">
              {dashboard.topSubscribers.map((subscriber, index) => (
                <div key={subscriber.name} className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2.5">
                  <span className="w-6 shrink-0 text-center text-sm">{rankLabel(index)}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B2C6B]/10 text-xs font-bold text-[#0B2C6B]">
                    {donorInitials(subscriber.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#0B2C6B]">{subscriber.name}</p>
                    <p className="text-xs text-slate-500">{subscriber.planName}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-emerald-700">{formatIndianCompact(subscriber.value)}</p>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <AdminCard>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#0B2C6B]">Projected Revenue</h3>
              <p className="mt-0.5 text-xs text-slate-500">Forecasting predictable fundraising income</p>
            </div>
            <div className="divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB]">
              <ForecastRow label="Next Month" value={formatIndianCompact(dashboard.forecast.nextMonth)} />
              <ForecastRow label="Next Quarter" value={formatIndianCompact(dashboard.forecast.nextQuarter)} />
              <ForecastRow label="Next Year" value={formatIndianCompact(dashboard.forecast.nextYear)} />
            </div>
            <p className={`mt-4 text-sm font-semibold ${dashboard.forecast.yoyGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {dashboard.forecast.yoyGrowth >= 0 ? '+' : ''}{dashboard.forecast.yoyGrowth}% YoY Growth
            </p>
          </AdminCard>

          {selectedSubscriber ? (
            <AdminCard>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#0B2C6B]">Subscriber Spotlight</h3>
                <p className="mt-0.5 text-xs text-slate-500">Selected subscriber profile and stewardship</p>
              </div>

              <div className="flex items-start gap-3 border-b border-[#E5E7EB] pb-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B2C6B]/10 text-sm font-bold text-[#0B2C6B]">
                  {donorInitials(selectedSubscriber.donorName)}
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-[#0B2C6B]">{selectedSubscriber.donorName}</p>
                  <p className="text-sm capitalize text-slate-600">{selectedSubscriber.planId} Plan</p>
                  <p className="text-sm font-semibold text-emerald-700">{formatIndianCompact(selectedSubscriber.lifetimeValue)} lifetime value</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SpotlightField label="Start Date" value={formatShortDate(selectedSubscriber.startDate)} />
                <SpotlightField label="Next Billing" value={formatShortDate(selectedSubscriber.nextBillingDate)} />
                <SpotlightField label="Last Payment" value={formatShortDate(selectedSubscriber.lastPaymentDate)} />
                <SpotlightField label="Status" value={selectedSubscriber.status} />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Stewardship Notes</label>
                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  rows={2}
                  placeholder="Prefers concise monthly updates..."
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className={adminBtnPrimary} onClick={() => act(() => updateSubscriberNotes(selectedSubscriber.id, noteDraft))}>
                  Save Notes
                </button>
                <button
                  type="button"
                  className={adminBtnSecondary}
                  onClick={async () => {
                    await act(() => markSubscriberContacted(selectedSubscriber.id))
                    window.location.href = `mailto:${selectedSubscriber.donorEmail}`
                  }}
                >
                  <Mail size={14} className="mr-1.5" />
                  Email Donor
                </button>
              </div>
            </AdminCard>
          ) : (
            <AdminCard>
              <p className="text-sm text-slate-500">Select a subscriber from the table to view their profile.</p>
            </AdminCard>
          )}
        </div>
      </div>
    </AdminShell>
  )
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'primary' | 'success' | 'warning'
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-[#0B2C6B]/10 text-[#0B2C6B]'

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-sm font-semibold ${toneClass}`}>{value}</div>
    </div>
  )
}

function ForecastRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-[#0B2C6B]">{value}</span>
    </div>
  )
}

function SpotlightField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium capitalize text-[#0B2C6B]">{value}</p>
    </div>
  )
}
