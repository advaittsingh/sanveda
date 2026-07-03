import { useEffect, useState } from 'react'
import {
  ALBUM_CATEGORIES,
  updateAlbumMeta,
  type AlbumCategory,
  type AlbumProfile,
  type ApprovalStatus,
} from '../../../lib/galleryOperationsService'
import { saveAlbum } from '../../../lib/galleryService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

export interface AlbumFormData {
  title: string
  slug: string
  description: string
  coverImage: string
  category: AlbumCategory
  project: string
  campaign: string
  focusArea: string
  status: ApprovalStatus
}

interface Props {
  open: boolean
  editing: AlbumProfile | null
  onClose: () => void
  onSaved: () => void
}

const defaultForm: AlbumFormData = {
  title: '',
  slug: '',
  description: '',
  coverImage: '',
  category: 'projects',
  project: '',
  campaign: '',
  focusArea: '',
  status: 'draft',
}

export default function GalleryAddModal({ open, editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<AlbumFormData>(defaultForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        title: editing.title,
        slug: editing.slug,
        description: editing.description ?? '',
        coverImage: editing.coverImage ?? '',
        category: editing.category,
        project: editing.project ?? '',
        campaign: editing.campaign ?? '',
        focusArea: editing.focusArea ?? '',
        status: editing.status,
      })
    } else {
      setForm(defaultForm)
    }
  }, [open, editing])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-')
      const albumStatus = form.status === 'published' ? 'published' : form.status === 'archived' ? 'archived' : 'draft'
      const saved = await saveAlbum({
        id: editing?.id,
        title: form.title,
        slug,
        description: form.description || undefined,
        coverImage: form.coverImage || undefined,
        status: albumStatus,
      })
      updateAlbumMeta(saved.id, {
        category: form.category,
        project: form.project || undefined,
        campaign: form.campaign || undefined,
        focusArea: form.focusArea || undefined,
        approvalStatus: form.status,
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
        <h2 className="text-lg font-semibold text-[#0B2C6B]">
          {editing ? 'Edit Album' : 'Create Album'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">Organize impact media into categorized proof-of-work albums.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Album Name</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Slug</span>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated from title"
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as AlbumCategory })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
            >
              {ALBUM_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Project</span>
              <input
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Campaign</span>
              <input
                value={form.campaign}
                onChange={(e) => setForm({ ...form, campaign: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Cover Image URL</span>
            <input
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ApprovalStatus })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
            >
              <option value="draft">Draft</option>
              <option value="uploaded">Uploaded</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
