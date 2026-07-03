import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { adminBtnSecondary } from '../ui/adminStyles'
import type { QuickFilter } from '../../../lib/auditOperationsService'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  quick: QuickFilter
  onQuickChange: (q: QuickFilter) => void
  showFilters: boolean
  onToggleFilters: () => void
  onExportCsv: () => void
}

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'critical', label: 'Critical' },
  { value: 'failed', label: 'Failed' },
  { value: 'security', label: 'Security' },
]

export default function AuditToolbar({
  search, onSearchChange, quick, onQuickChange, showFilters, onToggleFilters, onExportCsv,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search logs…"
          className="min-w-[200px] flex-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none lg:max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={adminBtnSecondary} onClick={onToggleFilters}>
            {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>
          <button type="button" className={adminBtnSecondary} onClick={onExportCsv}>
            <Download size={14} className="mr-1 inline" />CSV
          </button>
          <button type="button" className={adminBtnSecondary}>
            <FileSpreadsheet size={14} className="mr-1 inline" />Excel
          </button>
          <button type="button" className={adminBtnSecondary}>
            <FileText size={14} className="mr-1 inline" />PDF
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onQuickChange(quick === f.value ? 'all' : f.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              quick === f.value ? 'bg-[#0B2C6B] text-white' : 'border border-[#E5E7EB] bg-white text-slate-600 hover:bg-[#F8FAFC]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
