import { AlertTriangle, Clock, Inbox, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { EnquiryDashboardData } from '../../../lib/enquiryOperationsService'

interface Props {
  kpis: EnquiryDashboardData['kpis']
}

export default function EnquiryKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Enquiries" value={kpis.totalEnquiries} icon={Inbox} delay={0} />
      <StatCard label="New" value={kpis.newCount} icon={MessageSquare} accent="blue" delay={0.05} />
      <StatCard label="In Progress" value={kpis.inProgress} icon={TrendingUp} accent="secondary" delay={0.1} />
      <StatCard label="Resolved" value={kpis.resolved} icon={CheckCircle} accent="green" delay={0.15} />
      <StatCard label="Escalated" value={kpis.escalated} icon={AlertTriangle} accent="secondary" delay={0.2} />
      <StatCard label="Avg Response Time" value={kpis.avgResponseTimeHours} suffix=" hrs" icon={Clock} accent="green" delay={0.25} />
    </div>
  )
}
