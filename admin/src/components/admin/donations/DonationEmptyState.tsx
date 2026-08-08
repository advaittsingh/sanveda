import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { adminBtnPrimary } from '../ui/adminStyles'

interface Props {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function DonationEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Icon size={28} className="text-[#0B2C6B]/60" />
      </div>
      <h3 className="text-base font-semibold text-[#0B2C6B]">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className={`${adminBtnPrimary} mt-5`} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
