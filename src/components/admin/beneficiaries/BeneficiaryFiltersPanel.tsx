import {
  CATEGORY_FILTER_OPTIONS,
  PRIORITY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  type BeneficiaryFilters,
} from '../../../lib/beneficiaryOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: BeneficiaryFilters
  onChange: (patch: Partial<BeneficiaryFilters>) => void
  programOptions: string[]
  locationOptions: string[]
}

export default function BeneficiaryFiltersPanel({ filters, onChange, programOptions, locationOptions }: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-5">
      <label>
        <span className={adminLabelClass}>Category</span>
        <select
          className={adminInputClass}
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value as BeneficiaryFilters['category'] })}
        >
          {CATEGORY_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Status</span>
        <select
          className={adminInputClass}
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value as BeneficiaryFilters['status'] })}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Program</span>
        <select
          className={adminInputClass}
          value={filters.program}
          onChange={(e) => onChange({ program: e.target.value })}
        >
          <option value="all">All Programs</option>
          {programOptions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Location</span>
        <select
          className={adminInputClass}
          value={filters.location}
          onChange={(e) => onChange({ location: e.target.value })}
        >
          <option value="all">All Locations</option>
          {locationOptions.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Priority</span>
        <select
          className={adminInputClass}
          value={filters.priority}
          onChange={(e) => onChange({ priority: e.target.value as BeneficiaryFilters['priority'] })}
        >
          {PRIORITY_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
