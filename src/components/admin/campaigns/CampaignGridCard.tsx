import { ExternalLink, BarChart3, Pause, Trash2, Pencil } from 'lucide-react'
import type { CampaignRecord } from '../../../lib/campaignService'
import {
  campaignProgress,
  getDaysLeft,
  getCampaignHealth,
  healthLabel,
  parseCategory,
  normalizeStatus,
} from '../../../lib/campaignAdminService'
import StatusBadge from '../ui/StatusBadge'
import AdminCard from '../ui/AdminCard'
import { adminBtnDanger, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  campaign: CampaignRecord
  selected?: boolean
  onSelect?: (id: number, checked: boolean) => void
  onEdit: (c: CampaignRecord) => void
  onView: (c: CampaignRecord) => void
  onPreview: (c: CampaignRecord) => void
  onPause: (c: CampaignRecord) => void
  onDelete: (c: CampaignRecord) => void
}

export default function CampaignGridCard({
  campaign: c,
  selected,
  onSelect,
  onEdit,
  onView,
  onPreview,
  onPause,
  onDelete,
}: Props) {
  const pct = campaignProgress(c.raised, c.goal)
  const health = healthLabel(getCampaignHealth(c))
  const beneficiary = c.meta?.beneficiary

  return (
    <AdminCard className="overflow-hidden p-0">
      <div className="relative">
        {onSelect ? (
          <label className="absolute left-3 top-3 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(c.id, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
          </label>
        ) : null}
        <img
          src={c.banner_image || c.thumbnail_image || '/assets/fallBackBanner'}
          alt=""
          className="h-36 w-full object-cover"
        />
        <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1">
          {c.meta?.featured ? <Flag label="Featured" /> : null}
          {c.meta?.urgent ? <Flag label="Urgent" cls="bg-red-600" /> : null}
          {c.meta?.trending ? <Flag label="Trending" cls="bg-[#0E4FA8]" /> : null}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <button type="button" onClick={() => onView(c)} className="text-left font-semibold text-[#0B2C6B] line-clamp-2 hover:underline">
            {c.title}
          </button>
          <StatusBadge status={normalizeStatus(c.status)} />
        </div>

        <p className={`mb-3 text-xs font-semibold ${health.cls}`}>{health.emoji} {health.label}</p>

        <dl className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div><dt className="text-slate-400">Category</dt><dd className="font-medium text-slate-700">{parseCategory(c.category)}</dd></div>
          <div><dt className="text-slate-400">Beneficiary</dt><dd className="font-medium text-slate-700">{beneficiary?.name ?? '—'}</dd></div>
          <div><dt className="text-slate-400">Goal</dt><dd className="font-medium text-slate-700">₹{c.goal.toLocaleString('en-IN')}</dd></div>
          <div><dt className="text-slate-400">Raised</dt><dd className="font-medium text-emerald-700">₹{c.raised.toLocaleString('en-IN')}</dd></div>
          <div><dt className="text-slate-400">Donors</dt><dd className="font-medium text-slate-700">{c.total_donors ?? 0}</dd></div>
          <div><dt className="text-slate-400">Days Left</dt><dd className="font-medium text-slate-700">{getDaysLeft(c)}</dd></div>
        </dl>

        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span className="font-semibold text-[#0B2C6B]">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0B2C6B] to-[#0E4FA8]" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mb-3 flex gap-3 text-xs text-slate-500">
          <span>Updates {c.meta?.updateCount ?? 0}</span>
          <span>Comments {c.meta?.commentCount ?? 0}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={adminBtnSecondary} onClick={() => onEdit(c)}><Pencil size={14} className="mr-1" />Edit</button>
          <button type="button" className={adminBtnSecondary} onClick={() => onPreview(c)}><ExternalLink size={14} className="mr-1" />Preview</button>
          <button type="button" className={adminBtnSecondary} onClick={() => onView(c)}><BarChart3 size={14} className="mr-1" />Analytics</button>
          {['published', 'active', 'approved'].includes(c.status) && (
            <button type="button" className={adminBtnSecondary} onClick={() => onPause(c)}><Pause size={14} className="mr-1" />Pause</button>
          )}
          <button type="button" className={adminBtnDanger} onClick={() => onDelete(c)}><Trash2 size={14} className="mr-1" />Delete</button>
        </div>
      </div>
    </AdminCard>
  )
}

function Flag({ label, cls = 'bg-[#0B2C6B]' }: { label: string; cls?: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${cls}`}>{label}</span>
}
