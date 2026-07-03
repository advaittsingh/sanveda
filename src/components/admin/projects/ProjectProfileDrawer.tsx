import { Download, FileText, Pencil, Printer, Trash2, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { REPORT_TYPES, exportProjectsCsv, type ProjectProfile } from '../../../lib/projectOperationsService'
import type { ProjectStatus } from '../../../lib/projectService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  project: ProjectProfile | null
  notes: string
  onNotesChange: (value: string) => void
  onClose: () => void
  onStatusChange: (id: string, status: ProjectStatus) => void
  onSaveNotes: (id: string, notes: string) => void
  onEdit: () => void
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

export default function ProjectProfileDrawer({
  project,
  notes,
  onNotesChange,
  onClose,
  onStatusChange,
  onSaveNotes,
  onEdit,
  onDelete,
}: Props) {
  if (!project) return null

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' }) : '—'

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
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Project Director" value={project.team.projectDirector} />
              <Info label="Program Manager" value={project.team.programManager} />
              <Info label="Team Members" value={project.team.teamMembers} />
              <Info label="Volunteers" value={project.team.volunteers} />
              <Info label="Interns" value={project.team.interns} />
              <Info label="Partners" value={project.team.partners} />
              <Info label="Field Staff" value={project.team.fieldStaff} />
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

          {project.tasks.length ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Task Management</h3>
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
                    {project.tasks.map((t) => (
                      <tr key={t.name} className="border-b border-[#E5E7EB]/60">
                        <td className="px-3 py-2 font-medium">{t.name}</td>
                        <td className="px-3 py-2">{t.owner}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(t.dueDate)}</td>
                        <td className="px-3 py-2 capitalize">{t.status.replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

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
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Reporting Engine</h3>
            <div className="flex flex-wrap gap-2">
              {REPORT_TYPES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={adminBtnSecondary}
                  onClick={() => window.alert(`${r} generation coming soon.`)}
                >
                  <FileText size={13} className="mr-1" />
                  {r}
                </button>
              ))}
            </div>
          </section>

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
