import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Download,
  LayoutGrid,
  List,
  UserPlus,
  Users,
} from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  viewMode: 'table' | 'kanban'
  onViewModeChange: (mode: 'table' | 'kanban') => void
  onAddVolunteer: () => void
  onBulkApprove: () => void
  onGenerateIdCards: () => void
  onExport: () => void
  search: string
  onSearchChange: (value: string) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function VolunteerToolbar({
  viewMode,
  onViewModeChange,
  onAddVolunteer,
  onBulkApprove,
  onGenerateIdCards,
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
          <button type="button" className={adminBtnPrimary} onClick={onAddVolunteer}>
            <UserPlus size={15} className="mr-1.5" />
            Add Volunteer
          </button>
          <button type="button" className={adminBtnSecondary} onClick={onBulkApprove}>
            <BadgeCheck size={15} className="mr-1.5" />
            Bulk Approve
          </button>
          <button type="button" className={adminBtnSecondary} onClick={onGenerateIdCards}>
            Generate ID Cards
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
            placeholder="Search volunteers…"
            className="min-w-[200px] flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10 lg:min-w-[240px]"
          />
          <button type="button" className={adminBtnSecondary} onClick={onToggleFilters}>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
          <div className="flex rounded-xl border border-[#E5E7EB] p-0.5">
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${viewMode === 'table' ? 'bg-[#0B2C6B] text-white' : 'text-slate-600'}`}
              onClick={() => onViewModeChange('table')}
            >
              <List size={14} className="inline mr-1" />
              Table
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${viewMode === 'kanban' ? 'bg-[#0B2C6B] text-white' : 'text-slate-600'}`}
              onClick={() => onViewModeChange('kanban')}
            >
              <LayoutGrid size={14} className="inline mr-1" />
              Kanban
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VolunteerEmptyState({ onAddVolunteer }: { onAddVolunteer: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2C6B]/10 text-[#0B2C6B]">
        <Users size={28} />
      </div>
      <h3 className="text-lg font-semibold text-[#0B2C6B]">No volunteer applications yet</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Applications from the public volunteer portal will appear here for screening, assignment, and onboarding.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" className={adminBtnPrimary} onClick={onAddVolunteer}>
          Add Volunteer
        </button>
        <Link to="/volunteer" className={adminBtnSecondary}>
          View Public Portal
        </Link>
      </div>
    </div>
  )
}
