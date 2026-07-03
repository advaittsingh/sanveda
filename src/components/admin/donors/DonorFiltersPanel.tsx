import {
  DONOR_TAG_OPTIONS,
  DONOR_TYPE_OPTIONS,
  ENGAGEMENT_OPTIONS,
  GIVING_LEVEL_OPTIONS,
  type DonorFilters,
} from '../../../lib/donorOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: DonorFilters
  onChange: (patch: Partial<DonorFilters>) => void
}

export default function DonorFiltersPanel({ filters, onChange }: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
      <label>
        <span className={adminLabelClass}>Donor Type</span>
        <select
          className={adminInputClass}
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value as DonorFilters['type'] })}
        >
          {DONOR_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={adminLabelClass}>Giving Level</span>
        <select
          className={adminInputClass}
          value={filters.givingLevel}
          onChange={(e) => onChange({ givingLevel: e.target.value as DonorFilters['givingLevel'] })}
        >
          {GIVING_LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={adminLabelClass}>Engagement</span>
        <select
          className={adminInputClass}
          value={filters.engagement}
          onChange={(e) => onChange({ engagement: e.target.value as DonorFilters['engagement'] })}
        >
          {ENGAGEMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={adminLabelClass}>Tag</span>
        <select
          className={adminInputClass}
          value={filters.tag}
          onChange={(e) => onChange({ tag: e.target.value })}
        >
          <option value="all">All Tags</option>
          {DONOR_TAG_OPTIONS.map((tag) => (
            <option key={tag} value={tag}>
              #{tag}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
