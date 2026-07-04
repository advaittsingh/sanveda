import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import type { DonationOpsRecord, DonationTableFilters } from '../../../lib/donationOperationsService'
import { adminBtnSecondary, adminInputClass } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'
import DonationEmptyState from './DonationEmptyState'

type SortKey = 'date' | 'amount' | 'donor' | 'campaign'
type SortDir = 'asc' | 'desc'

interface Props {
  donations: DonationOpsRecord[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: (ids: string[]) => void
  onRowClick: (donation: DonationOpsRecord) => void
  onDownloadReceipt: (id: string) => void
  loading?: boolean
}

const PAGE_SIZE = 15

export default function DonationsTable({
  donations,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  onDownloadReceipt,
  loading,
}: Props) {
  const [filters, setFilters] = useState<DonationTableFilters>({
    search: '',
    status: 'all',
    receipt: 'all',
    gateway: 'all',
  })
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let rows = [...donations]

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      rows = rows.filter(
        (d) =>
          d.donorLabel.toLowerCase().includes(q) ||
          d.campaignTitle.toLowerCase().includes(q) ||
          (d.donorEmail?.toLowerCase().includes(q) ?? false) ||
          (d.receiptNumber?.toLowerCase().includes(q) ?? false),
      )
    }
    if (filters.status !== 'all') rows = rows.filter((d) => d.status === filters.status)
    if (filters.receipt !== 'all') rows = rows.filter((d) => d.receiptState === filters.receipt)
    if (filters.gateway !== 'all') rows = rows.filter((d) => d.gateway === filters.gateway)

    rows.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date') cmp = a.createdAt.localeCompare(b.createdAt)
      else if (sortKey === 'amount') cmp = a.amount - b.amount
      else if (sortKey === 'donor') cmp = a.donorLabel.localeCompare(b.donorLabel)
      else cmp = a.campaignTitle.localeCompare(b.campaignTitle)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return rows
  }, [donations, filters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageData = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
  const allPageSelected = pageData.length > 0 && pageData.every((d) => selectedIds.has(d.id))

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null

  if (loading) {
    return (
      <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className={`${adminInputClass} pl-9`}
            placeholder="Search donor, campaign, receipt…"
            value={filters.search}
            onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(0) }}
          />
        </div>
        <select
          className={adminInputClass}
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value as DonationTableFilters['status'] })); setPage(0) }}
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          className={adminInputClass}
          value={filters.receipt}
          onChange={(e) => { setFilters((f) => ({ ...f, receipt: e.target.value as DonationTableFilters['receipt'] })); setPage(0) }}
        >
          <option value="all">All receipts</option>
          <option value="pending">Receipt pending</option>
          <option value="generated">Generated</option>
          <option value="sent">Sent</option>
          <option value="downloaded">Downloaded</option>
        </select>
        <select
          className={adminInputClass}
          value={filters.gateway}
          onChange={(e) => { setFilters((f) => ({ ...f, gateway: e.target.value as DonationTableFilters['gateway'] })); setPage(0) }}
        >
          <option value="all">All gateways</option>
          <option value="Razorpay">Razorpay</option>
          <option value="UPI">UPI</option>
          <option value="Bank">Bank</option>
          <option value="Manual">Manual</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <DonationEmptyState
          title="No donations match your filters"
          description="Donations will appear here once donors contribute through campaigns or the donate flow."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={() => onToggleSelectAll(pageData.map((d) => d.id))}
                        className="h-4 w-4 rounded"
                      />
                    </th>
                    {([
                      ['donor', 'Donor'],
                      ['campaign', 'Campaign'],
                      ['amount', 'Amount'],
                    ] as [SortKey, string][]).map(([key, label]) => (
                      <th key={key} className="px-4 py-3">
                        <button type="button" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500" onClick={() => toggleSort(key)}>
                          {label}
                          <SortIcon col={key} />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tax</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Receipt</th>
                    <th className="px-4 py-3">
                      <button type="button" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500" onClick={() => toggleSort('date')}>
                        Date
                        <SortIcon col="date" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((donation) => (
                    <tr
                      key={donation.id}
                      onClick={() => onRowClick(donation)}
                      className="cursor-pointer border-b border-[#E5E7EB]/80 last:border-0 hover:bg-[#F8FAFC]"
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(donation.id)}
                          onChange={() => onToggleSelect(donation.id)}
                          className="h-4 w-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#0B2C6B]">{donation.donorLabel}</p>
                        <p className="text-xs text-slate-500">{donation.donorEmail ?? donation.donorPhone ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{donation.campaignTitle}</td>
                      <td className="px-4 py-3 font-semibold text-[#0B2C6B]">₹{donation.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-slate-700">{donation.paymentMethod}</td>
                      <td className="px-4 py-3 text-slate-700">{donation.taxExemption}</td>
                      <td className="px-4 py-3"><StatusBadge status={donation.status} /></td>
                      <td className="px-4 py-3 capitalize text-slate-700">{donation.receiptState}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(donation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button type="button" className={adminBtnSecondary} onClick={() => onRowClick(donation)}>View</button>
                          {donation.status === 'completed' ? (
                            <button type="button" className={adminBtnSecondary} onClick={() => onDownloadReceipt(donation.id)}>Receipt</button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <button type="button" className={adminBtnSecondary} disabled={safePage <= 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button type="button" className={adminBtnSecondary} disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
