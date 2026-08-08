import AdminCard from '../ui/AdminCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { BankAccount } from '../../../lib/financeOperationsService'

interface Props {
  accounts: BankAccount[]
}

export default function FinanceBankAccounts({ accounts }: Props) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Bank Accounts</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a) => (
          <div key={a.id} className="rounded-xl border border-[#E5E7EB] p-4">
            <h4 className="font-semibold text-[#0B2C6B]">{a.name}</h4>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-slate-500">Opening</p><p className="font-semibold">₹{formatIndianCompact(a.opening)}</p></div>
              <div><p className="text-slate-500">Credits</p><p className="font-semibold text-emerald-700">+₹{formatIndianCompact(a.credits)}</p></div>
              <div><p className="text-slate-500">Debits</p><p className="font-semibold text-red-600">-₹{formatIndianCompact(a.debits)}</p></div>
              <div><p className="text-slate-500">Closing</p><p className="font-semibold text-[#0B2C6B]">₹{formatIndianCompact(a.closing)}</p></div>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
