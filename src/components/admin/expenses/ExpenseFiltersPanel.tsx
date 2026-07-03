import AdminCard from '../ui/AdminCard'
import { EXPENSE_CATEGORIES, type ExpenseFilters } from '../../../lib/expenseOperationsService'

interface Props {
  filters: ExpenseFilters
  onChange: (patch: Partial<ExpenseFilters>) => void
  projects: string[]
  vendors: string[]
}

export default function ExpenseFiltersPanel({ filters, onChange, projects, vendors }: Props) {
  return (
    <AdminCard>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Category</span>
          <select value={filters.category} onChange={(e) => onChange({ category: e.target.value as ExpenseFilters['category'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Status</span>
          <select value={filters.status} onChange={(e) => onChange({ status: e.target.value as ExpenseFilters['status'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Project</span>
          <select value={filters.project} onChange={(e) => onChange({ project: e.target.value })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
            <option value="all">All Projects</option>
            {projects.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Vendor</span>
          <select value={filters.vendor} onChange={(e) => onChange({ vendor: e.target.value })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
            <option value="all">All Vendors</option>
            {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </div>
    </AdminCard>
  )
}
