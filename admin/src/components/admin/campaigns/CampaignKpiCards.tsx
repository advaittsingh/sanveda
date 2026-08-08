import { Megaphone, Clock, CheckCircle, FileEdit, HandCoins, Users } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { CampaignKpis } from '../../../types/campaignAdmin'

export default function CampaignKpiCards({ kpis }: { kpis: CampaignKpis }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#0B2C6B]">Campaign Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Active" value={kpis.active} icon={Megaphone} accent="green" delay={0} />
        <StatCard label="Pending Approval" value={kpis.pendingApproval} icon={Clock} accent="secondary" delay={0.05} />
        <StatCard label="Completed" value={kpis.completed} icon={CheckCircle} accent="blue" delay={0.1} />
        <StatCard label="Drafts" value={kpis.drafts} icon={FileEdit} delay={0.15} />
        <StatCard label="Total Raised" value={kpis.totalRaised} prefix="₹" icon={HandCoins} accent="primary" delay={0.2} />
        <StatCard label="Donors" value={kpis.totalDonors} icon={Users} accent="green" delay={0.25} />
      </div>
    </div>
  )
}
