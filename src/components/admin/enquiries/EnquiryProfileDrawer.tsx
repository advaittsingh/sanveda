import { Calendar, Mail, MessageCircle, Phone, Save, UserPlus, X } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  CONVERT_TARGETS,
  WORKFLOW_STAGES,
  type ConvertTarget,
  type EnquiryProfile,
  type WorkflowStage,
} from '../../../lib/enquiryOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  enquiry: EnquiryProfile | null
  notes: string
  workflowStage: WorkflowStage
  onNotesChange: (value: string) => void
  onWorkflowChange: (stage: WorkflowStage) => void
  onClose: () => void
  onSave: () => void
  onConvert: (target: ConvertTarget) => void
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">{title}</h3>
      {children}
    </section>
  )
}

const priorityStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-amber-100 text-amber-800',
  medium: 'bg-sky-100 text-sky-800',
  low: 'bg-slate-100 text-slate-600',
}

export default function EnquiryProfileDrawer({
  enquiry,
  notes,
  workflowStage,
  onNotesChange,
  onWorkflowChange,
  onClose,
  onSave,
  onConvert,
}: Props) {
  if (!enquiry) return null

  const formatTime = (d: string) =>
    new Date(d).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close enquiry" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{enquiry.ticketId} — {enquiry.name}</h2>
            <p className="text-sm text-slate-500">{enquiry.subject}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-5 py-3">
          <StatusBadge status={enquiry.workflowStage} />
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${priorityStyles[enquiry.priority]}`}>
            {enquiry.priority}
          </span>
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
            Score: {enquiry.leadScore}/100
          </span>
          {enquiry.isEscalated ? (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Escalated</span>
          ) : null}
          {enquiry.isOverdue ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">SLA Overdue</span>
          ) : null}
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <Section title="Basic Information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Ticket ID" value={enquiry.ticketId} />
              <Info label="Name" value={enquiry.name} />
              <Info label="Email" value={enquiry.email} />
              <Info label="Phone" value={enquiry.phone} />
              <Info label="Organization" value={enquiry.organization ?? '—'} />
              <Info label="Source" value={enquiry.sourceLabel} />
              <Info label="Date" value={enquiry.createdLabel} />
              <Info label="Priority" value={enquiry.priority} />
              <Info label="Category" value={enquiry.categoryLabel} />
              <Info label="Assigned To" value={`${enquiry.assignedTo} (${enquiry.assignedTeam})`} />
            </div>
          </Section>

          <Section title="Lead Score">
            <div className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
              <p className="text-2xl font-bold text-[#0B2C6B]">{enquiry.leadScore}<span className="text-base font-normal text-slate-500">/100</span></p>
              <ul className="mt-3 space-y-1">
                {enquiry.leadScoreBreakdown.map((b) => (
                  <li key={b.label} className="flex justify-between text-sm text-slate-700">
                    <span>{b.label}</span>
                    <span className="font-semibold text-emerald-600">+{b.points}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section title="Message Thread">
            <div className="space-y-3">
              {enquiry.thread.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-3 text-sm ${
                    msg.author === 'user' ? 'bg-slate-50 border border-[#E5E7EB]' : 'bg-[#0B2C6B]/5 border border-[#0B2C6B]/10'
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-500">
                    {msg.author === 'user' ? msg.authorName : `Admin: ${msg.authorName}`}
                  </p>
                  <p className="mt-1 text-slate-800">{msg.message}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{formatTime(msg.timestamp)}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Internal Notes">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="High-value CSR prospect. Follow up next Tuesday…"
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
            />
          </Section>

          <Section title="Workflow Status">
            <select
              value={workflowStage}
              onChange={(e) => onWorkflowChange(e.target.value as WorkflowStage)}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none"
            >
              {WORKFLOW_STAGES.map((s) => (
                <option key={s.stage} value={s.stage}>{s.label}</option>
              ))}
            </select>
          </Section>

          {enquiry.attachments.length > 0 ? (
            <Section title="File Attachments">
              <div className="flex flex-wrap gap-2">
                {enquiry.attachments.map((a) => (
                  <span key={a.name} className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    {a.name} ({a.type})
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="Convert Enquiry">
            <p className="mb-2 text-sm text-slate-600">Convert {enquiry.name} to:</p>
            <div className="flex flex-wrap gap-2">
              {CONVERT_TARGETS.map((t) => (
                <button key={t.value} type="button" className={adminBtnSecondary} onClick={() => onConvert(t.value)}>
                  <UserPlus size={12} className="mr-1" />
                  {t.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Communication Center">
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${enquiry.email}?subject=Re: ${encodeURIComponent(enquiry.subject)}`} className={adminBtnSecondary}>
                <Mail size={14} className="mr-1" />
                Send Email
              </a>
              <button type="button" className={adminBtnSecondary} onClick={() => window.alert('WhatsApp integration coming soon.')}>
                <MessageCircle size={14} className="mr-1" />
                WhatsApp
              </button>
              <a href={`tel:${enquiry.phone}`} className={adminBtnSecondary}>
                <Phone size={14} className="mr-1" />
                Call
              </a>
              <button type="button" className={adminBtnSecondary} onClick={() => window.alert('Meeting scheduler coming soon.')}>
                <Calendar size={14} className="mr-1" />
                Schedule Meeting
              </button>
            </div>
          </Section>

          <Section title="CRM Timeline">
            <ul className="space-y-2">
              {enquiry.crmTimeline.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-500">✓</span>
                  <span className="font-medium text-slate-800">{item.label}</span>
                  <span className="text-xs text-slate-400">{formatTime(item.date)}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="SLA & Timing">
            <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
              <Info label="SLA Target" value={`${enquiry.slaHours} hrs`} />
              <Info label="SLA Status" value={enquiry.slaCompliant ? 'Compliant' : 'Overdue'} />
              <Info label="Response Time" value={enquiry.responseTimeHours ? `${enquiry.responseTimeHours} hrs` : '—'} />
              <Info label="Resolution Time" value={enquiry.resolutionTimeHours ? `${enquiry.resolutionTimeHours} hrs` : '—'} />
            </div>
          </Section>
        </div>

        <div className="border-t border-[#E5E7EB] px-5 py-4">
          <button type="button" className={`${adminBtnPrimary} w-full justify-center`} onClick={onSave}>
            <Save size={14} className="mr-1.5" />
            Save Changes
          </button>
        </div>
      </aside>
    </div>
  )
}
