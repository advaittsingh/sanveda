import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartPoint } from '../../../lib/adminAnalytics'
import ChartCard from '../ui/ChartCard'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#8B5CF6', '#5B9AE8']

interface Props {
  donations: ChartPoint[]
  campaigns: ChartPoint[]
  volunteers: ChartPoint[]
  beneficiaries: ChartPoint[]
  finance: ChartPoint[]
  sources: ChartPoint[]
}

export default function DashboardCharts({ donations, campaigns, volunteers, beneficiaries, finance, sources }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Donations Over Time" subtitle="Last 6 months">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={donations}>
            <defs>
              <linearGradient id="donationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B2C6B" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0B2C6B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`₹${Number(v ?? 0).toLocaleString('en-IN')}`, 'Donations']} />
            <Area type="monotone" dataKey="value" stroke="#0B2C6B" fill="url(#donationGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Campaign Performance" subtitle="Raised vs goal">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={campaigns}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
            <Legend />
            <Bar dataKey="value" name="Raised" fill="#0B2C6B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="value2" name="Goal" fill="#0E4FA8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Volunteer Growth" subtitle="New applications per month">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={volunteers}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Beneficiary Growth" subtitle="New registrations per month">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={beneficiaries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Income vs Expenses" subtitle="Monthly comparison">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={finance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
            <Legend />
            <Bar dataKey="value" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="value2" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Donation Sources" subtitle="By campaign">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={sources} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={(entry) => String(entry.name ?? '')}>
              {sources.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
