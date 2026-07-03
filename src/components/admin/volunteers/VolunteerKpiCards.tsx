import { Clock, UserCheck, Users, UserCog, ClipboardList, Award } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { VolunteerDashboardData } from '../../../lib/volunteerOperationsService'

interface Props {
  kpis: VolunteerDashboardData['kpis']
}

export default function VolunteerKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Applications" value={kpis.totalApplications} icon={ClipboardList} delay={0} />
      <StatCard label="Pending Review" value={kpis.pendingReview} icon={Users} accent="secondary" delay={0.05} />
      <StatCard label="Approved Volunteers" value={kpis.approvedVolunteers} icon={Award} accent="green" delay={0.1} />
      <StatCard label="Active Volunteers" value={kpis.activeVolunteers} icon={UserCheck} accent="blue" delay={0.15} />
      <StatCard label="Team Leaders" value={kpis.teamLeaders} icon={UserCog} accent="secondary" delay={0.2} />
      <StatCard
        label="Volunteer Hours"
        value={kpis.volunteerHours}
        suffix=" hrs"
        icon={Clock}
        accent="green"
        delay={0.25}
      />
    </div>
  )
}
