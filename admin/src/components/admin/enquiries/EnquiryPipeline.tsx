import { WORKFLOW_STAGES, type EnquiryProfile } from '../../../lib/enquiryOperationsService'

interface Props {
  pipeline: Record<string, EnquiryProfile[]>
  onSelect: (enquiry: EnquiryProfile) => void
}

const priorityColor: Record<string, string> = {
  critical: 'border-red-300 bg-red-50',
  high: 'border-amber-300 bg-amber-50',
  medium: 'border-sky-200 bg-sky-50',
  low: 'border-slate-200 bg-white',
}

export default function EnquiryPipeline({ pipeline, onSelect }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[900px] gap-3">
        {WORKFLOW_STAGES.map(({ stage, label }) => {
          const cards = pipeline[stage] ?? []
          return (
            <div key={stage} className="w-40 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#0B2C6B]">{label}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => onSelect(eq)}
                    className={`w-full rounded-xl border p-3 text-left shadow-sm transition hover:border-[#0E4FA8]/40 ${priorityColor[eq.priority]}`}
                  >
                    <p className="text-xs font-semibold text-[#0B2C6B]">{eq.ticketId}</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-800">{eq.name}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{eq.categoryLabel}</p>
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
