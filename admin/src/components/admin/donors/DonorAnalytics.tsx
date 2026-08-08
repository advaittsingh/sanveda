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
  donationsByMonth: { label: string; value: number }[]
  topDonors: { name: string; value: number }[]
  donationSources: { label: string; value: number; pct: number }[]
}

export default function DonorAnalytics({ donationsByMonth, topDonors, donationSources }: Props) {
  const topDonorChart = topDonors.map((d) => ({
    label: d.name.length > 14 ? `${d.name.slice(0, 14)}…` : d.name,
    value: d.value,
  }))

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Donations by Month" subtitle="Fundraising trend">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={donationsByMonth.length ? donationsByMonth : [{ label: '—', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, 'Raised']} />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top Donors" subtitle="Lifetime giving leaders">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topDonorChart.length ? topDonorChart : [{ label: '—', value: 0 }]} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(value) => [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, 'Lifetime']} />
            <Bar dataKey="value" fill="#0E4FA8" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Donation Sources" subtitle="Channel mix">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={donationSources.length ? donationSources : [{ label: 'No data', value: 1, pct: 100 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={78}
              label={(entry) => `${String(entry.name ?? '')} ${entry.payload?.pct ?? 0}%`}
            >
              {(donationSources.length ? donationSources : [{ label: 'No data', value: 1, pct: 100 }]).map(
                (_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ),
              )}
            </Pie>
            <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
