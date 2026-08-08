import { formatIndianCompact } from '../../../lib/formatIndian'
import AdminCard from '../ui/AdminCard'

export default function FundraisingProgressWidget({ raised, goal }: { raised: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0

  return (
    <AdminCard>
      <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Monthly Fundraising Goal</h3>
      <p className="mb-2 text-lg font-bold text-[#0B2C6B]">
        {formatIndianCompact(raised)} <span className="text-sm font-normal text-slate-500">/ {formatIndianCompact(goal)}</span>
      </p>
      <div className="mb-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-[#0B2C6B] to-[#0E4FA8] transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm font-semibold text-[#0E4FA8]">{pct}% of monthly goal</p>
    </AdminCard>
  )
}
