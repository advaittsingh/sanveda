import {
  AUDIT_ACTIONS,
  AUDIT_DEPARTMENTS,
  AUDIT_MODULES,
  type AuditFilters,
} from '../../../lib/auditOperationsService'
import { adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  filters: AuditFilters
  onChange: (patch: Partial<AuditFilters>) => void
}

export default function AuditFiltersPanel({ filters, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className={adminLabelClass}>Date From</label>
        <input type="date" className={adminInputClass} value={filters.dateFrom} onChange={(e) => onChange({ dateFrom: e.target.value })} />
      </div>
      <div>
        <label className={adminLabelClass}>Date To</label>
        <input type="date" className={adminInputClass} value={filters.dateTo} onChange={(e) => onChange({ dateTo: e.target.value })} />
      </div>
      <div>
        <label className={adminLabelClass}>User</label>
        <input className={adminInputClass} value={filters.user} onChange={(e) => onChange({ user: e.target.value })} placeholder="Filter by user" />
      </div>
      <div>
        <label className={adminLabelClass}>Department</label>
        <select className={adminInputClass} value={filters.department} onChange={(e) => onChange({ department: e.target.value })}>
          <option value="all">All departments</option>
          {AUDIT_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Module</label>
        <select className={adminInputClass} value={filters.module} onChange={(e) => onChange({ module: e.target.value })}>
          <option value="all">All modules</option>
          {AUDIT_MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Action</label>
        <select className={adminInputClass} value={filters.action} onChange={(e) => onChange({ action: e.target.value as AuditFilters['action'] })}>
          <option value="all">All actions</option>
          {AUDIT_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Severity</label>
        <select className={adminInputClass} value={filters.severity} onChange={(e) => onChange({ severity: e.target.value as AuditFilters['severity'] })}>
          <option value="all">All severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="security">Security</option>
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Status</label>
        <select className={adminInputClass} value={filters.status} onChange={(e) => onChange({ status: e.target.value as AuditFilters['status'] })}>
          <option value="all">All results</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={adminLabelClass}>IP Address</label>
        <input className={adminInputClass} value={filters.ip} onChange={(e) => onChange({ ip: e.target.value })} placeholder="e.g. 122.xxx" />
      </div>
    </div>
  )
}
