import {
  CATEGORY_FILTER_OPTIONS,
  LIFECYCLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  type EventFilters,
} from '../../../lib/eventOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: EventFilters
  onChange: (patch: Partial<EventFilters>) => void
  locationOptions: string[]
}

export default function EventFiltersPanel({ filters, onChange, locationOptions }: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
      <label>
        <span className={adminLabelClass}>Category</span>
        <select className={adminInputClass} value={filters.category} onChange={(e) => onChange({ category: e.target.value as EventFilters['category'] })}>
          {CATEGORY_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Status</span>
        <select className={adminInputClass} value={filters.status} onChange={(e) => onChange({ status: e.target.value as EventFilters['status'] })}>
          {STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Lifecycle</span>
        <select className={adminInputClass} value={filters.lifecycle} onChange={(e) => onChange({ lifecycle: e.target.value as EventFilters['lifecycle'] })}>
          {LIFECYCLE_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Location</span>
        <select className={adminInputClass} value={filters.location} onChange={(e) => onChange({ location: e.target.value })}>
          <option value="all">All Locations</option>
          {locationOptions.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </label>
    </div>
  )
}
