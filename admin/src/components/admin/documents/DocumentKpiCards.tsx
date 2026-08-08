import { AlertTriangle, FileCheck, FileText, FolderOpen, HardDrive, ScrollText } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { DocumentDashboardData } from '../../../lib/documentOperationsService'

interface Props {
  kpis: DocumentDashboardData['kpis']
}

export default function DocumentKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Documents" value={kpis.totalDocuments} icon={FileText} delay={0} />
      <StatCard label="Public Documents" value={kpis.publicDocuments} icon={FolderOpen} accent="green" delay={0.05} />
      <StatCard label="Compliance Documents" value={kpis.complianceDocuments} icon={FileCheck} accent="blue" delay={0.1} />
      <StatCard label="Expiring Documents" value={kpis.expiringDocuments} icon={AlertTriangle} accent="secondary" delay={0.15} />
      <StatCard label="Reports Generated" value={kpis.reportsGenerated} icon={ScrollText} accent="green" delay={0.2} />
      <StatCard label="Storage Used" value={kpis.storageUsedGb} suffix=" GB" icon={HardDrive} accent="secondary" delay={0.25} />
    </div>
  )
}
