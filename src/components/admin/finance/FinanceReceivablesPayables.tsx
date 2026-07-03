import AdminCard from '../ui/AdminCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { PayableRecord, ReceivableRecord } from '../../../lib/financeOperationsService'

interface Props {
  receivables: ReceivableRecord[]
  payables: PayableRecord[]
  mode: 'receivables' | 'payables' | 'both'
}

export default function FinanceReceivablesPayables({ receivables, payables, mode }: Props) {
  const showRecv = mode === 'receivables' || mode === 'both'
  const showPay = mode === 'payables' || mode === 'both'

  return (
    <div className={`grid gap-5 ${mode === 'both' ? 'xl:grid-cols-2' : ''}`}>
      {showRecv ? (
        <AdminCard>
          <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Receivables</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase text-slate-500">
              <tr><th className="pb-2">Entity</th><th className="pb-2">Amount</th><th className="pb-2">Due</th></tr>
            </thead>
            <tbody>
              {receivables.map((r) => (
                <tr key={r.id} className="border-t border-[#E5E7EB]">
                  <td className="py-2 font-medium text-slate-800">{r.entity}</td>
                  <td className="py-2">₹{formatIndianCompact(r.amount)}</td>
                  <td className={`py-2 ${r.overdue ? 'font-semibold text-red-600' : 'text-slate-600'}`}>
                    {new Date(r.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    {r.overdue ? ' (Overdue)' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      ) : null}

      {showPay ? (
        <AdminCard>
          <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Payables</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase text-slate-500">
              <tr><th className="pb-2">Vendor</th><th className="pb-2">Amount</th><th className="pb-2">Due</th></tr>
            </thead>
            <tbody>
              {payables.map((p) => (
                <tr key={p.id} className="border-t border-[#E5E7EB]">
                  <td className="py-2 font-medium text-slate-800">{p.vendor}</td>
                  <td className="py-2">₹{formatIndianCompact(p.amount)}</td>
                  <td className={`py-2 ${p.overdue ? 'font-semibold text-red-600' : 'text-slate-600'}`}>
                    {new Date(p.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    {p.overdue ? ' (Overdue)' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      ) : null}
    </div>
  )
}
