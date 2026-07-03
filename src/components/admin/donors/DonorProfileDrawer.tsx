import { Download, Mail, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { DonorProfile } from '../../../lib/donorOperationsService'
import { formatDonorType, formatGivingLevel } from '../../../lib/donorOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  donor: DonorProfile | null
  onClose: () => void
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

export default function DonorProfileDrawer({ donor, onClose }: Props) {
  if (!donor) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close donor profile" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{donor.name}</h2>
            <p className="text-sm text-slate-500">
              {formatDonorType(donor.type)} · {formatGivingLevel(donor.givingLevel)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={donor.engagement} />
            {donor.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#0B2C6B]/8 px-2.5 py-0.5 text-xs font-semibold text-[#0B2C6B]">
                #{tag}
              </span>
            ))}
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Basic Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Name" value={donor.name} />
              <Info label="Email" value={donor.email} />
              <Info label="Phone" value={donor.phone} />
              <Info label="Address" value={donor.address} />
              <Info label="PAN" value={donor.pan} />
              <Info label="Aadhaar" value={donor.aadhaar} />
              <Info label="Date Joined" value={new Date(donor.dateJoined).toLocaleDateString('en-IN')} />
              <Info label="Status" value={<StatusBadge status={donor.engagement} />} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Engagement Metrics</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Lifetime Value" value={`₹${donor.lifetimeGiving.toLocaleString('en-IN')}`} />
              <Info label="Average Donation" value={`₹${donor.averageDonation.toLocaleString('en-IN')}`} />
              <Info
                label="Donation Frequency"
                value={donor.donationFrequencyDays ? `Every ${donor.donationFrequencyDays} days` : '—'}
              />
              <Info label="Retention Score" value={`${donor.retentionScore}%`} />
              <Info label="Engagement Score" value={donor.engagementScore} />
              <Info label="Total Donations" value={donor.donationCount} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Donation History</h3>
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Campaign</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Mode</th>
                    <th className="px-3 py-2">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {donor.donations.map((d) => (
                    <tr key={d.id} className="border-b border-[#E5E7EB]/80 last:border-0">
                      <td className="px-3 py-2">{new Date(d.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-3 py-2">{d.campaign}</td>
                      <td className="px-3 py-2">₹{d.amount.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2">{d.mode}</td>
                      <td className="px-3 py-2">
                        {d.receiptNumber ? (
                          <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E4FA8]">
                            <Download size={12} />
                            Download
                          </button>
                        ) : (
                          'Pending'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Communication Timeline</h3>
            <ul className="space-y-2">
              {donor.timeline.map((event) => (
                <li key={event.id} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>
                    {event.label}
                    <span className="ml-2 text-xs text-slate-400">
                      {new Date(event.at).toLocaleDateString('en-IN')}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Automated Receipts</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnSecondary}>Generate 80G Receipt</button>
              <button type="button" className={adminBtnSecondary}>Generate CSR Receipt</button>
              <button type="button" className={adminBtnSecondary}>
                <Mail size={14} className="mr-1.5" />
                Email Receipt
              </button>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Anniversary Automation</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {['Donor Birthday', 'Donation Anniversary', 'Membership Renewal', 'Monthly Giving Reminder'].map(
                (item) => (
                  <li key={item} className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm text-slate-600">
                    {item}
                  </li>
                ),
              )}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Follow-up Tasks</h3>
            <ul className="space-y-2">
              {donor.followUpTasks.map((task) => (
                <li key={task} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
                  <span>{task}</span>
                  <button type="button" className={`${adminBtnPrimary} !px-3 !py-1.5 text-xs`}>
                    Schedule
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  )
}
