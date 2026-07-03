import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HandCoins,
  Megaphone,
  Heart,
  Users,
  Wallet,
  TrendingUp,
  UserCheck,
  ArrowRight,
} from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import DashboardCharts from '../../components/admin/charts/DashboardCharts'
import StatCard from '../../components/admin/ui/StatCard'
import AdminCard from '../../components/admin/ui/AdminCard'
import ActionCenter from '../../components/admin/dashboard/ActionCenter'
import RecentActivityFeed from '../../components/admin/dashboard/RecentActivityFeed'
import CampaignHealthWidget from '../../components/admin/dashboard/CampaignHealthWidget'
import DonationFunnelWidget from '../../components/admin/dashboard/DonationFunnelWidget'
import UpcomingEventsWidget from '../../components/admin/dashboard/UpcomingEventsWidget'
import BeneficiaryAlertsWidget from '../../components/admin/dashboard/BeneficiaryAlertsWidget'
import VolunteerPipelineWidget from '../../components/admin/dashboard/VolunteerPipelineWidget'
import FundraisingProgressWidget from '../../components/admin/dashboard/FundraisingProgressWidget'
import FinancialOverviewWidget from '../../components/admin/dashboard/FinancialOverviewWidget'
import NgoStatusWidget from '../../components/admin/dashboard/NgoStatusWidget'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getDashboardAnalytics, type DashboardAnalytics } from '../../lib/analyticsService'
import {
  getBeneficiaryCount,
  getBeneficiaryGrowth,
  getCampaignPerformance,
  getDonationSourceBreakdown,
  getDonationsOverTime,
  getIncomeVsExpenses,
  getMemberStats,
  getVolunteerGrowth,
} from '../../lib/adminAnalytics'
import { getOperationsDashboard, type OperationsDashboard } from '../../lib/operationsDashboardService'
import { formatIndianCompact } from '../../lib/formatIndian'

export default function AdminDashboardPage() {
  const { authed } = useAdminAuth()
  const [stats, setStats] = useState<DashboardAnalytics | null>(null)
  const [ops, setOps] = useState<OperationsDashboard | null>(null)
  const [beneficiaries, setBeneficiaries] = useState(0)
  const [memberStats, setMemberStats] = useState({ total: 0, active: 0, pending: 0 })
  const [charts, setCharts] = useState({
    donations: [] as Awaited<ReturnType<typeof getDonationsOverTime>>,
    campaigns: [] as Awaited<ReturnType<typeof getCampaignPerformance>>,
    volunteers: [] as Awaited<ReturnType<typeof getVolunteerGrowth>>,
    beneficiaryGrowth: [] as Awaited<ReturnType<typeof getBeneficiaryGrowth>>,
    finance: [] as Awaited<ReturnType<typeof getIncomeVsExpenses>>,
    sources: [] as Awaited<ReturnType<typeof getDonationSourceBreakdown>>,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authed) return
    Promise.all([
      getDashboardAnalytics(),
      getOperationsDashboard(),
      getBeneficiaryCount(),
      getMemberStats(),
      getDonationsOverTime(),
      getCampaignPerformance(),
      getVolunteerGrowth(),
      getBeneficiaryGrowth(),
      getIncomeVsExpenses(),
      getDonationSourceBreakdown(),
    ])
      .then(([analytics, operations, benCount, members, donations, campaigns, volunteers, beneficiaryGrowth, finance, sources]) => {
        setStats(analytics)
        setOps(operations)
        setBeneficiaries(benCount)
        setMemberStats(members)
        setCharts({ donations, campaigns, volunteers, beneficiaryGrowth, finance, sources })
      })
      .finally(() => setLoading(false))
  }, [authed])

  if (!authed) {
    return <AdminLogin title="Executive Dashboard" subtitle="Sign in to access the Sanveda NGO Operating System." />
  }

  if (loading || !stats || !ops) {
    return (
      <AdminShell title="Executive Dashboard" subtitle="Sanveda Global Humanitarian Foundation">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const quickLinks = [
    { to: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
    { to: '/admin/donations', label: 'Donations', icon: HandCoins },
    { to: '/admin/volunteers', label: 'Volunteers', icon: Heart },
    { to: '/admin/finance', label: 'Finance', icon: Wallet },
    { to: '/admin/reports', label: 'Reports', icon: TrendingUp },
    { to: '/admin/memberships', label: 'Members', icon: UserCheck },
  ]

  return (
    <AdminShell
      title="Executive Dashboard"
      subtitle="What requires your attention today — plus real-time NGO operations"
    >
      <div className="space-y-6">
        {/* 1. Executive KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard
            label="Total Raised"
            value={stats.donations.total}
            prefix="₹"
            sub={`${stats.donations.count} transactions`}
            trend={ops.kpi.raisedTrend}
            trendPositive={ops.kpi.raisedPositive}
            icon={HandCoins}
            delay={0}
          />
          <StatCard
            label="Donors"
            value={ops.kpi.donorCount}
            trend={ops.kpi.donorsTrend}
            trendPositive={ops.kpi.donorsPositive}
            icon={TrendingUp}
            accent="secondary"
            delay={0.05}
          />
          <StatCard
            label="Campaigns"
            value={stats.campaigns.active}
            sub={`${stats.campaigns.total} total`}
            trend={ops.kpi.campaignsDelta}
            icon={Megaphone}
            accent="blue"
            delay={0.1}
          />
          <StatCard
            label="Volunteers"
            value={stats.volunteers.active}
            sub={`${stats.volunteers.pending} pending`}
            icon={Heart}
            accent="green"
            delay={0.15}
          />
          <StatCard
            label="Beneficiaries"
            value={beneficiaries}
            trend={ops.kpi.beneficiariesTrend}
            trendPositive={ops.kpi.beneficiariesPositive}
            icon={Users}
            delay={0.2}
          />
          <StatCard
            label="Members"
            value={memberStats.active}
            sub={`${memberStats.pending} pending`}
            icon={UserCheck}
            accent="secondary"
            delay={0.25}
          />
        </div>

        {/* 2. Action Center + Recent Activity */}
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ActionCenter items={ops.actions} />
          </div>
          <RecentActivityFeed items={ops.activity} />
        </div>

        {/* 3. Fundraising Overview */}
        <div className="grid gap-5 lg:grid-cols-2">
          <FundraisingProgressWidget raised={ops.monthlyRaised} goal={ops.monthlyGoal} />
          <DonationFunnelWidget funnel={ops.funnel} />
        </div>

        {/* 4. Campaign Health + Upcoming Events */}
        <div className="grid gap-5 lg:grid-cols-2">
          <CampaignHealthWidget health={ops.campaignHealth} />
          <UpcomingEventsWidget events={ops.upcomingEvents} />
        </div>

        {/* 5. Volunteer Pipeline + Beneficiary Alerts */}
        <div className="grid gap-5 lg:grid-cols-2">
          <VolunteerPipelineWidget pipeline={ops.volunteerPipeline} />
          <BeneficiaryAlertsWidget alerts={ops.beneficiaryAlerts} />
        </div>

        {/* 6. Finance Overview + NGO Status */}
        <div className="grid gap-5 lg:grid-cols-2">
          <FinancialOverviewWidget financial={ops.financial} />
          <NgoStatusWidget />
        </div>

        {/* 7. Analytics Charts */}
        <DashboardCharts
          donations={charts.donations}
          campaigns={charts.campaigns}
          volunteers={charts.volunteers}
          beneficiaries={charts.beneficiaryGrowth}
          finance={charts.finance}
          sources={charts.sources.length ? charts.sources : [{ label: 'No data', value: 1 }]}
        />

        {/* 8. Quick Actions */}
        <AdminCard>
          <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Quick Actions</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#0B2C6B]/20 hover:bg-[#F8FAFC]"
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} className="text-[#0B2C6B]" />
                    {link.label}
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </Link>
              )
            })}
          </div>
        </AdminCard>

        {/* 9. Pending Approvals */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <AdminCard>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Pending Approvals</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">{stats.volunteers.pending} volunteer applications</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">{stats.memberships.pending} membership applications</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">{stats.enquiries.new} new enquiries</span>
              <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">{formatIndianCompact(stats.finance.pendingExpenses)} pending expenses</span>
            </div>
          </AdminCard>
        </motion.div>
      </div>
    </AdminShell>
  )
}
