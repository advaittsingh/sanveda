import { useState } from 'react'
import { X } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (name: string) => void
}

export default function RbacDepartmentModal({ open, onClose, onSave }: Props) {
  const [name, setName] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-5">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">Create Department</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onSave(name.trim())
            setName('')
          }}
        >
          <div>
            <label className={adminLabelClass}>Department Name *</label>
            <input className={adminInputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Regional Operations" required />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary}>Create Department</button>
          </div>
        </form>
      </div>
    </div>
  )
}
