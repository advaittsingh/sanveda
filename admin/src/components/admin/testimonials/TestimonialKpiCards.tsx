import { Star, Clock, MessageSquare, TrendingUp, Video } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { TestimonialDashboardData } from '../../../lib/testimonialOperationsService'

interface Props {
  kpis: TestimonialDashboardData['kpis']
}

export default function TestimonialKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Testimonials" value={kpis.totalTestimonials} icon={MessageSquare} delay={0} />
      <StatCard label="Published" value={kpis.published} icon={TrendingUp} accent="green" delay={0.05} />
      <StatCard label="Pending Review" value={kpis.pendingReview} icon={Clock} accent="secondary" delay={0.1} />
      <StatCard label="Featured" value={kpis.featured} icon={Star} accent="blue" delay={0.15} />
      <StatCard label="Video Testimonials" value={kpis.videoTestimonials} icon={Video} delay={0.2} />
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-slate-500">Avg Rating</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Star size={18} />
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-[#0B2C6B]">{kpis.avgRating}/5</div>
      </div>
    </div>
  )
}
