import { Folder } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import type { DocumentDashboardData } from '../../../lib/documentOperationsService'

interface Props {
  folders: DocumentDashboardData['folderStructure']
  activeFolder: string
  onSelectFolder: (folder: string) => void
}

export default function DocumentFolderTree({ folders, activeFolder, onSelectFolder }: Props) {
  return (
    <AdminCard>
      <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Folder Structure</h3>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onClick={() => onSelectFolder('all')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              activeFolder === 'all' ? 'bg-[#0B2C6B]/10 font-semibold text-[#0B2C6B]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Folder size={14} />
            All Documents
          </button>
        </li>
        {folders.map((f) => (
          <li key={f.folder}>
            <button
              type="button"
              onClick={() => onSelectFolder(f.folder)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                activeFolder === f.folder ? 'bg-[#0B2C6B]/10 font-semibold text-[#0B2C6B]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-[#0E4FA8]">├──</span>
                {f.label}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                {f.count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </AdminCard>
  )
}
