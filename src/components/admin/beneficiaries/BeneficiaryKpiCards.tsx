import { BookOpen, HeartHandshake, Layers, Sparkles, TrendingUp, Users } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { BeneficiaryDashboardData } from '../../../lib/beneficiaryOperationsService'

interface Props {
  kpis: BeneficiaryDashboardData['kpis']
}

export default function BeneficiaryKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Beneficiaries" value={kpis.totalBeneficiaries} icon={Users} delay={0} />
      <StatCard label="Active Cases" value={kpis.activeCases} icon={HeartHandshake} accent="green" delay={0.05} />
      <StatCard label="Programs Running" value={kpis.programsRunning} icon={Layers} accent="blue" delay={0.1} />
      <StatCard
        label="Total Support Provided"
        value={kpis.totalSupportProvided}
        prefix="₹"
        sub={formatIndianCompact(kpis.totalSupportProvided)}
        icon={TrendingUp}
        accent="secondary"
        delay={0.15}
      />
      <StatCard label="This Month Added" value={kpis.thisMonthAdded} icon={BookOpen} accent="blue" delay={0.2} />
      <StatCard label="Success Stories" value={kpis.successStories} icon={Sparkles} accent="green" delay={0.25} />
    </div>
  )
}
