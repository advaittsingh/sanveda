import { Download, Eye, FileText } from 'lucide-react'
import type { DocumentProfile } from '../../../lib/documentOperationsService'
import { adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  documents: DocumentProfile[]
  onView: (doc: DocumentProfile) => void
  onDownload: (doc: DocumentProfile) => void
}

export default function DocumentCardGrid({ documents, onView, onDownload }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {documents.map((doc) => (
        <article
          key={doc.id}
          className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:border-[#0B2C6B]/20 hover:shadow-md"
        >
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2C6B]/10 text-[#0B2C6B]">
              <FileText size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-[#0B2C6B]">{doc.title}</h3>
              <p className="text-xs text-slate-500">{doc.documentId}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <p><span className="font-semibold text-slate-700">Category:</span> {doc.categoryLabel}</p>
            <p><span className="font-semibold text-slate-700">Folder:</span> {doc.folderLabel}</p>
            <p><span className="font-semibold text-slate-700">Valid Until:</span> {doc.validUntilLabel}</p>
            {doc.visibility === 'public' ? (
              <p><span className="font-semibold text-slate-700">Published:</span> Yes</p>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge status={doc.status} />
            {doc.isExpiringSoon ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Expiring Soon
              </span>
            ) : null}
            {doc.isCompliance ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Compliance
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex gap-2">
            <button type="button" className={`${adminBtnSecondary} flex-1 justify-center text-xs`} onClick={() => onView(doc)}>
              <Eye size={13} className="mr-1" />
              View
            </button>
            <button type="button" className={`${adminBtnSecondary} flex-1 justify-center text-xs`} onClick={() => onDownload(doc)}>
              <Download size={13} className="mr-1" />
              Download
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
