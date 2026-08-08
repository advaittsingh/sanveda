import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  type AdminUserProfile,
  type Department,
  type RoleDefinition,
  type SanvedaRole,
} from '../../../lib/adminUserOperationsService'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  open: boolean
  user: Partial<AdminUserProfile> | null
  managers: string[]
  departments: Department[]
  roles: RoleDefinition[]
  onClose: () => void
  onSave: (u: Partial<AdminUserProfile> & { email: string; firstName: string; lastName: string }) => void | Promise<void>
  inviteMode?: boolean
}

const EMPTY: Partial<AdminUserProfile> = {
  firstName: '', lastName: '', email: '', phone: '', department: '',
  designation: '', role: 'viewer', reportingManager: '', photo: '', status: 'invited',
}

export default function RbacUserEditorModal({
  open, user, managers, departments, roles, onClose, onSave, inviteMode,
}: Props) {
  const [form, setForm] = useState<Partial<AdminUserProfile>>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(user ? { ...EMPTY, ...user } : { ...EMPTY, status: inviteMode ? 'invited' : 'active' })
    setSaving(false)
  }, [open, user, inviteMode])

  if (!open) return null

  const set = (patch: Partial<AdminUserProfile>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8">
      <div className="mb-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">
            {inviteMode ? 'Send Admin Invite' : form.id ? 'Edit Admin' : 'Add Admin'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form
          className="max-h-[70vh] overflow-y-auto p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim() || saving) return
            setSaving(true)
            void Promise.resolve(
              onSave(form as Partial<AdminUserProfile> & { email: string; firstName: string; lastName: string }),
            ).finally(() => setSaving(false))
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={adminLabelClass}>First Name *</label><input className={adminInputClass} value={form.firstName ?? ''} onChange={(e) => set({ firstName: e.target.value })} required /></div>
            <div><label className={adminLabelClass}>Last Name *</label><input className={adminInputClass} value={form.lastName ?? ''} onChange={(e) => set({ lastName: e.target.value })} required /></div>
            <div><label className={adminLabelClass}>Email *</label><input type="email" className={adminInputClass} value={form.email ?? ''} onChange={(e) => set({ email: e.target.value })} required /></div>
            <div><label className={adminLabelClass}>Phone</label><input className={adminInputClass} value={form.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} /></div>
            <div><label className={adminLabelClass}>Department</label>
              <select className={adminInputClass} value={form.department ?? ''} onChange={(e) => set({ department: e.target.value })}>
                <option value="">No department</option>
                {departments.map((department) => <option key={department.id} value={department.name}>{department.name}</option>)}
              </select>
            </div>
            <div><label className={adminLabelClass}>Designation</label><input className={adminInputClass} value={form.designation ?? ''} onChange={(e) => set({ designation: e.target.value })} /></div>
            <div><label className={adminLabelClass}>Role</label>
              <select className={adminInputClass} value={form.role ?? 'viewer'} onChange={(e) => set({ role: e.target.value as SanvedaRole })}>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>
            <div><label className={adminLabelClass}>Reporting Manager</label>
              <select className={adminInputClass} value={form.reportingManager ?? ''} onChange={(e) => set({ reportingManager: e.target.value })}>
                <option value="">None</option>
                {managers.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className={adminLabelClass}>Profile Photo URL</label><input className={adminInputClass} value={form.photo ?? ''} onChange={(e) => set({ photo: e.target.value })} placeholder="https://…" /></div>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E5E7EB] pt-4">
            <button type="button" className={adminBtnSecondary} onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className={adminBtnPrimary} disabled={saving}>
              {saving ? 'Saving…' : inviteMode ? 'Send Invite' : 'Save Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
