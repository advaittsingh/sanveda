import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../ui/ChartCard'
import { formatIndianCompact } from '../../../lib/formatIndian'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

interface Props {
  categoryDistribution: { label: string; value: number; pct: number }[]
  monthlySpending: { label: string; value: number }[]
  budgetUtilization: { label: string; value: number; pct: number }[]
}

export default function ExpenseAnalytics({ categoryDistribution, monthlySpending, budgetUtilization }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Expenses by Category" subtitle="Spend breakdown">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={categoryDistribution.slice(0, 6)} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70}
              label={(e) => `${String(e.name ?? '')} ${e.payload?.pct ?? 0}%`}>
              {categoryDistribution.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Monthly Spending" subtitle="Expense trends">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlySpending}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatIndianCompact(Number(v))} />
            <Tooltip formatter={(v) => `₹${formatIndianCompact(Number(v ?? 0))}`} />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Budget Utilization" subtitle="By project">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={budgetUtilization}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={45} />
            <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
            <Tooltip formatter={(v) => [`${v}%`, 'Utilized']} />
            <Bar dataKey="pct" fill="#EF4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
