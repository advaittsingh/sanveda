import { adminInputClass, adminLabelClass } from '../ui/adminStyles'
import type { TaxReceiptFilters } from '../../../lib/taxReceiptOperationsService'
import { RECEIPT_TYPE_LABELS, type ReceiptStatus, type ReceiptType } from '../../../lib/taxReceiptOperationsService'

interface Props {
  filters: TaxReceiptFilters
  campaigns: string[]
  financialYears: string[]
  onChange: (patch: Partial<TaxReceiptFilters>) => void
}

const STATUSES: ReceiptStatus[] = ['pending', 'generated', 'sent', 'failed', 'verified']

export default function TaxReceiptFiltersPanel({ filters, campaigns, financialYears, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className={adminLabelClass}>Receipt Type</label>
        <select className={adminInputClass} value={filters.type} onChange={(e) => onChange({ type: e.target.value as ReceiptType | 'all' })}>
          <option value="all">All Types</option>
          {(Object.keys(RECEIPT_TYPE_LABELS) as ReceiptType[]).map((t) => (
            <option key={t} value={t}>{RECEIPT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Status</label>
        <select className={adminInputClass} value={filters.status} onChange={(e) => onChange({ status: e.target.value as ReceiptStatus | 'all' })}>
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Campaign</label>
        <select className={adminInputClass} value={filters.campaign} onChange={(e) => onChange({ campaign: e.target.value })}>
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Financial Year</label>
        <select className={adminInputClass} value={filters.financialYear} onChange={(e) => onChange({ financialYear: e.target.value })}>
          <option value="all">All Years</option>
          {financialYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  )
}
