import { Sparkles } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import type { BlogDashboardData } from '../../../lib/blogOperationsService'

const toneStyles = {
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

interface Props {
  insights: BlogDashboardData['aiInsights']
}

export default function BlogAiInsights({ insights }: Props) {
  return (
    <AdminCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#0B2C6B]">AI Insights</h3>
          <p className="text-sm text-slate-500">Content performance and storytelling intelligence</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
          <Sparkles size={12} /> Smart
        </span>
      </div>
      <ul className="space-y-3">
        {insights.map((i) => (
          <li key={i.id} className={`rounded-xl border px-4 py-3 text-sm font-medium ${toneStyles[i.tone]}`}>
            • {i.message}
          </li>
        ))}
      </ul>
    </AdminCard>
  )
}
