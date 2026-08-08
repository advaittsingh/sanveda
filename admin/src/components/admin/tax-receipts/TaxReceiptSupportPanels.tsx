import { ArrowDown, CheckCircle, Mail, Shield, XCircle } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import type {
  EightyGCertificate,
  EmailHistoryRecord,
  ReceiptTemplate,
  TaxReceiptProfile,
} from '../../../lib/taxReceiptOperationsService'

interface BulkProps {
  pendingCount: number
  onGenerateAll: () => void
  onGenerateByCampaign: () => void
  onGenerateByMonth: () => void
  onGenerateByFY: () => void
  onEmailAll: () => void
}

export function TaxReceiptBulkPanel({ pendingCount, onGenerateAll, onGenerateByCampaign, onGenerateByMonth, onGenerateByFY, onEmailAll }: BulkProps) {
  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="font-semibold text-[#0B2C6B]">Bulk Receipt Generation</h3>
        <p className="mt-1 text-sm text-slate-500">Generate receipts in batch after payment verification</p>
        <div className="mt-4 flex flex-col items-center gap-2 py-4 sm:flex-row sm:justify-center sm:gap-3">
          {['Donation Received', 'Verify Payment', 'Generate Receipt', 'Assign Number', 'Generate PDF', 'Email Donor', 'Store in Repository'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0B2C6B]">{step}</span>
              {i < arr.length - 1 ? <ArrowDown size={14} className="rotate-90 text-slate-400 sm:rotate-0" /> : null}
            </div>
          ))}
        </div>
      </AdminCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Generate All Pending', count: pendingCount, action: onGenerateAll },
          { label: 'Generate By Campaign', count: null, action: onGenerateByCampaign },
          { label: 'Generate By Month', count: 845, action: onGenerateByMonth },
          { label: 'Generate By Financial Year', count: null, action: onGenerateByFY },
          { label: 'Generate By Donor', count: null, action: onGenerateByCampaign },
        ].map((item) => (
          <AdminCard key={item.label}>
            <h4 className="font-semibold text-[#0B2C6B]">{item.label}</h4>
            {item.count != null ? <p className="mt-1 text-2xl font-bold text-[#0E4FA8]">{item.count.toLocaleString('en-IN')}</p> : null}
            <button type="button" className={`${adminBtnSecondary} mt-4 w-full`} onClick={item.action}>Run</button>
          </AdminCard>
        ))}
      </div>

      <AdminCard>
        <h4 className="font-semibold text-[#0B2C6B]">Example: April 2026 Donations</h4>
        <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <span className="text-sm text-slate-600">845 Donations</span>
          <ArrowDown size={14} className="rotate-90 text-slate-400 sm:rotate-0" />
          <span className="text-sm font-semibold text-[#0B2C6B]">Generate 845 Receipts</span>
          <ArrowDown size={14} className="rotate-90 text-slate-400 sm:rotate-0" />
          <button type="button" className={adminBtnPrimary} onClick={onEmailAll}>Email All</button>
        </div>
      </AdminCard>
    </div>
  )
}

export function TaxReceiptEightyGPanel({ certificates }: { certificates: EightyGCertificate[] }) {
  return (
    <div className="space-y-4">
      <AdminCard>
        <h3 className="font-semibold text-[#0B2C6B]">80G & 12A Certificates</h3>
        <p className="mt-1 text-sm text-slate-500">Organization tax exemption certificates for donor receipts</p>
      </AdminCard>
      <div className="grid gap-4 lg:grid-cols-2">
        {certificates.map((c) => (
          <AdminCard key={c.id}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#0E4FA8]">{c.certificate} Certificate</span>
                <h4 className="mt-1 font-semibold text-[#0B2C6B]">{c.certificateNumber}</h4>
              </div>
              <StatusBadge status={c.status.toLowerCase()} />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Issue Date</dt><dd>{c.issueDate}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Valid Till</dt><dd className="font-semibold text-emerald-700">{c.validTill}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Signatory</dt><dd>{c.authorizedSignatory}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Digital Signature</dt><dd>{c.digitalSignature ? 'Enabled' : 'Pending'}</dd></div>
            </dl>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}

export function TaxReceiptEmailPanel({ history }: { history: EmailHistoryRecord[] }) {
  const statusIcon = (status: EmailHistoryRecord['status']) => {
    if (status === 'sent' || status === 'opened') return <CheckCircle size={14} className="text-emerald-600" />
    if (status === 'failed') return <XCircle size={14} className="text-red-600" />
    return <Mail size={14} className="text-slate-400" />
  }

  return (
    <div className="space-y-4">
      <AdminCard>
        <h3 className="font-semibold text-[#0B2C6B]">Email Automation</h3>
        <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm text-slate-700">
          <p className="font-semibold text-[#0B2C6B]">Subject: Your Donation Receipt from Sanveda</p>
          <p className="mt-2">Dear Donor,</p>
          <p className="mt-1">Thank you for your contribution. Please find attached your 80G tax exemption receipt.</p>
          <p className="mt-2">Regards,<br />Sanveda Foundation</p>
        </div>
      </AdminCard>
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Receipt</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Donor</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No emails sent yet.</td></tr>
            ) : history.map((h) => (
              <tr key={h.id} className="border-b border-[#E5E7EB]">
                <td className="px-4 py-3 font-mono text-xs">{h.receiptNumber}</td>
                <td className="px-4 py-3">{h.donorName}</td>
                <td className="px-4 py-3 text-slate-600">{h.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 capitalize">{statusIcon(h.status)} {h.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TaxReceiptTemplatesPanel({ templates, onUse }: { templates: ReceiptTemplate[]; onUse: (name: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <AdminCard key={t.id}>
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-[#0B2C6B]">{t.name}</h4>
            {t.isDefault ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Default</span> : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">{t.description}</p>
          <button type="button" className={`${adminBtnSecondary} mt-4 w-full`} onClick={() => onUse(t.name)}>Use Template</button>
        </AdminCard>
      ))}
    </div>
  )
}

export function TaxReceiptVerificationPanel({ onVerify }: { onVerify: (receiptNumber: string) => void }) {
  return (
    <AdminCard>
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-[#0B2C6B]" />
        <h3 className="font-semibold text-[#0B2C6B]">Receipt Verification Portal</h3>
      </div>
      <p className="mt-2 text-sm text-slate-500">Verify receipt authenticity by receipt number — public portal at /verify</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const input = (e.currentTarget.elements.namedItem('receiptNo') as HTMLInputElement)
          onVerify(input.value)
        }}
      >
        <input name="receiptNo" placeholder="TXR-2026-001" className="flex-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-mono outline-none" />
        <button type="submit" className={adminBtnPrimary}>Verify</button>
      </form>
    </AdminCard>
  )
}

export function TaxReceiptCompliancePanel({ reports, onGenerate }: { reports: string[]; onGenerate: (name: string) => void }) {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Compliance Reports</h3>
      <p className="mt-1 text-sm text-slate-500">Generate tax and audit reports for regulators and auditors</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {reports.map((r) => (
          <button key={r} type="button" className={adminBtnSecondary} onClick={() => onGenerate(r)}>{r}</button>
        ))}
      </div>
    </AdminCard>
  )
}

export function TaxReceiptArchitecturePanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Finance & Compliance Engine</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <h4 className="text-sm font-semibold text-[#0B2C6B]">Finance Engine</h4>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {['Income', 'Expenses', 'Grants', 'Budgets', 'Receivables', 'Payables', 'Reports', 'Tax Receipts', 'Audit Logs'].map((i) => (
              <li key={i}>├── {i}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <h4 className="text-sm font-semibold text-[#0B2C6B]">Compliance Engine</h4>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {['80G', '12A', 'CSR', 'FCRA', 'Audit', 'Tax Receipts', 'Government Filings', 'Certificates'].map((i) => (
              <li key={i}>├── {i}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Donation → Transaction → Receipt → 80G/FCRA Validation → PDF → Email → Verification → Audit Trail
      </p>
    </AdminCard>
  )
}

export function TaxReceiptDonationList({ receipts, onSelect }: { receipts: TaxReceiptProfile[]; onSelect: (r: TaxReceiptProfile) => void }) {
  return (
    <div className="grid gap-3">
      {receipts.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onSelect(r)}
          className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-left transition hover:bg-[#F8FAFC]"
        >
          <div>
            <p className="font-mono text-xs text-[#0E4FA8]">{r.receiptNumber}</p>
            <p className="font-semibold text-[#0B2C6B]">{r.donorName}</p>
            <p className="text-xs text-slate-500">{r.campaign}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#0B2C6B]">₹{r.amount.toLocaleString('en-IN')}</p>
            <StatusBadge status={r.status} />
          </div>
        </button>
      ))}
    </div>
  )
}
