import { FileText, Globe, Layers, Megaphone, PenLine, TrendingUp } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { CmsDashboardData } from '../../../lib/cmsOperationsService'

interface Props {
  kpis: CmsDashboardData['kpis']
}

export default function CmsKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Website Pages" value={kpis.websitePages} icon={Globe} delay={0} />
      <StatCard label="Homepage Sections" value={kpis.homepageSections} icon={Layers} accent="blue" delay={0.05} />
      <StatCard label="Published Content" value={kpis.publishedContent} icon={TrendingUp} accent="green" delay={0.1} />
      <StatCard label="Draft Content" value={kpis.draftContent} icon={PenLine} accent="secondary" delay={0.15} />
      <StatCard label="Active Banners" value={kpis.activeBanners} icon={Megaphone} delay={0.2} />
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-slate-500">Last Published</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B2C6B]/10 text-[#0B2C6B]">
            <FileText size={18} />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-[#0B2C6B]">{kpis.lastPublished}</div>
      </div>
    </div>
  )
}
