import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  className?: string
}

export default function AdminCard({ children, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  )
}
