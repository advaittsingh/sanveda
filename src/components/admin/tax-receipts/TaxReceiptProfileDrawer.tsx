import { Download, Mail, QrCode, X } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { TaxReceiptProfile } from '../../../lib/taxReceiptOperationsService'

interface Props {
  receipt: TaxReceiptProfile | null
  onClose: () => void
  onGenerate: () => void
  onEmail: () => void
  onPrint: () => void
}

export default function TaxReceiptProfileDrawer({ receipt, onClose, onGenerate, onEmail, onPrint }: Props) {
  if (!receipt) return null

  const date = new Date(receipt.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0E4FA8]">{receipt.receiptTypeLabel} Receipt</p>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{receipt.receiptNumber}</h2>
            <StatusBadge status={receipt.status} />
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 p-5">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sanveda Global Humanitarian Foundation</p>
            <p className="mt-1 text-sm font-semibold text-[#0B2C6B]">Donation Receipt{receipt.eightyGEligible ? ' — 80G Eligible' : ''}</p>
            <p className="mt-3 text-2xl font-bold text-[#0B2C6B]">₹{formatIndianCompact(receipt.amount)}</p>
            <p className="mt-1 text-sm text-slate-600">{receipt.donorName}</p>
            <p className="text-xs text-slate-500">{date}</p>
          </div>

          <dl className="space-y-3 text-sm">
            {[
              ['Donation ID', receipt.donationId],
              ['Donor ID', receipt.donorId],
              ['PAN', receipt.pan],
              ['Email', receipt.email],
              ['Mobile', receipt.mobile],
              ['Transaction ID', receipt.transactionId],
              ['Payment Gateway', receipt.paymentGateway],
              ['Campaign', receipt.campaign],
              ['Project', receipt.project],
              ['80G Eligibility', receipt.eightyGEligible ? 'Yes' : 'No'],
              ['Financial Year', receipt.financialYear],
              ['Email Status', receipt.emailStatus],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-[#E5E7EB] pb-2">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-xl border border-dashed border-[#E5E7EB] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0B2C6B]">
              <QrCode size={16} /> QR Verification
            </div>
            <p className="mt-2 font-mono text-xs text-slate-600">{receipt.verificationUrl}</p>
            <p className="mt-1 text-xs text-slate-500">Code: {receipt.verificationCode}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#E5E7EB] p-5">
          {receipt.status === 'pending' ? (
            <button type="button" className={adminBtnPrimary} onClick={onGenerate}>Generate Receipt</button>
          ) : null}
          <button type="button" className={adminBtnSecondary} onClick={onPrint}>
            <Download size={14} className="mr-1.5 inline" />Download PDF
          </button>
          <button type="button" className={adminBtnSecondary} onClick={onEmail}>
            <Mail size={14} className="mr-1.5 inline" />Email Donor
          </button>
        </div>
      </div>
    </div>
  )
}
