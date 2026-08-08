import { useState } from 'react'
import { Download, Mail, MessageCircle, Printer, X } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  BADGE_EMOJI,
  type MemberProfile,
} from '../../../lib/membershipOperationsService'
import { downloadMemberIdCard, printMemberIdCard } from '../../../lib/documentService'
import { downloadMembershipCertificate } from '../../../lib/membershipService'
import type { MembershipStatus } from '../../../lib/membershipService'
import { runDocumentAction } from '../../../lib/runDocumentAction'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  member: MemberProfile | null
  notes: string
  onNotesChange: (value: string) => void
  onClose: () => void
  onStatusChange: (id: string, status: MembershipStatus) => void
  onSaveNotes: (id: string, notes: string) => void
  onSendEmail: (member: MemberProfile) => void
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

export default function MembershipProfileDrawer({
  member,
  notes,
  onNotesChange,
  onClose,
  onStatusChange,
  onSaveNotes,
  onSendEmail,
}: Props) {
  const [docMessage, setDocMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [docBusy, setDocBusy] = useState(false)

  if (!member) return null

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
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close member profile" />
      <aside className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{member.fullName}</h2>
            <p className="text-sm text-slate-500">{member.tierLabel} · {member.memberId ?? 'Pending ID'}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={member.status} />
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-sky-700">
              {member.paymentStatus}
            </span>
            {member.badges.map((badge) => (
              <span key={badge} className="rounded-full border border-[#E5E7EB] px-2.5 py-0.5 text-xs font-semibold text-[#0B2C6B]">
                {BADGE_EMOJI[badge] ?? '🏆'} {badge}
              </span>
            ))}
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Personal Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Name" value={member.fullName} />
              <Info label="Email" value={member.email} />
              <Info label="Phone" value={member.phone} />
              <Info label="Address" value={[member.address, member.city, member.state].filter(Boolean).join(', ') || '—'} />
              <Info label="Occupation" value={member.occupation || '—'} />
              <Info label="Company" value="—" />
              <Info label="PAN" value="—" />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Membership Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Membership ID" value={member.memberId ?? 'Pending'} />
              <Info label="Tier" value={member.tierLabel} />
              <Info label="Joined Date" value={member.joinedLabel} />
              <Info label="Renewal Date" value={member.expiresLabel} />
              <Info label="Status" value={<StatusBadge status={member.status} />} />
              <Info label="Payment Status" value={member.paymentStatus} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Contribution History</h3>
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {member.contributions.map((c) => (
                    <tr key={`${c.date}-${c.type}`} className="border-b border-[#E5E7EB]/80 last:border-0">
                      <td className="px-3 py-2">{new Date(c.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                      <td className="px-3 py-2">{c.type}</td>
                      <td className="px-3 py-2">₹{c.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Participation History</h3>
            <ul className="space-y-2">
              {member.participation.filter((p) => p.attended).map((p) => (
                <li key={p.label} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-emerald-600">✓</span> {p.label}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Community Engagement</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Info label="Events Attended" value={member.engagementMetrics.eventsAttended} />
              <Info label="Volunteer Hours" value={member.engagementMetrics.volunteerHours} />
              <Info label="Donations" value={`₹${member.engagementMetrics.donations.toLocaleString('en-IN')}`} />
              <Info label="Campaigns" value={member.engagementMetrics.campaignParticipation} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Communication Center</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnSecondary} onClick={() => onSendEmail(member)}>
                <Mail size={14} className="mr-1.5" />
                Send Email
              </button>
              <button type="button" className={adminBtnSecondary}>
                <MessageCircle size={14} className="mr-1.5" />
                Send WhatsApp
              </button>
              <button type="button" className={adminBtnSecondary}>Newsletter</button>
              <button type="button" className={adminBtnSecondary}>Event Invite</button>
              <button type="button" className={adminBtnSecondary}>Renewal Notice</button>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Certificates & ID</h3>
            <div className="flex flex-wrap gap-2">
              {(member.status === 'active' || member.status === 'approved') && member.memberId ? (
                <>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    disabled={docBusy}
                    onClick={() => void runDoc('Membership certificate downloaded.', () => downloadMembershipCertificate(member))}
                  >
                    <Download size={14} className="mr-1.5" />
                    Download Certificate
                  </button>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    disabled={docBusy}
                    onClick={() => void runDoc('Member ID card downloaded.', () => downloadMemberIdCard(member))}
                  >
                    Download ID Card
                  </button>
                  <button
                    type="button"
                    className={adminBtnSecondary}
                    disabled={docBusy}
                    onClick={() => void runDoc('Print dialog opened for ID card.', () => printMemberIdCard(member))}
                  >
                    <Printer size={14} className="mr-1.5" />
                    Print ID Card
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500">Approve member to generate certificates.</p>
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

          <section>
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
            <button type="button" className={adminBtnPrimary} onClick={() => onStatusChange(member.id, 'approved')}>
              Approve
            </button>
            <button type="button" className={adminBtnPrimary} onClick={() => onStatusChange(member.id, 'active')}>
              Activate
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => onStatusChange(member.id, 'rejected')}>
              Reject
            </button>
            <button type="button" className={adminBtnSecondary} onClick={() => onSaveNotes(member.id, notes)}>
              Save Notes
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
