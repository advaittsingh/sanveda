import { Download, Mail, MessageCircle, Printer, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { VolunteerProfile } from '../../../lib/volunteerOperationsService'
import { downloadAppointmentLetter, downloadVolunteerIdCard } from '../../../lib/documentService'
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
}: Props) {
  if (!volunteer) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close volunteer profile" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
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
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Assignment History</h3>
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
                  {volunteer.assignments.map((a) => (
                    <tr key={`${a.project}-${a.start}`} className="border-b border-[#E5E7EB]/80 last:border-0">
                      <td className="px-3 py-2">{a.project}</td>
                      <td className="px-3 py-2">{a.role}</td>
                      <td className="px-3 py-2">{a.start}</td>
                      <td className="px-3 py-2">{a.end}</td>
                      <td className="px-3 py-2 capitalize">{a.status}</td>
                    </tr>
                  ))}
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
                  <button type="button" className={adminBtnSecondary} onClick={() => downloadVolunteerIdCard(volunteer)}>
                    <Download size={14} className="mr-1.5" />
                    Download ID Card
                  </button>
                  <button type="button" className={adminBtnSecondary} onClick={() => window.print()}>
                    <Printer size={14} className="mr-1.5" />
                    Print ID Card
                  </button>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    onClick={() =>
                      downloadAppointmentLetter({
                        recipientName: volunteer.fullName,
                        role: volunteer.primaryRole,
                        department: volunteer.department,
                        startDate: new Date().toLocaleDateString('en-IN'),
                        type: 'volunteer',
                        referenceId: volunteer.volunteerId ?? volunteer.id,
                      })
                    }
                  >
                    Appointment Letter
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500">Approve volunteer to generate ID card.</p>
              )}
            </div>
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
