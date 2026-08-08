import { ExternalLink, BarChart3, Pause, Trash2, Pencil } from 'lucide-react'
import type { CampaignRecord } from '../../../lib/campaignService'
import {
  campaignProgress,
  getCampaignHealth,
  healthLabel,
  parseCategory,
  normalizeStatus,
} from '../../../lib/campaignAdminService'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  campaigns: CampaignRecord[]
  selectedIds: Set<number>
  loading?: boolean
  onToggleSelect: (id: number) => void
  onToggleAll: (checked: boolean) => void
  onView: (c: CampaignRecord) => void
  onEdit: (c: CampaignRecord) => void
  onPreview: (c: CampaignRecord) => void
  onPause: (c: CampaignRecord) => void
  onDelete: (c: CampaignRecord) => void
}

export default function CampaignDataGrid({
  campaigns,
  selectedIds,
  loading,
  onToggleSelect,
  onToggleAll,
  onView,
  onEdit,
  onPreview,
  onPause,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-2 h-10 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    )
  }

  const allSelected = campaigns.length > 0 && campaigns.every((c) => selectedIds.has(c.id))

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={(e) => onToggleAll(e.target.checked)} className="h-4 w-4 rounded" />
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Campaign</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Goal</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Raised</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Donors</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Health</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const pct = campaignProgress(c.raised, c.goal)
              const health = healthLabel(getCampaignHealth(c))
              return (
                <tr key={c.id} className="border-b border-[#E5E7EB]/80 last:border-0 hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(c.id)}
                      onChange={() => onToggleSelect(c.id)}
                      className="h-4 w-4 rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => onView(c)} className="font-medium text-[#0B2C6B] hover:underline">
                      {c.title}
                    </button>
                    <p className="text-xs text-slate-500">{c.meta?.beneficiary?.name}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{parseCategory(c.category)}</td>
                  <td className="px-4 py-3 text-slate-600">₹{c.goal.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-medium text-emerald-700">₹{c.raised.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-slate-600">{c.total_donors ?? 0}</td>
                  <td className={`px-4 py-3 text-xs font-semibold ${health.cls}`}>{health.emoji} {health.label}</td>
                  <td className="px-4 py-3"><StatusBadge status={normalizeStatus(c.status)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <ActionBtn icon={Pencil} label="Edit" onClick={() => onEdit(c)} />
                      <ActionBtn icon={ExternalLink} label="Preview" onClick={() => onPreview(c)} />
                      <ActionBtn icon={BarChart3} label="Analytics" onClick={() => onView(c)} />
                      <ActionBtn icon={Pause} label="Pause" onClick={() => onPause(c)} />
                      <ActionBtn icon={Trash2} label="Delete" onClick={() => onDelete(c)} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!campaigns.length && <p className="p-8 text-center text-sm text-slate-500">No campaigns match your filters.</p>}
    </div>
  )
}

function ActionBtn({ icon: Icon, label, onClick }: { icon: typeof Pencil; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0B2C6B]" title={label}>
      <Icon size={14} />
    </button>
  )
}
