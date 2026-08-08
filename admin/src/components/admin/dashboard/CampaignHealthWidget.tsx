import { Link } from 'react-router-dom'
import type { CampaignHealth } from '../../../lib/operationsDashboardService'
import AdminCard from '../ui/AdminCard'

export default function CampaignHealthWidget({ health }: { health: CampaignHealth }) {
  const rows = [
    { label: 'campaigns performing well', count: health.performing, emoji: '🟢', cls: 'text-emerald-700' },
    { label: 'campaigns below target', count: health.belowTarget, emoji: '🟡', cls: 'text-amber-700' },
    { label: 'campaigns need urgent promotion', count: health.urgent, emoji: '🔴', cls: 'text-red-700' },
  ]

  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0B2C6B]">Campaign Health</h3>
        <Link to="/admin/campaigns" className="text-xs font-medium text-[#0E4FA8] hover:underline">View all</Link>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.label} className={`flex items-center justify-between text-sm ${row.cls}`}>
            <span>{row.emoji} {row.count} {row.label}</span>
          </li>
        ))}
      </ul>
    </AdminCard>
  )
}
