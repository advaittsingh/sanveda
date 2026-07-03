import { PIPELINE_STAGES, type MemberProfile } from '../../../lib/membershipOperationsService'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  pipeline: Record<string, MemberProfile[]>
  onSelect: (member: MemberProfile) => void
}

export default function MembershipPipeline({ pipeline, onSelect }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[1080px] gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const cards = pipeline[stage.stage] ?? []
          return (
            <div key={stage.stage} className="w-44 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#0B2C6B]">{stage.label}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => onSelect(member)}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-left shadow-sm transition hover:border-[#0E4FA8]/40"
                  >
                    <p className="text-sm font-semibold text-[#0B2C6B]">{member.fullName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{member.tierLabel}</p>
                    <div className="mt-2"><StatusBadge status={member.status} /></div>
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
