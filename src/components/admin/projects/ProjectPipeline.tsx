import { LIFECYCLE_STAGES, type ProjectProfile } from '../../../lib/projectOperationsService'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  pipeline: Record<string, ProjectProfile[]>
  onSelect: (project: ProjectProfile) => void
}

export default function ProjectPipeline({ pipeline, onSelect }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[1050px] gap-3">
        {LIFECYCLE_STAGES.map((stage) => {
          const cards = pipeline[stage.stage] ?? []
          return (
            <div key={stage.stage} className="w-36 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#0B2C6B]">{stage.label}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onSelect(project)}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-left shadow-sm transition hover:border-[#0E4FA8]/40"
                  >
                    <p className="text-sm font-semibold text-[#0B2C6B]">{project.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{project.focusArea ?? '—'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={project.status} />
                      <span className="text-xs font-semibold text-slate-500">{project.computedProgress}%</span>
                    </div>
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
