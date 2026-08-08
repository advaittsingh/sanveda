import { Building2, Clock, UserCheck, Users } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { RbacDashboardData } from '../../../lib/adminUserOperationsService'

interface Props {
  kpis: RbacDashboardData['kpis']
}

export default function RbacKpiCards({ kpis }: Props) {
  const fingerprint = `${kpis.totalAdmins}-${kpis.activeUsers}-${kpis.pendingInvites}-${kpis.departments}`
  return (
    <div key={fingerprint} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Admins" value={kpis.totalAdmins} icon={Users} delay={0} />
      <StatCard label="Active" value={kpis.activeUsers} icon={UserCheck} accent="green" delay={0.05} />
      <StatCard label="Pending Invites" value={kpis.pendingInvites} icon={Clock} accent="secondary" delay={0.1} />
      <StatCard label="Departments" value={kpis.departments} icon={Building2} accent="blue" delay={0.15} />
    </div>
  )
}
