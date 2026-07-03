import { FINANCE_TABS, type FinanceTab } from '../../../lib/financeOperationsService'

interface Props {
  active: FinanceTab
  onChange: (tab: FinanceTab) => void
}

export default function FinanceNav({ active, onChange }: Props) {
  return (
    <nav className="mb-6 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-1 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-1">
        {FINANCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
              active === tab.id ? 'bg-[#0B2C6B] text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-[#0B2C6B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
