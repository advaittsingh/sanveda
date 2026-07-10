import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { DonationOpsRecord } from '../../../lib/donationOperationsService'
import {
  markReceiptDownloaded,
  markReceiptReissued,
  markReceiptSent,
} from '../../../lib/donationOperationsService'
import {
  getReceipt80GForDonationId,
  regenerateReceipt80G,
} from '../../../lib/receipt80G/receipt80GService'
import type { Receipt80GData } from '../../../lib/receipt80G/types'
import Receipt80GActions from '../../receipt80G/Receipt80GActions'
import Receipt80GModal from '../../receipt80G/Receipt80GModal'
import { adminBtnDanger, adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'
import type { ReactNode } from 'react'

interface Props {
  donation: DonationOpsRecord | null
  onClose: () => void
  onRefund: (id: string, reason: string) => Promise<void>
  onSaveNotes: (id: string, notes: string) => Promise<void>
  onApproveRefund?: (refundId: string, donationId: string) => Promise<void>
  onRejectRefund?: (refundId: string, donationId: string) => Promise<void>
  pendingRefundId?: string
  onReceiptAction?: () => Promise<void>
}

export default function DonationDetailDrawer({
  donation,
  onClose,
  onRefund,
  onSaveNotes,
  onApproveRefund,
  onRejectRefund,
  pendingRefundId,
  onReceiptAction,
}: Props) {
  const [notes, setNotes] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [receiptData, setReceiptData] = useState<Receipt80GData | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState(false)

  useEffect(() => {
    setNotes(donation?.notes ?? '')
    setRefundReason(donation?.refundReason ?? '')
    setReceiptData(null)
    setShowReceipt(false)
  }, [donation])

  useEffect(() => {
    if (!donation || donation.status !== 'completed') return
    let cancelled = false
    setReceiptLoading(true)
    getReceipt80GForDonationId(donation.id)
      .then((data) => { if (!cancelled) setReceiptData(data) })
      .finally(() => { if (!cancelled) setReceiptLoading(false) })
    return () => { cancelled = true }
  }, [donation])

  if (!donation) return null

  const canRefund = donation.status === 'completed' && donation.refundStatus === 'none'

  const afterReceipt = async () => {
    await onReceiptAction?.()
    const refreshed = await getReceipt80GForDonationId(donation.id)
    if (refreshed) setReceiptData(refreshed)
  }

  return (
    <>
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
              <Info label="Receipt Status" value={donation.receiptState} />
              <Info label="Compliance" value={donation.complianceType} />
              <Info label="Date" value={new Date(donation.createdAt).toLocaleString('en-IN')} />
            </div>

            {donation.status === 'completed' ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">80G Receipt</h3>
                {receiptLoading ? (
                  <p className="text-sm text-slate-500">Loading receipt…</p>
                ) : receiptData ? (
                  <>
                    <Receipt80GActions
                      data={receiptData}
                      onDownload={async () => {
                        await markReceiptDownloaded(donation.id)
                        await afterReceipt()
                      }}
                      onEmail={async () => {
                        await markReceiptSent(donation.id)
                        await afterReceipt()
                      }}
                      onRegenerate={async () => {
                        const next = await regenerateReceipt80G(donation.id)
                        if (next) setReceiptData(next)
                        await afterReceipt()
                      }}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className={adminBtnSecondary} onClick={() => setShowReceipt(true)}>
                        View Receipt
                      </button>
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        onClick={async () => {
                          await markReceiptSent(donation.id)
                          await afterReceipt()
                        }}
                      >
                        Mark as Sent
                      </button>
                      <button
                        type="button"
                        className={adminBtnSecondary}
                        onClick={async () => {
                          await markReceiptReissued(donation.id)
                          await afterReceipt()
                        }}
                      >
                        Mark as Reissued
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Receipt not available yet.</p>
                )}
              </section>
            ) : null}

            <section>
              <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Admin Notes</h3>
              <textarea
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add donor or compliance notes…"
              />
              <button type="button" className={`${adminBtnPrimary} mt-2`} onClick={() => onSaveNotes(donation.id, notes)}>
                Save Notes
              </button>
            </section>

            {canRefund ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Request Refund</h3>
                <textarea
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10"
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Reason for refund request…"
                />
                <button type="button" className={`${adminBtnSecondary} mt-2`} onClick={() => onRefund(donation.id, refundReason || 'Admin initiated refund review')}>
                  Submit Refund Request
                </button>
              </section>
            ) : null}

            {donation.refundStatus === 'requested' && pendingRefundId && onApproveRefund && onRejectRefund ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Refund Approval</h3>
                <p className="mb-3 text-sm text-slate-600">{donation.refundReason ?? 'Refund pending review'}</p>
                <div className="flex gap-2">
                  <button type="button" className={adminBtnPrimary} onClick={() => onApproveRefund(pendingRefundId, donation.id)}>Approve Refund</button>
                  <button type="button" className={adminBtnDanger} onClick={() => onRejectRefund(pendingRefundId, donation.id)}>Reject</button>
                </div>
              </section>
            ) : null}

            <section>
              <h3 className="mb-2 text-sm font-semibold text-[#0B2C6B]">Audit Trail</h3>
              <ul className="space-y-2">
                {donation.auditLogs.length ? donation.auditLogs.map((log) => (
                  <li key={log.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2">
                    <p className="text-sm font-medium text-slate-700">{log.action}</p>
                    <p className="text-xs text-slate-500">{log.detail}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{new Date(log.at).toLocaleString('en-IN')}</p>
                  </li>
                )) : (
                  <li className="text-sm text-slate-500">No audit entries for this donation yet.</li>
                )}
              </ul>
            </section>
          </div>
        </aside>
      </div>

      {showReceipt && receiptData ? (
        <Receipt80GModal
          data={receiptData}
          onClose={() => setShowReceipt(false)}
          onRegenerate={async () => {
            const next = await regenerateReceipt80G(donation.id)
            await afterReceipt()
            return next
          }}
        />
      ) : null}
    </>
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
