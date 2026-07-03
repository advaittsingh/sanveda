import { REPORT_CATEGORIES, type ReportCategory } from '../../../lib/reportOperationsService'

interface Props {
  active: ReportCategory | 'all'
  onChange: (cat: ReportCategory | 'all') => void
}

export default function ReportCategoryNav({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
          active === 'all' ? 'bg-[#0B2C6B] text-white' : 'border border-[#E5E7EB] bg-white text-slate-600 hover:bg-[#F8FAFC]'
        }`}
      >
        All Reports
      </button>
      {REPORT_CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onChange(cat.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            active === cat.value ? 'bg-[#0B2C6B] text-white' : 'border border-[#E5E7EB] bg-white text-slate-600 hover:bg-[#F8FAFC]'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
