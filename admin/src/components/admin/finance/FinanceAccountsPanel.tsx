import AdminCard from '../ui/AdminCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { ChartAccount } from '../../../lib/financeOperationsService'

interface Props {
  accounts: ChartAccount[]
}

const typeLabels: Record<string, string> = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  income: 'Income',
  expense: 'Expenses',
  grant: 'Grants',
  restricted: 'Restricted Funds',
}

export default function FinanceAccountsPanel({ accounts }: Props) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Chart of Accounts</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.code} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{a.code}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
                <td className="px-4 py-3 text-slate-600">{typeLabels[a.type] ?? a.type}</td>
                <td className="px-4 py-3 font-semibold text-[#0B2C6B]">₹{formatIndianCompact(a.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  )
}
