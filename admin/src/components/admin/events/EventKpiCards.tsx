import { Calendar, CalendarCheck, IndianRupee, Ticket, Users, Layers } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { EventDashboardData } from '../../../lib/eventOperationsService'

interface Props {
  kpis: EventDashboardData['kpis']
}

export default function EventKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Events" value={kpis.totalEvents} icon={Layers} delay={0} />
      <StatCard label="Upcoming Events" value={kpis.upcomingEvents} icon={Calendar} accent="blue" delay={0.05} />
      <StatCard label="Completed Events" value={kpis.completedEvents} icon={CalendarCheck} accent="green" delay={0.1} />
      <StatCard label="Registrations" value={kpis.totalRegistrations} icon={Ticket} accent="secondary" delay={0.15} />
      <StatCard label="Volunteers Assigned" value={kpis.volunteersAssigned} icon={Users} accent="green" delay={0.2} />
      <StatCard
        label="Funds Raised"
        value={kpis.fundsRaised}
        prefix="₹"
        sub={formatIndianCompact(kpis.fundsRaised)}
        icon={IndianRupee}
        accent="secondary"
        delay={0.25}
      />
    </div>
  )
}
