import { Download, FileBarChart, Plus, Upload } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  onAdd: () => void
  onUploadInvoice: () => void
  onApprove: () => void
  onExport: () => void
  onGenerateReport: () => void
  search: string
  onSearchChange: (v: string) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function ExpenseToolbar({
  onAdd, onUploadInvoice, onApprove, onExport, onGenerateReport,
  search, onSearchChange, showFilters, onToggleFilters,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={adminBtnPrimary} onClick={onAdd}><Plus size={15} className="mr-1.5" />Add Expense</button>
        <button type="button" className={adminBtnSecondary} onClick={onUploadInvoice}><Upload size={15} className="mr-1.5" />Upload Invoice</button>
        <button type="button" className={adminBtnSecondary} onClick={onApprove}>Approve Expenses</button>
        <button type="button" className={adminBtnSecondary} onClick={onExport}><Download size={15} className="mr-1.5" />Export</button>
        <button type="button" className={adminBtnSecondary} onClick={onGenerateReport}><FileBarChart size={15} className="mr-1.5" />Generate Report</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input type="search" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search expenses…"
          className="min-w-[200px] flex-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none lg:min-w-[240px]" />
        <button type="button" className={adminBtnSecondary} onClick={onToggleFilters}>{showFilters ? 'Hide Filters' : 'Filters'}</button>
      </div>
    </div>
  )
}

export function ExpenseEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-[#0B2C6B]">No expenses recorded</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">Track programme expenses with approval workflows, vendor management, and project budget controls.</p>
      <button type="button" className={`${adminBtnPrimary} mt-6`} onClick={onAdd}>Add Expense</button>
    </div>
  )
}
