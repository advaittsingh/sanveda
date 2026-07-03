import { AlertTriangle, CheckCircle, Clock, FileCheck, IndianRupee } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { TaxReceiptDashboardData } from '../../../lib/taxReceiptOperationsService'

interface Props {
  kpis: TaxReceiptDashboardData['kpis']
}

export default function TaxReceiptKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Receipts" value={kpis.totalReceipts} icon={FileCheck} delay={0} />
      <StatCard label="80G Receipts" value={kpis.eightyGReceipts} icon={CheckCircle} accent="green" delay={0.05} />
      <StatCard label="Pending Generation" value={kpis.pendingGeneration} icon={Clock} accent="secondary" delay={0.1} />
      <StatCard label="Generated This Month" value={kpis.generatedThisMonth} icon={FileCheck} accent="blue" delay={0.15} />
      <StatCard label="Total Tax Benefit" value={kpis.totalTaxBenefit} prefix="₹" sub={formatIndianCompact(kpis.totalTaxBenefit)} icon={IndianRupee} delay={0.2} />
      <StatCard label="Failed Deliveries" value={kpis.failedDeliveries} icon={AlertTriangle} accent="secondary" delay={0.25} />
    </div>
  )
}
