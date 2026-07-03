import AdminCard from '../ui/AdminCard'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import type {
  ActivityLogEntry,
  ApprovalStep,
  AuditLogEntry,
  Department,
  ModulePermission,
  OrgChartNode,
  PendingInvite,
  RoleDefinition,
  RbacDashboardData,
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
          {['Create Admin', 'Email Invite', 'Password Setup', '2FA Setup', 'Role Assignment', 'Activated'].map((step, i, arr) => (
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

export function RbacPermissionsPanel({ permissions, selectedRole }: { permissions: Record<string, ModulePermission[]>; selectedRole: string }) {
  const rows = permissions[selectedRole] ?? permissions.super_admin ?? []

  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Granular Permissions — {selectedRole.replace(/_/g, ' ')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-left text-slate-500">
              <th className="pb-2 pr-4 font-semibold">Module</th>
              <th className="pb-2 px-2 font-semibold">View</th>
              <th className="pb-2 px-2 font-semibold">Create</th>
              <th className="pb-2 px-2 font-semibold">Edit</th>
              <th className="pb-2 px-2 font-semibold">Delete</th>
              <th className="pb-2 px-2 font-semibold">Approve</th>
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
                <td className="px-2 text-center"><Check ok={row.approve} /></td>
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
          { key: 'head', header: 'Department Head', render: (d) => d.head ?? '—' },
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
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Approval Hierarchy</h3>
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
  const days = [...new Set(logs.map((l) => l.day))]
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Activity Logs</h3>
      {days.map((day) => (
        <div key={day} className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-slate-500">{day}</h4>
          <ul className="space-y-3">
            {logs.filter((l) => l.day === day).map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-4 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm">
                <div>
                  <span className="font-semibold text-[#0B2C6B]">{l.user}</span>
                  <span className="text-slate-600"> — {l.action}</span>
                  <p className="text-xs text-slate-400">{l.module}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-slate-500">{l.time}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </AdminCard>
  )
}

export function RbacAuditPanel({ logs }: { logs: AuditLogEntry[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Audit Trail</h3>
      <p className="mb-4 text-sm text-slate-500">Created · Updated · Deleted · Approved · Rejected · Exported · Downloaded</p>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="rounded-xl border border-[#E5E7EB] p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold text-[#0B2C6B]">{log.user}</p>
              <p className="text-xs text-slate-400">{log.timestamp}</p>
            </div>
            <p className="mt-1 font-medium text-slate-700">{log.action} · {log.module}</p>
            <div className="mt-3 rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs">
              <p><span className="text-slate-500">Old:</span> {log.oldValue}</p>
              <p className="mt-1"><span className="text-slate-500">New:</span> {log.newValue}</p>
            </div>
            <dl className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
              <div><dt className="text-slate-500">IP</dt><dd className="font-medium">{log.ip}</dd></div>
              <div><dt className="text-slate-500">Browser</dt><dd className="font-medium">{log.browser}</dd></div>
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

export function RbacTeamsPanel({ departments, users }: { departments: Department[]; users: { name: string; department: string; designation: string; roleLabel: string }[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Teams by Department</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {departments.map((d) => {
          const team = users.filter((u) => u.department === d.name)
          return (
            <div key={d.id} className="rounded-xl border border-[#E5E7EB] p-4">
              <h4 className="font-semibold text-[#0B2C6B]">{d.name}</h4>
              <p className="text-xs text-slate-500">{team.length} members</p>
              <ul className="mt-3 space-y-2">
                {team.slice(0, 5).map((u) => (
                  <li key={u.name} className="flex justify-between text-sm">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-slate-500">{u.roleLabel}</span>
                  </li>
                ))}
                {!team.length ? <li className="text-sm text-slate-400">No admins assigned</li> : null}
              </ul>
            </div>
          )
        })}
      </div>
    </AdminCard>
  )
}

function OrgChartNodeView({ node, depth = 0 }: { node: OrgChartNode; depth?: number }) {
  return (
    <div className={`flex flex-col items-center ${depth > 0 ? 'mt-4' : ''}`}>
      <div className="rounded-xl border-2 border-[#0B2C6B] bg-white px-4 py-2 text-sm font-semibold text-[#0B2C6B] shadow-sm">
        {node.label}
      </div>
      {node.children?.length ? (
        <>
          <div className="my-2 h-4 w-px bg-[#E5E7EB]" />
          <div className="flex flex-wrap justify-center gap-6">
            {node.children.map((child) => (
              <OrgChartNodeView key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export function RbacOrgChartPanel({ orgChart }: { orgChart: OrgChartNode }) {
  return (
    <AdminCard>
      <h3 className="mb-6 text-base font-semibold text-[#0B2C6B]">Organization Chart</h3>
      <div className="overflow-x-auto py-4">
        <OrgChartNodeView node={orgChart} />
      </div>
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
