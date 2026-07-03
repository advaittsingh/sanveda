import { Building2, Clock, Shield, UserCheck, Users, UserPlus } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { RbacDashboardData } from '../../../lib/adminUserOperationsService'

interface Props {
  kpis: RbacDashboardData['kpis']
}

export default function RbacKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Admins" value={kpis.totalAdmins} icon={Users} delay={0} />
      <StatCard label="Super Admins" value={kpis.superAdmins} icon={Shield} accent="blue" delay={0.05} />
      <StatCard label="Active Users" value={kpis.activeUsers} icon={UserCheck} accent="green" delay={0.1} />
      <StatCard label="Pending Invites" value={kpis.pendingInvites} icon={UserPlus} accent="secondary" delay={0.15} />
      <StatCard label="Departments" value={kpis.departments} icon={Building2} delay={0.2} />
      <StatCard label="Last Login Today" value={kpis.lastLoginToday} icon={Clock} accent="green" delay={0.25} />
    </div>
  )
}
