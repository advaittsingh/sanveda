import { Sparkles } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import type { AuditDashboardData } from '../../../lib/auditOperationsService'

const toneStyles = {
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  critical: 'border-red-200 bg-red-50 text-red-800',
}

interface Props {
  alerts: AuditDashboardData['aiAlerts']
}

export default function AuditAiInsights({ alerts }: Props) {
  return (
    <AdminCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#0B2C6B]">AI Anomaly Detection</h3>
          <p className="text-sm text-slate-500">Automated monitoring for suspicious and high-risk activity</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
          <Sparkles size={12} /> SIEM
        </span>
      </div>
      <ul className="space-y-3">
        {alerts.map((a) => (
          <li key={a.id} className={`rounded-xl border px-4 py-3 text-sm font-medium ${toneStyles[a.tone]}`}>
            • {a.message}
          </li>
        ))}
      </ul>
    </AdminCard>
  )
}
