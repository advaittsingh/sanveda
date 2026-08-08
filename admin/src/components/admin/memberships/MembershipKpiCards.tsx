import { Clock, Crown, IndianRupee, RefreshCcw, UserCheck, Users } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { MembershipDashboardData } from '../../../lib/membershipOperationsService'

interface Props {
  kpis: MembershipDashboardData['kpis']
}

export default function MembershipKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Members" value={kpis.totalMembers} icon={Users} delay={0} />
      <StatCard label="Active Members" value={kpis.activeMembers} icon={UserCheck} accent="green" delay={0.05} />
      <StatCard label="Pending Applications" value={kpis.pendingApplications} icon={Clock} accent="secondary" delay={0.1} />
      <StatCard label="Renewals Due" value={kpis.renewalsDue} icon={RefreshCcw} accent="blue" delay={0.15} />
      <StatCard label="Lifetime Members" value={kpis.lifetimeMembers} icon={Crown} accent="secondary" delay={0.2} />
      <StatCard
        label="Membership Revenue"
        value={kpis.membershipRevenue}
        prefix="₹"
        icon={IndianRupee}
        accent="green"
        sub={formatIndianCompact(kpis.membershipRevenue)}
        delay={0.25}
      />
    </div>
  )
}
