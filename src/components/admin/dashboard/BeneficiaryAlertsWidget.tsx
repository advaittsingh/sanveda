import { Link } from 'react-router-dom'
import AdminCard from '../ui/AdminCard'
import { formatIndianCompact } from '../../../lib/formatIndian'

interface Alert {
  id: string
  title: string
  amount: number
  program?: string
}

export default function BeneficiaryAlertsWidget({ alerts }: { alerts: Alert[] }) {
  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0B2C6B]">Urgent Beneficiary Cases</h3>
        <Link to="/admin/beneficiaries" className="text-xs font-medium text-[#0E4FA8] hover:underline">View all</Link>
      </div>
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-500">No urgent beneficiary cases.</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li key={a.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-sm font-medium text-slate-800">⚠ {a.title}</p>
              <p className="text-xs text-slate-600">{a.program}</p>
              <p className="mt-1 text-sm font-semibold text-amber-800">{formatIndianCompact(a.amount)} pending</p>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  )
}
