import { useState, type ReactNode } from 'react'
import { X, ExternalLink, Pause, Trash2, Pencil } from 'lucide-react'
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
import { adminBtnDanger, adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

const TABS = ['Overview', 'Donations', 'Beneficiaries', 'Updates', 'Gallery', 'Documents', 'Comments', 'Analytics', 'Settings'] as const

interface Props {
  campaign: CampaignRecord | null
  onClose: () => void
  onEdit: (c: CampaignRecord) => void
  onPreview: (c: CampaignRecord) => void
  onPause: (c: CampaignRecord) => void
  onDelete: (c: CampaignRecord) => void
}

export default function CampaignDetailPanel({ campaign, onClose, onEdit, onPreview, onPause, onDelete }: Props) {
  const [tab, setTab] = useState<typeof TABS[number]>('Overview')

  if (!campaign) return null

  const c = campaign
  const pct = campaignProgress(c.raised, c.goal)
  const health = healthLabel(getCampaignHealth(c))
  const beneficiary = c.meta?.beneficiary

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close panel" />
      <aside className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#0B2C6B]">{c.title}</h2>
              <p className="text-sm text-slate-500">{parseCategory(c.category)} · {normalizeStatus(c.status)}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnSecondary} onClick={() => onEdit(c)}><Pencil size={14} className="mr-1" />Edit</button>
            <button type="button" className={adminBtnSecondary} onClick={() => onPreview(c)}><ExternalLink size={14} className="mr-1" />Preview</button>
            <button type="button" className={adminBtnSecondary} onClick={() => onPause(c)}><Pause size={14} className="mr-1" />Pause</button>
            <button type="button" className={adminBtnDanger} onClick={() => onDelete(c)}><Trash2 size={14} className="mr-1" />Delete</button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-[#E5E7EB] px-5 py-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === t ? 'bg-[#0B2C6B] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'Overview' && (
            <div className="space-y-5">
              <img src={c.banner_image || c.thumbnail_image} alt="" className="h-40 w-full rounded-xl object-cover" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Goal" value={`₹${c.goal.toLocaleString('en-IN')}`} />
                <Metric label="Raised" value={`₹${c.raised.toLocaleString('en-IN')}`} />
                <Metric label="Donors" value={String(c.total_donors ?? 0)} />
                <Metric label="Days Left" value={String(getDaysLeft(c))} />
                <Metric label="Progress" value={`${pct}%`} />
                <Metric label="Health" value={`${health.emoji} ${health.label}`} />
              </div>
              <div>
                <div className="mb-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#0E4FA8]" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <StatusBadge status={normalizeStatus(c.status)} />
              <p className="text-sm text-slate-600">{c.description}</p>
            </div>
          )}

          {tab === 'Donations' && (
            <div className="space-y-3 text-sm text-slate-600">
              <p>Total raised: <strong>₹{c.raised.toLocaleString('en-IN')}</strong></p>
              <p>Donors: <strong>{c.total_donors ?? 0}</strong></p>
              <p className="text-slate-500">Detailed donation ledger available in Donations module.</p>
            </div>
          )}

          {tab === 'Beneficiaries' && beneficiary && (
            <dl className="space-y-3 text-sm">
              <Row label="Beneficiary" value={beneficiary.name} />
              {beneficiary.age ? <Row label="Age" value={String(beneficiary.age)} /> : null}
              {beneficiary.location ? <Row label="Location" value={beneficiary.location} /> : null}
              {beneficiary.category ? <Row label="Category" value={beneficiary.category} /> : null}
              <Row label="Verification" value={beneficiary.verified ? 'Verified ✓' : 'Pending'} />
            </dl>
          )}

          {tab === 'Updates' && (
            <p className="text-sm text-slate-600">{c.meta?.updateCount ?? 0} campaign updates published.</p>
          )}

          {tab === 'Gallery' && (
            <div className="grid grid-cols-2 gap-3">
              {(c.meta?.gallery ?? [c.banner_image]).filter(Boolean).map((url, i) => (
                <img key={i} src={url} alt="" className="h-28 w-full rounded-xl object-cover" />
              ))}
            </div>
          )}

          {tab === 'Documents' && (
            <ul className="space-y-2 text-sm">
              {(c.meta?.documents ?? []).length === 0 ? (
                <li className="text-slate-500">No documents uploaded.</li>
              ) : (
                c.meta!.documents!.map((doc, i) => (
                  <li key={i}><a href={doc} className="text-[#0E4FA8] hover:underline" target="_blank" rel="noreferrer">{doc}</a></li>
                ))
              )}
            </ul>
          )}

          {tab === 'Comments' && (
            <p className="text-sm text-slate-600">{c.meta?.commentCount ?? 0} comments on this campaign.</p>
          )}

          {tab === 'Analytics' && (
            <div className="space-y-3 text-sm">
              <p className={health.cls}>{health.emoji} {health.label}</p>
              <p>Conversion potential based on {pct}% progress with {getDaysLeft(c)} days remaining.</p>
              <div className="flex flex-wrap gap-2">
                {c.meta?.featured ? <Tag>Featured</Tag> : null}
                {c.meta?.trending ? <Tag>Trending</Tag> : null}
                {c.meta?.urgent ? <Tag>Urgent</Tag> : null}
                {c.meta?.recommended ? <Tag>Recommended</Tag> : null}
              </div>
            </div>
          )}

          {tab === 'Settings' && (
            <div className="space-y-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Slug</span>
                <p className="text-slate-500">{c.slug}</p>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Created By</span>
                <p className="text-slate-500">{c.meta?.createdBy ?? 'Admin'}</p>
              </label>
              {c.meta?.timeline?.length ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Timeline</p>
                  <ul className="space-y-2">
                    {c.meta.timeline.map((ev) => (
                      <li key={ev.label} className="flex justify-between text-sm text-slate-600">
                        <span>{ev.label}</span>
                        <span>{new Date(ev.date).toLocaleDateString('en-IN')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <button type="button" className={adminBtnPrimary} onClick={() => onEdit(c)}>Open in Editor</button>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-[#0B2C6B]">{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[#E5E7EB]/80 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-[#0B2C6B]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0B2C6B]">{children}</span>
}
