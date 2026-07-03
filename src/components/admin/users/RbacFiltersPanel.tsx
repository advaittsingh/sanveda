import { DEPARTMENTS, SANVEDA_ROLES, type RbacFilters } from '../../../lib/adminUserOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: RbacFilters
  onChange: (patch: Partial<RbacFilters>) => void
}

export default function RbacFiltersPanel({ filters, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <label className={adminLabelClass}>Department</label>
        <select className={adminInputClass} value={filters.department} onChange={(e) => onChange({ department: e.target.value })}>
          <option value="all">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Role</label>
        <select className={adminInputClass} value={filters.role} onChange={(e) => onChange({ role: e.target.value as RbacFilters['role'] })}>
          <option value="all">All roles</option>
          {SANVEDA_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Status</label>
        <select className={adminInputClass} value={filters.status} onChange={(e) => onChange({ status: e.target.value as RbacFilters['status'] })}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Last Login</label>
        <select className={adminInputClass} value={filters.lastLogin} onChange={(e) => onChange({ lastLogin: e.target.value as RbacFilters['lastLogin'] })}>
          <option value="all">Any time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>
    </div>
  )
}
