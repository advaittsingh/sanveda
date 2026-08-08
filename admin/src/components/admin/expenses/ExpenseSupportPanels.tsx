import AdminCard from '../ui/AdminCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { BudgetControl, GrantUtilization, VendorRecord } from '../../../lib/expenseOperationsService'

export function ExpenseVendorsPanel({ vendors }: { vendors: VendorRecord[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Vendor Master</h3>
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-semibold uppercase text-slate-500">
          <tr><th className="pb-2">Vendor</th><th className="pb-2">Type</th><th className="pb-2">GST</th><th className="pb-2">Total Spend</th></tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id} className="border-t border-[#E5E7EB]">
              <td className="py-2 font-medium">{v.name}</td>
              <td className="py-2 text-slate-600">{v.type}</td>
              <td className="py-2 font-mono text-xs text-slate-500">{v.gst ?? '—'}</td>
              <td className="py-2 font-semibold text-[#0B2C6B]">₹{formatIndianCompact(v.totalSpend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  )
}

export function ExpenseBudgetControls({ budgets }: { budgets: BudgetControl[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Budget Controls</h3>
      <div className="space-y-4">
        {budgets.map((b) => (
          <div key={b.project} className={`rounded-xl border p-4 ${b.warning ? 'border-amber-300 bg-amber-50/50' : 'border-[#E5E7EB]'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="font-semibold text-[#0B2C6B]">{b.project}</h4>
              {b.warning ? <span className="text-xs font-semibold text-amber-700">⚠️ {b.warning}</span> : null}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              <div><p className="text-xs text-slate-500">Budget</p><p className="font-semibold">₹{formatIndianCompact(b.budget)}</p></div>
              <div><p className="text-xs text-slate-500">Spent</p><p className="font-semibold">₹{formatIndianCompact(b.spent)}</p></div>
              <div><p className="text-xs text-slate-500">Remaining</p><p className="font-semibold text-emerald-700">₹{formatIndianCompact(b.remaining)}</p></div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${b.utilizationPct > 90 ? 'bg-amber-500' : 'bg-[#0E4FA8]'}`} style={{ width: `${b.utilizationPct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function ExpenseGrantUtilization({ grants }: { grants: GrantUtilization[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Grant Utilization</h3>
      <div className="space-y-4">
        {grants.map((g) => (
          <div key={g.name} className="rounded-xl border border-[#E5E7EB] p-4">
            <h4 className="font-semibold text-[#0B2C6B]">{g.name}</h4>
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              <div><p className="text-xs text-slate-500">Allocated</p><p className="font-semibold">₹{formatIndianCompact(g.allocated)}</p></div>
              <div><p className="text-xs text-slate-500">Utilized</p><p className="font-semibold">₹{formatIndianCompact(g.utilized)}</p></div>
              <div><p className="text-xs text-slate-500">Remaining</p><p className="font-semibold text-emerald-700">₹{formatIndianCompact(g.remaining)}</p></div>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function ExpenseAuditLog({ logs }: { logs: import('../../../lib/expenseOperationsService').ExpenseAuditEntry[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Audit Trail</h3>
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-semibold uppercase text-slate-500">
          <tr><th className="pb-2">User</th><th className="pb-2">Date</th><th className="pb-2">Action</th><th className="pb-2">Change</th></tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-t border-[#E5E7EB]">
              <td className="py-2 font-medium">{l.user}</td>
              <td className="py-2 text-slate-600">{new Date(l.date).toLocaleDateString('en-IN')}</td>
              <td className="py-2">{l.action}</td>
              <td className="py-2 text-slate-600">{l.oldValue} → {l.newValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  )
}
