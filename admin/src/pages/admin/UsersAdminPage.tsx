import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, Shield, UserPlus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import RbacAiInsights from '../../components/admin/users/RbacAiInsights'
import RbacAnalytics from '../../components/admin/users/RbacAnalytics'
import RbacDeleteConfirmModal from '../../components/admin/users/RbacDeleteConfirmModal'
import RbacDepartmentModal from '../../components/admin/users/RbacDepartmentModal'
import RbacFiltersPanel from '../../components/admin/users/RbacFiltersPanel'
import RbacKpiCards from '../../components/admin/users/RbacKpiCards'
import RbacNav from '../../components/admin/users/RbacNav'
import RbacProfileDrawer from '../../components/admin/users/RbacProfileDrawer'
import RbacRoleModal from '../../components/admin/users/RbacRoleModal'
import {
  RbacActivityPanel,
  RbacApprovalsPanel,
  RbacAuditPanel,
  RbacDashboardOverview,
  RbacDepartmentsPanel,
  RbacInvitationsPanel,
  RbacOrgChartPanel,
  RbacPermissionsPanel,
  RbacRolesPanel,
  RbacSecurityPanel,
  RbacTeamsPanel,
} from '../../components/admin/users/RbacSupportPanels'
import RbacToolbar from '../../components/admin/users/RbacToolbar'
import RbacUserEditorModal from '../../components/admin/users/RbacUserEditorModal'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  deleteDepartment,
  deleteRole,
  exportUsersCsv,
  filterUsers,
  formatLastLogin,
  getRbacDashboardData,
  parseRbacTab,
  saveAdminUser,
  saveCustomRole,
  saveDepartment,
  updateCustomRole,
  updateDepartment,
  type AdminUserProfile,
  type Department,
  type RbacDashboardData,
  type RbacFilters,
  type RbacTab,
  type RoleDefinition,
} from '../../lib/adminUserOperationsService'

const defaultFilters: RbacFilters = {
  search: '',
  department: 'all',
  role: 'all',
  status: 'all',
  lastLogin: 'all',
}

export default function UsersAdminPage() {
  const { authed } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [dashboard, setDashboard] = useState<RbacDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<RbacTab>(() => parseRbacTab(searchParams.get('tab')))
  const [filters, setFilters] = useState<RbacFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [active, setActive] = useState<AdminUserProfile | null>(null)
  const [editing, setEditing] = useState<Partial<AdminUserProfile> | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [inviteMode, setInviteMode] = useState(false)
  const [roleModal, setRoleModal] = useState<{ mode: 'create' | 'edit'; role?: RoleDefinition } | null>(null)
  const [deptModal, setDeptModal] = useState<{ mode: 'create' | 'edit'; department?: Department } | null>(null)
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<RoleDefinition | null>(null)
  const [deleteDeptTarget, setDeleteDeptTarget] = useState<Department | null>(null)
  const [permRole, setPermRole] = useState('super_admin')
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    try {
      setDashboard(await getRbacDashboardData())
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) void refresh()
  }, [authed, refresh])

  useEffect(() => {
    const t = parseRbacTab(searchParams.get('tab'))
    setTab(t)
  }, [searchParams])

  const setTabAndUrl = (t: RbacTab) => {
    setTab(t)
    setSearchParams(t === 'dashboard' ? {} : { tab: t }, { replace: true })
  }

  const filtered = useMemo(() => {
    if (!dashboard) return []
    return filterUsers(dashboard.users, filters)
  }, [dashboard, filters])

  const managers = useMemo(() => dashboard?.users.map((u) => u.name) ?? [], [dashboard])

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3500)
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

  const openRolePermissions = (role: RoleDefinition) => {
    setPermRole(role.key || String(role.id))
    setTabAndUrl('permissions')
  }

  const handleSave = async (u: Partial<AdminUserProfile> & { email: string; firstName: string; lastName: string }) => {
    const wasInvite = inviteMode
    await saveAdminUser({ ...u, status: wasInvite ? 'invited' : (u.status ?? 'active') })
    setShowEditor(false)
    setEditing(null)
    setInviteMode(false)
    // Refetch so KPI cards (total admins / pending invites / departments) update without a full page reload.
    await refresh({ silent: true })
    notify(wasInvite ? `Invite sent to ${u.email}.` : `Admin ${u.firstName} ${u.lastName} saved.`)
  }

  const showUserTable = tab === 'dashboard' || tab === 'users'

  const headerActions = (
    <>
      <button type="button" className={adminBtnPrimary} onClick={openInvite}>
        <UserPlus size={15} className="mr-1.5 inline" />Invite Admin
      </button>
      <button type="button" className={adminBtnSecondary} onClick={() => setRoleModal({ mode: 'create' })}>
        <Shield size={15} className="mr-1.5 inline" />Create Role
      </button>
      <button type="button" className={adminBtnSecondary} onClick={() => setDeptModal({ mode: 'create' })}>
        <Building2 size={15} className="mr-1.5 inline" />Create Department
      </button>
    </>
  )

  if (!authed) {
    return (
      <AdminLogin
        title="Admin Users"
        subtitle="Manage administrators, permissions, departments and access policies."
      />
    )
  }

  return (
    <AdminShell
      title="Admin Users"
      subtitle="Manage administrators, permissions, departments and access policies."
      actions={headerActions}
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0B2C6B] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading administration center…</p></AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <RbacKpiCards kpis={dashboard.kpis} />
          <RbacNav active={tab} onChange={setTabAndUrl} />

          {tab === 'dashboard' ? (
            <>
              <RbacDashboardOverview />
              <RbacAnalytics activityByDepartment={dashboard.activityByDepartment} moduleUsage={dashboard.moduleUsage} />
            </>
          ) : null}

          {showUserTable ? (
            <AdminCard>
              <RbacToolbar
                onExport={() => { exportUsersCsv(filtered); notify('Admin users exported to CSV.') }}
                search={filters.search}
                onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((v) => !v)}
              />
              {showFilters ? (
                <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                  <RbacFiltersPanel
                    filters={filters}
                    departments={dashboard.departments}
                    roles={dashboard.roles}
                    onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
                  />
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
                    { key: 'department', header: 'Department', render: (u) => u.department },
                    { key: 'designation', header: 'Designation', render: (u) => u.designation },
                    { key: 'role', header: 'Role', render: (u) => u.roleLabel },
                    { key: 'lastLogin', header: 'Last Login', render: (u) => formatLastLogin(u.lastLogin) },
                    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (u) => (
                        <button type="button" className={adminBtnSecondary} onClick={(e) => { e.stopPropagation(); setActive(u) }}>
                          Manage
                        </button>
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

          {tab === 'roles' ? (
            <RbacRolesPanel
              roles={dashboard.roles}
              onOpenRole={openRolePermissions}
              onEditRole={(role) => setRoleModal({ mode: 'edit', role })}
              onDeleteRole={setDeleteRoleTarget}
            />
          ) : null}
          {tab === 'permissions' ? (
            <>
              <AdminCard>
                <label className="mb-2 block text-sm font-semibold text-slate-600">Select role to view permissions</label>
                <select
                  className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                  value={permRole}
                  onChange={(e) => setPermRole(e.target.value)}
                >
                  {dashboard.roles.map((role) => <option key={role.dbId || role.id} value={role.key || role.id}>{role.name}</option>)}
                </select>
              </AdminCard>
              <RbacPermissionsPanel permissions={dashboard.permissions} selectedRole={permRole} />
            </>
          ) : null}
          {tab === 'departments' ? (
            <RbacDepartmentsPanel
              departments={dashboard.departments}
              onEdit={(department) => setDeptModal({ mode: 'edit', department })}
              onDelete={setDeleteDeptTarget}
            />
          ) : null}
          {tab === 'teams' ? <RbacTeamsPanel departments={dashboard.departments} users={dashboard.users} /> : null}
          {tab === 'approvals' ? <RbacApprovalsPanel approvalMatrix={dashboard.approvalMatrix} /> : null}
          {tab === 'activity' ? <RbacActivityPanel logs={dashboard.activityLogs} /> : null}
          {tab === 'audit' ? <RbacAuditPanel logs={dashboard.auditLogs} /> : null}
          {tab === 'invitations' ? <RbacInvitationsPanel invites={dashboard.pendingInvites} /> : null}
          {tab === 'security' ? <RbacSecurityPanel settings={dashboard.securitySettings} /> : null}
          {tab === 'orgchart' ? <RbacOrgChartPanel orgChart={dashboard.orgChart} /> : null}
          {tab === 'analytics' ? (
            <RbacAnalytics activityByDepartment={dashboard.activityByDepartment} moduleUsage={dashboard.moduleUsage} />
          ) : null}

          <RbacAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <RbacProfileDrawer
        user={active}
        permissions={dashboard?.permissions ?? {}}
        onClose={() => setActive(null)}
        onEdit={() => active && openEdit(active)}
      />
      <RbacUserEditorModal
        key={editing?.id ?? (inviteMode ? 'invite' : 'new')}
        open={showEditor}
        user={editing}
        managers={managers}
        departments={dashboard?.departments ?? []}
        roles={dashboard?.roles ?? []}
        inviteMode={inviteMode}
        onClose={() => { setShowEditor(false); setEditing(null); setInviteMode(false) }}
        onSave={handleSave}
      />
      <RbacRoleModal
        key={roleModal?.role?.dbId ?? 'create-role'}
        open={Boolean(roleModal)}
        mode={roleModal?.mode ?? 'create'}
        initialName={roleModal?.role?.name ?? ''}
        initialDescription={roleModal?.role?.description ?? ''}
        onClose={() => setRoleModal(null)}
        onSave={async (name, description) => {
          if (roleModal?.mode === 'edit' && roleModal.role) {
            await updateCustomRole(roleModal.role.dbId, name, description)
            setRoleModal(null)
            await refresh({ silent: true })
            notify(`Role "${name}" updated.`)
            return
          }
          await saveCustomRole(name, description)
          setRoleModal(null)
          await refresh({ silent: true })
          notify(`Role "${name}" created.`)
        }}
      />
      <RbacDepartmentModal
        key={deptModal?.department?.id ?? 'create-dept'}
        open={Boolean(deptModal)}
        mode={deptModal?.mode ?? 'create'}
        initialName={deptModal?.department?.name ?? ''}
        onClose={() => setDeptModal(null)}
        onSave={async (name) => {
          if (deptModal?.mode === 'edit' && deptModal.department) {
            await updateDepartment(deptModal.department.id, name)
            setDeptModal(null)
            await refresh({ silent: true })
            notify(`Department "${name}" updated.`)
            return
          }
          await saveDepartment(name)
          setDeptModal(null)
          await refresh({ silent: true })
          notify(`Department "${name}" created.`)
        }}
      />
      <RbacDeleteConfirmModal
        open={Boolean(deleteRoleTarget)}
        title="Delete Role"
        entityLabel="role"
        entityName={deleteRoleTarget?.name ?? ''}
        adminCount={deleteRoleTarget?.assignedCount ?? 0}
        inviteCount={deleteRoleTarget?.inviteCount ?? 0}
        reassignOptions={(dashboard?.roles ?? [])
          .filter((role) => role.dbId !== deleteRoleTarget?.dbId)
          .map((role) => ({ id: role.dbId, label: role.name }))}
        onClose={() => setDeleteRoleTarget(null)}
        onConfirm={async (reassignToId) => {
          if (!deleteRoleTarget) return
          await deleteRole(deleteRoleTarget.dbId, { reassignToRoleDbId: reassignToId })
          setDeleteRoleTarget(null)
          await refresh({ silent: true })
          notify(`Role "${deleteRoleTarget.name}" deleted.`)
        }}
      />
      <RbacDeleteConfirmModal
        open={Boolean(deleteDeptTarget)}
        title="Delete Department"
        entityLabel="department"
        entityName={deleteDeptTarget?.name ?? ''}
        adminCount={deleteDeptTarget?.headCount ?? 0}
        inviteCount={deleteDeptTarget?.inviteCount ?? 0}
        reassignOptions={(dashboard?.departments ?? [])
          .filter((department) => department.id !== deleteDeptTarget?.id)
          .map((department) => ({ id: department.id, label: department.name }))}
        onClose={() => setDeleteDeptTarget(null)}
        onConfirm={async (reassignToId) => {
          if (!deleteDeptTarget) return
          await deleteDepartment(deleteDeptTarget.id, { reassignToDepartmentId: reassignToId })
          setDeleteDeptTarget(null)
          await refresh({ silent: true })
          notify(`Department "${deleteDeptTarget.name}" deleted.`)
        }}
      />
    </AdminShell>
  )
}
