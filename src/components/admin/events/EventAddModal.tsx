import { X } from 'lucide-react'
import { EVENT_CATEGORIES } from '../../../lib/eventOperationsService'
import type { EventStatus } from '../../../lib/eventService'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

export interface EventFormData {
  title: string
  slug: string
  description: string
  location: string
  eventDate: string
  endDate: string
  capacity: number
  category: string
  status: EventStatus
}

interface Props {
  open: boolean
  editing: EventFormData | null
  onClose: () => void
  onSave: (data: EventFormData) => void
}

const EMPTY: EventFormData = {
  title: '',
  slug: '',
  description: '',
  location: '',
  eventDate: '',
  endDate: '',
  capacity: 500,
  category: '',
  status: 'draft',
}

export default function EventAddModal({ open, editing, onClose, onSave }: Props) {
  if (!open) return null
  const form = editing ?? EMPTY

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSave({
      title: String(fd.get('title') ?? '').trim(),
      slug: String(fd.get('slug') ?? '').trim(),
      description: String(fd.get('description') ?? ''),
      location: String(fd.get('location') ?? ''),
      eventDate: String(fd.get('eventDate') ?? ''),
      endDate: String(fd.get('endDate') ?? ''),
      capacity: Number(fd.get('capacity') ?? 0),
      category: String(fd.get('category') ?? ''),
      status: String(fd.get('status') ?? 'draft') as EventStatus,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">{editing ? 'Edit Event' : 'Create Event'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label><span className={adminLabelClass}>Event Name *</span><input name="title" required defaultValue={form.title} className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Slug *</span><input name="slug" required defaultValue={form.slug} className={adminInputClass} /></label>
          <label>
            <span className={adminLabelClass}>Category</span>
            <select name="category" defaultValue={form.category} className={adminInputClass}>
              <option value="">Select category</option>
              {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label><span className={adminLabelClass}>Description</span><textarea name="description" rows={2} defaultValue={form.description} className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Venue / Location</span><input name="location" defaultValue={form.location} className={adminInputClass} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={adminLabelClass}>Start Date *</span><input name="eventDate" type="datetime-local" required defaultValue={form.eventDate?.slice(0, 16)} className={adminInputClass} /></label>
            <label><span className={adminLabelClass}>End Date</span><input name="endDate" type="datetime-local" defaultValue={form.endDate?.slice(0, 16)} className={adminInputClass} /></label>
          </div>
          <label><span className={adminLabelClass}>Capacity</span><input name="capacity" type="number" min={0} defaultValue={form.capacity} className={adminInputClass} /></label>
          <label>
            <span className={adminLabelClass}>Status</span>
            <select name="status" defaultValue={form.status} className={adminInputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary}>{editing ? 'Update' : 'Create Event'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
