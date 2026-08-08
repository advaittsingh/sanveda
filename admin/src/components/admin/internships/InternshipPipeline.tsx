import { CASE_STAGES, type InternProfile } from '../../../lib/internshipOperationsService'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  pipeline: Record<string, InternProfile[]>
  onSelect: (intern: InternProfile) => void
}

export default function InternshipPipeline({ pipeline, onSelect }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[1200px] gap-3">
        {CASE_STAGES.map((stage) => {
          const cards = pipeline[stage.stage] ?? []
          return (
            <div key={stage.stage} className="w-36 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#0B2C6B]">{stage.label}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((intern) => (
                  <button
                    key={intern.id}
                    type="button"
                    onClick={() => onSelect(intern)}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-left shadow-sm transition hover:border-[#0E4FA8]/40"
                  >
                    <p className="text-sm font-semibold text-[#0B2C6B]">{intern.fullName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{intern.university ?? '—'}</p>
                    <div className="mt-2"><StatusBadge status={intern.status} /></div>
                  </button>
                ))}
                {!cards.length && (
                  <p className="rounded-xl border border-dashed border-[#E5E7EB] px-2 py-5 text-center text-xs text-slate-400">Empty</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
