import { Download, FileText, Mail, MessageCircle, Printer, X } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  ALUMNI_OUTCOME_LABELS,
  type InternProfile,
} from '../../../lib/internshipOperationsService'
import { downloadInternshipCertificate, downloadInternshipLor } from '../../../lib/internshipService'
import type { InternshipStatus } from '../../../lib/internshipService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  intern: InternProfile | null
  notes: string
  onNotesChange: (value: string) => void
  onClose: () => void
  onStatusChange: (id: string, status: InternshipStatus) => void
  onSaveNotes: (id: string, notes: string) => void
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

export default function InternshipProfileDrawer({
  intern,
  notes,
  onNotesChange,
  onClose,
  onStatusChange,
  onSaveNotes,
}: Props) {
  if (!intern) return null

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' }) : '—'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close profile" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B2C6B]/10 text-lg font-bold text-[#0B2C6B]">
              {intern.fullName.charAt(0)}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#0B2C6B]">{intern.fullName}</h2>
              <p className="text-sm text-slate-500">{intern.internId} · {intern.programLabel}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={intern.status} />
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
              Performance: {intern.performanceScore}%
            </span>
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-violet-700">
              {intern.mode}
            </span>
          </div>

          {intern.unifiedRoles.length > 1 ? (
            <section className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">People Master — Unified Roles</h3>
              <ul className="space-y-2">
                {intern.unifiedRoles.map((r) => (
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
              <Info label="Email" value={intern.email} />
              <Info label="Phone" value={intern.phone} />
              <Info label="Address" value="—" />
              <Info label="Emergency Contact" value="—" />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Academic Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="University" value={intern.university ?? '—'} />
              <Info label="Degree" value={intern.course ?? '—'} />
              <Info label="Branch" value={intern.course ?? '—'} />
              <Info label="Semester" value={intern.semester ?? '—'} />
              <Info label="CGPA" value="—" />
              <Info label="Graduation Year" value="—" />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Internship Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Intern ID" value={intern.internId} />
              <Info label="Application ID" value={intern.applicationId} />
              <Info label="Department" value={intern.preferredDepartment ?? '—'} />
              <Info label="Mentor" value={intern.mentor} />
              <Info label="Start Date" value={formatDate(intern.startDate)} />
              <Info label="End Date" value={formatDate(intern.endDate)} />
              <Info label="Mode" value={intern.mode} />
              <Info label="Stipend" value={intern.stipend ? `₹${intern.stipend.toLocaleString('en-IN')}/month` : 'Unpaid'} />
              <Info label="Duration" value={intern.durationLabel} />
              <Info label="Case Stage" value={intern.pipelineStage.replace(/_/g, ' ')} />
            </div>
          </section>

          <section className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Mentor Management</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Mentor" value={intern.mentor} />
              <Info label="Department" value={intern.preferredDepartment ?? '—'} />
              <Info label="Weekly Meetings" value={intern.weeklyMeetings} />
              <Info label="Progress Score" value={`${intern.progressScore}%`} />
            </div>
          </section>

          {intern.tasks.length ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Task & Project Tracking</h3>
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Task</th>
                      <th className="px-3 py-2">Due Date</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intern.tasks.map((t) => (
                      <tr key={t.name} className="border-b border-[#E5E7EB]/60">
                        <td className="px-3 py-2 font-medium">{t.name}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(t.dueDate)}</td>
                        <td className="px-3 py-2 capitalize">{t.status.replace(/_/g, ' ')}</td>
                        <td className="px-3 py-2 font-semibold text-[#0B2C6B]">{t.score ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {(intern.status === 'active' || intern.status === 'completed') && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Attendance & Hours</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Info label="Attendance" value={`${intern.attendancePct}%`} />
                <Info label="Working Hours" value={`${intern.workingHours} hrs`} />
                <Info label="Meetings Attended" value={intern.meetingsAttended} />
                <Info label="Assignments Completed" value={intern.assignmentsCompleted} />
              </div>
            </section>
          )}

          {intern.performance.length ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Performance Evaluation</h3>
              <div className="space-y-2">
                {intern.performance.map((p) => (
                  <div key={p.label} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2">
                    <span className="text-sm font-medium text-slate-700">{p.label}</span>
                    <span className="text-sm font-semibold text-[#0B2C6B]">{p.score}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm font-semibold text-emerald-700">Overall: {intern.performanceScore}/100</p>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Deliverables</h3>
            <div className="flex flex-wrap gap-2">
              {intern.deliverables.map((d) => (
                <span
                  key={d.label}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${d.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {d.completed ? '✓' : '○'} {d.label}
                </span>
              ))}
            </div>
          </section>

          {intern.stipendRecords.length ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Stipend Management</h3>
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Month</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intern.stipendRecords.map((s) => (
                      <tr key={s.month} className="border-b border-[#E5E7EB]/60">
                        <td className="px-3 py-2">{s.month}</td>
                        <td className="px-3 py-2 font-semibold text-[#0B2C6B]">₹{s.amount.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 capitalize">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {intern.alumniOutcomes.length ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Placement & Alumni Tracking</h3>
              <div className="flex flex-wrap gap-2">
                {intern.alumniOutcomes.map((o) => (
                  <span key={o} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    ✓ {ALUMNI_OUTCOME_LABELS[o]}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Admin Notes</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0B2C6B]/30"
              placeholder="Interview notes, mentor feedback…"
            />
          </section>
        </div>

        <div className="space-y-3 border-t border-[#E5E7EB] p-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(intern.id, 'review')}>Screen</button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(intern.id, 'approved')}>Select</button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(intern.id, 'active')}>Activate</button>
            <button type="button" className={adminBtnPrimary} onClick={() => onStatusChange(intern.id, 'completed')}>Complete</button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(intern.id, 'rejected')}>Reject</button>
            <button type="button" className={adminBtnPrimary} onClick={() => onSaveNotes(intern.id, notes)}>Save Notes</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {intern.certificateNumber ? (
              <button type="button" className={adminBtnSecondary} onClick={() => downloadInternshipCertificate(intern)}>
                <Download size={14} className="mr-1" />
                Certificate
              </button>
            ) : null}
            {(intern.status === 'completed' || intern.status === 'active') && (
              <button type="button" className={adminBtnSecondary} onClick={() => downloadInternshipLor(intern)}>
                <FileText size={14} className="mr-1" />
                LOR
              </button>
            )}
            <button
              type="button"
              className={adminBtnSecondary}
              onClick={() => {
                const subject = encodeURIComponent('Sanveda Internship Update')
                const body = encodeURIComponent(`Dear ${intern.fullName},\n\nWe have an update regarding your Sanveda internship.\n\nRegards,\nSanveda Team`)
                window.open(`mailto:${intern.email}?subject=${subject}&body=${body}`, '_blank')
              }}
            >
              <Mail size={14} className="mr-1" />
              Email
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => window.alert('WhatsApp integration coming soon.')}>
              <MessageCircle size={14} className="mr-1" />
              WhatsApp
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => window.print()}>
              <Printer size={14} className="mr-1" />
              Print
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
