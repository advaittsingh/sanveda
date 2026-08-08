import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (name: string, description: string) => void | Promise<void>
  initialName?: string
  initialDescription?: string
  mode?: 'create' | 'edit'
}

export default function RbacRoleModal({
  open,
  onClose,
  onSave,
  initialName = '',
  initialDescription = '',
  mode = 'create',
}: Props) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(initialName)
    setDescription(initialDescription)
    setError(null)
    setSaving(false)
  }, [open, initialName, initialDescription])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-5">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">
            {mode === 'edit' ? 'Edit Role' : 'Create Role'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form
          className="space-y-4 p-5"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!name.trim() || saving) return
            setSaving(true)
            setError(null)
            try {
              await onSave(name.trim(), description.trim())
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to save role')
              setSaving(false)
            }
          }}
        >
          <div>
            <label className={adminLabelClass}>Role Name *</label>
            <input className={adminInputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Regional Coordinator" required />
          </div>
          <div>
            <label className={adminLabelClass}>Description</label>
            <textarea className={`${adminInputClass} min-h-[80px]`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What can this role access?" />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className={adminBtnPrimary} disabled={saving}>
              {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
