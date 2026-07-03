import { ArrowRight } from 'lucide-react'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { FocusAreaProfile } from '../../../lib/focusAreaOperationsService'
import { adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  areas: FocusAreaProfile[]
  onView: (area: FocusAreaProfile) => void
}

export default function FocusAreaCardGrid({ areas, onView }: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {areas.map((area) => (
        <article
          key={area.slug}
          className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition hover:border-[#0B2C6B]/20 hover:shadow-md"
        >
          <div className="relative h-32 overflow-hidden">
            <img src={area.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C6B]/80 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-lg font-semibold text-white">{area.name}</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <StatusBadge status={area.status} />
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                  {area.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projects</p>
                <p className="mt-0.5 font-semibold text-[#0B2C6B]">{area.projectCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Beneficiaries</p>
                <p className="mt-0.5 font-semibold text-[#0B2C6B]">{area.beneficiaryCount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget</p>
                <p className="mt-0.5 font-semibold text-[#0B2C6B]">₹{formatIndianCompact(area.fundsRaised)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</p>
                <p className="mt-0.5 font-semibold text-[#0B2C6B]">{area.progressPct}%</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                <span>Programme progress</span>
                <span>{area.progressPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0E4FA8]"
                  style={{ width: `${area.progressPct}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              className={`${adminBtnSecondary} mt-4 w-full justify-center`}
              onClick={() => onView(area)}
            >
              View
              <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
