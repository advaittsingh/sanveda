import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  STRATEGIC_FOCUS_AREAS,
  updateFocusAreaMeta,
  type FocusAreaProfile,
  type FocusPriority,
  type FocusAreaStatus,
} from '../../../lib/focusAreaOperationsService'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

export interface FocusAreaFormData {
  slug: string
  mission: string
  objectives: string
  priority: FocusPriority
  status: FocusAreaStatus
  customDescription: string
}

interface Props {
  open: boolean
  editing?: FocusAreaProfile | null
  onClose: () => void
  onSaved: () => void
}

export default function FocusAreaAddModal({ open, editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FocusAreaFormData>({
    slug: STRATEGIC_FOCUS_AREAS[0].slug,
    mission: '',
    objectives: '',
    priority: 'high',
    status: 'active',
    customDescription: '',
  })

  useEffect(() => {
    if (editing) {
      setForm({
        slug: editing.slug,
        mission: editing.mission,
        objectives: editing.objectives,
        priority: editing.priority,
        status: editing.status,
        customDescription: editing.description,
      })
    } else if (open) {
      setForm({
        slug: STRATEGIC_FOCUS_AREAS[0].slug,
        mission: '',
        objectives: '',
        priority: 'high',
        status: 'active',
        customDescription: '',
      })
    }
  }, [editing, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFocusAreaMeta(form.slug, {
      mission: form.mission,
      objectives: form.objectives,
      priority: form.priority,
      status: form.status,
      customDescription: form.customDescription,
    })
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close modal" />
      <div className="relative w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">
            {editing ? 'Edit Focus Area' : 'Configure Focus Area'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label>
            <span className={adminLabelClass}>Focus Area</span>
            <select
              className={adminInputClass}
              value={form.slug}
              disabled={!!editing}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            >
              {STRATEGIC_FOCUS_AREAS.map((a) => (
                <option key={a.slug} value={a.slug}>{a.name}</option>
              ))}
            </select>
          </label>

          <label>
            <span className={adminLabelClass}>Description</span>
            <textarea
              className={adminInputClass}
              rows={2}
              value={form.customDescription}
              onChange={(e) => setForm((f) => ({ ...f, customDescription: e.target.value }))}
              placeholder="Programme overview…"
            />
          </label>

          <label>
            <span className={adminLabelClass}>Mission</span>
            <textarea
              className={adminInputClass}
              rows={2}
              value={form.mission}
              onChange={(e) => setForm((f) => ({ ...f, mission: e.target.value }))}
            />
          </label>

          <label>
            <span className={adminLabelClass}>Objectives</span>
            <textarea
              className={adminInputClass}
              rows={2}
              value={form.objectives}
              onChange={(e) => setForm((f) => ({ ...f, objectives: e.target.value }))}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={adminLabelClass}>Priority Level</span>
              <select
                className={adminInputClass}
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as FocusPriority }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="strategic">Strategic</option>
              </select>
            </label>
            <label>
              <span className={adminLabelClass}>Status</span>
              <select
                className={adminInputClass}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FocusAreaStatus }))}
              >
                <option value="active">Active</option>
                <option value="planned">Planned</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary}>Save Focus Area</button>
          </div>
        </form>
      </div>
    </div>
  )
}
