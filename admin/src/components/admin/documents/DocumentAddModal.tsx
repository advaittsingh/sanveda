import { useEffect, useState } from 'react'
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_FOLDERS,
  type DocumentCategory,
  type DocumentFolder,
  type DocumentProfile,
  type DocumentStatus,
  type DocumentVisibility,
} from '../../../lib/documentOperationsService'
import { saveDocument } from '../../../lib/documentsService'
import { uploadPrivateFile } from '../../../lib/privateStorageClient'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

export interface DocumentFormData {
  title: string
  category: DocumentCategory
  folder: DocumentFolder
  description: string
  owner: string
  expiryDate: string
  visibility: DocumentVisibility
  status: DocumentStatus
  fileUrl: string
  project: string
  isCompliance: boolean
  tags: string
}

interface Props {
  open: boolean
  editing: DocumentProfile | null
  onClose: () => void
  onSaved: () => void
}

const defaultForm: DocumentFormData = {
  title: '',
  category: 'internal',
  folder: 'public',
  description: '',
  owner: 'Admin',
  expiryDate: '',
  visibility: 'internal',
  status: 'draft',
  fileUrl: '',
  project: '',
  isCompliance: false,
  tags: '',
}

export default function DocumentAddModal({ open, editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<DocumentFormData>(defaultForm)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setFile(null)
    if (editing) {
      setForm({
        title: editing.title,
        category: editing.category,
        folder: editing.folder,
        description: editing.description ?? '',
        owner: editing.owner,
        expiryDate: editing.expiryDate ?? '',
        visibility: editing.visibility,
        status: editing.status,
        fileUrl: editing.fileUrl ?? '',
        project: editing.project ?? '',
        isCompliance: editing.isCompliance,
        tags: editing.tags.join(', '),
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
      const reportCategories: DocumentCategory[] = ['annual_report', 'audit', 'csr', 'project_report', 'financial']
      const stored = file
        ? await uploadPrivateFile(
            reportCategories.includes(form.category) ? 'report' : 'document',
            editing?.id ?? crypto.randomUUID(),
            file,
          )
        : null
      await saveDocument({
        id: editing?.id,
        title: form.title,
        category: form.category,
        folder: form.folder,
        description: form.description || undefined,
        owner: form.owner,
        expiryDate: form.expiryDate || undefined,
        visibility: form.visibility,
        status: form.status,
        fileUrl: (stored?.path ?? form.fileUrl) || undefined,
        fileSizeMb: stored ? stored.size / 1_000_000 : editing?.fileSizeMb,
        project: form.project || undefined,
        isCompliance: form.isCompliance,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-[#0B2C6B]">
          {editing ? 'Edit Document' : 'Upload Document'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">Add to the central document repository with metadata and compliance tracking.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Title</span>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as DocumentCategory })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30">
                {DOCUMENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Folder</span>
              <select value={form.folder} onChange={(e) => setForm({ ...form, folder: e.target.value as DocumentFolder })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30">
                {DOCUMENT_FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Upload file</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">External or existing URL</span>
            <input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              placeholder="https://… or /assets/…"
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Owner</span>
              <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Expiry Date</span>
              <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30" />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Project</span>
            <input value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Visibility</span>
              <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as DocumentVisibility })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30">
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="restricted">Restricted</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DocumentStatus })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30">
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tags (comma-separated)</span>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30" />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isCompliance} onChange={(e) => setForm({ ...form, isCompliance: e.target.checked })} />
            <span className="font-medium text-slate-700">Compliance document</span>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Description</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30" />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
