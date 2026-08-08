import { CheckCircle, HeartHandshake, IndianRupee, Layers, Target, TrendingUp } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { ProjectDashboardData } from '../../../lib/projectOperationsService'

interface Props {
  kpis: ProjectDashboardData['kpis']
}

export default function ProjectKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Projects" value={kpis.totalProjects} icon={Layers} delay={0} />
      <StatCard label="Active Projects" value={kpis.activeProjects} icon={Target} accent="green" delay={0.05} />
      <StatCard label="Completed Projects" value={kpis.completedProjects} icon={CheckCircle} accent="blue" delay={0.1} />
      <StatCard
        label="Total Budget"
        value={kpis.totalBudget}
        prefix="₹"
        sub={formatIndianCompact(kpis.totalBudget)}
        icon={IndianRupee}
        accent="secondary"
        delay={0.15}
      />
      <StatCard
        label="Funds Utilized"
        value={kpis.fundsUtilized}
        prefix="₹"
        sub={formatIndianCompact(kpis.fundsUtilized)}
        icon={TrendingUp}
        accent="secondary"
        delay={0.2}
      />
      <StatCard label="Beneficiaries Served" value={kpis.beneficiariesServed} icon={HeartHandshake} accent="green" delay={0.25} />
    </div>
  )
}
