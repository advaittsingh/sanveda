import AdminCard from '../ui/AdminCard'
import type { EnquiryDashboardData } from '../../../lib/enquiryOperationsService'

interface Props {
  kpis: EnquiryDashboardData['kpis']
}

export default function EnquirySlaPanel({ kpis }: Props) {
  return (
    <AdminCard>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#0B2C6B]">SLA Tracking</h3>
          <p className="text-sm text-slate-500">Response time compliance by category</p>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{kpis.slaCompliancePct}%</p>
            <p className="text-xs font-semibold text-slate-500">SLA Compliance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{kpis.overdueCount}</p>
            <p className="text-xs font-semibold text-slate-500">Overdue Tickets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#0B2C6B]">{kpis.avgResponseTimeHours} hrs</p>
            <p className="text-xs font-semibold text-slate-500">Avg Response</p>
          </div>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="pb-2">Category</th>
              <th className="pb-2">SLA Target</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            <tr className="border-t border-[#E5E7EB]"><td className="py-2">Donation</td><td>2 hrs</td></tr>
            <tr className="border-t border-[#E5E7EB]"><td className="py-2">Volunteer</td><td>24 hrs</td></tr>
            <tr className="border-t border-[#E5E7EB]"><td className="py-2">CSR</td><td>4 hrs</td></tr>
            <tr className="border-t border-[#E5E7EB]"><td className="py-2">Complaint</td><td>12 hrs</td></tr>
          </tbody>
        </table>
      </div>
    </AdminCard>
  )
}
