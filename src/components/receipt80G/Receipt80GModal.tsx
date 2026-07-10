import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Receipt80GData } from '../../lib/receipt80G/types'
import Receipt80GView from './Receipt80GView'
import Receipt80GActions from './Receipt80GActions'

interface Props {
  data: Receipt80GData | null
  onClose: () => void
  onRegenerate?: () => Promise<Receipt80GData | null>
}

export default function Receipt80GModal({ data, onClose, onRegenerate }: Props) {
  const [current, setCurrent] = useState<Receipt80GData | null>(data)

  useEffect(() => {
    setCurrent(data)
  }, [data])

  if (!current) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close receipt preview" />
      <div className="relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">80G Receipt Preview</h2>
            <p className="text-sm text-slate-500">{current.receiptNumber}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4">
          <Receipt80GView data={current} />
        </div>
        <div className="border-t border-[#E5E7EB] bg-white px-5 py-4">
          <Receipt80GActions
            data={current}
            onRegenerate={onRegenerate ? async () => {
              const next = await onRegenerate()
              if (next) setCurrent(next)
            } : undefined}
          />
        </div>
      </div>
    </div>
  )
}
