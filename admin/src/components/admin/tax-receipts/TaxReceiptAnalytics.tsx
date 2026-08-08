import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '../ui/ChartCard'

const COLORS = ['#0B2C6B', '#0E4FA8', '#10B981']

interface Props {
  receiptsGeneratedTrend: { label: string; value: number }[]
  donationsByTaxCategory: { label: string; value: number; pct: number }[]
}

export default function TaxReceiptAnalytics({ receiptsGeneratedTrend, donationsByTaxCategory }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Receipts Generated" subtitle="Monthly volume">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={receiptsGeneratedTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#0B2C6B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Donations by Tax Category" subtitle="80G, CSR, and general">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={donationsByTaxCategory} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70}
              label={(e) => `${String(e.name ?? '')} ${e.payload?.pct ?? 0}%`}>
              {donationsByTaxCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
