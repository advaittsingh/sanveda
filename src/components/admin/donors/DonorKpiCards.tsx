import {
  HeartHandshake,
  IndianRupee,
  RefreshCcw,
  TrendingUp,
  Users,
  UserCheck,
} from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { DonorDashboardData } from '../../../lib/donorOperationsService'

interface Props {
  kpis: DonorDashboardData['kpis']
}

export default function DonorKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Donors" value={kpis.totalDonors} icon={Users} delay={0} />
      <StatCard label="Active Donors" value={kpis.activeDonors} icon={UserCheck} accent="green" delay={0.05} />
      <StatCard
        label="Lifetime Giving"
        value={kpis.lifetimeGiving}
        prefix="₹"
        icon={IndianRupee}
        accent="secondary"
        trend={kpis.lifetimeTrend}
        trendPositive={kpis.lifetimeTrendPositive}
        delay={0.1}
      />
      <StatCard label="Monthly Recurring" value={kpis.monthlyRecurring} icon={RefreshCcw} accent="blue" delay={0.15} />
      <StatCard label="Average Donation" value={kpis.averageDonation} prefix="₹" icon={TrendingUp} delay={0.2} />
      <StatCard
        label="Retention Rate"
        value={kpis.retentionRate}
        suffix="%"
        icon={HeartHandshake}
        accent="green"
        sub="Year-over-year repeat donors"
        delay={0.25}
      />
    </div>
  )
}
