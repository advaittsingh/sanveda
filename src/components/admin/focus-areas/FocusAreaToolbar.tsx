import { Download, FileBarChart, Layers, Plus, Upload } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  onCreate: () => void
  onImport: () => void
  onExport: () => void
  onGenerateReport: () => void
  search: string
  onSearchChange: (value: string) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function FocusAreaToolbar({
  onCreate,
  onImport,
  onExport,
  onGenerateReport,
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={adminBtnPrimary} onClick={onCreate}>
          <Plus size={15} className="mr-1.5" />
          Create Focus Area
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onImport}>
          <Upload size={15} className="mr-1.5" />
          Import
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onExport}>
          <Download size={15} className="mr-1.5" />
          Export
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onGenerateReport}>
          <FileBarChart size={15} className="mr-1.5" />
          Generate Impact Report
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search focus areas…"
          className="min-w-[200px] flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10 lg:min-w-[240px]"
        />
        <button type="button" className={adminBtnSecondary} onClick={onToggleFilters}>
          {showFilters ? 'Hide Filters' : 'Filter'}
        </button>
      </div>
    </div>
  )
}

export function FocusAreaEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2C6B]/10 text-[#0B2C6B]">
        <Layers size={28} />
      </div>
      <h3 className="text-lg font-semibold text-[#0B2C6B]">No focus areas configured</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Define strategic programme pillars to map projects, campaigns, beneficiaries, and impact across Sanveda.
      </p>
      <button type="button" className={`${adminBtnPrimary} mt-6`} onClick={onCreate}>
        Create Focus Area
      </button>
    </div>
  )
}
