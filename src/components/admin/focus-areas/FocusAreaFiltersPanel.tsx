import {
  PRIORITY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  type FocusAreaFilters,
} from '../../../lib/focusAreaOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: FocusAreaFilters
  onChange: (patch: Partial<FocusAreaFilters>) => void
}

export default function FocusAreaFiltersPanel({ filters, onChange }: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2">
      <label>
        <span className={adminLabelClass}>Status</span>
        <select
          className={adminInputClass}
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value as FocusAreaFilters['status'] })}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Priority Level</span>
        <select
          className={adminInputClass}
          value={filters.priority}
          onChange={(e) => onChange({ priority: e.target.value as FocusAreaFilters['priority'] })}
        >
          {PRIORITY_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
