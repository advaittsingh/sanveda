import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../ui/ChartCard'
import { formatIndianCompact } from '../../../lib/formatIndian'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

interface Props {
  donationTrends: { label: string; value: number }[]
  expenseDistribution: { label: string; value: number; pct: number }[]
  geographicImpact: { label: string; value: number }[]
}

export default function ReportAnalytics({ donationTrends, expenseDistribution, geographicImpact }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Donation Trends" subtitle="Monthly inflow">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={donationTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatIndianCompact(Number(v))} />
            <Tooltip formatter={(v) => `₹${formatIndianCompact(Number(v ?? 0))}`} />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Expense Distribution" subtitle="By programme area">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={expenseDistribution} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70}
              label={(e) => `${String(e.name ?? '')} ${e.payload?.pct ?? 0}%`}>
              {expenseDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Geographic Impact" subtitle="Beneficiaries by city">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={geographicImpact} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={60} />
            <Tooltip />
            <Bar dataKey="value" fill="#0E4FA8" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
