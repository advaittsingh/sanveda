import {
  Area,
  AreaChart,
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

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

interface Props {
  donationsOverTime: { label: string; value: number }[]
  donationSources: { label: string; value: number }[]
  campaignAllocation: { label: string; value: number }[]
}

export default function DonationAnalytics({ donationsOverTime, donationSources, campaignAllocation }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Donations Over Time" subtitle="Monthly fundraising trend" className="xl:col-span-2">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={donationsOverTime}>
            <defs>
              <linearGradient id="donationArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B2C6B" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#0B2C6B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, 'Raised']} />
            <Area type="monotone" dataKey="value" stroke="#0B2C6B" fill="url(#donationArea)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Donation Sources" subtitle="Collection mix by source">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={donationSources.length ? donationSources : [{ label: 'No data', value: 1 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={84}
              label={(entry) => String(entry.name ?? '')}
            >
              {(donationSources.length ? donationSources : [{ label: 'No data', value: 1 }]).map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Campaign Allocation" subtitle="Funds by campaign category" className="xl:col-span-3">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={campaignAllocation.length ? campaignAllocation : [{ label: 'No data', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`} />
            <Bar dataKey="value" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
