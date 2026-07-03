import { Download, FileBarChart, Image, Plus, Upload, UploadCloud } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  onCreateAlbum: () => void
  onUploadMedia: () => void
  onBulkUpload: () => void
  onImport: () => void
  onExport: () => void
  search: string
  onSearchChange: (value: string) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function GalleryToolbar({
  onCreateAlbum,
  onUploadMedia,
  onBulkUpload,
  onImport,
  onExport,
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={adminBtnPrimary} onClick={onCreateAlbum}>
            <Plus size={15} className="mr-1.5" />
            Create Album
          </button>
          <button type="button" className={adminBtnSecondary} onClick={onUploadMedia}>
            <Upload size={15} className="mr-1.5" />
            Upload Media
          </button>
          <button type="button" className={adminBtnSecondary} onClick={onBulkUpload}>
            <UploadCloud size={15} className="mr-1.5" />
            Bulk Upload
          </button>
          <button type="button" className={adminBtnSecondary} onClick={onImport}>
            <FileBarChart size={15} className="mr-1.5" />
            Import
          </button>
          <button type="button" className={adminBtnSecondary} onClick={onExport}>
            <Download size={15} className="mr-1.5" />
            Export
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search albums…"
            className="min-w-[200px] flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10 lg:min-w-[240px]"
          />
          <button type="button" className={adminBtnSecondary} onClick={onToggleFilters}>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function GalleryEmptyState({ onCreateAlbum }: { onCreateAlbum: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2C6B]/10 text-[#0B2C6B]">
        <Image size={28} />
      </div>
      <h3 className="text-lg font-semibold text-[#0B2C6B]">No albums yet</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Create impact galleries to validate projects, attract donors, and power CSR reporting and social media.
      </p>
      <button type="button" className={`${adminBtnPrimary} mt-6`} onClick={onCreateAlbum}>
        Create Album
      </button>
    </div>
  )
}
