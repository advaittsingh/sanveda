import AdminCard from '../ui/AdminCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { BudgetRecord } from '../../../lib/financeOperationsService'

interface Props {
  budgets: BudgetRecord[]
}

export default function FinanceBudgetsPanel({ budgets }: Props) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Budget Management</h3>
      <div className="space-y-5">
        {budgets.map((b) => (
          <div key={b.id} className="rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-[#0B2C6B]">{b.program}</h4>
                <p className="text-xs text-slate-500">{b.focusArea} · Budget: ₹{formatIndianCompact(b.budget)}</p>
              </div>
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">{b.utilizationPct}% utilized</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-xs text-slate-500">Allocated</p><p className="font-semibold">₹{formatIndianCompact(b.allocated)}</p></div>
              <div><p className="text-xs text-slate-500">Utilized</p><p className="font-semibold">₹{formatIndianCompact(b.utilized)}</p></div>
              <div><p className="text-xs text-slate-500">Remaining</p><p className="font-semibold text-emerald-700">₹{formatIndianCompact(b.remaining)}</p></div>
            </div>
            <div className="mt-3">
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${b.utilizationPct}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
