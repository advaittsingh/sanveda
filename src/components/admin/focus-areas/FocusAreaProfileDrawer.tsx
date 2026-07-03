import { ExternalLink, Pencil, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { FocusAreaProfile } from '../../../lib/focusAreaOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  area: FocusAreaProfile | null
  onClose: () => void
  onEdit: () => void
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

export default function FocusAreaProfileDrawer({ area, onClose, onEdit }: Props) {
  if (!area) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close focus area" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="relative h-36 overflow-hidden">
          <img src={area.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C6B]/90 via-[#0B2C6B]/40 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-xl font-semibold text-white">{area.name}</h2>
            <p className="text-sm text-white/80">{area.slug}</p>
          </div>
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-lg bg-black/30 p-2 text-white hover:bg-black/50">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-5 py-3">
          <StatusBadge status={area.status} />
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-violet-700">
            {area.priority} priority
          </span>
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
            {area.progressPct}% progress
          </span>
          <div className="ml-auto flex gap-2">
            <button type="button" className={adminBtnSecondary} onClick={onEdit}>
              <Pencil size={14} className="mr-1" />
              Edit
            </button>
            <Link to={area.publicUrl} className={adminBtnPrimary} target="_blank" rel="noreferrer">
              <ExternalLink size={14} className="mr-1" />
              Public Page
            </Link>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <Section title="Basic Information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Name" value={area.name} />
              <Info label="Slug" value={area.slug} />
              <Info label="Priority Level" value={area.priority} />
              <Info label="Status" value={area.status} />
            </div>
            <div className="mt-3 space-y-2">
              <Info label="Description" value={area.description} />
              <Info label="Mission" value={area.mission} />
              <Info label="Objectives" value={area.objectives} />
            </div>
          </Section>

          <Section title="Statistics">
            <div className="grid gap-3 rounded-xl border border-[#E5E7EB] bg-slate-50 p-4 sm:grid-cols-2">
              <Info label="Projects" value={area.projectCount} />
              <Info label="Campaigns" value={area.campaignCount} />
              <Info label="Beneficiaries" value={area.beneficiaryCount.toLocaleString('en-IN')} />
              <Info label="Volunteers" value={area.volunteerCount.toLocaleString('en-IN')} />
              <Info label="Donors" value={area.donorCount.toLocaleString('en-IN')} />
              <Info label="Funds Raised" value={`₹${formatIndianCompact(area.fundsRaised)}`} />
              <Info label="Funds Utilized" value={`₹${formatIndianCompact(area.fundsUtilized)}`} />
            </div>
          </Section>

          <Section title="Project Mapping">
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Project</th>
                    <th className="px-4 py-2">Budget</th>
                    <th className="px-4 py-2">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {area.projects.map((p) => (
                    <tr key={p.id} className="border-t border-[#E5E7EB]">
                      <td className="px-4 py-2 font-medium text-slate-800">{p.title}</td>
                      <td className="px-4 py-2 text-slate-600">₹{formatIndianCompact(p.budget)}</td>
                      <td className="px-4 py-2 text-slate-600">{p.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Campaign Mapping">
            <ul className="space-y-2 rounded-xl border border-[#E5E7EB] p-4">
              {area.campaigns.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-[#0E4FA8]">├──</span>
                  {c.title}
                  <span className="ml-auto text-xs text-slate-500">₹{formatIndianCompact(c.raised)}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Beneficiary Mapping">
            <div className="grid gap-3 sm:grid-cols-2">
              {area.beneficiarySegments.map((s) => (
                <div key={s.label} className="rounded-xl border border-[#E5E7EB] px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">{s.label}</p>
                  <p className="mt-1 text-lg font-semibold text-[#0B2C6B]">{s.count.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Volunteer Mapping">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              {area.name} Volunteers — Total: {area.volunteerCount}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {area.volunteerSegments.map((s) => (
                <Info key={s.label} label={s.label} value={s.count} />
              ))}
            </div>
          </Section>

          <section className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Financial Dashboard</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Allocated Budget" value={`₹${formatIndianCompact(area.budgetAllocated)}`} />
              <Info label="Received" value={`₹${formatIndianCompact(area.fundsRaised)}`} />
              <Info label="Utilized" value={`₹${formatIndianCompact(area.fundsUtilized)}`} />
              <Info label="Remaining" value={`₹${formatIndianCompact(area.fundsRemaining)}`} />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                <span>{area.utilizationPct}% Utilized</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#0E4FA8]"
                  style={{ width: `${Math.min(area.utilizationPct, 100)}%` }}
                />
              </div>
            </div>
          </section>

          <Section title="Impact Metrics">
            <div className="grid gap-3 sm:grid-cols-2">
              {area.impactMetrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-[#E5E7EB] px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">{m.label}</p>
                  <p className="mt-1 text-lg font-semibold text-[#0B2C6B]">{m.value.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Geographic Coverage">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="States Covered" value={area.geographic.states} />
              <Info label="Districts" value={area.geographic.districts} />
              <Info label="Villages" value={area.geographic.villages} />
              <Info label="Cities" value={area.geographic.cities} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Map visualization coming soon.</p>
          </Section>

          <Section title="Success Stories">
            {area.successStories.map((story, i) => (
              <blockquote key={i} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <p className="text-sm font-semibold text-[#0B2C6B]">{story.title}</p>
                <p className="mt-1 text-xs text-slate-500">{story.beneficiary} · {story.project}</p>
                <p className="mt-2 text-sm italic text-slate-600">&ldquo;{story.quote}&rdquo;</p>
                <p className="mt-2 text-xs font-semibold text-emerald-700">Impact Score: {story.impactScore}/100</p>
              </blockquote>
            ))}
          </Section>

          <Section title="Document Repository">
            <ul className="space-y-2">
              {area.documents.map((doc) => (
                <li key={doc.name} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
                  <span className="text-slate-700">{doc.name}</span>
                  <span className={`text-xs font-semibold ${doc.uploaded ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {doc.uploaded ? 'Uploaded' : 'Pending'}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </aside>
    </div>
  )
}
