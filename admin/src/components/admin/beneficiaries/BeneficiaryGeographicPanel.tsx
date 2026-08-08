import { MapPin } from 'lucide-react'
import AdminCard from '../ui/AdminCard'

interface Props {
  geographic: { city: string; count: number }[]
  supportDistribution: { type: string; quantity: number; value: number }[]
}

export default function BeneficiaryGeographicPanel({ geographic, supportDistribution }: Props) {
  const maxCount = Math.max(...geographic.map((g) => g.count), 1)

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <AdminCard>
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-[#0B2C6B]" />
          <div>
            <h3 className="text-base font-semibold text-[#0B2C6B]">Geographic Distribution</h3>
            <p className="text-sm text-slate-500">Beneficiaries by city</p>
          </div>
        </div>
        {geographic.length ? (
          <ul className="space-y-3">
            {geographic.map((g) => (
              <li key={g.city}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{g.city}</span>
                  <span className="font-semibold text-[#0B2C6B]">{g.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#0E4FA8]"
                    style={{ width: `${(g.count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No location data yet.</p>
        )}
      </AdminCard>

      <AdminCard>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#0B2C6B]">Support Distribution Tracking</h3>
          <p className="text-sm text-slate-500">Quantity and value by support type</p>
        </div>
        {supportDistribution.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Quantity</th>
                  <th className="pb-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {supportDistribution.map((s) => (
                  <tr key={s.type} className="border-b border-[#E5E7EB]/60">
                    <td className="py-2.5 font-medium text-slate-700">{s.type}</td>
                    <td className="py-2.5 text-slate-600">{s.quantity}</td>
                    <td className="py-2.5 font-semibold text-[#0B2C6B]">₹{s.value.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No support records yet.</p>
        )}
      </AdminCard>
    </div>
  )
}
