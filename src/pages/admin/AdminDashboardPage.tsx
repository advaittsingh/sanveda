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

export default function AdminDashboardPage() {
  const { authed } = useAdminAuth()
  const [stats, setStats] = useState<DashboardAnalytics | null>(null)
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
      getBeneficiaryCount(),
      getMemberStats(),
      getDonationsOverTime(),
      getCampaignPerformance(),
      getVolunteerGrowth(),
      getBeneficiaryGrowth(),
      getIncomeVsExpenses(),
      getDonationSourceBreakdown(),
    ])
      .then(([analytics, benCount, members, donations, campaigns, volunteers, beneficiaryGrowth, finance, sources]) => {
        setStats(analytics)
        setBeneficiaries(benCount)
        setMemberStats(members)
        setCharts({ donations, campaigns, volunteers, beneficiaryGrowth, finance, sources })
      })
      .finally(() => setLoading(false))
  }, [authed])

  if (!authed) {
    return <AdminLogin title="Executive Dashboard" subtitle="Sign in to access the Sanveda NGO Operating System." />
  }

  if (loading || !stats) {
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
      subtitle="Real-time overview of Sanveda's humanitarian operations"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard label="Total Donations" value={stats.donations.total} prefix="₹" sub={`${stats.donations.count} transactions`} icon={HandCoins} delay={0} />
          <StatCard label="This Month" value={stats.donations.thisMonth} prefix="₹" icon={TrendingUp} accent="secondary" delay={0.05} />
          <StatCard label="Active Campaigns" value={stats.campaigns.active} sub={`${stats.campaigns.total} total`} icon={Megaphone} accent="blue" delay={0.1} />
          <StatCard label="Volunteers" value={stats.volunteers.active} sub={`${stats.volunteers.pending} pending`} icon={Heart} accent="green" delay={0.15} />
          <StatCard label="Beneficiaries" value={beneficiaries} icon={Users} delay={0.2} />
          <StatCard label="Members" value={memberStats.active} sub={`${memberStats.pending} pending`} icon={UserCheck} accent="secondary" delay={0.25} />
        </div>

        <DashboardCharts
          donations={charts.donations}
          campaigns={charts.campaigns}
          volunteers={charts.volunteers}
          beneficiaries={charts.beneficiaryGrowth}
          finance={charts.finance}
          sources={charts.sources.length ? charts.sources : [{ label: 'No data', value: 1 }]}
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <AdminCard className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Financial Summary</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-700">Total Income</p>
                <p className="text-xl font-bold text-emerald-800">₹{stats.finance.totalIncome.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs text-red-700">Total Expenses</p>
                <p className="text-xl font-bold text-red-800">₹{stats.finance.totalExpenses.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-xl bg-[#0B2C6B]/5 p-4">
                <p className="text-xs text-[#0B2C6B]">Net Balance</p>
                <p className="text-xl font-bold text-[#0B2C6B]">₹{stats.finance.netBalance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="mb-4 text-sm font-semibold text-[#0B2C6B]">Quick Actions</h3>
            <div className="space-y-2">
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
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <AdminCard>
            <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">Pending Approvals</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">{stats.volunteers.pending} volunteer applications</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">{stats.memberships.pending} membership applications</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">{stats.enquiries.new} new enquiries</span>
              <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">₹{stats.finance.pendingExpenses.toLocaleString('en-IN')} pending expenses</span>
            </div>
          </AdminCard>
        </motion.div>
      </div>
    </AdminShell>
  )
}
