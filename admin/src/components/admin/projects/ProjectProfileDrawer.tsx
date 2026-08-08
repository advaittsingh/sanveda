import { useState } from 'react'
import { Download, Pencil, Printer, Trash2, X } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  exportProjectsCsv,
  type ProjectProfile,
} from '../../../lib/projectOperationsService'
import type { ProjectStatus } from '../../../lib/projectService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

export interface PersonOption {
  id: string
  name: string
  assignedTeam?: string
}

interface Props {
  project: ProjectProfile | null
  notes: string
  onNotesChange: (value: string) => void
  onClose: () => void
  onStatusChange: (id: string, status: ProjectStatus) => void
  onSaveNotes: (id: string, notes: string) => void
  onEdit: () => void
  onDelete: (id: string) => void
  volunteerOptions: PersonOption[]
  internOptions: PersonOption[]
  onAddTeamMember: (input: {
    memberType: 'volunteer' | 'intern' | 'other'
    personId?: string
    memberName: string
    role: string
    currentAssignedTeam?: string | null
  }) => Promise<void>
  onCreateTask: (input: { title: string; dueDate: string; assignedName: string }) => Promise<void>
  onTaskStatusChange: (
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled',
  ) => Promise<void>
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

export default function ProjectProfileDrawer({
  project,
  notes,
  onNotesChange,
  onClose,
  onStatusChange,
  onSaveNotes,
  onEdit,
  onDelete,
  volunteerOptions,
  internOptions,
  onAddTeamMember,
  onCreateTask,
  onTaskStatusChange,
}: Props) {
  const [memberType, setMemberType] = useState<'volunteer' | 'intern' | 'other'>('volunteer')
  const [personId, setPersonId] = useState('')
  const [otherName, setOtherName] = useState('')
  const [memberRole, setMemberRole] = useState('Volunteer')
  const [memberBusy, setMemberBusy] = useState(false)
  const [memberError, setMemberError] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [taskOwner, setTaskOwner] = useState('')
  const [taskBusy, setTaskBusy] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)

  if (!project) return null

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' }) : '—'

  const people = memberType === 'volunteer' ? volunteerOptions : memberType === 'intern' ? internOptions : []

  const submitMember = async () => {
    setMemberBusy(true)
    setMemberError(null)
    try {
      if (memberType === 'other') {
        await onAddTeamMember({
          memberType: 'other',
          memberName: otherName,
          role: memberRole || 'Team Member',
        })
        setOtherName('')
      } else {
        const person = people.find((p) => p.id === personId)
        if (!person) throw new Error(`Select a ${memberType}.`)
        await onAddTeamMember({
          memberType,
          personId: person.id,
          memberName: person.name,
          role: memberRole || (memberType === 'volunteer' ? 'Volunteer' : 'Intern'),
          currentAssignedTeam: person.assignedTeam,
        })
        setPersonId('')
      }
    } catch (err) {
      setMemberError(err instanceof Error ? err.message : 'Could not add team member.')
    } finally {
      setMemberBusy(false)
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
      await onCreateTask({ title: taskTitle, dueDate: taskDue, assignedName: taskOwner })
      setTaskTitle('')
      setTaskDue('')
      setTaskOwner('')
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Could not create task.')
    } finally {
      setTaskBusy(false)
    }
  }

  const dbStatus = (ui: string): 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' => {
    if (ui === 'complete') return 'completed'
    if (ui === 'in_progress') return 'in_progress'
    if (ui === 'blocked') return 'blocked'
    if (ui === 'cancelled') return 'cancelled'
    return 'pending'
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close project" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{project.title}</h2>
            <p className="text-sm text-slate-500">{project.projectId} · {project.focusArea}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={project.status} />
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-violet-700">
              {project.priority} priority
            </span>
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
              {project.computedProgress}% progress
            </span>
            {project.isOverBudget ? (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Over budget</span>
            ) : null}
            {project.isDelayed ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Delayed</span>
            ) : null}
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Basic Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Project ID" value={project.projectId} />
              <Info label="Focus Area" value={project.focusArea ?? '—'} />
              <Info label="Start Date" value={formatDate(project.startDate)} />
              <Info label="End Date" value={formatDate(project.endDate)} />
              <Info label="Location" value={project.locationLabel} />
              <Info label="Lifecycle Stage" value={project.lifecycleStage.replace(/_/g, ' ')} />
            </div>
            {project.description ? (
              <p className="mt-3 text-sm text-slate-600">{project.description}</p>
            ) : null}
          </section>

          <section className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Budget Tracking</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Allocated Budget" value={`₹${project.budget.toLocaleString('en-IN')}`} />
              <Info label="Received Funds" value={`₹${project.receivedFunds.toLocaleString('en-IN')}`} />
              <Info label="Utilized Funds" value={`₹${project.spent.toLocaleString('en-IN')}`} />
              <Info label="Remaining" value={`₹${project.remainingBudget.toLocaleString('en-IN')}`} />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                <span>{project.utilizationPct}% Utilized</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${project.isOverBudget ? 'bg-red-500' : 'bg-[#0E4FA8]'}`}
                  style={{ width: `${Math.min(project.utilizationPct, 100)}%` }}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Team Assignment</h3>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <Info label="Project Director" value={project.team.projectDirector || '—'} />
              <Info label="Program Manager" value={project.team.programManager || '—'} />
              <Info label="Team Members" value={project.team.teamMembers} />
              <Info label="Volunteers" value={project.team.volunteers} />
              <Info label="Interns" value={project.team.interns} />
              <Info label="Partners" value={project.team.partners} />
              <Info label="Field Staff" value={project.team.fieldStaff} />
            </div>
            <div className="mb-4 space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add Team Member</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                  value={memberType}
                  onChange={(e) => {
                    const next = e.target.value as 'volunteer' | 'intern' | 'other'
                    setMemberType(next)
                    setPersonId('')
                    setMemberRole(next === 'volunteer' ? 'Volunteer' : next === 'intern' ? 'Intern' : 'Team Member')
                  }}
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="intern">Intern</option>
                  <option value="other">Other</option>
                </select>
                {memberType === 'other' ? (
                  <input
                    className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    placeholder="Full name"
                  />
                ) : (
                  <select
                    className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                    value={personId}
                    onChange={(e) => setPersonId(e.target.value)}
                  >
                    <option value="">Select {memberType}…</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  placeholder="Role"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={adminBtnPrimary} disabled={memberBusy} onClick={() => void submitMember()}>
                  {memberBusy ? 'Adding…' : 'Add Member'}
                </button>
                {memberError ? <p className="text-sm font-semibold text-red-700">{memberError}</p> : null}
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {project.teamRoster.length ? (
                    project.teamRoster.map((m) => (
                      <tr key={m.id} className="border-b border-[#E5E7EB]/60">
                        <td className="px-3 py-2 font-medium">{m.name}</td>
                        <td className="px-3 py-2">{m.role}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(m.joinedOn)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-sm text-slate-500">
                        No team members yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Beneficiary Integration</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Info label="Total" value={project.beneficiaryBreakdown.total.toLocaleString('en-IN')} />
              <Info label="Children" value={project.beneficiaryBreakdown.children.toLocaleString('en-IN')} />
              <Info label="Women" value={project.beneficiaryBreakdown.women.toLocaleString('en-IN')} />
              <Info label="Senior Citizens" value={project.beneficiaryBreakdown.seniorCitizens.toLocaleString('en-IN')} />
            </div>
          </section>

          {project.linkedCampaigns.length ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Campaign Integration</h3>
              <div className="flex flex-wrap gap-2">
                {project.linkedCampaigns.map((c) => (
                  <span key={c} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    ✓ {c}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Milestone Tracking</h3>
            <div className="space-y-2">
              {project.milestones.map((m) => (
                <div key={m.label} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{m.label}</span>
                  <span className={`text-sm font-semibold ${m.completed ? 'text-emerald-600' : m.inProgress ? 'text-amber-600' : 'text-slate-400'}`}>
                    {m.completed ? '✓' : m.inProgress ? '⏳' : '○'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Task Management</h3>
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
                  value={taskOwner}
                  onChange={(e) => setTaskOwner(e.target.value)}
                >
                  <option value="">Owner (optional)</option>
                  {project.teamRoster.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
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
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Task</th>
                    <th className="px-3 py-2">Owner</th>
                    <th className="px-3 py-2">Due</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {project.tasks.length ? (
                    project.tasks.map((t) => (
                      <tr key={t.id || t.name} className="border-b border-[#E5E7EB]/60">
                        <td className="px-3 py-2 font-medium">{t.name}</td>
                        <td className="px-3 py-2">{t.owner || '—'}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(t.dueDate)}</td>
                        <td className="px-3 py-2">
                          {t.id ? (
                            <select
                              className="rounded-lg border border-[#E5E7EB] px-2 py-1 text-xs capitalize"
                              value={dbStatus(t.status)}
                              onChange={(e) =>
                                void onTaskStatusChange(
                                  t.id,
                                  e.target.value as 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled',
                                )
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In progress</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className="capitalize">{t.status.replace(/_/g, ' ')}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-500">
                        No tasks yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Impact Metrics</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {project.impactMetrics.map((m) => (
                <div key={m.label} className="rounded-lg border border-[#E5E7EB] px-3 py-2">
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="text-lg font-bold text-[#0B2C6B]">{m.value.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </section>

          {project.expenseCategories.length ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Financial Tracking</h3>
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.expenseCategories.map((e) => (
                      <tr key={e.category} className="border-b border-[#E5E7EB]/60">
                        <td className="px-3 py-2">{e.category}</td>
                        <td className="px-3 py-2 font-semibold text-[#0B2C6B]">₹{e.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Document Repository</h3>
            <div className="flex flex-wrap gap-2">
              {project.documents.map((d) => (
                <span
                  key={d.name}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${d.uploaded ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {d.uploaded ? '✓' : '○'} {d.name}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Media Gallery</h3>
            <div className="flex flex-wrap gap-2">
              {project.media.map((m) => (
                <span
                  key={m.label}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${m.available ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {m.available ? '✓' : '○'} {m.label}
                </span>
              ))}
            </div>
          </section>

          {project.successStory ? (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Project Success Story</h3>
              <Info label="Investment" value={`₹${project.successStory.investment.toLocaleString('en-IN')}`} />
              <div className="mt-2">
                <Info label="Beneficiaries" value={project.successStory.beneficiaries.toLocaleString('en-IN')} />
              </div>
              <p className="mt-3 text-sm text-slate-700">{project.successStory.outcome}</p>
              <div className="mt-2 flex gap-2 text-xs font-semibold text-emerald-700">
                {project.successStory.hasPhotos ? <span>✓ Photos</span> : null}
                {project.successStory.hasTestimonials ? <span>✓ Testimonials</span> : null}
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
              placeholder="Project notes, risks, follow-ups…"
            />
          </section>
        </div>

        <div className="space-y-3 border-t border-[#E5E7EB] p-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(project.id, 'planning')}>Planning</button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(project.id, 'active')}>Activate</button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(project.id, 'completed')}>Complete</button>
            <button type="button" className={adminBtnPrimary} onClick={() => onSaveNotes(project.id, notes)}>Save Notes</button>
            <button type="button" className={adminBtnSecondary} onClick={onEdit}>
              <Pencil size={14} className="mr-1" />
              Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnSecondary} onClick={() => exportProjectsCsv([project])}>
              <Download size={14} className="mr-1" />
              Export
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => window.print()}>
              <Printer size={14} className="mr-1" />
              Print
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              onClick={() => {
                if (window.confirm(`Delete ${project.title}?`)) onDelete(project.id)
              }}
            >
              <Trash2 size={14} className="mr-1" />
              Delete
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
