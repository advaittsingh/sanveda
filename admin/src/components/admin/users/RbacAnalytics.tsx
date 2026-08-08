import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../ui/ChartCard'
import type { RbacDashboardData } from '../../../lib/adminUserOperationsService'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981']

interface Props {
  activityByDepartment: RbacDashboardData['activityByDepartment']
  moduleUsage: RbacDashboardData['moduleUsage']
}

export default function RbacAnalytics({ activityByDepartment, moduleUsage }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Admin Activity" subtitle="Activity share by role / department">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={activityByDepartment} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70}
              label={(e) => `${String(e.name ?? '')} ${e.payload?.pct ?? 0}%`}>
              {activityByDepartment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Module Usage" subtitle="Which modules admins use most">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={moduleUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v) => [`${v}%`, 'Usage']} />
            <Bar dataKey="pct" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
