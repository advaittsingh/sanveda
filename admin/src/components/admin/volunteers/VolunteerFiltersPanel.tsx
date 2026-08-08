import {
  DEPARTMENT_OPTIONS,
  STATUS_FILTER_OPTIONS,
  type VolunteerFilters,
} from '../../../lib/volunteerOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: VolunteerFilters
  teams: string[]
  onChange: (patch: Partial<VolunteerFilters>) => void
}

export default function VolunteerFiltersPanel({ filters, teams, onChange }: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-3">
      <label>
        <span className={adminLabelClass}>Status</span>
        <select
          className={adminInputClass}
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value as VolunteerFilters['status'] })}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={adminLabelClass}>Department</span>
        <select
          className={adminInputClass}
          value={filters.department}
          onChange={(e) => onChange({ department: e.target.value })}
        >
          {DEPARTMENT_OPTIONS.map((dept) => (
            <option key={dept} value={dept}>
              {dept === 'all' ? 'All Departments' : dept}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className={adminLabelClass}>Team</span>
        <select
          className={adminInputClass}
          value={filters.team}
          onChange={(e) => onChange({ team: e.target.value })}
        >
          <option value="all">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
