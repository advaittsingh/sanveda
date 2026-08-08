import AdminCard from '../ui/AdminCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { FundBucket } from '../../../lib/financeOperationsService'

interface Props {
  restricted: FundBucket[]
  unrestricted: FundBucket[]
}

function FundList({ title, funds }: { title: string; funds: FundBucket[] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-[#0B2C6B]">{title}</h4>
      <ul className="space-y-2">
        {funds.map((f) => (
          <li key={f.name} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <span className="text-sm font-medium text-slate-800">{f.name}</span>
            <span className="text-sm font-semibold text-[#0B2C6B]">₹{formatIndianCompact(f.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FinanceFundAccounting({ restricted, unrestricted }: Props) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Fund Accounting</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <FundList title="Restricted Funds" funds={restricted} />
        <FundList title="Unrestricted Funds" funds={unrestricted} />
      </div>
    </AdminCard>
  )
}
