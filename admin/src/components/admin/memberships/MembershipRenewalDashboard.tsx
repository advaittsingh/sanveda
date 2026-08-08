import AdminCard from '../ui/AdminCard'
import type { RenewalSummary } from '../../../lib/membershipOperationsService'

interface Props {
  renewals: RenewalSummary
}

export default function MembershipRenewalDashboard({ renewals }: Props) {
  return (
    <AdminCard>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#0B2C6B]">Renewal Management</h3>
        <p className="text-sm text-slate-500">Automated renewal tracking and reminders</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Due This Month</p>
          <p className="mt-1 text-3xl font-bold text-amber-800">{renewals.dueThisMonth}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Overdue</p>
          <p className="mt-1 text-3xl font-bold text-red-800">{renewals.overdue}</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Upcoming (90 days)</p>
          <p className="mt-1 text-3xl font-bold text-sky-800">{renewals.upcoming}</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-600">
        <li className="rounded-lg bg-[#F8FAFC] px-3 py-2">30 days reminder</li>
        <li className="rounded-lg bg-[#F8FAFC] px-3 py-2">7 days reminder</li>
        <li className="rounded-lg bg-[#F8FAFC] px-3 py-2">Expiry notice</li>
        <li className="rounded-lg bg-[#F8FAFC] px-3 py-2">Renewal confirmation</li>
      </ul>
    </AdminCard>
  )
}
