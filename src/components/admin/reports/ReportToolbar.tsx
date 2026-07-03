import { Calendar, Download, LayoutTemplate, Plus, Sparkles } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  onCreateReport: () => void
  onScheduleReport: () => void
  onTemplates: () => void
  onExport: () => void
  onAiGenerator: () => void
  search: string
  onSearchChange: (v: string) => void
}

export default function ReportToolbar({
  onCreateReport, onScheduleReport, onTemplates, onExport, onAiGenerator,
  search, onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={adminBtnPrimary} onClick={onCreateReport}>
          <Plus size={15} className="mr-1.5" />Create Report
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onScheduleReport}>
          <Calendar size={15} className="mr-1.5" />Schedule Report
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onTemplates}>
          <LayoutTemplate size={15} className="mr-1.5" />Templates
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onExport}>
          <Download size={15} className="mr-1.5" />Export
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onAiGenerator}>
          <Sparkles size={15} className="mr-1.5" />AI Generator
        </button>
      </div>
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search reports…"
        className="min-w-[200px] rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none lg:min-w-[280px]"
      />
    </div>
  )
}
