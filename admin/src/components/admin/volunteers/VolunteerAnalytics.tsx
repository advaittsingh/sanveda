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
  volunteersByDepartment: { label: string; value: number; pct: number }[]
  volunteerGrowth: { label: string; value: number }[]
  retentionRates: { label: string; value: number }[]
  hoursByDepartment: { label: string; hours: number }[]
}

export default function VolunteerAnalytics({
  volunteersByDepartment,
  volunteerGrowth,
  retentionRates,
  hoursByDepartment,
}: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
      <ChartCard title="Volunteers by Department" subtitle="Active distribution">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={volunteersByDepartment.length ? volunteersByDepartment : [{ label: 'No data', value: 1, pct: 100 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={(entry) => `${String(entry.name ?? '')} ${entry.payload?.pct ?? 0}%`}
            >
              {(volunteersByDepartment.length ? volunteersByDepartment : [{ label: 'No data', value: 1, pct: 100 }]).map(
                (_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ),
              )}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Volunteer Growth" subtitle="Applications over time">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={volunteerGrowth.length ? volunteerGrowth : [{ label: '—', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Volunteer Retention" subtitle="Cohort retention rates">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={retentionRates}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, 'Retention']} />
            <Bar dataKey="value" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Volunteer Hours" subtitle="Hours by department">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hoursByDepartment.length ? hoursByDepartment : [{ label: '—', hours: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [`${value} hrs`, 'Hours']} />
            <Bar dataKey="hours" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
