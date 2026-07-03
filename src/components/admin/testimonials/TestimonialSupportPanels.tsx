import { ArrowDown, CheckCircle, Star } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnSecondary } from '../ui/adminStyles'
import { formatIndianCompact } from '../../../lib/formatIndian'
import {
  PLACEMENT_LABELS,
  TESTIMONIAL_CATEGORIES,
  WORKFLOW_STEPS,
  renderStars,
  type TestimonialDashboardData,
  type TestimonialProfile,
  type WebsitePlacement,
} from '../../../lib/testimonialOperationsService'

export function TestimonialSocialProofPanel({ socialProof }: { socialProof: TestimonialDashboardData['socialProof'] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {[
        { label: 'Average Rating', value: `${socialProof.averageRating}/5` },
        { label: 'Testimonials', value: socialProof.totalTestimonials.toLocaleString('en-IN') },
        { label: 'Video Views', value: formatIndianCompact(socialProof.videoViews) },
        { label: 'Shares', value: formatIndianCompact(socialProof.shares) },
        { label: 'Sentiment Score', value: `${socialProof.sentimentScore}% Positive` },
      ].map((m) => (
        <div key={m.label} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
          <p className="text-xs font-semibold uppercase text-slate-500">{m.label}</p>
          <p className="mt-1 text-lg font-bold text-[#0B2C6B]">{m.value}</p>
        </div>
      ))}
    </div>
  )
}

export function TestimonialCategoriesPanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {TESTIMONIAL_CATEGORIES.map((c) => (
        <AdminCard key={c.value}>
          <h4 className="text-sm font-semibold text-[#0B2C6B]">{c.label}</h4>
        </AdminCard>
      ))}
    </div>
  )
}

export function TestimonialVideoPanel({ testimonials }: { testimonials: TestimonialProfile[] }) {
  const videos = testimonials.filter((t) => t.videoUrl)
  return (
    <div className="space-y-4">
      <AdminCard>
        <h3 className="font-semibold text-[#0B2C6B]">Video Testimonials</h3>
        <p className="mt-1 text-sm text-slate-500">YouTube · Vimeo · Uploaded Video · Instagram Reel</p>
      </AdminCard>
      <div className="grid gap-4 lg:grid-cols-2">
        {videos.map((v) => (
          <AdminCard key={v.id}>
            <h4 className="font-semibold text-[#0B2C6B]">{v.name}</h4>
            <p className="mt-1 truncate text-xs text-slate-500">{v.videoUrl}</p>
            <div className="mt-3 flex gap-4 text-sm">
              {v.videoDuration ? <span>Duration: {v.videoDuration}</span> : null}
              {v.videoViews ? <span>{v.videoViews.toLocaleString('en-IN')} views</span> : null}
              {v.videoShares ? <span>{v.videoShares} shares</span> : null}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}

export function TestimonialFeaturedPanel({ testimonials }: { testimonials: TestimonialProfile[] }) {
  const featured = testimonials.filter((t) => t.featured)
  const placements: WebsitePlacement[] = ['homepage', 'donation_page', 'campaign_page', 'volunteer_page']
  return (
    <div className="space-y-4">
      <AdminCard>
        <h3 className="font-semibold text-[#0B2C6B]">Featured Testimonials — Homepage Slider</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {placements.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle size={12} /> {PLACEMENT_LABELS[p]}
            </span>
          ))}
        </div>
      </AdminCard>
      <div className="grid gap-4 sm:grid-cols-2">
        {featured.map((t) => (
          <AdminCard key={t.id}>
            <div className="flex gap-3">
              <img src={t.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h4 className="font-semibold text-[#0B2C6B]">{t.name}</h4>
                <span className="text-amber-500 text-sm">{renderStars(t.rating)}</span>
              </div>
              <Star size={16} className="ml-auto text-amber-500" />
            </div>
            <p className="mt-3 text-sm italic text-slate-600">&ldquo;{t.testimonial.slice(0, 120)}…&rdquo;</p>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}

export function TestimonialDonorPanel({ testimonials }: { testimonials: TestimonialProfile[] }) {
  const donors = testimonials.filter((t) => t.category === 'donor')
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {donors.map((d) => (
        <AdminCard key={d.id}>
          <h4 className="font-semibold text-[#0B2C6B]">{d.name}</h4>
          <p className="text-sm text-slate-500">Donor since {d.donorSince ?? '2022'}</p>
          <p className="mt-1 text-amber-500">{renderStars(d.rating)}</p>
          <p className="mt-2 text-sm italic">&ldquo;{d.testimonial}&rdquo;</p>
          {d.donorTotalDonations ? <p className="mt-2 text-sm font-bold">Total Donations: ₹{formatIndianCompact(d.donorTotalDonations)}</p> : null}
        </AdminCard>
      ))}
    </div>
  )
}

export function TestimonialBeneficiaryPanel({ testimonials }: { testimonials: TestimonialProfile[] }) {
  const items = testimonials.filter((t) => t.category === 'beneficiary' || t.category === 'success_story')
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((b) => (
        <AdminCard key={b.id}>
          <h4 className="font-semibold text-[#0B2C6B]">{b.name}</h4>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Program</dt><dd>{b.program}</dd></div>
            {b.beneficiarySupport ? <div className="flex justify-between"><dt className="text-slate-500">Support</dt><dd>₹{formatIndianCompact(b.beneficiarySupport)}</dd></div> : null}
            {b.beneficiaryOutcome ? <div className="flex justify-between"><dt className="text-slate-500">Outcome</dt><dd className="font-semibold text-emerald-700">{b.beneficiaryOutcome}</dd></div> : null}
          </dl>
          <div className="mt-3 flex flex-wrap gap-1">
            {['Before photos', 'After photos', 'Videos', 'Outcome metrics'].map((l) => (
              <span key={l} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{l}</span>
            ))}
          </div>
        </AdminCard>
      ))}
    </div>
  )
}

export function TestimonialStoryBuilder() {
  const steps = ['Person', 'Problem', 'Intervention', 'Support Amount', 'Outcome', 'Impact Metrics', 'Testimonial']
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Story Builder</h3>
      <p className="mt-1 text-sm text-slate-500">Priya Sharma → Cancer Diagnosis → Treatment Support → ₹4,50,000 → Recovery → Patient Story</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 py-2">
        {steps.map((step, i, arr) => (
          <span key={step} className="flex items-center gap-1 text-xs text-slate-600">
            <span className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-2 py-1 font-semibold">{step}</span>
            {i < arr.length - 1 ? <ArrowDown size={12} className="rotate-90 text-slate-400" /> : null}
          </span>
        ))}
      </div>
    </AdminCard>
  )
}

export function TestimonialPublishingPanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Approval Workflow</h3>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {WORKFLOW_STEPS.map((step, i, arr) => (
          <span key={step} className="flex items-center gap-1 text-sm capitalize text-slate-600">
            {step}{i < arr.length - 1 ? <ArrowDown size={14} className="rotate-90 text-slate-400" /> : null}
          </span>
        ))}
      </div>
    </AdminCard>
  )
}

export function TestimonialSentimentPanel({ testimonials }: { testimonials: TestimonialProfile[] }) {
  const sentiments = ['very_positive', 'positive', 'neutral', 'negative', 'critical'] as const
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Sentiment Analysis</h3>
      <div className="mt-4 space-y-2">
        {sentiments.map((s) => {
          const count = testimonials.filter((t) => t.sentiment === s).length
          return (
            <div key={s} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm capitalize">
              <span>{s.replace('_', ' ')}</span>
              <span className="font-semibold">{count || '—'}</span>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-center text-sm font-semibold text-emerald-700">Overall Sentiment Score: 94% Positive</p>
    </AdminCard>
  )
}

export function TestimonialProjectMappingPanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Project Mapping</h3>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {['Focus Area', 'Project', 'Campaign', 'Testimonial'].map((step, i, arr) => (
          <span key={step} className="flex items-center gap-1 text-xs text-slate-600">
            <span className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 font-semibold text-[#0B2C6B]">{step}</span>
            {i < arr.length - 1 ? <ArrowDown size={14} className="rotate-90 text-slate-400" /> : null}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-slate-600">Healthcare → Cancer Care → Save Lives → Patient Story</p>
    </AdminCard>
  )
}

export function TestimonialArchitecturePanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Trust Engine Architecture</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <h4 className="text-sm font-semibold text-[#0B2C6B]">Content Engine</h4>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {['CMS', 'Blogs', 'Stories', 'Testimonials', 'Gallery', 'Documents', 'Media Library', 'SEO', 'Publishing', 'Analytics', 'AI Content'].map((i) => (
              <li key={i}>├── {i}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <h4 className="text-sm font-semibold text-[#0B2C6B]">Fundraising Funnel</h4>
          <p className="mt-2 text-xs text-slate-600">
            Beneficiary → Project → Support → Outcome → Story → Testimonial → Campaign → Donation
          </p>
        </div>
      </div>
    </AdminCard>
  )
}

export function TestimonialReviewsPanel({ testimonials }: { testimonials: TestimonialProfile[] }) {
  return (
    <div className="space-y-3">
      {testimonials.filter((t) => t.status === 'submitted' || t.status === 'review').map((t) => (
        <AdminCard key={t.id}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-[#0B2C6B]">{t.name}</h4>
              <p className="text-sm text-slate-500">{t.categoryLabel} · {t.program}</p>
            </div>
            <StatusBadge status={t.status} />
          </div>
          <p className="mt-2 text-sm italic">&ldquo;{t.testimonial.slice(0, 150)}…&rdquo;</p>
          <button type="button" className={`${adminBtnSecondary} mt-3`}>Review</button>
        </AdminCard>
      ))}
    </div>
  )
}

export function TestimonialPlacementPanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Website Placement</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(PLACEMENT_LABELS) as WebsitePlacement[]).map((p) => (
          <span key={p} className="rounded-full border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-slate-700">{PLACEMENT_LABELS[p]}</span>
        ))}
      </div>
    </AdminCard>
  )
}
