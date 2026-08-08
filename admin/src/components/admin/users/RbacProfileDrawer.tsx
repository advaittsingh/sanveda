import { useState } from 'react'
import { X } from 'lucide-react'
import {
  ACCESS_MODULE_CATALOG,
  formatLastLogin,
  getUserModuleAccess,
  getUserPermissions,
  modulePermissionLabel,
  type AdminUserProfile,
  type ModulePermission,
} from '../../../lib/adminUserOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

function Check({ ok }: { ok: boolean }) {
  return <span className={ok ? 'text-emerald-600 font-bold' : 'text-slate-300'}>{ok ? '✓' : '✗'}</span>
}

interface Props {
  user: AdminUserProfile | null
  permissions: Record<string, ModulePermission[]>
  onClose: () => void
  onEdit: () => void
}

export default function RbacProfileDrawer({ user, permissions, onClose, onEdit }: Props) {
  const [tab, setTab] = useState<'profile' | 'access' | 'security'>('profile')
  if (!user) return null

  const userPerms = getUserPermissions(user.role, permissions)
  const modules = getUserModuleAccess(user.role, permissions)
  const sec = user.security

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.roleLabel} · {user.department}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="flex gap-1 border-b border-[#E5E7EB] px-5 pt-3">
          {(['profile', 'access', 'security'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-t-lg px-3 py-2 text-xs font-semibold capitalize ${
                tab === t ? 'bg-[#0B2C6B] text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-5 p-5">
          {tab === 'profile' ? (
            <>
              <div className="flex items-center gap-4">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0B2C6B] text-2xl font-bold text-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                )}
                <div>
                  <StatusBadge status={user.status} />
                  <p className="mt-1 text-sm text-slate-500">Last login: {formatLastLogin(user.lastLogin)}</p>
                </div>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Full Name</dt><dd className="font-medium">{user.name}</dd></div>
                <div><dt className="text-slate-500">Employee ID</dt><dd className="font-medium">{user.employeeId}</dd></div>
                <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{user.email}</dd></div>
                <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{user.phone || '—'}</dd></div>
                <div><dt className="text-slate-500">Department</dt><dd className="font-medium">{user.department}</dd></div>
                <div><dt className="text-slate-500">Designation</dt><dd className="font-medium">{user.designation}</dd></div>
                <div><dt className="text-slate-500">Role</dt><dd className="font-medium">{user.roleLabel}</dd></div>
                {user.reportingManager ? (
                  <div><dt className="text-slate-500">Reporting Manager</dt><dd className="font-medium">{user.reportingManager}</dd></div>
                ) : null}
              </dl>
            </>
          ) : null}

          {tab === 'access' ? (
            <>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Module Access</h3>
                <div className="flex flex-wrap gap-2">
                  {ACCESS_MODULE_CATALOG.map((mod) => (
                    <span
                      key={mod.key}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        modules.includes(mod.label) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {mod.label}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Permissions</h3>
                <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                  <table className="w-full min-w-[480px] text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-left text-slate-500">
                        <th className="px-3 py-2 font-semibold">Module</th>
                        <th className="px-2 py-2 font-semibold">View</th>
                        <th className="px-2 py-2 font-semibold">Create</th>
                        <th className="px-2 py-2 font-semibold">Edit</th>
                        <th className="px-2 py-2 font-semibold">Delete</th>
                        <th className="px-2 py-2 font-semibold">Approve</th>
                        <th className="px-2 py-2 font-semibold">Export</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ACCESS_MODULE_CATALOG.map((mod) => {
                        const row = userPerms.find((p) => p.module === mod.key) ?? {
                          module: mod.key, view: false, create: false, edit: false, delete: false, approve: false, export: false,
                        }
                        return (
                          <tr key={row.module} className="border-b border-[#F8FAFC]">
                            <td className="px-3 py-2 font-medium">{modulePermissionLabel(row.module)}</td>
                            <td className="px-2 text-center"><Check ok={row.view} /></td>
                            <td className="px-2 text-center"><Check ok={row.create} /></td>
                            <td className="px-2 text-center"><Check ok={row.edit} /></td>
                            <td className="px-2 text-center"><Check ok={row.delete} /></td>
                            <td className="px-2 text-center"><Check ok={row.approve} /></td>
                            <td className="px-2 text-center"><Check ok={row.export} /></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {tab === 'security' ? (
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Two Factor Authentication', ok: sec.twoFactor },
                { label: 'Device Restriction', ok: sec.deviceRestriction },
                { label: 'Session Timeout', ok: true, value: sec.sessionTimeout },
                { label: 'Password Expiry', ok: true, value: sec.passwordExpiry },
                { label: 'Login Alerts', ok: sec.loginAlerts },
                { label: 'IP Whitelist', ok: sec.ipWhitelist },
              ].map((item) => (
                <li key={item.label} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  {'value' in item && item.value ? (
                    <span className="text-xs font-semibold text-[#0B2C6B]">{item.value}</span>
                  ) : (
                    <Check ok={item.ok} />
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex gap-2 border-t border-[#E5E7EB] pt-4">
            <button type="button" className={adminBtnPrimary} onClick={onEdit}>Edit Admin</button>
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
