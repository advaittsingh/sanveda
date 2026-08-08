import { Download, Plus } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  onCreate: () => void
  onExport: () => void
  search: string
  onSearchChange: (value: string) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function EnquiryToolbar({
  onCreate,
  onExport,
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
          Create Enquiry
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
          placeholder="Search tickets, names, emails…"
          className="min-w-[200px] flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30 lg:min-w-[260px]"
        />
        <button type="button" className={adminBtnSecondary} onClick={onToggleFilters}>
          {showFilters ? 'Hide Filters' : 'Filters'}
        </button>
      </div>
    </div>
  )
}

export function EnquiryEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-[#0B2C6B]">No enquiries yet</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Every enquiry is a potential donor, volunteer, member, or partner. Track leads from first contact to conversion.
      </p>
      <button type="button" className={`${adminBtnPrimary} mt-6`} onClick={onCreate}>
        Create Enquiry
      </button>
    </div>
  )
}
