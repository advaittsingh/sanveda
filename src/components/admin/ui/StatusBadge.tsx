const styles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-50 text-amber-700',
  new: 'bg-amber-50 text-amber-700',
  review: 'bg-sky-50 text-sky-700',
  screening: 'bg-sky-50 text-sky-700',
  interview: 'bg-violet-50 text-violet-700',
  active: 'bg-emerald-50 text-emerald-700',
  approved: 'bg-emerald-50 text-emerald-700',
  published: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  closed: 'bg-slate-100 text-slate-600',
  rejected: 'bg-red-50 text-red-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-orange-50 text-orange-700',
  requested: 'bg-amber-50 text-amber-700',
  generated: 'bg-sky-50 text-sky-700',
  sent: 'bg-emerald-50 text-emerald-700',
  downloaded: 'bg-violet-50 text-violet-700',
  expired: 'bg-slate-100 text-slate-500',
  on_hold: 'bg-amber-50 text-amber-700',
  archived: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-red-50 text-red-600',
}

export default function StatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
