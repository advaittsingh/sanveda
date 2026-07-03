import { Download, FileText } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import { adminBtnSecondary } from '../ui/adminStyles'
import type { ReportTemplate } from '../../../lib/reportOperationsService'

interface Props {
  templates: ReportTemplate[]
  onGenerate: (template: ReportTemplate) => void
}

export default function ReportTemplatesGrid({ templates, onGenerate }: Props) {
  if (templates.length === 0) {
    return (
      <AdminCard>
        <p className="text-sm text-slate-500">No templates match this category.</p>
      </AdminCard>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {templates.map((t) => (
        <AdminCard key={t.id}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#0E4FA8]">{t.categoryLabel}</span>
              <h3 className="mt-1 font-semibold text-[#0B2C6B]">{t.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{t.description}</p>
            </div>
            <FileText size={18} className="shrink-0 text-slate-400" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {t.formats.map((f) => (
              <span key={f} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-600">{f}</span>
            ))}
            {t.scheduled ? (
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">Scheduled</span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-slate-400">Last generated: {t.lastGenerated ?? 'Never'}</p>
          <button type="button" className={`${adminBtnSecondary} mt-4 w-full`} onClick={() => onGenerate(t)}>
            <Download size={14} className="mr-1.5 inline" />Generate
          </button>
        </AdminCard>
      ))}
    </div>
  )
}
