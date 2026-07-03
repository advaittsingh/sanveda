import { HeartHandshake, IndianRupee, Layers, Megaphone, Target, Users } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { FocusAreaDashboardData } from '../../../lib/focusAreaOperationsService'

interface Props {
  kpis: FocusAreaDashboardData['kpis']
}

export default function FocusAreaKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Focus Areas" value={kpis.totalFocusAreas} icon={Layers} delay={0} />
      <StatCard label="Active Projects" value={kpis.activeProjects} icon={Target} accent="green" delay={0.05} />
      <StatCard label="Beneficiaries Served" value={kpis.beneficiariesServed} icon={HeartHandshake} accent="blue" delay={0.1} />
      <StatCard
        label="Total Funding"
        value={kpis.totalFunding}
        prefix="₹"
        sub={formatIndianCompact(kpis.totalFunding)}
        icon={IndianRupee}
        accent="secondary"
        delay={0.15}
      />
      <StatCard label="Volunteers" value={kpis.volunteers} icon={Users} accent="green" delay={0.2} />
      <StatCard label="Campaigns Running" value={kpis.campaignsRunning} icon={Megaphone} accent="secondary" delay={0.25} />
    </div>
  )

}
