import AdminCard from '../ui/AdminCard'

const ITEMS = [
  { label: 'Registration', status: 'Active', ok: true },
  { label: '80G', status: 'Valid', ok: true },
  { label: '12A', status: 'Valid', ok: true },
  { label: 'CSR', status: 'Renewal due in 32 days', ok: false },
]

export default function NgoStatusWidget() {
  return (
    <AdminCard>
      <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">NGO Compliance Status</h3>
      <ul className="space-y-2">
        {ITEMS.map((item) => (
          <li key={item.label} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm">
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className={item.ok ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>
              {item.ok ? '✅' : '⚠'} {item.status}
            </span>
          </li>
        ))}
      </ul>
    </AdminCard>
  )
}
