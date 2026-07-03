import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import RbacAiInsights from '../../components/admin/users/RbacAiInsights'
import RbacAnalytics from '../../components/admin/users/RbacAnalytics'
import RbacFiltersPanel from '../../components/admin/users/RbacFiltersPanel'
import RbacKpiCards from '../../components/admin/users/RbacKpiCards'
import RbacNav from '../../components/admin/users/RbacNav'
import RbacProfileDrawer from '../../components/admin/users/RbacProfileDrawer'
import {
  RbacActivityPanel,
  RbacApprovalsPanel,
  RbacAuditPanel,
  RbacDashboardOverview,
  RbacDepartmentsPanel,
  RbacInvitationsPanel,
  RbacPermissionsPanel,
  RbacRolesPanel,
  RbacSecurityPanel,
  RbacSettingsPanel,
} from '../../components/admin/users/RbacSupportPanels'
import RbacToolbar from '../../components/admin/users/RbacToolbar'
import RbacUserEditorModal from '../../components/admin/users/RbacUserEditorModal'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnDanger, adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  deleteAdminUser,
  exportUsersCsv,
  filterUsers,
  formatLastLogin,
  getRbacDashboardData,
  saveAdminUser,
  SANVEDA_ROLES,
  type AdminUserProfile,
  type RbacDashboardData,
  type RbacFilters,
  type RbacTab,
  type SanvedaRole,
} from '../../lib/adminUserOperationsService'

const defaultFilters: RbacFilters = {
  search: '',
  department: 'all',
  role: 'all',
  status: 'all',
}

export default function UsersAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<RbacDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<RbacTab>('dashboard')
  const [filters, setFilters] = useState<RbacFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [active, setActive] = useState<AdminUserProfile | null>(null)
  const [editing, setEditing] = useState<Partial<AdminUserProfile> | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [inviteMode, setInviteMode] = useState(false)
  const [permRole, setPermRole] = useState<SanvedaRole>('super_admin')
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getRbacDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filtered = useMemo(() => {
    if (!dashboard) return []
    return filterUsers(dashboard.users, filters)
  }, [dashboard, filters])

  const managers = useMemo(() => {
    if (!dashboard) return []
    return dashboard.users.map((u) => u.name)
  }, [dashboard])

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3500)
  }

  const openAdd = () => {
    setEditing(null)
    setInviteMode(false)
    setShowEditor(true)
  }

  const openInvite = () => {
    setEditing(null)
    setInviteMode(true)
    setShowEditor(true)
  }

  const openEdit = (u: AdminUserProfile) => {
    setEditing(u)
    setInviteMode(false)
    setShowEditor(true)
    setActive(null)
  }

  const handleSave = async (u: Partial<AdminUserProfile> & { email: string; firstName: string; lastName: string }) => {
    await saveAdminUser({ ...u, status: inviteMode ? 'invited' : (u.status ?? 'active') })
    setShowEditor(false)
    setEditing(null)
    setInviteMode(false)
    await refresh()
    notify(inviteMode ? `Invite sent to ${u.email}.` : `Admin ${u.firstName} ${u.lastName} saved.`)
  }

  const handleDelete = async (id: string) => {
    await deleteAdminUser(id)
    setActive(null)
    await refresh()
    notify('Admin user removed.')
  }

  const showUserTable = tab === 'dashboard' || tab === 'users'

  if (!authed) {
    return (
      <AdminLogin
        title="Admin & Organization"
        subtitle="Role-based access control, departments, approvals, and security for your NGO team."
      />
    )
  }

  return (
    <AdminShell
      title="Admin & Organization"
      subtitle="RBAC & Organization Management — access control center for Sanveda NGO OS"
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0B2C6B] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading RBAC dashboard…</p></AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <RbacKpiCards kpis={dashboard.kpis} />
          <RbacNav active={tab} onChange={setTab} />

          {tab === 'dashboard' ? (
            <>
              <RbacDashboardOverview />
              <RbacAnalytics activityByDepartment={dashboard.activityByDepartment} moduleUsage={dashboard.moduleUsage} />
            </>
          ) : null}

          {showUserTable ? (
            <AdminCard>
              <RbacToolbar
                onAddAdmin={openAdd}
                onSendInvite={openInvite}
                onExport={() => { exportUsersCsv(filtered); notify('Admin users exported to CSV.') }}
                search={filters.search}
                onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((v) => !v)}
              />
              {showFilters ? (
                <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                  <RbacFiltersPanel filters={filters} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} />
                </div>
              ) : null}
              <div className="mt-4">
                <DataTable
                  columns={[
                    {
                      key: 'user',
                      header: 'User',
                      render: (u) => (
                        <div className="flex items-center gap-2">
                          {u.photo ? (
                            <img src={u.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2C6B] text-xs font-bold text-white">
                              {u.firstName[0]}{u.lastName[0]}
                            </span>
                          )}
                          <span className="font-medium">{u.name}</span>
                        </div>
                      ),
                    },
                    { key: 'email', header: 'Email', render: (u) => u.email },
                    { key: 'department', header: 'Department', render: (u) => u.department },
                    { key: 'role', header: 'Role', render: (u) => u.roleLabel },
                    { key: 'access', header: 'Access', render: (u) => u.accessLevel },
                    { key: 'lastLogin', header: 'Last Login', render: (u) => formatLastLogin(u.lastLogin) },
                    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (u) => (
                        <div className="flex gap-2">
                          <button type="button" className={adminBtnSecondary} onClick={(e) => { e.stopPropagation(); setActive(u) }}>Manage</button>
                          <button type="button" className={adminBtnSecondary} onClick={(e) => { e.stopPropagation(); openEdit(u) }}>Edit</button>
                          <button type="button" className={adminBtnDanger} onClick={(e) => { e.stopPropagation(); handleDelete(u.id) }}>Remove</button>
                        </div>
                      ),
                    },
                  ]}
                  data={filtered}
                  keyFn={(u) => u.id}
                  onRowClick={setActive}
                  selectedKey={active?.id}
                  emptyMessage="No admin users found."
                />
              </div>
            </AdminCard>
          ) : null}

          {tab === 'roles' ? <RbacRolesPanel roles={dashboard.roles} /> : null}
          {tab === 'permissions' ? (
            <>
              <AdminCard>
                <label className="mb-2 block text-sm font-semibold text-slate-600">Select role to view permissions</label>
                <select
                  className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                  value={permRole}
                  onChange={(e) => setPermRole(e.target.value as SanvedaRole)}
                >
                  {SANVEDA_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </AdminCard>
              <RbacPermissionsPanel permissions={dashboard.permissions} selectedRole={permRole} />
            </>
          ) : null}
          {tab === 'departments' ? <RbacDepartmentsPanel departments={dashboard.departments} /> : null}
          {tab === 'approvals' ? <RbacApprovalsPanel approvalMatrix={dashboard.approvalMatrix} /> : null}
          {tab === 'activity' ? <RbacActivityPanel logs={dashboard.activityLogs} /> : null}
          {tab === 'audit' ? <RbacAuditPanel logs={dashboard.auditLogs} /> : null}
          {tab === 'invitations' ? <RbacInvitationsPanel invites={dashboard.pendingInvites} /> : null}
          {tab === 'security' ? <RbacSecurityPanel settings={dashboard.securitySettings} /> : null}
          {tab === 'analytics' ? (
            <RbacAnalytics activityByDepartment={dashboard.activityByDepartment} moduleUsage={dashboard.moduleUsage} />
          ) : null}
          {tab === 'settings' ? <RbacSettingsPanel /> : null}

          <RbacAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <RbacProfileDrawer user={active} onClose={() => setActive(null)} onEdit={() => active && openEdit(active)} />
      <RbacUserEditorModal
        key={editing?.id ?? (inviteMode ? 'invite' : 'new')}
        open={showEditor}
        user={editing}
        managers={managers}
        inviteMode={inviteMode}
        onClose={() => { setShowEditor(false); setEditing(null); setInviteMode(false) }}
        onSave={handleSave}
      />
    </AdminShell>
  )
}
