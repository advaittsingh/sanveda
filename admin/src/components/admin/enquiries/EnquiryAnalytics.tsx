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

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

interface Props {
  categoryDistribution: { label: string; value: number; pct: number }[]
  monthlyTrends: { label: string; value: number }[]
  resolutionBreakdown: { label: string; value: number; pct: number }[]
}

export default function EnquiryAnalytics({ categoryDistribution, monthlyTrends, resolutionBreakdown }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Enquiries by Category" subtitle="Lead source breakdown">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={categoryDistribution.length ? categoryDistribution.slice(0, 6) : [{ label: 'No data', value: 1, pct: 100 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={(entry) => `${String(entry.name ?? '')} ${entry.payload?.pct ?? 0}%`}
            >
              {(categoryDistribution.length ? categoryDistribution.slice(0, 6) : [{ label: 'No data', value: 1, pct: 100 }]).map(
                (_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />,
              )}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly Trends" subtitle="Enquiry volume">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Resolution Rate" subtitle="Open vs resolved vs escalated">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={resolutionBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, _n, p) => [`${v} (${(p.payload as { pct: number }).pct}%)`, 'Count']} />
            <Bar dataKey="value" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
