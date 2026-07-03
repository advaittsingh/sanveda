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
import { formatIndianCompact } from '../../../lib/formatIndian'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6']

interface Props {
  fundingDistribution: { label: string; value: number }[]
  beneficiaryDistribution: { label: string; value: number; pct: number }[]
  growthTrends: { label: string; value: number }[]
}

export default function FocusAreaAnalytics({ fundingDistribution, beneficiaryDistribution, growthTrends }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Funding Distribution" subtitle="By focus area">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={fundingDistribution.length ? fundingDistribution : [{ label: '—', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={55} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [`₹${formatIndianCompact(Number(value ?? 0))}`, 'Funding']} />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Beneficiary Distribution" subtitle="Share by focus area">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={beneficiaryDistribution.length ? beneficiaryDistribution : [{ label: 'No data', value: 1, pct: 100 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={78}
              label={(entry) => `${String(entry.name ?? '')} ${entry.payload?.pct ?? 0}%`}
            >
              {(beneficiaryDistribution.length ? beneficiaryDistribution : [{ label: 'No data', value: 1, pct: 100 }]).map(
                (_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />,
              )}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Growth Trends" subtitle="Monthly programme activity">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={growthTrends.length ? growthTrends : [{ label: '—', value: 0 }]}>
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
