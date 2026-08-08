import type { DonationPeriodStats } from '../../../types/campaignAdmin'
import { formatIndianCompact } from '../../../lib/formatIndian'
import AdminCard from '../ui/AdminCard'

export default function DonationStatsWidget({ stats }: { stats: DonationPeriodStats }) {
  const rows = [
    { label: 'Today', value: stats.today },
    { label: 'This Week', value: stats.thisWeek },
    { label: 'This Month', value: stats.thisMonth },
  ]

  return (
    <AdminCard>
      <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Donation Stats</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <p className="text-xs font-medium text-slate-500">{row.label}</p>
            <p className="text-lg font-bold text-[#0B2C6B]">{formatIndianCompact(row.value)}</p>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
