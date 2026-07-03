import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../ui/ChartCard'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981']

interface Props {
  membershipGrowth: { label: string; value: number }[]
  tierDistribution: { label: string; value: number; pct: number }[]
  revenueByTier: { label: string; value: number }[]
}

export default function MembershipAnalytics({ membershipGrowth, tierDistribution, revenueByTier }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Membership Growth" subtitle="New members over time">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={membershipGrowth.length ? membershipGrowth : [{ label: '—', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tier Distribution" subtitle="Active member mix">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={tierDistribution.length ? tierDistribution : [{ label: 'No data', value: 1, pct: 100 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={78}
              label={(entry) => `${String(entry.name ?? '')} ${entry.payload?.pct ?? 0}%`}
            >
              {(tierDistribution.length ? tierDistribution : [{ label: 'No data', value: 1, pct: 100 }]).map(
                (_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />,
              )}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue by Memberships" subtitle="Contributions by tier">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueByTier.length ? revenueByTier : [{ label: '—', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, 'Revenue']} />
            <Bar dataKey="value" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
