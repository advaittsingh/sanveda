import type { FinancialOverview } from '../../../lib/operationsDashboardService'
import { formatIndianCompact } from '../../../lib/formatIndian'
import AdminCard from '../ui/AdminCard'

export default function FinancialOverviewWidget({ financial }: { financial: FinancialOverview }) {
  const rows = [
    { label: 'Funds Raised', value: financial.fundsRaised, cls: 'text-emerald-700 bg-emerald-50' },
    { label: 'Disbursed', value: financial.disbursed, cls: 'text-sky-700 bg-sky-50' },
    { label: 'Operational Cost', value: financial.operationalCost, cls: 'text-amber-700 bg-amber-50' },
    { label: 'Available', value: financial.available, cls: 'text-[#0B2C6B] bg-[#0B2C6B]/5' },
  ]

  return (
    <AdminCard>
      <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Financial Overview</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className={`rounded-xl p-4 ${row.cls}`}>
            <p className="text-xs font-medium opacity-80">{row.label}</p>
            <p className="text-xl font-bold">{formatIndianCompact(row.value)}</p>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
