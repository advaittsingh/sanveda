import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../ui/ChartCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { CmsDashboardData } from '../../../lib/cmsOperationsService'

interface Props {
  trafficTrend: CmsDashboardData['trafficTrend']
  analytics: CmsDashboardData['analytics']
}

export default function CmsAnalytics({ trafficTrend, analytics }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Visitors', value: formatIndianCompact(analytics.visitors) },
          { label: 'Page Views', value: formatIndianCompact(analytics.pageViews) },
          { label: 'Bounce Rate', value: `${analytics.bounceRate}%` },
          { label: 'Donation Conversion', value: `${analytics.donationConversion}%` },
          { label: 'Top Page', value: analytics.topPages[0] ?? '—' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <p className="text-xs font-semibold uppercase text-slate-500">{m.label}</p>
            <p className="mt-1 text-lg font-bold text-[#0B2C6B]">{m.value}</p>
          </div>
        ))}
      </div>
      <ChartCard title="Website Traffic" subtitle="Monthly visitors">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trafficTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatIndianCompact(Number(v))} />
            <Tooltip formatter={(v) => formatIndianCompact(Number(v ?? 0))} />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
