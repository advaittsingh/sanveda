import { Calendar, Clock, FileCheck, FileText, Layers, Zap } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { ReportDashboardData } from '../../../lib/reportOperationsService'

interface Props {
  kpis: ReportDashboardData['kpis']
}

export default function ReportKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Reports Generated" value={kpis.reportsGenerated} icon={FileText} delay={0} />
      <StatCard label="Scheduled Reports" value={kpis.scheduledReports} icon={Calendar} accent="blue" delay={0.05} />
      <StatCard label="Pending Reports" value={kpis.pendingReports} icon={Clock} accent="secondary" delay={0.1} />
      <StatCard label="Compliance Reports" value={kpis.complianceReports} icon={FileCheck} accent="green" delay={0.15} />
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-slate-500">Last Generated</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B2C6B]/10 text-[#0B2C6B]">
            <Layers size={18} />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-[#0B2C6B]">{kpis.lastGenerated}</div>
      </div>
      <StatCard label="Automated Reports" value={kpis.automatedPct} suffix="%" icon={Zap} accent="green" delay={0.25} />
    </div>
  )
}
