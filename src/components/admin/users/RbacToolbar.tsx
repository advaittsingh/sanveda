import { Download } from 'lucide-react'
import { adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  onExport: () => void
  search: string
  onSearchChange: (v: string) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function RbacToolbar({ onExport, search, onSearchChange, showFilters, onToggleFilters }: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search admin…"
          className="min-w-[200px] flex-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none lg:min-w-[280px]"
        />
        <button type="button" className={adminBtnSecondary} onClick={onToggleFilters}>
          {showFilters ? 'Hide Filters' : 'Filters'}
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onExport}>
          <Download size={15} className="mr-1.5 inline" />Export
        </button>
      </div>
    </div>
  )
}
