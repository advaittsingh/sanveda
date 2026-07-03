import {
  MEMBER_ACTIVITY_OPTIONS,
  MEMBER_ENGAGEMENT_OPTIONS,
  MEMBER_STATUS_OPTIONS,
  TIER_FILTER_OPTIONS,
  type MemberFilters,
} from '../../../lib/membershipOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: MemberFilters
  onChange: (patch: Partial<MemberFilters>) => void
}

export default function MembershipFiltersPanel({ filters, onChange }: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
      <label>
        <span className={adminLabelClass}>Tier</span>
        <select
          className={adminInputClass}
          value={filters.tier}
          onChange={(e) => onChange({ tier: e.target.value as MemberFilters['tier'] })}
        >
          {TIER_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Status</span>
        <select
          className={adminInputClass}
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value as MemberFilters['status'] })}
        >
          {MEMBER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Activity</span>
        <select
          className={adminInputClass}
          value={filters.activity}
          onChange={(e) => onChange({ activity: e.target.value as MemberFilters['activity'] })}
        >
          {MEMBER_ACTIVITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Engagement</span>
        <select
          className={adminInputClass}
          value={filters.engagement}
          onChange={(e) => onChange({ engagement: e.target.value as MemberFilters['engagement'] })}
        >
          {MEMBER_ENGAGEMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
