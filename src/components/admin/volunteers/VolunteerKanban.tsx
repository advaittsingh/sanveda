import { PIPELINE_STAGES, type VolunteerProfile } from '../../../lib/volunteerOperationsService'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  pipeline: Record<string, VolunteerProfile[]>
  onSelect: (volunteer: VolunteerProfile) => void
}

export default function VolunteerKanban({ pipeline, onSelect }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[960px] gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const cards = pipeline[stage.status] ?? []
          return (
            <div key={stage.status} className="w-56 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0B2C6B]">{stage.label}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2">
                {cards.map((vol) => (
                  <button
                    key={vol.id}
                    type="button"
                    onClick={() => onSelect(vol)}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-left shadow-sm transition hover:border-[#0E4FA8]/40 hover:shadow-md"
                  >
                    <p className="font-semibold text-[#0B2C6B]">{vol.fullName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{vol.primaryRole}</p>
                    <p className="mt-1 text-xs text-slate-400">{vol.location}</p>
                    <div className="mt-2">
                      <StatusBadge status={vol.status} />
                    </div>
                  </button>
                ))}
                {!cards.length && (
                  <p className="rounded-xl border border-dashed border-[#E5E7EB] px-3 py-6 text-center text-xs text-slate-400">
                    No volunteers
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
