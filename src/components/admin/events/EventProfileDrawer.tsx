import { FileText, Pencil, Printer, QrCode, Trash2, X } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  CERTIFICATE_TYPES,
  PARTICIPANT_TYPE_LABELS,
  type EventProfile,
} from '../../../lib/eventOperationsService'
import { downloadEventParticipationCertificate, downloadEventPass } from '../../../lib/documentService'
import type { EventStatus } from '../../../lib/eventService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  event: EventProfile | null
  notes: string
  onNotesChange: (value: string) => void
  onClose: () => void
  onStatusChange: (id: string, status: EventStatus) => void
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

export default function EventProfileDrawer({
  event,
  notes,
  onNotesChange,
  onClose,
  onStatusChange,
  onSaveNotes,
  onEdit,
  onDelete,
}: Props) {
  if (!event) return null

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close event" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{event.title}</h2>
            <p className="text-sm text-slate-500">{event.eventCode} · {event.category}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={event.status} />
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{event.displayStatus}</span>
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">{event.fundsRaisedLabel} raised</span>
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Basic Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Event ID" value={event.eventCode} />
              <Info label="Organizer" value={event.organizer} />
              <Info label="Start Date" value={formatDate(event.eventDate)} />
              <Info label="End Date" value={formatDate(event.endDate)} />
              <Info label="Venue" value={event.location ?? '—'} />
              <Info label="Lifecycle" value={event.lifecycleStage.replace(/_/g, ' ')} />
            </div>
            {event.description ? <p className="mt-3 text-sm text-slate-600">{event.description}</p> : null}
          </section>

          <section className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Registration Statistics</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Info label="Capacity" value={event.capacity ?? '—'} />
              <Info label="Registered" value={event.registeredCount} />
              <Info label="Checked In" value={event.checkedIn} />
              <Info label="Waiting List" value={event.waitingList} />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                <span>{event.capacityPct}% Capacity Filled</span>
                <span>{event.cancelled} cancelled</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${Math.min(event.capacityPct, 100)}%` }} />
              </div>
            </div>
          </section>

          {event.registrations.length ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Registration Management</h3>
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Pass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.registrations.slice(0, 10).map((r) => (
                      <tr key={r.id} className="border-b border-[#E5E7EB]/60">
                        <td className="px-3 py-2">
                          <p className="font-medium">{r.fullName}</p>
                          <p className="text-xs text-slate-400">{r.email}</p>
                        </td>
                        <td className="px-3 py-2">{PARTICIPANT_TYPE_LABELS[r.participantType]}</td>
                        <td className="px-3 py-2 capitalize">{r.status.replace(/_/g, ' ')}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="text-xs font-semibold text-[#0E4FA8] hover:underline"
                            onClick={() => downloadEventPass({
                              eventTitle: event.title,
                              attendeeName: r.fullName,
                              registrationId: r.registrationId,
                            })}
                          >
                            <QrCode size={12} className="inline mr-0.5" />
                            QR Pass
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Volunteer Assignment</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {event.volunteerRoles.map((v) => (
                <div key={v.role} className="flex justify-between rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
                  <span>{v.role}</span>
                  <span className="font-semibold text-[#0B2C6B]">{v.count}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">Total assigned: {event.volunteersAssigned}</p>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Project & Campaign Integration</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Project" value={event.projectName} />
              <Info label="Campaign" value={event.campaignName} />
              <Info label="Focus Area" value={event.focusArea} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Fundraising Integration</h3>
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {event.fundraising.map((f) => (
                    <tr key={f.source} className="border-b border-[#E5E7EB]/60">
                      <td className="px-3 py-2">{f.source}</td>
                      <td className="px-3 py-2 font-semibold text-[#0B2C6B]">₹{f.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Sponsor Management</h3>
            <div className="space-y-2">
              {event.sponsors.map((s) => (
                <div key={s.name} className="rounded-lg border border-[#E5E7EB] px-3 py-2">
                  <p className="text-xs font-semibold uppercase text-amber-700">{s.tier} Sponsor</p>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-sm text-slate-500">₹{s.amount.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Budget Management</h3>
            <Info label="Allocated" value={`₹${event.budgetAllocated.toLocaleString('en-IN')}`} />
            <div className="mt-3 overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <tbody>
                  {event.budgetLines.map((b) => (
                    <tr key={b.category} className="border-b border-[#E5E7EB]/60">
                      <td className="px-3 py-2">{b.category}</td>
                      <td className="px-3 py-2 text-right font-semibold text-[#0B2C6B]">₹{b.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Agenda & Sessions</h3>
            <div className="space-y-2">
              {event.agenda.map((a) => (
                <div key={a.time} className="flex gap-3 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
                  <span className="font-semibold text-[#0B2C6B]">{a.time}</span>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Impact Metrics</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {event.impactMetrics.map((m) => (
                <div key={m.label} className="rounded-lg border border-[#E5E7EB] px-3 py-2">
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="text-lg font-bold text-[#0B2C6B]">{m.value.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Feedback System</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {event.feedback.map((f) => (
                <div key={f.label} className="flex justify-between rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
                  <span>{f.label}</span>
                  <span className="font-semibold text-[#0B2C6B]">{f.score}/5</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Media Gallery</h3>
            <div className="flex flex-wrap gap-2">
              {event.media.map((m) => (
                <span key={m.label} className={`rounded-full px-3 py-1 text-xs font-semibold ${m.available ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-500'}`}>
                  {m.available ? '✓' : '○'} {m.label}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Certificates</h3>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATE_TYPES.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  className={adminBtnSecondary}
                  onClick={() => {
                    const attendee = event.registrations[0]
                    if (attendee) {
                      downloadEventParticipationCertificate({
                        attendeeName: attendee.fullName,
                        eventTitle: event.title,
                      })
                    } else {
                      window.alert('No registrations yet. Certificates require at least one attendee.')
                    }
                  }}
                >
                  <FileText size={13} className="mr-1" />
                  {cert}
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
              placeholder="Event notes, logistics, follow-ups…"
            />
          </section>
        </div>

        <div className="space-y-3 border-t border-[#E5E7EB] p-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(event.id, 'draft')}>Draft</button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(event.id, 'published')}>Publish</button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(event.id, 'completed')}>Complete</button>
            <button type="button" className={adminBtnPrimary} onClick={() => onSaveNotes(event.id, notes)}>Save Notes</button>
            <button type="button" className={adminBtnSecondary} onClick={onEdit}><Pencil size={14} className="mr-1" />Edit</button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnSecondary} onClick={() => window.print()}><Printer size={14} className="mr-1" />Print</button>
            <button
              type="button"
              className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              onClick={() => { if (window.confirm(`Delete ${event.title}?`)) onDelete(event.id) }}
            >
              <Trash2 size={14} className="mr-1" />Delete
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
