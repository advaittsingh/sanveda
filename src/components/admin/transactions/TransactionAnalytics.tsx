import {
  Area,
  AreaChart,
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

const COLORS = ['#0B2C6B', '#0E4FA8', '#3B82F6', '#10B981', '#F59E0B']

interface Props {
  volumeTrend: { label: string; value: number }[]
  paymentMethodDistribution: { label: string; value: number }[]
  settlementOverview: Array<{ gateway: string; collected: number; settled: number; pending: number }>
}

export default function TransactionAnalytics({ volumeTrend, paymentMethodDistribution, settlementOverview }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Transactions Over Time" subtitle="Payment volume trend" className="min-h-0">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={volumeTrend}>
            <defs>
              <linearGradient id="transactionArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E4FA8" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#0E4FA8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`} />
            <Area type="monotone" dataKey="value" stroke="#0E4FA8" fill="url(#transactionArea)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Payment Method Distribution" subtitle="Collection mix by method">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={paymentMethodDistribution.length ? paymentMethodDistribution : [{ label: 'No data', value: 1 }]}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={84}
              label={(entry) => String(entry.name ?? '')}
            >
              {(paymentMethodDistribution.length ? paymentMethodDistribution : [{ label: 'No data', value: 1 }]).map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Settlement Status" subtitle="Gateway collection vs settlement">
        <div className="space-y-3">
          {settlementOverview.map((item) => {
            const pct = item.collected > 0 ? Math.round((item.settled / item.collected) * 100) : 0
            return (
              <div key={item.gateway} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#0B2C6B]">{item.gateway}</p>
                  <span className="text-xs font-semibold text-slate-500">{pct}% settled</span>
                </div>
                <div className="mb-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-[#0E4FA8]" style={{ width: `${pct}%` }} />
                </div>
                <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">Collected</span>
                    <span className="font-semibold text-[#0B2C6B]">{formatIndianCompact(item.collected)}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">Settled</span>
                    <span className="font-semibold text-emerald-700">{formatIndianCompact(item.settled)}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">Pending</span>
                    <span className="font-semibold text-amber-700">{formatIndianCompact(item.pending)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}
