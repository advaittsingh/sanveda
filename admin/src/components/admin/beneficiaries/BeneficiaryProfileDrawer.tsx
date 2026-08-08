import { useState } from 'react'
import { Download, Mail, MessageCircle, Printer, Trash2, X } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  DOCUMENT_STATUS_LABELS,
  type BeneficiaryProfile,
} from '../../../lib/beneficiaryOperationsService'
import { downloadBeneficiaryIdCard, printBeneficiaryIdCard } from '../../../lib/documentService'
import type { BeneficiaryStatus } from '../../../lib/beneficiaryService'
import { runDocumentAction } from '../../../lib/runDocumentAction'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  beneficiary: BeneficiaryProfile | null
  notes: string
  onNotesChange: (value: string) => void
  onClose: () => void
  onStatusChange: (id: string, status: BeneficiaryStatus) => void
  onSaveNotes: (id: string, notes: string) => void
  onDelete: (id: string) => void
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

const DOC_STATUS_STYLE: Record<string, string> = {
  uploaded: 'bg-slate-100 text-slate-600',
  pending_review: 'bg-amber-50 text-amber-700',
  verified: 'bg-sky-50 text-sky-700',
  approved: 'bg-emerald-50 text-emerald-700',
}

export default function BeneficiaryProfileDrawer({
  beneficiary,
  notes,
  onNotesChange,
  onClose,
  onStatusChange,
  onSaveNotes,
  onDelete,
}: Props) {
  const [docMessage, setDocMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [docBusy, setDocBusy] = useState(false)

  if (!beneficiary) return null

  const runDoc = async (label: string, action: () => void | Promise<void>) => {
    setDocBusy(true)
    setDocMessage(null)
    const result = await runDocumentAction(action)
    setDocBusy(false)
    setDocMessage(
      result.ok
        ? { tone: 'ok', text: label }
        : { tone: 'error', text: result.message },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close profile" />
      <aside className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B2C6B]/10 text-lg font-bold text-[#0B2C6B]">
              {beneficiary.fullName.charAt(0)}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#0B2C6B]">{beneficiary.fullName}</h2>
              <p className="text-sm text-slate-500">{beneficiary.beneficiaryId} · {beneficiary.categoryLabel}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={beneficiary.status} />
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-violet-700">
              {beneficiary.priority} priority
            </span>
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
              Impact: {beneficiary.impactScore}/100
            </span>
          </div>

          {beneficiary.unifiedRoles.length > 1 ? (
            <section className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Unified People Engine</h3>
              <p className="mb-2 text-xs text-slate-500">This person appears across multiple Sanveda systems</p>
              <ul className="space-y-2">
                {beneficiary.unifiedRoles.map((r) => (
                  <li key={r.role} className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-[#0B2C6B]">✓ {r.role}</span>
                    <span className="text-slate-500">— {r.detail}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Personal Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Beneficiary ID" value={beneficiary.beneficiaryId} />
              <Info label="Phone" value={beneficiary.phone ?? '—'} />
              <Info label="Email" value={beneficiary.email ?? '—'} />
              <Info label="Address" value={beneficiary.address ?? '—'} />
              <Info label="Location" value={beneficiary.locationLabel} />
              <Info label="Guardian" value="—" />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Program Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Primary Program" value={beneficiary.programLabel} />
              <Info label="Case Worker" value={beneficiary.caseWorker} />
              <Info label="Assigned Team" value={beneficiary.assignedTeam} />
              <Info label="Registration Date" value={new Date(beneficiary.createdAt).toLocaleDateString('en-IN')} />
              <Info label="Support Category" value={beneficiary.categoryLabel} />
              <Info label="Case Stage" value={beneficiary.pipelineStage.replace(/_/g, ' ')} />
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Programs</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {beneficiary.programs.map((p) => (
                  <span key={p} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Financial Assistance</h3>
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiary.financialAssistance.map((f, i) => (
                    <tr key={i} className="border-b border-[#E5E7EB]/60">
                      <td className="px-3 py-2 text-slate-600">
                        {new Date(f.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-2 font-semibold text-[#0B2C6B]">₹{f.amount.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2">{f.type}</td>
                      <td className="px-3 py-2 text-slate-500">{f.approvedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Support Distribution</h3>
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Quantity</th>
                    <th className="px-3 py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiary.supportItems.map((s) => (
                    <tr key={s.type} className="border-b border-[#E5E7EB]/60">
                      <td className="px-3 py-2 font-medium">{s.type}</td>
                      <td className="px-3 py-2">{s.quantity}</td>
                      <td className="px-3 py-2 font-semibold text-[#0B2C6B]">₹{s.value.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Family Management</h3>
            <p className="mb-2 text-sm font-medium text-slate-700">{beneficiary.fullName.split(' ')[0]} Family</p>
            <ul className="mb-3 space-y-1">
              {beneficiary.familyMembers.map((m) => (
                <li key={m.name} className="text-sm text-slate-600">
                  {m.name} <span className="text-slate-400">({m.relation})</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-3">
              <Info label="Family Income" value={`₹${beneficiary.familyIncome.toLocaleString('en-IN')}`} />
              <Info label="Family Support Received" value={`₹${beneficiary.familySupportTotal.toLocaleString('en-IN')}`} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Document Verification</h3>
            <div className="space-y-2">
              {beneficiary.documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">✓ {doc.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${DOC_STATUS_STYLE[doc.status] ?? ''}`}>
                    {DOCUMENT_STATUS_LABELS[doc.status]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Outcome Tracking</h3>
            <div className="space-y-2">
              {beneficiary.outcomes.map((o) => (
                <div key={o.label} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{o.label}</span>
                  <span className={`text-sm font-semibold ${o.completed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {o.completed ? '✓' : '○'} {o.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {beneficiary.successStory ? (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Success Story</h3>
              <p className="text-xs font-semibold uppercase text-slate-500">Before Support</p>
              <p className="mt-1 text-sm text-slate-700">{beneficiary.successStory.before}</p>
              <p className="mt-3 text-xs font-semibold uppercase text-slate-500">After Support</p>
              <p className="mt-1 text-sm text-slate-700">{beneficiary.successStory.after}</p>
              <blockquote className="mt-3 border-l-2 border-emerald-400 pl-3 text-sm italic text-slate-600">
                {beneficiary.successStory.testimonial}
              </blockquote>
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                Impact Score: {beneficiary.successStory.impactScore}/100
              </p>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Admin Notes</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
              placeholder="Case notes, follow-up actions…"
            />
          </section>
        </div>

        <div className="space-y-3 border-t border-[#E5E7EB] p-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(beneficiary.id, 'active')}>
              Mark Active
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(beneficiary.id, 'completed')}>
              Mark Completed
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(beneficiary.id, 'on_hold')}>
              On Hold
            </button>
            <button type="button" className={adminBtnPrimary} onClick={() => onSaveNotes(beneficiary.id, notes)}>
              Save Notes
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={adminBtnSecondary}
              disabled={docBusy}
              onClick={() => void runDoc('Beneficiary ID card downloaded.', () => downloadBeneficiaryIdCard(beneficiary))}
            >
              <Download size={14} className="mr-1" />
              ID Card
            </button>
            <button
              type="button"
              className={adminBtnSecondary}
              disabled={docBusy}
              onClick={() =>
                void runDoc('Print dialog opened for ID card.', () => printBeneficiaryIdCard(beneficiary))
              }
            >
              <Printer size={14} className="mr-1" />
              Print ID Card
            </button>
            <button
              type="button"
              className={adminBtnSecondary}
              onClick={() => {
                const subject = encodeURIComponent('Sanveda Program Update')
                const body = encodeURIComponent(`Dear ${beneficiary.fullName},\n\nWe have an update regarding your Sanveda program support.\n\nRegards,\nSanveda Team`)
                window.open(`mailto:${beneficiary.email ?? ''}?subject=${subject}&body=${body}`, '_blank')
              }}
            >
              <Mail size={14} className="mr-1" />
              Email
            </button>
            <a
              className={adminBtnSecondary}
              href={`https://wa.me/${(beneficiary.phone ?? '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={14} className="mr-1" />
              WhatsApp
            </a>
            <button
              type="button"
              className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              onClick={() => {
                if (window.confirm(`Delete ${beneficiary.fullName}?`)) onDelete(beneficiary.id)
              }}
            >
              <Trash2 size={14} className="mr-1" />
              Delete
            </button>
          </div>
          {docMessage ? (
            <p
              role={docMessage.tone === 'error' ? 'alert' : 'status'}
              className={`text-sm ${docMessage.tone === 'error' ? 'font-semibold text-red-700' : 'text-emerald-700'}`}
            >
              {docMessage.text}
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
