import AdminCard from '../ui/AdminCard'
import {
  ALBUM_CATEGORIES,
  STATUS_FILTER_OPTIONS,
  type GalleryFilters,
} from '../../../lib/galleryOperationsService'

interface Props {
  filters: GalleryFilters
  onChange: (patch: Partial<GalleryFilters>) => void
}

export default function GalleryFiltersPanel({ filters, onChange }: Props) {
  return (
    <AdminCard>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</span>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value as GalleryFilters['category'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30"
          >
            <option value="all">All Categories</option>
            {ALBUM_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as GalleryFilters['status'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>
    </AdminCard>
  )
}
