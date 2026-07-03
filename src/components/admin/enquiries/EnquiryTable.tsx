import { Eye } from 'lucide-react'
import type { EnquiryProfile } from '../../../lib/enquiryOperationsService'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  enquiries: EnquiryProfile[]
  loading?: boolean
  selectedId?: string
  onView: (enquiry: EnquiryProfile) => void
}

const priorityStyles: Record<string, string> = {
  critical: 'bg-red-50 text-red-700',
  high: 'bg-orange-50 text-orange-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

export default function EnquiryTable({ enquiries, loading, selectedId, onView }: Props) {
  return (
    <DataTable
      loading={loading}
      data={enquiries}
      keyFn={(e) => e.id}
      selectedKey={selectedId}
      onRowClick={onView}
      emptyMessage="No enquiries match your filters."
      columns={[
        { key: 'ticket', header: 'Ticket', render: (e) => <span className="font-mono text-xs font-semibold text-[#0B2C6B]">{e.ticketId}</span> },
        { key: 'name', header: 'Name', render: (e) => (
          <div>
            <p className="font-medium text-slate-800">{e.name}</p>
            {e.organization ? <p className="text-xs text-slate-500">{e.organization}</p> : null}
          </div>
        )},
        { key: 'category', header: 'Category', render: (e) => e.categoryLabel },
        { key: 'priority', header: 'Priority', render: (e) => (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${priorityStyles[e.priority]}`}>{e.priority}</span>
        )},
        { key: 'assigned', header: 'Assigned To', render: (e) => e.assignedTo },
        { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.workflowStage} /> },
        { key: 'source', header: 'Source', render: (e) => e.sourceLabel },
        { key: 'created', header: 'Created', render: (e) => e.createdLabel },
        { key: 'actions', header: '', render: (e) => (
          <button type="button" className={adminBtnSecondary} onClick={(ev) => { ev.stopPropagation(); onView(e) }}>
            <Eye size={13} className="mr-1" />View
          </button>
        )},
      ]}
    />
  )
}
