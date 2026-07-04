import type { DonationFunnel } from '../../../lib/operationsDashboardService'
import AdminCard from '../ui/AdminCard'
import DonationEmptyState from '../donations/DonationEmptyState'

export default function DonationFunnelWidget({ funnel }: { funnel: DonationFunnel }) {
  const steps = [
    { label: 'Payment Attempts', value: funnel.started },
    { label: 'Pending', value: funnel.pending },
    { label: 'Failed', value: funnel.failed },
    { label: 'Completed', value: funnel.completed },
  ]

  if (funnel.started === 0) {
    return (
      <AdminCard>
        <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Payment Funnel</h3>
        <DonationEmptyState
          title="No payment attempts yet"
          description="Funnel metrics are computed from real donation payment statuses."
        />
      </AdminCard>
    )
  }

  return (
    <AdminCard>
      <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Payment Funnel</h3>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const width = funnel.started > 0 ? Math.max(8, (step.value / funnel.started) * 100) : 0
          return (
            <div key={step.label}>
              <div className="mb-1 flex justify-between text-xs text-slate-600">
                <span>{step.label}</span>
                <span className="font-semibold text-[#0B2C6B]">{step.value.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${width}%`, opacity: 1 - i * 0.12 }} />
              </div>
            </div>
          )
        })}
        <p className="pt-2 text-sm font-semibold text-emerald-700">Success rate {funnel.conversion}%</p>
      </div>
    </AdminCard>
  )
}
