import { Eye, FileText, Clock, Star, TrendingUp, PenLine } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { BlogDashboardData } from '../../../lib/blogOperationsService'

interface Props {
  kpis: BlogDashboardData['kpis']
}

export default function BlogKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Articles" value={kpis.totalArticles} icon={FileText} delay={0} />
      <StatCard label="Published" value={kpis.published} icon={TrendingUp} accent="green" delay={0.05} />
      <StatCard label="Drafts" value={kpis.drafts} icon={PenLine} accent="secondary" delay={0.1} />
      <StatCard label="Scheduled" value={kpis.scheduled} icon={Clock} accent="blue" delay={0.15} />
      <StatCard label="Views" value={kpis.views} suffix="" sub={formatIndianCompact(kpis.views)} icon={Eye} delay={0.2} />
      <StatCard label="Featured Stories" value={kpis.featuredStories} icon={Star} accent="green" delay={0.25} />
    </div>
  )
}
