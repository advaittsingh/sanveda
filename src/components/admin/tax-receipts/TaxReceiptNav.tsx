import { TAX_RECEIPT_TABS, type TaxReceiptTab } from '../../../lib/taxReceiptOperationsService'

interface Props {
  active: TaxReceiptTab
  onChange: (tab: TaxReceiptTab) => void
}

export default function TaxReceiptNav({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-4">
      {TAX_RECEIPT_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            active === tab.value
              ? 'bg-[#0B2C6B] text-white'
              : 'border border-[#E5E7EB] bg-white text-slate-600 hover:bg-[#F8FAFC]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
