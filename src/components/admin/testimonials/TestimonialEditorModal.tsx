import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  PLACEMENT_LABELS,
  TESTIMONIAL_CATEGORIES,
  WORKFLOW_STEPS,
  type TestimonialCategory,
  type TestimonialProfile,
  type TestimonialStatus,
  type WebsitePlacement,
} from '../../../lib/testimonialOperationsService'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  open: boolean
  testimonial: Partial<TestimonialProfile> | null
  onClose: () => void
  onSave: (t: Partial<TestimonialProfile> & { name: string }) => void
}

const EMPTY: Partial<TestimonialProfile> = {
  name: '', photo: '/assets/focus-areas/healthcare.jpg', designation: '', organization: '',
  category: 'donor', rating: 5, title: '', testimonial: '', videoUrl: '',
  focusArea: 'Healthcare', project: '', campaign: '', program: 'Healthcare',
  status: 'submitted', featured: false, placements: [],
}

export default function TestimonialEditorModal({ open, testimonial, onClose, onSave }: Props) {
  const [form, setForm] = useState<Partial<TestimonialProfile>>(EMPTY)

  useEffect(() => {
    if (!open) return
    setForm(testimonial ? { ...EMPTY, ...testimonial } : { ...EMPTY })
  }, [open, testimonial])

  if (!open) return null

  const set = (patch: Partial<TestimonialProfile>) => setForm((f) => ({ ...f, ...patch }))

  const togglePlacement = (p: WebsitePlacement) => {
    const current = form.placements ?? []
    set({ placements: current.includes(p) ? current.filter((x) => x !== p) : [...current, p] })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8">
      <div className="mb-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">{form.id ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form
          className="max-h-[70vh] overflow-y-auto p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.name?.trim()) return
            onSave(form as Partial<TestimonialProfile> & { name: string })
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={adminLabelClass}>Name *</label><input className={adminInputClass} value={form.name ?? ''} onChange={(e) => set({ name: e.target.value })} required /></div>
            <div><label className={adminLabelClass}>Photo URL</label><input className={adminInputClass} value={form.photo ?? ''} onChange={(e) => set({ photo: e.target.value })} /></div>
            <div><label className={adminLabelClass}>Designation</label><input className={adminInputClass} value={form.designation ?? ''} onChange={(e) => set({ designation: e.target.value })} /></div>
            <div><label className={adminLabelClass}>Organization</label><input className={adminInputClass} value={form.organization ?? ''} onChange={(e) => set({ organization: e.target.value })} /></div>
            <div><label className={adminLabelClass}>Category</label>
              <select className={adminInputClass} value={form.category ?? 'donor'} onChange={(e) => set({ category: e.target.value as TestimonialCategory })}>
                {TESTIMONIAL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div><label className={adminLabelClass}>Rating</label>
              <select className={adminInputClass} value={form.rating ?? 5} onChange={(e) => set({ rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className={adminLabelClass}>Title</label><input className={adminInputClass} value={form.title ?? ''} onChange={(e) => set({ title: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className={adminLabelClass}>Testimonial</label><textarea className={`${adminInputClass} min-h-[100px]`} value={form.testimonial ?? ''} onChange={(e) => set({ testimonial: e.target.value })} /></div>
            <div><label className={adminLabelClass}>Video URL</label><input className={adminInputClass} value={form.videoUrl ?? ''} onChange={(e) => set({ videoUrl: e.target.value })} placeholder="YouTube, Vimeo, or upload URL" /></div>
            <div><label className={adminLabelClass}>Program</label><input className={adminInputClass} value={form.program ?? ''} onChange={(e) => set({ program: e.target.value })} /></div>
            <div><label className={adminLabelClass}>Project</label><input className={adminInputClass} value={form.project ?? ''} onChange={(e) => set({ project: e.target.value })} /></div>
            <div><label className={adminLabelClass}>Campaign</label><input className={adminInputClass} value={form.campaign ?? ''} onChange={(e) => set({ campaign: e.target.value })} /></div>
            <div><label className={adminLabelClass}>Status</label>
              <select className={adminInputClass} value={form.status ?? 'submitted'} onChange={(e) => set({ status: e.target.value as TestimonialStatus })}>
                {WORKFLOW_STEPS.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured ?? false} onChange={(e) => set({ featured: e.target.checked })} /> Featured</label>
          <div>
            <label className={adminLabelClass}>Website Placement</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PLACEMENT_LABELS) as WebsitePlacement[]).map((p) => (
                <button key={p} type="button" onClick={() => togglePlacement(p)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${form.placements?.includes(p) ? 'bg-[#0B2C6B] text-white' : 'border border-[#E5E7EB] text-slate-600'}`}>
                  {PLACEMENT_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E5E7EB] pt-4">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary}>Save Testimonial</button>
          </div>
        </form>
      </div>
    </div>
  )
}
