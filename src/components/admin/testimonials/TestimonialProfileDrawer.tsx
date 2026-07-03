import { X, Star } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnSecondary } from '../ui/adminStyles'
import { formatIndianCompact } from '../../../lib/formatIndian'
import { PLACEMENT_LABELS, renderStars, type TestimonialProfile } from '../../../lib/testimonialOperationsService'

interface Props {
  testimonial: TestimonialProfile | null
  onClose: () => void
  onEdit: () => void
  onApprove: () => void
}

export default function TestimonialProfileDrawer({ testimonial, onClose, onEdit, onApprove }: Props) {
  if (!testimonial) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <div className="flex gap-3">
            <img src={testimonial.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
            <div>
              <p className="text-xs font-semibold uppercase text-[#0E4FA8]">{testimonial.categoryLabel}</p>
              <h2 className="text-lg font-semibold text-[#0B2C6B]">{testimonial.name}</h2>
              <p className="text-sm text-slate-500">{testimonial.designation}{testimonial.organization ? ` · ${testimonial.organization}` : ''}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="flex-1 space-y-5 p-5">
          <div className="flex items-center gap-2">
            <span className="text-amber-500">{renderStars(testimonial.rating)}</span>
            <StatusBadge status={testimonial.status} />
            {testimonial.featured ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><Star size={12} /> Featured</span> : null}
          </div>

          {testimonial.title ? <h3 className="font-semibold text-[#0B2C6B]">{testimonial.title}</h3> : null}
          <p className="text-sm italic text-slate-600">&ldquo;{testimonial.testimonial}&rdquo;</p>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Program</dt><dd>{testimonial.program}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Focus → Project → Campaign</dt><dd className="text-right">{testimonial.focusArea} → {testimonial.project} → {testimonial.campaign}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Sentiment</dt><dd className="capitalize">{testimonial.sentiment.replace('_', ' ')} ({testimonial.sentimentScore}%)</dd></div>
          </dl>

          {testimonial.donorTotalDonations ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Donor Profile</p>
              <p className="mt-1 text-sm">Donor since {testimonial.donorSince}</p>
              <p className="text-lg font-bold text-[#0B2C6B]">₹{formatIndianCompact(testimonial.donorTotalDonations)} total</p>
            </div>
          ) : null}

          {testimonial.beneficiarySupport ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Beneficiary Story</p>
              <p className="mt-1 text-sm">Support: ₹{formatIndianCompact(testimonial.beneficiarySupport)}</p>
              <p className="text-sm font-semibold text-emerald-700">Outcome: {testimonial.beneficiaryOutcome}</p>
            </div>
          ) : null}

          {testimonial.volunteerHours ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Volunteer Profile</p>
              <p className="mt-1 text-sm">{testimonial.volunteerHours} hours · {testimonial.volunteerProjects} projects</p>
            </div>
          ) : null}

          {testimonial.csrBudget ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">CSR Partnership</p>
              <p className="mt-1 text-lg font-bold">₹{formatIndianCompact(testimonial.csrBudget)} CSR budget</p>
            </div>
          ) : null}

          {testimonial.videoUrl ? (
            <div className="rounded-xl border border-dashed border-[#E5E7EB] p-4 text-sm">
              <p className="font-semibold text-[#0B2C6B]">Video Testimonial</p>
              <p className="mt-1 truncate text-slate-500">{testimonial.videoUrl}</p>
              {testimonial.videoViews ? <p className="mt-1 text-xs">{testimonial.videoViews.toLocaleString('en-IN')} views · {testimonial.videoShares} shares</p> : null}
            </div>
          ) : null}

          {testimonial.placements.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {testimonial.placements.map((p) => (
                <span key={p} className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">{PLACEMENT_LABELS[p]}</span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex gap-2 border-t border-[#E5E7EB] p-5">
          {(testimonial.status === 'submitted' || testimonial.status === 'review') ? (
            <button type="button" className={adminBtnSecondary} onClick={onApprove}>Approve & Publish</button>
          ) : null}
          <button type="button" className={adminBtnSecondary} onClick={onEdit}>Edit</button>
        </div>
      </div>
    </div>
  )
}
