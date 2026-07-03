import { Award, CheckCircle, ClipboardList, GraduationCap, Users, UserCheck } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { InternshipDashboardData } from '../../../lib/internshipOperationsService'

interface Props {
  kpis: InternshipDashboardData['kpis']
}

export default function InternshipKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Applications" value={kpis.totalApplications} icon={ClipboardList} delay={0} />
      <StatCard label="Pending Review" value={kpis.pendingReview} icon={Users} accent="secondary" delay={0.05} />
      <StatCard label="Selected Interns" value={kpis.selectedInterns} icon={UserCheck} accent="blue" delay={0.1} />
      <StatCard label="Active Interns" value={kpis.activeInterns} icon={GraduationCap} accent="green" delay={0.15} />
      <StatCard label="Completed Internships" value={kpis.completedInternships} icon={CheckCircle} accent="green" delay={0.2} />
      <StatCard label="Certificates Issued" value={kpis.certificatesIssued} icon={Award} accent="secondary" delay={0.25} />
    </div>
  )
}
