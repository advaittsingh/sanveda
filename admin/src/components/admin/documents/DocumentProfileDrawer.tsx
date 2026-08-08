import { Download, ExternalLink, Pencil, QrCode, Shield, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { POLICY_TYPES, REPORT_TYPES, type DocumentProfile } from '../../../lib/documentOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  document: DocumentProfile | null
  onClose: () => void
  onEdit: () => void
  onDownload: () => void
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

const WORKFLOW_STEPS = ['draft', 'under_review', 'approved', 'published', 'archived'] as const

export default function DocumentProfileDrawer({ document: doc, onClose, onEdit, onDownload }: Props) {
  if (!doc) return null

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' })

  const currentStep = WORKFLOW_STEPS.indexOf(doc.status as typeof WORKFLOW_STEPS[number])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close document" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{doc.title}</h2>
            <p className="text-sm text-slate-500">{doc.documentId} · {doc.categoryLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-5 py-3">
          <StatusBadge status={doc.status} />
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-sky-700">
            {doc.visibility}
          </span>
          {doc.isCompliance ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <Shield size={10} />
              Compliance
            </span>
          ) : null}
          <div className="ml-auto flex gap-2">
            <button type="button" className={adminBtnSecondary} onClick={onDownload}>
              <Download size={14} className="mr-1" />
              Download
            </button>
            <button type="button" className={adminBtnSecondary} onClick={onEdit}>
              <Pencil size={14} className="mr-1" />
              Edit
            </button>
            {doc.publicUrl ? (
              <Link to={doc.publicUrl} className={adminBtnPrimary} target="_blank" rel="noreferrer">
                <ExternalLink size={14} className="mr-1" />
                Public Page
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <Section title="Document Metadata">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Document ID" value={doc.documentId} />
              <Info label="Title" value={doc.title} />
              <Info label="Category" value={doc.categoryLabel} />
              <Info label="Folder" value={doc.folderLabel} />
              <Info label="Owner" value={doc.owner} />
              <Info label="Version" value={doc.version} />
              <Info label="Issue Date" value={formatDate(doc.issueDate)} />
              <Info label="Expiry Date" value={doc.validUntilLabel} />
              <Info label="Visibility" value={doc.visibility} />
              <Info label="Status" value={doc.status.replace(/_/g, ' ')} />
            </div>
            {doc.description ? (
              <p className="mt-3 text-sm text-slate-600">{doc.description}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-1">
              {doc.tags.map((t) => (
                <span key={t} className="rounded-full border border-[#E5E7EB] bg-white px-2 py-0.5 text-xs text-slate-600">{t}</span>
              ))}
            </div>
          </Section>

          <Section title="Statistics">
            <div className="grid gap-3 rounded-xl border border-[#E5E7EB] bg-slate-50 p-4 sm:grid-cols-3">
              <Info label="Downloads" value={doc.downloads.toLocaleString('en-IN')} />
              <Info label="Views" value={doc.views.toLocaleString('en-IN')} />
              <Info label="Shares" value={doc.shares.toLocaleString('en-IN')} />
              <Info label="Storage" value={`${doc.fileSizeMb} MB`} />
            </div>
          </Section>

          <Section title="Approval Workflow">
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    i <= currentStep ? 'bg-[#0B2C6B] text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.replace(/_/g, ' ')}
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 ? <span className="mx-1 text-slate-300">→</span> : null}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Version Control">
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Version</th>
                    <th className="px-4 py-2">Author</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.versions.map((v) => (
                    <tr key={v.version} className="border-t border-[#E5E7EB]">
                      <td className="px-4 py-2 font-medium">{v.version}</td>
                      <td className="px-4 py-2 text-slate-600">{v.author}</td>
                      <td className="px-4 py-2 text-slate-600">{formatDate(v.date)}</td>
                      <td className="px-4 py-2"><StatusBadge status={v.approvalStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {doc.versions[0]?.changeLog ? (
              <p className="mt-2 text-xs text-slate-500">Latest: {doc.versions[doc.versions.length - 1].changeLog}</p>
            ) : null}
          </Section>

          {(doc.project || doc.campaign || doc.event || doc.focusArea) ? (
            <Section title="Cross-Module Mapping">
              <div className="grid gap-3 sm:grid-cols-2">
                {doc.project ? <Info label="Project" value={doc.project} /> : null}
                {doc.campaign ? <Info label="Campaign" value={doc.campaign} /> : null}
                {doc.event ? <Info label="Event" value={doc.event} /> : null}
                {doc.focusArea ? <Info label="Focus Area" value={doc.focusArea} /> : null}
              </div>
            </Section>
          ) : null}

          {doc.projectFiles?.length ? (
            <Section title="Project Document Mapping">
              <ul className="space-y-1 rounded-xl border border-[#E5E7EB] p-3">
                <li className="text-sm font-semibold text-[#0B2C6B]">{doc.project}</li>
                {doc.projectFiles.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-[#0E4FA8]">├──</span> {f}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title="Digital Signature Support">
            <div className="flex flex-wrap gap-2">
              {['PDF Signing', 'Director Signature', 'Certificate Signing', 'QR Verification', 'Timestamping'].map((label) => (
                <span key={label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {label === 'QR Verification' ? <QrCode size={10} /> : null}
                  {label}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Report Generator">
            <div className="flex flex-wrap gap-2">
              {REPORT_TYPES.map((r) => (
                <button key={r} type="button" className={adminBtnSecondary}>{r}</button>
              ))}
            </div>
          </Section>

          {doc.category === 'policy' ? (
            <Section title="Policy Management">
              <div className="flex flex-wrap gap-2">
                {POLICY_TYPES.map((p) => (
                  <span key={p} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{p}</span>
                ))}
              </div>
            </Section>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
