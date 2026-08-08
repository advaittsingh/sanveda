import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../ui/ChartCard'
import type { AuditDashboardData } from '../../../lib/auditOperationsService'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#94A3B8']

interface Props {
  actionsByModule: AuditDashboardData['actionsByModule']
  adminActivity: AuditDashboardData['adminActivity']
}

export default function AuditAnalytics({ actionsByModule, adminActivity }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Actions by Module" subtitle="Audit event distribution">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={actionsByModule} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70}
              label={(e) => `${String(e.name ?? '')} ${e.payload?.pct ?? 0}%`}>
              {actionsByModule.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Admin Activity" subtitle="Actions by admin user">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={adminActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
            <Bar dataKey="pct" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
