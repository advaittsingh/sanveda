import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  open: boolean
  onClose: () => void
  onGenerate: (prompt: string) => void
}

const OUTPUTS = ['Heading', 'Content', 'CTA', 'SEO', 'Images'] as const

export default function CmsAiAssistantModal({ open, onClose, onGenerate }: Props) {
  const [prompt, setPrompt] = useState('Create a section for healthcare fundraising.')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0B2C6B]">
              <Sparkles size={20} className="text-violet-600" /> AI Website Assistant
            </h2>
            <p className="text-sm text-slate-500">Generate homepage sections, copy, and SEO without code</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div>
          <label className={adminLabelClass}>Prompt</label>
          <textarea className={`${adminInputClass} min-h-[100px] resize-y`} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className={adminLabelClass}>Output</label>
          <div className="flex flex-wrap gap-2">
            {OUTPUTS.map((f) => (
              <span key={f} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">✓ {f}</span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
          <button type="button" className={adminBtnPrimary} onClick={() => { onGenerate(prompt); onClose() }}>Generate Section</button>
        </div>
      </div>
    </div>
  )
}
