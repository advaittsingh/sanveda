import { X } from 'lucide-react'
import { BENEFICIARY_CATEGORIES } from '../../../lib/beneficiaryOperationsService'
import type { BeneficiaryStatus } from '../../../lib/beneficiaryService'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

export interface BeneficiaryFormData {
  fullName: string
  phone: string
  email: string
  city: string
  state: string
  category: string
  program: string
  supportType: string
  supportAmount: number
  status: BeneficiaryStatus
  notes: string
}

interface Props {
  open: boolean
  editing: BeneficiaryFormData | null
  onClose: () => void
  onSave: (data: BeneficiaryFormData) => void
}

const EMPTY: BeneficiaryFormData = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  category: '',
  program: '',
  supportType: '',
  supportAmount: 0,
  status: 'active',
  notes: '',
}

export default function BeneficiaryAddModal({ open, editing, onClose, onSave }: Props) {
  if (!open) return null

  const form = editing ?? EMPTY
  const isEdit = Boolean(editing)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSave({
      fullName: String(fd.get('fullName') ?? '').trim(),
      phone: String(fd.get('phone') ?? ''),
      email: String(fd.get('email') ?? ''),
      city: String(fd.get('city') ?? ''),
      state: String(fd.get('state') ?? ''),
      category: String(fd.get('category') ?? ''),
      program: String(fd.get('program') ?? ''),
      supportType: String(fd.get('supportType') ?? ''),
      supportAmount: Number(fd.get('supportAmount') ?? 0),
      status: String(fd.get('status') ?? 'active') as BeneficiaryStatus,
      notes: String(fd.get('notes') ?? ''),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">{isEdit ? 'Edit Beneficiary' : 'Add Beneficiary'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label>
            <span className={adminLabelClass}>Full Name *</span>
            <input name="fullName" required defaultValue={form.fullName} className={adminInputClass} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={adminLabelClass}>Phone</span>
              <input name="phone" defaultValue={form.phone} className={adminInputClass} />
            </label>
            <label>
              <span className={adminLabelClass}>Email</span>
              <input name="email" type="email" defaultValue={form.email} className={adminInputClass} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={adminLabelClass}>City</span>
              <input name="city" defaultValue={form.city} className={adminInputClass} />
            </label>
            <label>
              <span className={adminLabelClass}>State</span>
              <input name="state" defaultValue={form.state} className={adminInputClass} />
            </label>
          </div>
          <label>
            <span className={adminLabelClass}>Category</span>
            <select name="category" defaultValue={form.category} className={adminInputClass}>
              <option value="">Select category</option>
              {BENEFICIARY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={adminLabelClass}>Program</span>
            <input name="program" defaultValue={form.program} placeholder="e.g. Education Scholarship" className={adminInputClass} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={adminLabelClass}>Support Type</span>
              <input name="supportType" defaultValue={form.supportType} placeholder="Medical, Cash, etc." className={adminInputClass} />
            </label>
            <label>
              <span className={adminLabelClass}>Support Amount (₹)</span>
              <input name="supportAmount" type="number" min={0} defaultValue={form.supportAmount} className={adminInputClass} />
            </label>
          </div>
          <label>
            <span className={adminLabelClass}>Status</span>
            <select name="status" defaultValue={form.status} className={adminInputClass}>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            <span className={adminLabelClass}>Notes</span>
            <textarea name="notes" rows={3} defaultValue={form.notes} className={adminInputClass} />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary}>{isEdit ? 'Update' : 'Add Beneficiary'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
