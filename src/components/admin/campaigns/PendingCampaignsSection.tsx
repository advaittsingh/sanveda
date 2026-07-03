import type { CampaignRecord } from '../../../lib/campaignService'
import { campaignProgress, normalizeStatus } from '../../../lib/campaignAdminService'
import AdminCard from '../ui/AdminCard'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  campaigns: CampaignRecord[]
  onApprove: (c: CampaignRecord) => void
  onView: (c: CampaignRecord) => void
}

export default function PendingCampaignsSection({ campaigns, onApprove, onView }: Props) {
  if (!campaigns.length) return null

  return (
    <AdminCard>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#0B2C6B]">Pending Approval</h3>
      <div className="space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-[#0B2C6B]">{c.title}</p>
              <p className="text-xs text-slate-500">
                Goal ₹{c.goal.toLocaleString('en-IN')} · {campaignProgress(c.raised, c.goal)}% raised
              </p>
              <StatusBadge status={normalizeStatus(c.status)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnSecondary} onClick={() => onView(c)}>Review</button>
              <button type="button" className={adminBtnPrimary} onClick={() => onApprove(c)}>Approve</button>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
