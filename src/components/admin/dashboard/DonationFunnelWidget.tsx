import type { DonationFunnel } from '../../../lib/operationsDashboardService'
import AdminCard from '../ui/AdminCard'

export default function DonationFunnelWidget({ funnel }: { funnel: DonationFunnel }) {
  const steps = [
    { label: 'Visitors', value: funnel.visitors },
    { label: 'Viewed Campaign', value: funnel.viewedCampaign },
    { label: 'Clicked Donate', value: funnel.clickedDonate },
    { label: 'Completed Donation', value: funnel.completed },
  ]

  return (
    <AdminCard>
      <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Donation Funnel</h3>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const width = funnel.visitors > 0 ? Math.max(12, (step.value / funnel.visitors) * 100) : 12
          return (
            <div key={step.label}>
              <div className="mb-1 flex justify-between text-xs text-slate-600">
                <span>{step.label}</span>
                <span className="font-semibold text-[#0B2C6B]">{step.value.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${width}%`, opacity: 1 - i * 0.15 }} />
              </div>
            </div>
          )
        })}
        <p className="pt-2 text-sm font-semibold text-emerald-700">Conversion {funnel.conversion}%</p>
      </div>
    </AdminCard>
  )
}
