import AdminCard from '../ui/AdminCard'
import {
  ENQUIRY_CATEGORIES,
  PRIORITY_OPTIONS,
  SOURCE_OPTIONS,
  WORKFLOW_STAGES,
  type EnquiryFilters,
} from '../../../lib/enquiryOperationsService'

interface Props {
  filters: EnquiryFilters
  onChange: (patch: Partial<EnquiryFilters>) => void
  assignees: string[]
}

export default function EnquiryFiltersPanel({ filters, onChange, assignees }: Props) {
  return (
    <AdminCard>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</span>
          <select value={filters.category} onChange={(e) => onChange({ category: e.target.value as EnquiryFilters['category'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
            <option value="all">All Categories</option>
            {ENQUIRY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</span>
          <select value={filters.priority} onChange={(e) => onChange({ priority: e.target.value as EnquiryFilters['priority'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
            <option value="all">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
          <select value={filters.status} onChange={(e) => onChange({ status: e.target.value as EnquiryFilters['status'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
            <option value="all">All Statuses</option>
            {WORKFLOW_STAGES.map((s) => <option key={s.stage} value={s.stage}>{s.label}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Source</span>
          <select value={filters.source} onChange={(e) => onChange({ source: e.target.value as EnquiryFilters['source'] })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
            <option value="all">All Sources</option>
            {SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned To</span>
          <select value={filters.assignedTo} onChange={(e) => onChange({ assignedTo: e.target.value })}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none">
            <option value="all">All Agents</option>
            {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>
    </AdminCard>
  )
}
