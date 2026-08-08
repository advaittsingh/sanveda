import { useState } from 'react'
import { Download, FileText, Mail, MessageCircle, Printer, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AssignmentStatus, ProjectOption } from '../../../lib/assignmentOperations'
import {
  ALUMNI_OUTCOME_LABELS,
  type InternProfile,
  type InternTask,
} from '../../../lib/internshipOperationsService'
import { downloadAppointmentLetter } from '../../../lib/documentService'
import { downloadInternshipCertificate, downloadInternshipLor } from '../../../lib/internshipService'
import type { InternshipStatus } from '../../../lib/internshipService'
import { runDocumentAction } from '../../../lib/runDocumentAction'
import { deliveryUrl } from '../../../lib/privateStorageClient'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  intern: InternProfile | null
  notes: string
  onNotesChange: (value: string) => void
  onClose: () => void
  onStatusChange: (id: string, status: InternshipStatus) => void
  onSaveNotes: (id: string, notes: string) => void
  projectOptions: ProjectOption[]
  onAssignProject: (input: { projectId: string; role: string; startsAt: string }) => Promise<void>
  onAssignmentStatusChange: (assignmentId: string, status: AssignmentStatus) => Promise<void>
  onCreateTask: (input: { title: string; dueDate: string }) => Promise<void>
  onTaskStatusChange: (taskId: string, status: InternTask['status']) => Promise<void>
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
  projectOptions,
  onAssignProject,
  onAssignmentStatusChange,
  onCreateTask,
  onTaskStatusChange,
}: Props) {
  const [docMessage, setDocMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [docBusy, setDocBusy] = useState(false)
  const [assignProjectId, setAssignProjectId] = useState('')
  const [assignRole, setAssignRole] = useState('Intern')
  const [assignStart, setAssignStart] = useState(() => new Date().toISOString().slice(0, 10))
  const [assignBusy, setAssignBusy] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [taskBusy, setTaskBusy] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)

  if (!intern) return null

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' }) : '—'

  const submitAssign = async () => {
    if (!assignProjectId) {
      setAssignError('Select a project.')
      return
    }
    setAssignBusy(true)
    setAssignError(null)
    try {
      await onAssignProject({
        projectId: assignProjectId,
        role: assignRole,
        startsAt: assignStart,
      })
      setAssignProjectId('')
      setAssignRole('Intern')
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Could not assign to project.')
    } finally {
      setAssignBusy(false)
    }
  }

  const submitTask = async () => {
    if (!taskTitle.trim()) {
      setTaskError('Task title is required.')
      return
    }
    setTaskBusy(true)
    setTaskError(null)
    try {
      await onCreateTask({ title: taskTitle, dueDate: taskDue })
      setTaskTitle('')
      setTaskDue('')
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Could not create task.')
    } finally {
      setTaskBusy(false)
    }
  }

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

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Project Assignments</h3>
            <div className="mb-4 space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assign to Project</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                  value={assignProjectId}
                  onChange={(e) => setAssignProjectId(e.target.value)}
                >
                  <option value="">Select project…</option>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  placeholder="Role"
                />
                <input
                  type="date"
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                  value={assignStart}
                  onChange={(e) => setAssignStart(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={adminBtnPrimary} disabled={assignBusy} onClick={() => void submitAssign()}>
                  {assignBusy ? 'Assigning…' : 'Assign to Project'}
                </button>
                {assignError ? <p className="text-sm font-semibold text-red-700">{assignError}</p> : null}
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Project</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Start</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {intern.projectAssignments.length ? (
                    intern.projectAssignments.map((a) => (
                      <tr key={a.id} className="border-b border-[#E5E7EB]/60">
                        <td className="px-3 py-2 font-medium">{a.project}</td>
                        <td className="px-3 py-2">{a.role}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(a.start)}</td>
                        <td className="px-3 py-2">
                          {a.status === 'upcoming' || a.status === 'active' ? (
                            <select
                              className="rounded-lg border border-[#E5E7EB] px-2 py-1 text-xs capitalize"
                              value={a.status === 'upcoming' ? 'assigned' : a.status}
                              onChange={(e) =>
                                void onAssignmentStatusChange(a.id, e.target.value as AssignmentStatus)
                              }
                            >
                              <option value="assigned">Upcoming</option>
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className="capitalize">{a.status}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-500">
                        No project assignments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Task & Project Tracking</h3>
            <div className="mb-4 space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add Task</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title"
                />
                <input
                  type="date"
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={adminBtnPrimary} disabled={taskBusy} onClick={() => void submitTask()}>
                  {taskBusy ? 'Saving…' : 'Add Task'}
                </button>
                {taskError ? <p className="text-sm font-semibold text-red-700">{taskError}</p> : null}
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Task</th>
                    <th className="px-3 py-2">Due Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Proof</th>
                    <th className="px-3 py-2">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {intern.tasks.length ? (
                    intern.tasks.map((t) => (
                      <tr key={t.id || t.name} className="border-b border-[#E5E7EB]/60">
                        <td className="px-3 py-2 font-medium">{t.name}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(t.dueDate)}</td>
                        <td className="px-3 py-2">
                          {t.id ? (
                            <select
                              className="rounded-lg border border-[#E5E7EB] px-2 py-1 text-xs capitalize"
                              value={t.status}
                              onChange={(e) =>
                                void onTaskStatusChange(t.id, e.target.value as InternTask['status'])
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className="capitalize">{t.status.replace(/_/g, ' ')}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-semibold text-[#0B2C6B]">{t.score ?? '—'}</td>
                        <td className="px-3 py-2 text-xs">
                          {t.proofUrl ? (
                            <a
                              href={deliveryUrl(t.proofUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-[#0B2C6B] underline"
                            >
                              {t.proofName || 'View proof'}
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={t.approvalStatus || 'unreviewed'} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-sm text-slate-500">
                        No tasks yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

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
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={docBusy}
                onClick={() => void runDoc('Internship certificate downloaded.', () => downloadInternshipCertificate(intern))}
              >
                <Download size={14} className="mr-1" />
                Certificate
              </button>
            ) : null}
            {['approved', 'active', 'completed'].includes(intern.status) ? (
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={docBusy}
                onClick={() =>
                  void runDoc('Internship appointment letter downloaded.', () =>
                    downloadAppointmentLetter({
                      recipientName: intern.fullName,
                      role: `${intern.preferredDepartment || 'General'} Intern`,
                      department: intern.preferredDepartment || 'Internship Programme',
                      startDate: intern.startDate
                        ? new Date(intern.startDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : new Date().toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }),
                      type: 'intern',
                      referenceId: intern.internId || intern.applicationId || intern.id,
                    }),
                  )
                }
              >
                <FileText size={14} className="mr-1" />
                Appointment Letter
              </button>
            ) : null}
            {(intern.status === 'completed' || intern.status === 'active') && (
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={docBusy}
                onClick={() => void runDoc('Letter of recommendation downloaded.', () => downloadInternshipLor(intern))}
              >
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
            <a
              className={adminBtnSecondary}
              href={`https://wa.me/${intern.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={14} className="mr-1" />
              WhatsApp
            </a>
            {intern.certificateNumber ? (
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={docBusy}
                onClick={() => void runDoc('Internship certificate downloaded for print/save.', () => downloadInternshipCertificate(intern))}
              >
                <Printer size={14} className="mr-1" />
                Print Certificate
              </button>
            ) : null}
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
