import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import ChartCard from '../ui/ChartCard'
import { formatIndianCompact } from '../../../lib/formatIndian'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

interface Props {
  incomeSourceDistribution: { label: string; value: number; pct: number }[]
  monthlyRevenue: { label: string; value: number }[]
  budgetUtilization: { label: string; value: number; pct: number }[]
}

export default function FinanceAnalytics({ incomeSourceDistribution, monthlyRevenue, budgetUtilization }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Income Sources" subtitle="Revenue breakdown">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={incomeSourceDistribution.slice(0, 6)} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70}
              label={(e) => `${String(e.name ?? '')} ${e.payload?.pct ?? 0}%`}>
              {incomeSourceDistribution.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => `₹${formatIndianCompact(Number(v ?? 0))}`} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly Revenue" subtitle="Income trends">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatIndianCompact(Number(v))} />
            <Tooltip formatter={(v) => `₹${formatIndianCompact(Number(v ?? 0))}`} />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Budget Utilization" subtitle="By focus area">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={budgetUtilization}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
            <Tooltip formatter={(v, _n, p) => [`${v}% (${formatIndianCompact((p.payload as { value: number }).value)})`, 'Utilized']} />
            <Bar dataKey="pct" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
