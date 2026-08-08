import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../ui/ChartCard'

interface Props {
  revenueTrend: { label: string; value: number }[]
  subscriberGrowth: { label: string; newSubscribers: number; cancelledSubscribers: number }[]
}

export default function MonthlyGivingAnalytics({ revenueTrend, subscriberGrowth }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Monthly Recurring Revenue" subtitle="Recurring revenue trend">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueTrend}>
            <defs>
              <linearGradient id="monthlyRevenueArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B2C6B" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#0B2C6B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`} />
            <Area type="monotone" dataKey="value" stroke="#0B2C6B" fill="url(#monthlyRevenueArea)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Subscriber Growth" subtitle="New vs cancelled subscribers">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={subscriberGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="newSubscribers" name="New Subscribers" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="cancelledSubscribers" name="Cancelled" fill="#EF4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
