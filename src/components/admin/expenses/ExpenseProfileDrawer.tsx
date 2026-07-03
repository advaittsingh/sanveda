import { Check, Save, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { WORKFLOW_STAGES, type ExpenseProfile } from '../../../lib/expenseOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  expense: ExpenseProfile | null
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onMarkPaid: () => void
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

export default function ExpenseProfileDrawer({ expense, onClose, onApprove, onReject, onMarkPaid }: Props) {
  if (!expense) return null

  const currentStep = WORKFLOW_STAGES.findIndex((s) => s.stage === expense.workflowStage)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{expense.expenseId}</h2>
            <p className="text-sm text-slate-500">{expense.description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-5 py-3">
          <StatusBadge status={expense.status} />
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">₹{expense.amount.toLocaleString('en-IN')}</span>
          {expense.hasInvoice ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Invoice</span> : null}
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Expense Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Date" value={expense.dateLabel} />
              <Info label="Category" value={expense.categoryLabel} />
              <Info label="Project" value={expense.project} />
              <Info label="Focus Area" value={expense.focusArea} />
              <Info label="Vendor" value={expense.vendor} />
              <Info label="Approved By" value={expense.approvedBy ?? 'Pending'} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Project Mapping</h3>
            <div className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-3 text-sm">
              <p>{expense.focusArea} → {expense.project} → {expense.description} → ₹{expense.amount.toLocaleString('en-IN')}</p>
            </div>
          </section>

          {expense.beneficiary ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Beneficiary Mapping</h3>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                <Info label="Beneficiary" value={expense.beneficiary} />
                <div className="mt-2"><Info label="Treatment" value={expense.description} /></div>
                <div className="mt-2"><Info label="Status" value={expense.status} /></div>
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Approval Workflow</h3>
            <div className="flex flex-wrap items-center gap-1">
              {WORKFLOW_STAGES.map((step, i) => (
                <div key={step.stage} className="flex items-center">
                  <div className={`rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${i <= currentStep ? 'bg-[#0B2C6B] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {step.label}
                  </div>
                  {i < WORKFLOW_STAGES.length - 1 ? <span className="mx-0.5 text-slate-300">→</span> : null}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Payment Tracking</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Method" value={expense.paymentMethod?.replace('_', ' ') ?? '—'} />
              <Info label="Status" value={expense.paymentStatus ?? '—'} />
              <Info label="UTR" value={expense.utr ?? '—'} />
              <Info label="Grant" value={expense.grant ?? '—'} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Documents</h3>
            <div className="flex flex-wrap gap-2">
              {['Invoice', 'GST Invoice', 'Purchase Order', 'Quotation', 'Payment Proof'].map((doc) => (
                <span key={doc} className={`rounded-full border px-3 py-1 text-xs ${expense.hasInvoice ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#E5E7EB] text-slate-500'}`}>{doc}</span>
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-2 border-t border-[#E5E7EB] px-5 py-4">
          {expense.status === 'pending' ? (
            <>
              <button type="button" className={`${adminBtnPrimary} flex-1 justify-center`} onClick={onApprove}><Check size={14} className="mr-1" />Approve</button>
              <button type="button" className={`${adminBtnSecondary} flex-1 justify-center`} onClick={onReject}>Reject</button>
            </>
          ) : expense.status === 'approved' ? (
            <button type="button" className={`${adminBtnPrimary} w-full justify-center`} onClick={onMarkPaid}><Save size={14} className="mr-1" />Mark Paid</button>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
