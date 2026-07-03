import { X } from 'lucide-react'
import { FOCUS_AREAS } from '../../../lib/projectOperationsService'
import type { ProjectStatus } from '../../../lib/projectService'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

export interface ProjectFormData {
  title: string
  slug: string
  focusArea: string
  description: string
  budget: number
  spent: number
  beneficiariesCount: number
  progressPercent: number
  status: ProjectStatus
  startDate: string
  endDate: string
  managerName: string
}

interface Props {
  open: boolean
  editing: ProjectFormData | null
  onClose: () => void
  onSave: (data: ProjectFormData) => void
}

const EMPTY: ProjectFormData = {
  title: '',
  slug: '',
  focusArea: '',
  description: '',
  budget: 0,
  spent: 0,
  beneficiariesCount: 0,
  progressPercent: 0,
  status: 'planning',
  startDate: '',
  endDate: '',
  managerName: '',
}

export default function ProjectAddModal({ open, editing, onClose, onSave }: Props) {
  if (!open) return null
  const form = editing ?? EMPTY

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSave({
      title: String(fd.get('title') ?? '').trim(),
      slug: String(fd.get('slug') ?? '').trim(),
      focusArea: String(fd.get('focusArea') ?? ''),
      description: String(fd.get('description') ?? ''),
      budget: Number(fd.get('budget') ?? 0),
      spent: Number(fd.get('spent') ?? 0),
      beneficiariesCount: Number(fd.get('beneficiariesCount') ?? 0),
      progressPercent: Number(fd.get('progressPercent') ?? 0),
      status: String(fd.get('status') ?? 'planning') as ProjectStatus,
      startDate: String(fd.get('startDate') ?? ''),
      endDate: String(fd.get('endDate') ?? ''),
      managerName: String(fd.get('managerName') ?? ''),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">{editing ? 'Edit Project' : 'Create Project'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label>
            <span className={adminLabelClass}>Project Name *</span>
            <input name="title" required defaultValue={form.title} className={adminInputClass} />
          </label>
          <label>
            <span className={adminLabelClass}>Slug *</span>
            <input name="slug" required defaultValue={form.slug} className={adminInputClass} />
          </label>
          <label>
            <span className={adminLabelClass}>Focus Area</span>
            <select name="focusArea" defaultValue={form.focusArea} className={adminInputClass}>
              <option value="">Select focus area</option>
              {FOCUS_AREAS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={adminLabelClass}>Description</span>
            <textarea name="description" rows={2} defaultValue={form.description} className={adminInputClass} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={adminLabelClass}>Budget (₹)</span>
              <input name="budget" type="number" min={0} defaultValue={form.budget} className={adminInputClass} />
            </label>
            <label>
              <span className={adminLabelClass}>Utilized (₹)</span>
              <input name="spent" type="number" min={0} defaultValue={form.spent} className={adminInputClass} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={adminLabelClass}>Beneficiaries</span>
              <input name="beneficiariesCount" type="number" min={0} defaultValue={form.beneficiariesCount} className={adminInputClass} />
            </label>
            <label>
              <span className={adminLabelClass}>Progress %</span>
              <input name="progressPercent" type="number" min={0} max={100} defaultValue={form.progressPercent} className={adminInputClass} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={adminLabelClass}>Start Date</span>
              <input name="startDate" type="date" defaultValue={form.startDate} className={adminInputClass} />
            </label>
            <label>
              <span className={adminLabelClass}>End Date</span>
              <input name="endDate" type="date" defaultValue={form.endDate} className={adminInputClass} />
            </label>
          </div>
          <label>
            <span className={adminLabelClass}>Project Manager</span>
            <input name="managerName" defaultValue={form.managerName} className={adminInputClass} />
          </label>
          <label>
            <span className={adminLabelClass}>Status</span>
            <select name="status" defaultValue={form.status} className={adminInputClass}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary}>{editing ? 'Update' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
