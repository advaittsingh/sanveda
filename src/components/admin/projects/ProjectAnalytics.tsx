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

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B']

interface Props {
  projectsByFocus: { label: string; value: number; pct: number }[]
  budgetByFocus: { label: string; value: number }[]
  completionBreakdown: { label: string; value: number; pct: number }[]
}

export default function ProjectAnalytics({ projectsByFocus, budgetByFocus, completionBreakdown }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Projects by Focus Area" subtitle="Programme distribution">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={projectsByFocus.length ? projectsByFocus : [{ label: 'No data', value: 1, pct: 100 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={78}
              label={(entry) => `${String(entry.name ?? '')} ${entry.payload?.pct ?? 0}%`}
            >
              {(projectsByFocus.length ? projectsByFocus : [{ label: 'No data', value: 1, pct: 100 }]).map(
                (_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />,
              )}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Budget Distribution" subtitle="Allocated funds by focus">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={budgetByFocus.length ? budgetByFocus : [{ label: '—', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, 'Budget']} />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Project Completion" subtitle="Status breakdown">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={completionBreakdown.length ? completionBreakdown : [{ label: '—', value: 0, pct: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
