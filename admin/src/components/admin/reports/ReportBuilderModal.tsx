import { useState } from 'react'
import { X } from 'lucide-react'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'
import type { ReportFormat } from '../../../lib/reportOperationsService'

interface Props {
  open: boolean
  onClose: () => void
  onGenerate: (name: string, format: ReportFormat) => void
}

const INCLUDE_OPTIONS = ['Donations', 'Beneficiaries', 'Expenses', 'Volunteers', 'Projects'] as const
const FORMATS: { value: ReportFormat; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
  { value: 'dashboard', label: 'Dashboard' },
]

export default function ReportBuilderModal({ open, onClose, onGenerate }: Props) {
  const [name, setName] = useState('Healthcare Impact Report')
  const [dateRange, setDateRange] = useState('Jan 2026 - Dec 2026')
  const [includes, setIncludes] = useState<string[]>([...INCLUDE_OPTIONS])
  const [format, setFormat] = useState<ReportFormat>('pdf')

  if (!open) return null

  const toggleInclude = (item: string) => {
    setIncludes((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">Custom Report Builder</h2>
            <p className="text-sm text-slate-500">Configure and generate a custom NGO report</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={adminLabelClass}>Report Name</label>
            <input className={adminInputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={adminLabelClass}>Date Range</label>
            <input className={adminInputClass} value={dateRange} onChange={(e) => setDateRange(e.target.value)} />
          </div>
          <div>
            <label className={adminLabelClass}>Include</label>
            <div className="space-y-2">
              {INCLUDE_OPTIONS.map((item) => (
                <label key={item} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={includes.includes(item)}
                    onChange={() => toggleInclude(item)}
                    className="rounded border-[#E5E7EB]"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={adminLabelClass}>Format</label>
            <div className="flex flex-wrap gap-3">
              {FORMATS.map((f) => (
                <label key={f.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="format"
                    checked={format === f.value}
                    onChange={() => setFormat(f.value)}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
          <button type="button" className={adminBtnPrimary} onClick={() => { onGenerate(name, format); onClose() }}>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}
