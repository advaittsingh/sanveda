import { AlertTriangle } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import type { ComplianceItem, ExpiryAlert } from '../../../lib/documentOperationsService'

interface Props {
  compliance: ComplianceItem[]
  alerts: ExpiryAlert[]
}

const statusStyles = {
  active: 'text-emerald-700 bg-emerald-50',
  expiring: 'text-amber-700 bg-amber-50',
  expired: 'text-red-700 bg-red-50',
}

export default function DocumentCompliancePanel({ compliance, alerts }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <AdminCard>
        <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">NGO Compliance Dashboard</h3>
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
              </tr>
            </thead>
            <tbody>
              {compliance.map((item) => (
                <tr key={item.name} className="border-t border-[#E5E7EB]">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.expires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#0B2C6B]">
          <AlertTriangle size={18} className="text-amber-500" />
          Expiring Soon
        </h3>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500">No documents expiring within 60 days.</p>
        ) : (
          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                  alert.severity === 'critical'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}
              >
                ⚠️ {alert.title} expires in {alert.daysRemaining} days
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  )
}
