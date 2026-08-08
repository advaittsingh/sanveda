import { useState } from 'react'
import { Download, Mail, MessageCircle, Printer, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ProjectOption } from '../../../lib/assignmentOperations'
import type { AssignmentStatus } from '../../../lib/assignmentOperations'
import type { VolunteerProfile, VolunteerTask } from '../../../lib/volunteerOperationsService'
import {
  downloadAppointmentLetter,
  downloadVolunteerIdCard,
  printVolunteerIdCard,
} from '../../../lib/documentService'
import { runDocumentAction } from '../../../lib/runDocumentAction'
import { deliveryUrl } from '../../../lib/privateStorageClient'
import { notifyVolunteerByEmail } from '../../../lib/volunteerStore'
import type { VolunteerStatus } from '../../../types/volunteer'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  volunteer: VolunteerProfile | null
  onClose: () => void
  onStatusChange: (id: string, status: VolunteerStatus) => void
  onSave: (id: string, patch: { assignedTeam?: string; adminNotes?: string; interviewDate?: string }) => void
  team: string
  notes: string
  interviewDate: string
  onTeamChange: (value: string) => void
  onNotesChange: (value: string) => void
  onInterviewDateChange: (value: string) => void
  projectOptions: ProjectOption[]
  onAssignProject: (input: { projectId: string; role: string; startsAt: string }) => Promise<void>
  onAssignmentStatusChange: (assignmentId: string, status: AssignmentStatus) => Promise<void>
  onCreateTask: (input: { title: string; dueDate: string; projectId?: string }) => Promise<void>
  onTaskStatusChange: (taskId: string, status: VolunteerTask['status']) => Promise<void>
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

const BADGE_EMOJI: Record<string, string> = {
  'Top Volunteer': '🥇',
  'Community Hero': '🏅',
  '100 Hours Club': '⭐',
  'Team Leader': '💎',
  'Impact Champion': '🎖️',
}

export default function VolunteerProfileDrawer({
  volunteer,
  onClose,
  onStatusChange,
  onSave,
  team,
  notes,
  interviewDate,
  onTeamChange,
  onNotesChange,
  onInterviewDateChange,
  projectOptions,
  onAssignProject,
  onAssignmentStatusChange,
  onCreateTask,
  onTaskStatusChange,
}: Props) {
  const [docMessage, setDocMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [docBusy, setDocBusy] = useState(false)
  const [assignProjectId, setAssignProjectId] = useState('')
  const [assignRole, setAssignRole] = useState('Volunteer')
  const [assignStart, setAssignStart] = useState(() => new Date().toISOString().slice(0, 10))
  const [assignBusy, setAssignBusy] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [taskProjectId, setTaskProjectId] = useState('')
  const [taskBusy, setTaskBusy] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)

  if (!volunteer) return null

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
      setAssignRole('Volunteer')
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
      await onCreateTask({
        title: taskTitle,
        dueDate: taskDue,
        projectId: taskProjectId || undefined,
      })
      setTaskTitle('')
      setTaskDue('')
      setTaskProjectId('')
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
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close volunteer profile" />
      <aside className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-3">
            {volunteer.photoDataUrl ? (
              <img src={volunteer.photoDataUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B2C6B]/10 text-lg font-bold text-[#0B2C6B]">
                {volunteer.fullName.charAt(0)}
              </span>
            )}
            <div>
              <h2 className="text-lg font-semibold text-[#0B2C6B]">{volunteer.fullName}</h2>
              <p className="text-sm text-slate-500">
                {volunteer.primaryRole} · {volunteer.department}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={volunteer.status} />
            {volunteer.volunteerId ? (
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                {volunteer.volunteerId}
              </span>
            ) : null}
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Personal Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Full Name" value={volunteer.fullName} />
              <Info label="Email" value={volunteer.email} />
              <Info label="Phone" value={volunteer.phone} />
              <Info label="DOB" value={volunteer.dateOfBirth || '—'} />
              <Info label="Gender" value={volunteer.gender || '—'} />
              <Info label="Address" value={volunteer.address} />
              <Info label="Location" value={volunteer.location} />
              <Info label="Emergency Contact" value={volunteer.emergencyContact} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {volunteer.skillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Attendance</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Info label="Present Days" value={volunteer.presentDays} />
              <Info label="Volunteer Hours" value={volunteer.volunteerHours} />
              <Info label="Projects" value={volunteer.projects} />
              <Info label="Events" value={volunteer.events} />
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#0B2C6B]">Assignment History</h3>
            </div>
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
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Project</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Start</th>
                    <th className="px-3 py-2">End</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteer.assignments.length ? (
                    volunteer.assignments.map((a) => (
                      <tr key={a.id || `${a.project}-${a.start}`} className="border-b border-[#E5E7EB]/80 last:border-0">
                        <td className="px-3 py-2">{a.project}</td>
                        <td className="px-3 py-2">{a.role}</td>
                        <td className="px-3 py-2">{formatDate(a.start)}</td>
                        <td className="px-3 py-2">{formatDate(a.end)}</td>
                        <td className="px-3 py-2">
                          {a.id && (a.status === 'upcoming' || a.status === 'active') ? (
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
                      <td colSpan={5} className="px-3 py-4 text-center text-sm text-slate-500">
                        No project assignments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Tasks</h3>
            <div className="mb-4 space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add Task</p>
              <div className="grid gap-2 sm:grid-cols-3">
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
                <select
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                  value={taskProjectId}
                  onChange={(e) => setTaskProjectId(e.target.value)}
                >
                  <option value="">Project (optional)</option>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={adminBtnPrimary} disabled={taskBusy} onClick={() => void submitTask()}>
                  {taskBusy ? 'Saving…' : 'Add Task'}
                </button>
                {taskError ? <p className="text-sm font-semibold text-red-700">{taskError}</p> : null}
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Task</th>
                    <th className="px-3 py-2">Due</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Proof</th>
                    <th className="px-3 py-2">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteer.tasks.length ? (
                    volunteer.tasks.map((t) => (
                      <tr key={t.id || t.name} className="border-b border-[#E5E7EB]/80 last:border-0">
                        <td className="px-3 py-2 font-medium">{t.name}</td>
                        <td className="px-3 py-2">{formatDate(t.dueDate)}</td>
                        <td className="px-3 py-2">
                          {t.id ? (
                            <select
                              className="rounded-lg border border-[#E5E7EB] px-2 py-1 text-xs capitalize"
                              value={t.status}
                              onChange={(e) =>
                                void onTaskStatusChange(t.id, e.target.value as VolunteerTask['status'])
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
                      <td colSpan={5} className="px-3 py-4 text-center text-sm text-slate-500">
                        No tasks yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Certifications</h3>
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Certification</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteer.certificationRecords.map((c) => (
                    <tr key={c.name} className="border-b border-[#E5E7EB]/80 last:border-0">
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2 capitalize">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Events Participation</h3>
            <div className="space-y-2">
              {volunteer.eventParticipation.map((event) => (
                <div
                  key={event.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-800">{event.name}</span>
                  <span className="text-xs text-slate-500">
                    {event.attended ? 'Attended' : 'Missed'} · {event.hours} hrs · ★ {event.feedbackScore}/5
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">
              Volunteer Score: {volunteer.performanceScore}/100
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(volunteer.performanceBreakdown).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-[#F8FAFC] px-3 py-2">
                  <div className="flex justify-between text-xs font-semibold capitalize text-slate-600">
                    <span>{key === 'impact' ? 'Impact Score' : key}</span>
                    <span>{value}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Recognition Badges</h3>
            <div className="flex flex-wrap gap-2">
              {volunteer.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#0B2C6B]"
                >
                  {BADGE_EMOJI[badge] ?? '🏆'} {badge}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Communication</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={adminBtnSecondary}
                onClick={() =>
                  notifyVolunteerByEmail(volunteer, 'Sanveda Volunteer Update', `Dear ${volunteer.fullName},\n\nWe have an update regarding your volunteer application.\n\nRegards,\nSanveda Team`)
                }
              >
                <Mail size={14} className="mr-1.5" />
                Send Email
              </button>
              <button type="button" className={adminBtnSecondary}>
                <MessageCircle size={14} className="mr-1.5" />
                Send WhatsApp
              </button>
              <button type="button" className={adminBtnSecondary}>Broadcast</button>
              <button type="button" className={adminBtnSecondary}>Event Reminder</button>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">ID Card & Certificates</h3>
            <div className="flex flex-wrap gap-2">
              {volunteer.volunteerId ? (
                <>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    disabled={docBusy}
                    onClick={() => void runDoc('Volunteer ID card downloaded.', () => downloadVolunteerIdCard(volunteer))}
                  >
                    <Download size={14} className="mr-1.5" />
                    Download ID Card
                  </button>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    disabled={docBusy}
                    onClick={() => void runDoc('Print dialog opened for ID card.', () => printVolunteerIdCard(volunteer))}
                  >
                    <Printer size={14} className="mr-1.5" />
                    Print ID Card
                  </button>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    disabled={docBusy}
                    onClick={() =>
                      void runDoc('Appointment letter downloaded.', () =>
                        downloadAppointmentLetter({
                          recipientName: volunteer.fullName,
                          role: volunteer.primaryRole || 'Volunteer',
                          department: volunteer.department || 'Operations',
                          startDate: new Date().toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }),
                          type: 'volunteer',
                          referenceId: volunteer.volunteerId ?? volunteer.id,
                        }),
                      )
                    }
                  >
                    Appointment Letter
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500">Approve volunteer to generate ID card.</p>
              )}
            </div>
            {docMessage ? (
              <p
                role={docMessage.tone === 'error' ? 'alert' : 'status'}
                className={`mt-2 text-sm ${docMessage.tone === 'error' ? 'font-semibold text-red-700' : 'text-emerald-700'}`}
              >
                {docMessage.text}
              </p>
            ) : null}
          </section>

          <section className="space-y-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Team</span>
              <input
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                value={team}
                onChange={(e) => onTeamChange(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interview Date</span>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                value={interviewDate}
                onChange={(e) => onInterviewDateChange(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Notes</span>
              <textarea
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                rows={3}
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
              />
            </label>
          </section>

          <div className="flex flex-wrap gap-2 border-t border-[#E5E7EB] pt-4">
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(volunteer.id, 'screening')}>
              Screening
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(volunteer.id, 'interview')}>
              Interview
            </button>
            <button type="button" className={adminBtnPrimary} onClick={() => onStatusChange(volunteer.id, 'approved')}>
              Approve
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(volunteer.id, 'orientation')}>
              Training
            </button>
            <button type="button" className={adminBtnPrimary} onClick={() => onStatusChange(volunteer.id, 'active')}>
              Activate
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(volunteer.id, 'rejected')}>
              Reject
            </button>
            <button
              type="button"
              className={adminBtnSecondary}
              onClick={() =>
                onSave(volunteer.id, {
                  assignedTeam: team,
                  adminNotes: notes,
                  interviewDate: interviewDate || undefined,
                })
              }
            >
              Save
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
