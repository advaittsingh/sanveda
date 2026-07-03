import {
  PROGRAM_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  type InternFilters,
} from '../../../lib/internshipOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: InternFilters
  onChange: (patch: Partial<InternFilters>) => void
  departmentOptions: string[]
  universityOptions: string[]
}

export default function InternshipFiltersPanel({ filters, onChange, departmentOptions, universityOptions }: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
      <label>
        <span className={adminLabelClass}>Department</span>
        <select
          className={adminInputClass}
          value={filters.department}
          onChange={(e) => onChange({ department: e.target.value })}
        >
          <option value="all">All Departments</option>
          {departmentOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
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
          {PROGRAM_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>Status</span>
        <select
          className={adminInputClass}
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value as InternFilters['status'] })}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabelClass}>University</span>
        <select
          className={adminInputClass}
          value={filters.university}
          onChange={(e) => onChange({ university: e.target.value })}
        >
          <option value="all">All Universities</option>
          {universityOptions.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
