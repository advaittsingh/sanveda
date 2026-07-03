import { AlertTriangle, FileText, ShieldAlert, Users, XCircle } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { AuditDashboardData } from '../../../lib/auditOperationsService'

interface Props {
  kpis: AuditDashboardData['kpis']
}

export default function AuditKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Logs" value={kpis.totalLogs} icon={FileText} delay={0} />
      <StatCard label="Today" value={kpis.today} icon={FileText} accent="blue" delay={0.05} />
      <StatCard label="Critical Actions" value={kpis.criticalActions} icon={AlertTriangle} accent="secondary" delay={0.1} />
      <StatCard label="Failed Actions" value={kpis.failedActions} icon={XCircle} accent="secondary" delay={0.15} />
      <StatCard label="Active Admins" value={kpis.activeAdmins} icon={Users} accent="green" delay={0.2} />
      <StatCard label="Security Alerts" value={kpis.securityAlerts} icon={ShieldAlert} accent="secondary" delay={0.25} />
    </div>
  )
}
