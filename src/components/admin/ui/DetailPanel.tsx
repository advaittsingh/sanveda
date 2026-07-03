import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function DetailPanel({ open, onClose, title, children }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end lg:static lg:inset-auto lg:z-auto">
      <button type="button" className="absolute inset-0 bg-black/30 lg:hidden" onClick={onClose} aria-label="Close panel" />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-[#E5E7EB] bg-white shadow-xl lg:max-w-sm lg:shadow-none">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  )
}
