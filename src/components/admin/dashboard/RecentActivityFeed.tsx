import type { ActivityItem } from '../../../lib/operationsDashboardService'
import AdminCard from '../ui/AdminCard'

export default function RecentActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <AdminCard className="h-full">
      <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Recent Activity</h3>
      <ul className="space-y-4">
        {items.length === 0 ? (
          <li className="text-sm text-slate-500">No recent activity yet.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex gap-3 border-b border-[#E5E7EB]/80 pb-3 last:border-0 last:pb-0">
              <span className="w-14 shrink-0 text-xs font-medium text-slate-400">{item.time}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                {item.subtitle ? <p className="text-xs text-slate-500">{item.subtitle}</p> : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </AdminCard>
  )
}
