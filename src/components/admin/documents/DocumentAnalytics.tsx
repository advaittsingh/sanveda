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
  uploadTrends: { label: string; value: number }[]
  categoryUsage: { label: string; value: number; pct: number }[]
  analytics: { downloads: number; views: number; shares: number; publicAccess: number }
}

export default function DocumentAnalytics({ uploadTrends, categoryUsage, analytics }: Props) {
  const engagementData = [
    { label: 'Downloads', value: analytics.downloads },
    { label: 'Views', value: analytics.views },
    { label: 'Shares', value: analytics.shares },
    { label: 'Public Access', value: analytics.publicAccess },
  ]

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Upload Trends" subtitle="Documents added per month">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={uploadTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Category Usage" subtitle="Documents by category">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={categoryUsage.length ? categoryUsage.slice(0, 6) : [{ label: 'No data', value: 1, pct: 100 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={(entry) => `${String(entry.name ?? '')} ${entry.payload?.pct ?? 0}%`}
            >
              {(categoryUsage.length ? categoryUsage.slice(0, 6) : [{ label: 'No data', value: 1, pct: 100 }]).map(
                (_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />,
              )}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Document Analytics" subtitle="Engagement metrics">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={45} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
