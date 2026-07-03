import { useEffect, useState, type ReactNode } from 'react'
import { Download, Mail, RefreshCcw, X } from 'lucide-react'
import type { DonationOpsRecord } from '../../../lib/donationOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  donation: DonationOpsRecord | null
  onClose: () => void
  onSendReceipt: (id: string) => Promise<void>
  onDownloadReceipt: (id: string) => Promise<void>
  onRefund: (id: string, reason: string) => Promise<void>
  onSaveNotes: (id: string, notes: string) => Promise<void>
}

export default function DonationDetailDrawer({
  donation,
  onClose,
  onSendReceipt,
  onDownloadReceipt,
  onRefund,
  onSaveNotes,
}: Props) {
  const [notes, setNotes] = useState('')
  const [refundReason, setRefundReason] = useState('')

  useEffect(() => {
    setNotes(donation?.notes ?? '')
    setRefundReason(donation?.refundReason ?? '')
  }, [donation])

  if (!donation) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close donation details" />
      <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">Donation #{donation.id.slice(0, 8)}</h2>
            <p className="text-sm text-slate-500">{donation.donorLabel} · {donation.campaignTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Amount" value={`₹${donation.amount.toLocaleString('en-IN')}`} />
            <Info label="Status" value={<StatusBadge status={donation.status} />} />
            <Info label="Donor" value={donation.donorLabel} />
            <Info label="Campaign" value={donation.campaignTitle} />
            <Info label="Transaction ID" value={donation.transactionId} />
            <Info label="Gateway" value={donation.gateway} />
            <Info label="Payment Method" value={donation.paymentMethod} />
            <Info label="Tax Exemption" value={donation.taxExemption} />
            <Info label="Receipt" value={donation.receiptNumber ?? 'Pending'} />
            <Info label="Compliance" value={donation.complianceType} />
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Receipt Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnSecondary} onClick={() => onSendReceipt(donation.id)}>
                <Mail size={14} className="mr-1.5" />
                Send Receipt
              </button>
              <button type="button" className={adminBtnSecondary} onClick={() => onDownloadReceipt(donation.id)}>
                <Download size={14} className="mr-1.5" />
                Download PDF
              </button>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Notes</h3>
            <textarea
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add donor or compliance notes..."
            />
            <button type="button" className={`${adminBtnPrimary} mt-2`} onClick={() => onSaveNotes(donation.id, notes)}>
              Save Notes
            </button>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Refund</h3>
            <textarea
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10"
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund request..."
            />
            <button type="button" className={`${adminBtnSecondary} mt-2`} onClick={() => onRefund(donation.id, refundReason || 'Admin initiated refund review')}>
              <RefreshCcw size={14} className="mr-1.5" />
              Request Refund
            </button>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Audit Logs</h3>
            <ul className="space-y-2">
              {donation.auditLogs.length ? donation.auditLogs.map((log) => (
                <li key={log.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2">
                  <p className="text-sm font-medium text-slate-700">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.detail}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{new Date(log.at).toLocaleString('en-IN')}</p>
                </li>
              )) : (
                <li className="text-sm text-slate-500">No audit logs yet.</li>
              )}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  )
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-700">{value}</div>
    </div>
  )
}
