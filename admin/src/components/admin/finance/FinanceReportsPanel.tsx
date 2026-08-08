import AdminCard from '../ui/AdminCard'
import { REPORT_TYPES } from '../../../lib/financeOperationsService'
import { adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  title?: string
}

export default function FinanceReportsPanel({ title = 'NGO Financial Reports' }: Props) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">Generate compliance and management reports for auditors, CSR partners, and leadership.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REPORT_TYPES.map((r) => (
          <button key={r} type="button" className={`${adminBtnSecondary} justify-center`} onClick={() => window.alert(`Generate ${r} — connects to report engine.`)}>
            {r}
          </button>
        ))}
      </div>
    </AdminCard>
  )
}
