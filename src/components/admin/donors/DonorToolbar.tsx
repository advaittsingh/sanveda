import { Link } from 'react-router-dom'
import { Megaphone, Upload, UserPlus, Users } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  onAddDonor: () => void
  onImport: () => void
  onExport: () => void
  onSendCampaign: () => void
  onGenerateReceipts: () => void
  search: string
  onSearchChange: (value: string) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function DonorToolbar({
  onAddDonor,
  onImport,
  onExport,
  onSendCampaign,
  onGenerateReceipts,
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={adminBtnPrimary} onClick={onAddDonor}>
          <UserPlus size={15} className="mr-1.5" />
          Add Donor
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onImport}>
          <Upload size={15} className="mr-1.5" />
          Import CSV
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onExport}>
          Export
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onSendCampaign}>
          <Megaphone size={15} className="mr-1.5" />
          Send Campaign
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onGenerateReceipts}>
          Generate Receipts
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search donors…"
          className="min-w-[200px] flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10 lg:min-w-[240px]"
        />
        <button type="button" className={adminBtnSecondary} onClick={onToggleFilters}>
          {showFilters ? 'Hide Filters' : 'Filter'}
        </button>
      </div>
    </div>
  )
}

export function DonorEmptyState({ onAddDonor, onImport }: { onAddDonor: () => void; onImport: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2C6B]/10 text-[#0B2C6B]">
        <Users size={28} />
      </div>
      <h3 className="text-lg font-semibold text-[#0B2C6B]">No donors yet</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Start building your donor network. Donors appear here automatically when donations are completed.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" className={adminBtnPrimary} onClick={onAddDonor}>
          Add Donor
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onImport}>
          Import Donors
        </button>
        <Link to="/admin/campaigns" className={adminBtnSecondary}>
          Create Donation Campaign
        </Link>
      </div>
    </div>
  )
}
