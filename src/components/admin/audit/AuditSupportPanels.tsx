import AdminCard from '../ui/AdminCard'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import AuditSeverityBadge from './AuditSeverityBadge'
import type {
  AuditLogEntry,
  ComplianceReport,
  DataChangeEntry,
  FinancialAuditEntry,
  MembershipAuditEntry,
  SecurityLogEntry,
  VolunteerAuditEntry,
} from '../../../lib/auditOperationsService'

export function AuditSecurityPanel({ logs }: { logs: SecurityLogEntry[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Security Audit Logs</h3>
      <p className="mb-4 text-sm text-slate-500">Failed logins · Password changes · Role changes · Permission changes · 2FA · Device changes · Suspicious activity</p>
      <DataTable
        columns={[
          { key: 'event', header: 'Event', render: (l) => <span className="font-medium">{l.event}</span> },
          { key: 'user', header: 'User', render: (l) => l.user },
          { key: 'device', header: 'Device', render: (l) => l.device },
          { key: 'ip', header: 'IP', render: (l) => l.ip },
          { key: 'result', header: 'Result', render: (l) => <StatusBadge status={l.result} /> },
        ]}
        data={logs}
        keyFn={(l) => l.id}
        emptyMessage="No security events logged."
      />
    </AdminCard>
  )
}

export function AuditFinancialPanel({ logs }: { logs: FinancialAuditEntry[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Financial Audit Tracking</h3>
      <p className="mb-4 text-sm text-slate-500">Donations · Refunds · Expense approvals · Tax receipts · Bank reconciliation · Grants</p>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="rounded-xl border border-[#E5E7EB] p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold text-[#0B2C6B]">{log.date}</p>
              <AuditSeverityBadge severity={log.severity} />
            </div>
            <p className="mt-1 font-medium">{log.user} — {log.action}</p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-3">
              <div><dt className="text-slate-500">Amount</dt><dd className="font-semibold">{log.amount}</dd></div>
              <div><dt className="text-slate-500">Project</dt><dd className="font-medium">{log.project}</dd></div>
              <div><dt className="text-slate-500">Reference</dt><dd className="font-mono text-xs">{log.referenceId}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function AuditVolunteerPanel({ logs }: { logs: VolunteerAuditEntry[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Volunteer Audit Trail</h3>
      <DataTable
        columns={[
          { key: 'date', header: 'Date', render: (l) => l.date },
          { key: 'action', header: 'Action', render: (l) => <span className="font-medium">{l.action}</span> },
          { key: 'volunteer', header: 'Volunteer', render: (l) => l.volunteer },
          { key: 'module', header: 'Module', render: (l) => l.module },
          { key: 'user', header: 'By', render: (l) => l.user },
        ]}
        data={logs}
        keyFn={(l) => l.id}
        emptyMessage="No volunteer audit entries."
      />
    </AdminCard>
  )
}

export function AuditMembershipPanel({ logs }: { logs: MembershipAuditEntry[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Membership Audit Trail</h3>
      <DataTable
        columns={[
          { key: 'date', header: 'Date', render: (l) => l.date },
          { key: 'action', header: 'Action', render: (l) => <span className="font-medium">{l.action}</span> },
          { key: 'member', header: 'Member', render: (l) => l.member },
          { key: 'user', header: 'By', render: (l) => l.user },
        ]}
        data={logs}
        keyFn={(l) => l.id}
        emptyMessage="No membership audit entries."
      />
    </AdminCard>
  )
}

export function AuditApprovalsPanel({ logs }: { logs: AuditLogEntry[] }) {
  const approvals = logs.filter((l) => l.action === 'APPROVE' || l.action === 'REJECT')
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Approval Logs</h3>
      <DataTable
        columns={[
          { key: 'time', header: 'Time', render: (l) => new Date(l.createdAt).toLocaleDateString('en-IN') },
          { key: 'user', header: 'User', render: (l) => l.userName },
          { key: 'action', header: 'Action', render: (l) => l.action },
          { key: 'module', header: 'Module', render: (l) => l.module },
          { key: 'object', header: 'Object', render: (l) => l.object },
          { key: 'status', header: 'Result', render: (l) => <StatusBadge status={l.status} /> },
        ]}
        data={approvals}
        keyFn={(l) => l.id}
        emptyMessage="No approval logs found."
      />
    </AdminCard>
  )
}

export function AuditDataChangesPanel({ changes }: { changes: DataChangeEntry[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Data Change History</h3>
      <div className="space-y-4">
        {changes.map((c) => (
          <div key={c.id} className="rounded-xl border border-[#E5E7EB] p-4 text-sm">
            <p className="font-semibold text-[#0B2C6B]">{c.entity}</p>
            <p className="text-xs text-slate-500">{c.module}</p>
            <div className="mt-3 rounded-lg bg-[#F8FAFC] px-3 py-2">
              <p><span className="text-slate-500">Original:</span> {c.original}</p>
              <p className="mt-1"><span className="text-slate-500">Updated:</span> {c.updated}</p>
            </div>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <div><dt className="text-slate-500">Changed by</dt><dd className="font-medium">{c.changedBy}</dd></div>
              <div><dt className="text-slate-500">Approved by</dt><dd className="font-medium">{c.approvedBy}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function AuditCompliancePanel({ reports }: { reports: ComplianceReport[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Compliance Reports</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#E5E7EB] p-4">
            <h4 className="font-semibold text-[#0B2C6B]">{r.name}</h4>
            <p className="mt-1 text-sm text-slate-500">{r.description}</p>
            {r.lastGenerated ? <p className="mt-2 text-xs text-slate-400">Last generated: {r.lastGenerated}</p> : null}
            <button type="button" className={`${adminBtnSecondary} mt-3`}>Generate Report</button>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function AuditExportsPanel({ onExportCsv, onGenerateAudit, onGenerateCompliance }: {
  onExportCsv: () => void
  onGenerateAudit: () => void
  onGenerateCompliance: () => void
}) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Export Options</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button type="button" className={adminBtnSecondary} onClick={onExportCsv}>Export CSV</button>
        <button type="button" className={adminBtnSecondary}>Export Excel</button>
        <button type="button" className={adminBtnSecondary}>Export PDF</button>
        <button type="button" className={adminBtnPrimary} onClick={onGenerateAudit}>Generate Audit Report</button>
        <button type="button" className={adminBtnPrimary} onClick={onGenerateCompliance}>Generate Compliance Report</button>
      </div>
    </AdminCard>
  )
}

export function AuditSettingsPanel() {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Audit Center Settings</h3>
      <ul className="space-y-2 text-sm text-slate-600">
        <li>• Log retention: 365 days (extendable for compliance)</li>
        <li>• Critical actions require dual approval logging</li>
        <li>• Financial module: immutable audit trail enabled</li>
        <li>• Security events: real-time alert to Super Admin</li>
        <li>• Export includes IP, device, session metadata</li>
        <li>• AI anomaly detection: enabled</li>
      </ul>
    </AdminCard>
  )
}

export function AuditActionTypesPanel() {
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT', 'EXPORT', 'DOWNLOAD', 'UPLOAD', 'GENERATE', 'SEND', 'ASSIGN', 'PUBLISH', 'ARCHIVE']
  return (
    <AdminCard>
      <h3 className="mb-3 text-base font-semibold text-[#0B2C6B]">Tracked Action Types</h3>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <span key={a} className="rounded-md bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-slate-600">{a}</span>
        ))}
      </div>
    </AdminCard>
  )
}
