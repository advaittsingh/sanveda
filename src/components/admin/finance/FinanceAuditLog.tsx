import AdminCard from '../ui/AdminCard'
import type { AuditLogEntry } from '../../../lib/financeOperationsService'

interface Props {
  logs: AuditLogEntry[]
}

export default function FinanceAuditLog({ logs }: Props) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Audit Trail</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3 font-medium">{l.user}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(l.timestamp).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">{l.action}</td>
                <td className="px-4 py-3 text-slate-600">{l.oldValue} → {l.newValue}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  )
}
