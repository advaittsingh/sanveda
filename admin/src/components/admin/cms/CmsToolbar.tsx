import { Download, Monitor, Plus, Sparkles, Tablet, Smartphone } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  onNewPage: () => void
  onAiAssistant: () => void
  onExport: () => void
  onPreview: (device: 'desktop' | 'tablet' | 'mobile') => void
  search: string
  onSearchChange: (v: string) => void
}

export default function CmsToolbar({
  onNewPage, onAiAssistant, onExport, onPreview, search, onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={adminBtnPrimary} onClick={onNewPage}>
          <Plus size={15} className="mr-1.5" />New Page
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onAiAssistant}>
          <Sparkles size={15} className="mr-1.5" />AI Assistant
        </button>
        <button type="button" className={adminBtnSecondary} onClick={onExport}>
          <Download size={15} className="mr-1.5" />Export
        </button>
        <button type="button" className={adminBtnSecondary} onClick={() => onPreview('desktop')}>
          <Monitor size={15} className="mr-1.5" />Preview
        </button>
        <button type="button" className={adminBtnSecondary} onClick={() => onPreview('tablet')} title="Tablet preview">
          <Tablet size={15} />
        </button>
        <button type="button" className={adminBtnSecondary} onClick={() => onPreview('mobile')} title="Mobile preview">
          <Smartphone size={15} />
        </button>
      </div>
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search pages, sections…"
        className="min-w-[200px] rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none lg:min-w-[280px]"
      />
    </div>
  )
}
