import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../ui/ChartCard'
import { formatIndianCompact } from '../../../lib/formatIndian'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B']

interface Props {
  viewsTrend: { label: string; value: number }[]
  categoryEngagement: { label: string; value: number; pct: number }[]
}

export default function BlogAnalytics({ viewsTrend, categoryEngagement }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Article Views" subtitle="Monthly traffic">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={viewsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatIndianCompact(Number(v))} />
            <Tooltip formatter={(v) => formatIndianCompact(Number(v ?? 0))} />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Category Engagement" subtitle="Content performance by category">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={categoryEngagement} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70}
              label={(e) => `${String(e.name ?? '').slice(0, 12)} ${e.payload?.pct ?? 0}%`}>
              {categoryEngagement.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
