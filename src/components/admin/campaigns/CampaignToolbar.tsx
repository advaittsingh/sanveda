import { Search, Plus, Download, Upload, LayoutGrid, List } from 'lucide-react'
import type { CampaignFilters } from '../../../types/campaignAdmin'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass } from '../ui/adminStyles'

interface FilterOptions {
  categories: string[]
  focusAreas: string[]
  creators: string[]
  statuses: string[]
  sorts: { value: string; label: string }[]
}

interface Props {
  filters: CampaignFilters
  options: FilterOptions
  view: 'grid' | 'table'
  onFiltersChange: (patch: Partial<CampaignFilters>) => void
  onViewChange: (view: 'grid' | 'table') => void
  onCreate: () => void
  onExport: () => void
  onImport: (file: File) => void
}

export default function CampaignToolbar({
  filters,
  options,
  view,
  onFiltersChange,
  onViewChange,
  onCreate,
  onExport,
  onImport,
}: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onFiltersChange({ query: e.target.value })}
            placeholder="Search campaigns, beneficiaries, categories…"
            className={`${adminInputClass} pl-10`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={adminBtnPrimary} onClick={onCreate}>
            <Plus size={16} className="mr-1.5" />
            New Campaign
          </button>
          <label className={`${adminBtnSecondary} cursor-pointer`}>
            <Upload size={16} className="mr-1.5" />
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onImport(file)
                e.target.value = ''
              }}
            />
          </label>
          <button type="button" className={adminBtnSecondary} onClick={onExport}>
            <Download size={16} className="mr-1.5" />
            Export
          </button>
          <div className="flex rounded-xl border border-[#E5E7EB] p-0.5">
            <button
              type="button"
              onClick={() => onViewChange('grid')}
              className={`rounded-lg p-2 ${view === 'grid' ? 'bg-[#0B2C6B] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => onViewChange('table')}
              className={`rounded-lg p-2 ${view === 'table' ? 'bg-[#0B2C6B] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              aria-label="Table view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterSelect label="Category" value={filters.category} options={options.categories} onChange={(v) => onFiltersChange({ category: v })} />
        <FilterSelect label="Status" value={filters.status} options={options.statuses} onChange={(v) => onFiltersChange({ status: v })} />
        <FilterSelect label="Focus Area" value={filters.focusArea} options={options.focusAreas} onChange={(v) => onFiltersChange({ focusArea: v })} />
        <FilterSelect label="Created By" value={filters.createdBy} options={options.creators} onChange={(v) => onFiltersChange({ createdBy: v })} />
        <FilterSelect
          label="Sort"
          value={filters.sort}
          options={options.sorts.map((s) => s.value)}
          labels={options.sorts.map((s) => s.label)}
          onChange={(v) => onFiltersChange({ sort: v as CampaignFilters['sort'] })}
        />
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  labels?: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-medium text-[#0B2C6B] outline-none"
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt}>
            {opt === 'all' ? 'All' : (labels?.[i] ?? opt)}
          </option>
        ))}
      </select>
    </label>
  )
}
