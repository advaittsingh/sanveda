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

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6']

interface Props {
  uploadTrends: { label: string; value: number }[]
  contentDistribution: { label: string; value: number; pct: number }[]
  categoryUsage: { label: string; value: number; pct: number }[]
  storageBreakdown: { label: string; valueGb: number }[]
}

export default function GalleryAnalytics({ uploadTrends, contentDistribution, categoryUsage, storageBreakdown }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
      <ChartCard title="Upload Trends" subtitle="Monthly media uploads">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={uploadTrends.length ? uploadTrends : [{ label: '—', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Content Distribution" subtitle="Photos, videos, documents">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={contentDistribution.length ? contentDistribution : [{ label: 'No data', value: 1, pct: 100 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={(entry) => `${String(entry.name ?? '')} ${entry.payload?.pct ?? 0}%`}
            >
              {(contentDistribution.length ? contentDistribution : [{ label: 'No data', value: 1, pct: 100 }]).map(
                (_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />,
              )}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Category Usage" subtitle="Media by album category">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryUsage.length ? categoryUsage.slice(0, 6) : [{ label: '—', value: 0, pct: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Storage Management" subtitle="Usage by media type">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={storageBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit=" GB" />
            <Tooltip formatter={(v) => [`${v} GB`, 'Storage']} />
            <Bar dataKey="valueGb" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
