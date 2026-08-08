import { Sparkles } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import type { ProjectDashboardData } from '../../../lib/projectOperationsService'

const toneStyles = {
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

interface Props {
  insights: ProjectDashboardData['aiInsights']
}

export default function ProjectAiInsights({ insights }: Props) {
  return (
    <AdminCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#0B2C6B]">AI Insights</h3>
          <p className="text-sm text-slate-500">Programme intelligence and resource optimization</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
          <Sparkles size={12} />
          Smart
        </span>
      </div>
      <ul className="space-y-3">
        {insights.map((insight) => (
          <li key={insight.id} className={`rounded-xl border px-4 py-3 text-sm font-medium ${toneStyles[insight.tone]}`}>
            • {insight.message}
          </li>
        ))}
      </ul>
    </AdminCard>
  )
}
