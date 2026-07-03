import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter'

interface Props {
  label: string
  value: number
  prefix?: string
  suffix?: string
  sub?: string
  icon?: LucideIcon
  accent?: 'primary' | 'secondary' | 'green' | 'blue'
  delay?: number
}

const accents = {
  primary: 'bg-[#0B2C6B]/10 text-[#0B2C6B]',
  secondary: 'bg-[#0E4FA8]/10 text-[#0E4FA8]',
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-sky-50 text-sky-700',
}

export default function StatCard({ label, value, prefix, suffix, sub, icon: Icon, accent = 'primary', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(11,44,107,0.08)' }}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {Icon ? (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accents[accent]}`}>
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <div className="text-2xl font-bold tracking-tight text-[#0B2C6B]">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </motion.div>
  )
}
