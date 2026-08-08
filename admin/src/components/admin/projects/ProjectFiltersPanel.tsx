import {
  FOCUS_FILTER_OPTIONS,
  LIFECYCLE_FILTER_OPTIONS,
  PRIORITY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  type ProjectFilters,
} from '../../../lib/projectOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: ProjectFilters
  onChange: (patch: Partial<ProjectFilters>) => void
  focusAreaOptions: string[]
}

export default function ProjectFiltersPanel({ filters, onChange, focusAreaOptions }: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
      <label>
        <span className={adminLabelClass}>Focus Area</span>
        <select
          className={adminInputClass}
          value={filters.focusArea}
          onChange={(e) => onChange({ focusArea: e.target.value })}
        >
          {FOCUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
          {focusAreaOptions.filter((f) => !FOCUS_FILTER_OPTIONS.some((o) => o.value === f)).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Status</span>
        <select
          className={adminInputClass}
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value as ProjectFilters['status'] })}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Lifecycle Stage</span>
        <select
          className={adminInputClass}
          value={filters.lifecycle}
          onChange={(e) => onChange({ lifecycle: e.target.value as ProjectFilters['lifecycle'] })}
        >
          {LIFECYCLE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Priority</span>
        <select
          className={adminInputClass}
          value={filters.priority}
          onChange={(e) => onChange({ priority: e.target.value as ProjectFilters['priority'] })}
        >
          {PRIORITY_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
