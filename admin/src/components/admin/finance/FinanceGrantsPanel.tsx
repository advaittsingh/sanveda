import AdminCard from '../ui/AdminCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { GrantRecord } from '../../../lib/financeOperationsService'

interface Props {
  grants: GrantRecord[]
}

export default function FinanceGrantsPanel({ grants }: Props) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Grant Management</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Grant</th>
              <th className="px-4 py-3">Agency</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Utilized</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {grants.map((g) => (
              <tr key={g.id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3 font-medium text-slate-800">{g.name}</td>
                <td className="px-4 py-3 text-slate-600">{g.agency}</td>
                <td className="px-4 py-3">₹{formatIndianCompact(g.amount)}</td>
                <td className="px-4 py-3">₹{formatIndianCompact(g.utilized)}</td>
                <td className="px-4 py-3 font-semibold text-emerald-700">₹{formatIndianCompact(g.remaining)}</td>
                <td className="px-4 py-3 text-slate-500">{g.deadline ? new Date(g.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {grants.map((g) => (
          <div key={`${g.id}-milestones`} className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-3">
            <p className="text-xs font-semibold text-[#0B2C6B]">{g.name} — Milestones</p>
            <ul className="mt-2 space-y-1">
              {g.milestones.map((m) => (
                <li key={m} className="text-xs text-slate-600">• {m}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
