import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../ui/ChartCard'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

interface Props {
  eventsByCategory: { label: string; value: number; pct: number }[]
  attendanceTrends: { label: string; value: number }[]
  registrationSources: { label: string; value: number; pct: number }[]
}

export default function EventAnalytics({ eventsByCategory, attendanceTrends, registrationSources }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Events by Category" subtitle="Event mix across programmes">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={eventsByCategory.length ? eventsByCategory : [{ label: 'No data', value: 1, pct: 100 }]}
              dataKey="value"
              nameKey="label"
              cx="50%" cy="50%" outerRadius={78}
              label={(e) => `${String(e.name ?? '')} ${e.payload?.pct ?? 0}%`}
            >
              {(eventsByCategory.length ? eventsByCategory : [{ label: 'No data', value: 1, pct: 100 }]).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Attendance Trends" subtitle="Registrations over time">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={attendanceTrends.length ? attendanceTrends : [{ label: '—', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Registration Sources" subtitle="How attendees discover events">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={registrationSources}
              dataKey="value"
              nameKey="label"
              cx="50%" cy="50%" outerRadius={78}
              label={(e) => `${String(e.name ?? '')} ${e.payload?.pct ?? 0}%`}
            >
              {registrationSources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
