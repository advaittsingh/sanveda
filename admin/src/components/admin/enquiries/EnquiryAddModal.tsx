import { useEffect, useState } from 'react'
import {
  ENQUIRY_CATEGORIES,
  PRIORITY_OPTIONS,
  SOURCE_OPTIONS,
  updateEnquiryMeta,
  type EnquiryCategory,
  type EnquiryPriority,
  type EnquirySource,
} from '../../../lib/enquiryOperationsService'
import { createEnquiryAdmin } from '../../../lib/enquiryService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export default function EnquiryAddModal({ open, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
    category: 'general' as EnquiryCategory,
    priority: 'medium' as EnquiryPriority,
    source: 'website' as EnquirySource,
    organization: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ name: '', email: '', phone: '', subject: '', message: '', category: 'general', priority: 'medium', source: 'website', organization: '' })
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const enquiry = await createEnquiryAdmin({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      })
      const catInfo = ENQUIRY_CATEGORIES.find((category) => category.value === form.category)
      await updateEnquiryMeta(enquiry.id, {
        category: form.category,
        priority: form.priority,
        source: form.source,
        organization: form.organization || undefined,
        slaHours: catInfo?.slaHours,
        workflowStage: 'new',
      })
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-[#0B2C6B]">Create Enquiry</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Email</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Phone</span>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Organization</span>
            <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Subject</span>
            <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as EnquiryCategory })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
                {ENQUIRY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Priority</span>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as EnquiryPriority })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
                {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Source</span>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as EnquirySource })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
                {SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Message</span>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary} disabled={saving}>{saving ? 'Creating…' : 'Create Enquiry'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
