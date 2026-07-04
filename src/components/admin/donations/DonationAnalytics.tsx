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
import DonationEmptyState from './DonationEmptyState'

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

interface Props {
  donationsOverTime: { label: string; value: number }[]
  donationSources: { label: string; value: number }[]
  campaignAllocation: { label: string; value: number }[]
  averageDonation: number
  repeatDonorRate: number
  hasData: boolean
}

export default function DonationAnalytics({
  donationsOverTime,
  donationSources,
  campaignAllocation,
  averageDonation,
  repeatDonorRate,
  hasData,
}: Props) {
  if (!hasData) {
    return (
      <DonationEmptyState
        title="No donation analytics yet"
        description="Charts will populate automatically when completed donations are recorded."
      />
    )
  }

  const hasTimeData = donationsOverTime.some((d) => d.value > 0)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Average Donation</p>
          <p className="mt-1 text-2xl font-bold text-[#0B2C6B]">₹{averageDonation.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Repeat Donor Rate</p>
          <p className="mt-1 text-2xl font-bold text-[#0B2C6B]">{repeatDonorRate}%</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard title="Donations Over Time" subtitle="Fundraising trend" className="min-h-[280px]">
          {hasTimeData ? (
            <ResponsiveContainer width="100%" height={220}>
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
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">No donations in this period.</p>
          )}
        </ChartCard>

        <ChartCard title="Donation Sources" subtitle="Collection mix" className="min-h-[280px]">
          {donationSources.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donationSources} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={84} label={(entry) => String(entry.name ?? '')}>
                  {donationSources.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">No source data yet.</p>
          )}
        </ChartCard>

        <ChartCard title="Campaign Allocation" subtitle="Funds by campaign" className="min-h-[280px]">
          {campaignAllocation.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={campaignAllocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`} />
                <Bar dataKey="value" fill="#0E4FA8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">No campaign allocation data yet.</p>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
