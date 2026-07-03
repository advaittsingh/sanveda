import { X } from 'lucide-react'
import { formatLastLogin, type AdminUserProfile } from '../../../lib/adminUserOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  user: AdminUserProfile | null
  onClose: () => void
  onEdit: () => void
}

export default function RbacProfileDrawer({ user, onClose, onEdit }: Props) {
  if (!user) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.designation || user.roleLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="space-y-5 p-5">
          {user.photo ? (
            <img src={user.photo} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0B2C6B] text-2xl font-bold text-white">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          )}
          <dl className="space-y-3 text-sm">
            <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{user.email}</dd></div>
            <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{user.phone || '—'}</dd></div>
            <div><dt className="text-slate-500">Department</dt><dd className="font-medium">{user.department}</dd></div>
            <div><dt className="text-slate-500">Role</dt><dd className="font-medium">{user.roleLabel}</dd></div>
            <div><dt className="text-slate-500">Access</dt><dd className="font-medium">{user.accessLevel}</dd></div>
            <div><dt className="text-slate-500">Status</dt><dd><StatusBadge status={user.status} /></dd></div>
            <div><dt className="text-slate-500">Last Login</dt><dd className="font-medium">{formatLastLogin(user.lastLogin)}</dd></div>
            {user.reportingManager ? (
              <div><dt className="text-slate-500">Reporting Manager</dt><dd className="font-medium">{user.reportingManager}</dd></div>
            ) : null}
            <div><dt className="text-slate-500">2FA</dt><dd className="font-medium">{user.twoFactorEnabled ? 'Enabled' : 'Not enabled'}</dd></div>
          </dl>
          <div className="flex gap-2 pt-2">
            <button type="button" className={adminBtnPrimary} onClick={onEdit}>Manage</button>
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
