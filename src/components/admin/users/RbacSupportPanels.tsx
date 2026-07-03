import AdminCard from '../ui/AdminCard'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import type {
  ActivityLogEntry,
  ApprovalStep,
  AuditLogEntry,
  Department,
  ModulePermission,
  PendingInvite,
  RoleDefinition,
  RbacDashboardData,
  SanvedaRole,
} from '../../../lib/adminUserOperationsService'

function Check({ ok }: { ok: boolean }) {
  return <span className={ok ? 'text-emerald-600 font-bold' : 'text-slate-300'}>{ok ? '✓' : '✗'}</span>
}

export function RbacDashboardOverview() {
  const notifications = [
    'New Donation', 'Campaign Approval', 'Volunteer Application', 'Membership Request',
    'Expense Approval', 'Enquiry Received', 'Tax Receipt Generated',
  ]
  const workspace = ['My Tasks', 'My Approvals', 'My Projects', 'My Events', 'My Reports', 'My Team']

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <AdminCard>
        <h3 className="mb-3 text-base font-semibold text-[#0B2C6B]">Invitation Flow</h3>
        <div className="space-y-2 text-sm text-slate-600">
          {['Create Admin', 'Email Invite', 'Password Setup', '2FA Setup', 'First Login', 'Activated'].map((step, i, arr) => (
            <div key={step}>
              <span className="font-medium text-[#0B2C6B]">{step}</span>
              {i < arr.length - 1 ? <div className="ml-4 border-l-2 border-[#E5E7EB] py-1 pl-3 text-xs text-slate-400">↓</div> : null}
            </div>
          ))}
        </div>
      </AdminCard>
      <AdminCard>
        <h3 className="mb-3 text-base font-semibold text-[#0B2C6B]">Organization Hierarchy</h3>
        <div className="space-y-2 text-sm text-slate-600">
          {['Board Members', 'CEO / Director', 'Department Heads', 'Managers', 'Executives', 'Volunteers'].map((level, i, arr) => (
            <div key={level}>
              <span className="font-medium">{level}</span>
              {i < arr.length - 1 ? <div className="ml-4 border-l-2 border-[#E5E7EB] py-1 pl-3 text-xs text-slate-400">↓</div> : null}
            </div>
          ))}
        </div>
      </AdminCard>
      <AdminCard>
        <h3 className="mb-3 text-base font-semibold text-[#0B2C6B]">Team Workspace</h3>
        <div className="flex flex-wrap gap-2">
          {workspace.map((w) => (
            <span key={w} className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-slate-600">{w}</span>
          ))}
        </div>
      </AdminCard>
      <AdminCard>
        <h3 className="mb-3 text-base font-semibold text-[#0B2C6B]">Admin Notifications</h3>
        <ul className="space-y-1.5 text-sm text-slate-600">
          {notifications.map((n) => <li key={n}>• {n}</li>)}
        </ul>
      </AdminCard>
    </div>
  )
}

export function RbacRolesPanel({ roles }: { roles: RoleDefinition[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Predefined Roles</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-[#0B2C6B]">{r.name}</h4>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">{r.accessLevel}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{r.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.modules.map((m) => (
                <span key={m} className="rounded-md bg-[#F8FAFC] px-2 py-0.5 text-xs font-medium text-slate-600">{m}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function RbacPermissionsPanel({ permissions, selectedRole }: { permissions: Record<SanvedaRole, ModulePermission[]>; selectedRole: SanvedaRole }) {
  const rows = permissions[selectedRole] ?? permissions.super_admin ?? []

  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Granular Permissions — {selectedRole.replace(/_/g, ' ')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-left text-slate-500">
              <th className="pb-2 pr-4 font-semibold">Module</th>
              <th className="pb-2 px-2 font-semibold">View</th>
              <th className="pb-2 px-2 font-semibold">Create</th>
              <th className="pb-2 px-2 font-semibold">Edit</th>
              <th className="pb-2 px-2 font-semibold">Delete</th>
              <th className="pb-2 px-2 font-semibold">Export</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.module} className="border-b border-[#F8FAFC]">
                <td className="py-2.5 pr-4 font-medium">{row.module}</td>
                <td className="px-2 text-center"><Check ok={row.view} /></td>
                <td className="px-2 text-center"><Check ok={row.create} /></td>
                <td className="px-2 text-center"><Check ok={row.edit} /></td>
                <td className="px-2 text-center"><Check ok={row.delete} /></td>
                <td className="px-2 text-center"><Check ok={row.export} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  )
}

export function RbacDepartmentsPanel({ departments }: { departments: Department[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Departments</h3>
      <DataTable
        columns={[
          { key: 'name', header: 'Department', render: (d) => <span className="font-medium">{d.name}</span> },
          { key: 'headCount', header: 'Team Size', render: (d) => `${d.headCount} admins` },
        ]}
        data={departments}
        keyFn={(d) => d.id}
        emptyMessage="No departments configured."
      />
    </AdminCard>
  )
}

export function RbacApprovalsPanel({ approvalMatrix }: { approvalMatrix: ApprovalStep[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Approval Matrix</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {approvalMatrix.map((w) => (
          <div key={w.id} className="rounded-xl border border-[#E5E7EB] p-4">
            <h4 className="font-semibold text-[#0B2C6B]">{w.workflow}</h4>
            <div className="mt-3 space-y-2">
              {w.steps.map((step, i) => (
                <div key={step}>
                  <span className="text-sm font-medium text-slate-700">{step}</span>
                  {i < w.steps.length - 1 ? <div className="ml-3 border-l-2 border-[#E5E7EB] py-1 pl-2 text-xs text-slate-400">↓</div> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function RbacActivityPanel({ logs }: { logs: ActivityLogEntry[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Admin Activity Logs</h3>
      <DataTable
        columns={[
          { key: 'user', header: 'User', render: (l) => <span className="font-medium">{l.user}</span> },
          { key: 'action', header: 'Action', render: (l) => l.action },
          { key: 'module', header: 'Module', render: (l) => l.module },
          { key: 'timestamp', header: 'Timestamp', render: (l) => l.timestamp },
        ]}
        data={logs}
        keyFn={(l) => l.id}
        emptyMessage="No activity logged yet."
      />
    </AdminCard>
  )
}

export function RbacAuditPanel({ logs }: { logs: AuditLogEntry[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Audit Logs</h3>
      <p className="mb-4 text-sm text-slate-500">Every action: Created, Updated, Deleted, Approved, Rejected, Exported, Downloaded</p>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="rounded-xl border border-[#E5E7EB] p-4 text-sm">
            <p className="font-semibold text-[#0B2C6B]">{log.date}</p>
            <dl className="mt-2 grid gap-1 sm:grid-cols-2">
              <div><dt className="text-slate-500">Admin</dt><dd className="font-medium">{log.admin}</dd></div>
              <div><dt className="text-slate-500">Action</dt><dd className="font-medium">{log.action}</dd></div>
              <div><dt className="text-slate-500">Detail</dt><dd className="font-medium">{log.detail}</dd></div>
              <div><dt className="text-slate-500">IP</dt><dd className="font-medium">{log.ip}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function RbacInvitationsPanel({ invites }: { invites: PendingInvite[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Pending Invitations</h3>
      <DataTable
        columns={[
          { key: 'email', header: 'Email', render: (i) => <span className="font-medium">{i.email}</span> },
          { key: 'role', header: 'Role', render: (i) => i.role },
          { key: 'department', header: 'Department', render: (i) => i.department },
          { key: 'sentAt', header: 'Sent', render: (i) => i.sentAt },
          { key: 'status', header: 'Status', render: () => <StatusBadge status="invited" /> },
        ]}
        data={invites}
        keyFn={(i) => i.id}
        emptyMessage="No pending invitations."
      />
    </AdminCard>
  )
}

export function RbacSecurityPanel({ settings }: { settings: RbacDashboardData['securitySettings'] }) {
  const items = [
    { label: 'Two-Factor Authentication (2FA)', enabled: settings.twoFactor },
    { label: 'Google Login', enabled: settings.googleLogin },
    { label: 'OTP Login', enabled: settings.otpLogin },
    { label: 'IP Restriction', enabled: settings.ipRestriction },
    { label: 'Device Restriction', enabled: settings.deviceRestriction },
  ]

  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Login Security</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
            <StatusBadge status={item.enabled ? 'active' : 'draft'} />
          </div>
        ))}
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded-xl bg-[#F8FAFC] p-4">
          <dt className="text-slate-500">Session Timeout</dt>
          <dd className="mt-1 font-semibold text-[#0B2C6B]">{settings.sessionTimeout}</dd>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] p-4">
          <dt className="text-slate-500">Password Policy</dt>
          <dd className="mt-1 font-semibold text-[#0B2C6B]">{settings.passwordPolicy}</dd>
        </div>
      </dl>
    </AdminCard>
  )
}

export function RbacSettingsPanel() {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Organization Settings</h3>
      <p className="text-sm text-slate-500">
        Configure default roles, session policies, and department mappings. Changes apply to new admin invites and role assignments.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        <li>• Default role for new invites: Viewer</li>
        <li>• Require 2FA for Super Admin and Finance roles</li>
        <li>• Audit log retention: 365 days</li>
        <li>• Auto-suspend inactive accounts after 90 days</li>
      </ul>
    </AdminCard>
  )
}
