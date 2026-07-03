import AdminCard from '../ui/AdminCard'
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_FOLDERS,
  STATUS_FILTER_OPTIONS,
  type DocumentFilters,
} from '../../../lib/documentOperationsService'

interface Props {
  filters: DocumentFilters
  onChange: (patch: Partial<DocumentFilters>) => void
}

export default function DocumentFiltersPanel({ filters, onChange }: Props) {
  return (
    <AdminCard>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</span>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value as DocumentFilters['category'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
          >
            <option value="all">All Categories</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Folder</span>
          <select
            value={filters.folder}
            onChange={(e) => onChange({ folder: e.target.value as DocumentFilters['folder'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
          >
            <option value="all">All Folders</option>
            {DOCUMENT_FOLDERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as DocumentFilters['status'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Visibility</span>
          <select
            value={filters.visibility}
            onChange={(e) => onChange({ visibility: e.target.value as DocumentFilters['visibility'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="restricted">Restricted</option>
          </select>
        </label>
      </div>
    </AdminCard>
  )
}
