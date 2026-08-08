import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ActionItem } from '../../../lib/operationsDashboardService'
import AdminCard from '../ui/AdminCard'

const toneStyles: Record<ActionItem['tone'], string> = {
  red: 'border-red-200 bg-red-50 hover:bg-red-100/80',
  amber: 'border-amber-200 bg-amber-50 hover:bg-amber-100/80',
  orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100/80',
  green: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80',
  blue: 'border-sky-200 bg-sky-50 hover:bg-sky-100/80',
  violet: 'border-violet-200 bg-violet-50 hover:bg-violet-100/80',
}

export default function ActionCenter({ items }: { items: ActionItem[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#0B2C6B]">Today&apos;s Action Center</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link
              to={item.to}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${toneStyles[item.tone]} ${item.count === 0 ? 'opacity-60' : ''}`}
            >
              <span className="text-sm font-medium text-slate-800">
                {item.emoji} {item.label}
              </span>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-[#0B2C6B] shadow-sm">
                {item.count}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </AdminCard>
  )
}
