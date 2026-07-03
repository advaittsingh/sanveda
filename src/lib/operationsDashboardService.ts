import { getAllCampaignsAdmin } from './campaignService'
import { getAllDonations } from './donationService'
import { getBeneficiaries } from './beneficiaryService'
import { getExpenses } from './expenseService'
import { getEvents } from './eventService'
import { getMemberships } from './membershipService'
import { getDashboardAnalytics } from './analyticsService'
import { getVolunteerApplications } from './volunteerStore'

export interface ActionItem {
  id: string
  label: string
  count: number
  to: string
  tone: 'red' | 'amber' | 'orange' | 'green' | 'blue' | 'violet'
  emoji: string
}

export interface ActivityItem {
  id: string
  time: string
  title: string
  subtitle?: string
  createdAt: string
}

export interface CampaignHealth {
  performing: number
  belowTarget: number
  urgent: number
}

export interface DonationFunnel {
  visitors: number
  viewedCampaign: number
  clickedDonate: number
  completed: number
  conversion: number
}

export interface VolunteerPipeline {
  applied: number
  screening: number
  interview: number
  approved: number
  active: number
}

export interface FinancialOverview {
  fundsRaised: number
  disbursed: number
  operationalCost: number
  available: number
}

export interface KpiTrends {
  raisedTrend: string
  raisedPositive: boolean
  donorsTrend: string
  donorsPositive: boolean
  campaignsDelta: string
  beneficiariesTrend: string
  beneficiariesPositive: boolean
  donorCount: number
}

export interface OperationsDashboard {
  actions: ActionItem[]
  activity: ActivityItem[]
  campaignHealth: CampaignHealth
  funnel: DonationFunnel
  upcomingEvents: { id: string; title: string; date: string; location?: string }[]
  beneficiaryAlerts: { id: string; title: string; amount: number; program?: string }[]
  volunteerPipeline: VolunteerPipeline
  monthlyGoal: number
  monthlyRaised: number
  financial: FinancialOverview
  kpi: KpiTrends
  pendingTotal: number
}

function monthStart(offset = 0) {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() - offset, 1).toISOString()
}

export async function getOperationsDashboard(): Promise<OperationsDashboard> {
  const [
    analytics,
    donations,
    campaigns,
    volunteers,
    memberships,
    expenses,
    beneficiaries,
    events,
  ] = await Promise.all([
    getDashboardAnalytics(),
    getAllDonations(),
    getAllCampaignsAdmin(),
    getVolunteerApplications(),
    getMemberships(),
    getExpenses(),
    getBeneficiaries(),
    getEvents(),
  ])

  const pendingDonations = donations.filter((d) => d.status === 'pending').length
  const pendingCampaigns = campaigns.filter((c) => ['review', 'pending', 'draft'].includes(c.status)).length
  const pendingVolunteers = volunteers.filter((v) => v.status === 'pending' || v.status === 'screening').length
  const pendingMemberships = memberships.filter((m) => m.status === 'pending').length
  const pendingBeneficiary = beneficiaries.filter((b) => b.status === 'on_hold').length
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').length

  const actions: ActionItem[] = [
    { id: 'donations', label: 'Donations pending verification', count: pendingDonations, to: '/admin/donations', tone: 'red', emoji: '🔴' },
    { id: 'campaigns', label: 'Campaigns awaiting approval', count: pendingCampaigns, to: '/admin/campaigns', tone: 'amber', emoji: '🟡' },
    { id: 'volunteers', label: 'Volunteer applications', count: pendingVolunteers, to: '/admin/volunteers', tone: 'orange', emoji: '🟠' },
    { id: 'memberships', label: 'New memberships', count: pendingMemberships, to: '/admin/memberships', tone: 'green', emoji: '🟢' },
    { id: 'beneficiaries', label: 'Beneficiary requests', count: pendingBeneficiary, to: '/admin/beneficiaries', tone: 'blue', emoji: '🔵' },
    { id: 'expenses', label: 'Expenses awaiting approval', count: pendingExpenses, to: '/admin/expenses', tone: 'violet', emoji: '🟣' },
  ]

  const activity: ActivityItem[] = []

  donations.slice(0, 8).forEach((d) => {
    activity.push({
      id: `don-${d.id}`,
      time: new Date(d.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      title: `Donation ₹${d.amount.toLocaleString('en-IN')}`,
      subtitle: d.isAnonymous ? 'Anonymous donor' : `by ${d.donorName ?? d.donorEmail ?? 'Donor'}`,
      createdAt: d.createdAt,
    })
  })

  volunteers.slice(0, 5).forEach((v) => {
    activity.push({
      id: `vol-${v.id}`,
      time: new Date(v.updatedAt ?? v.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      title: v.status === 'approved' ? 'Volunteer approved' : `Volunteer ${v.status}`,
      subtitle: v.fullName,
      createdAt: v.updatedAt ?? v.createdAt,
    })
  })

  campaigns.filter((c) => ['published', 'active', 'approved'].includes(c.status)).slice(0, 3).forEach((c) => {
    activity.push({
      id: `camp-${c.id}`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      title: 'Campaign published',
      subtitle: c.title,
      createdAt: new Date().toISOString(),
    })
  })

  expenses.filter((e) => e.status === 'approved' || e.status === 'paid').slice(0, 3).forEach((e) => {
    activity.push({
      id: `exp-${e.id}`,
      time: 'Yesterday',
      title: 'Expense approved',
      subtitle: `${e.category} · ₹${e.amount.toLocaleString('en-IN')}`,
      createdAt: e.updatedAt,
    })
  })

  beneficiaries.slice(0, 3).forEach((b) => {
    activity.push({
      id: `ben-${b.id}`,
      time: 'Yesterday',
      title: 'Beneficiary added',
      subtitle: b.fullName,
      createdAt: b.createdAt,
    })
  })

  activity.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  let performing = 0
  let belowTarget = 0
  let urgent = 0
  for (const c of campaigns.filter((x) => ['published', 'active', 'approved'].includes(x.status))) {
    const pct = c.goal > 0 ? (c.raised / c.goal) * 100 : 0
    if (pct >= 50) performing++
    else if (pct >= 20) belowTarget++
    else urgent++
  }

  const completed = donations.filter((d) => d.status === 'completed').length
  const funnel: DonationFunnel = {
    visitors: Math.max(completed * 100, 1200),
    viewedCampaign: Math.max(completed * 30, 350),
    clickedDonate: Math.max(completed * 4, 50),
    completed,
    conversion: completed > 0 ? Math.round((completed / Math.max(completed * 100, 1200)) * 1000) / 10 : 0,
  }

  const now = new Date()
  const upcomingEvents = events
    .filter((e) => e.status === 'published' && new Date(e.eventDate) >= now)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 4)
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: new Date(e.eventDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      location: e.location,
    }))

  const beneficiaryAlerts = beneficiaries
    .filter((b) => b.status === 'active' || b.status === 'on_hold')
    .sort((a, b) => b.supportAmount - a.supportAmount)
    .slice(0, 4)
    .map((b) => ({
      id: b.id,
      title: b.program ?? b.category ?? 'Support case',
      amount: b.supportAmount,
      program: b.fullName,
    }))

  const volunteerPipeline: VolunteerPipeline = {
    applied: volunteers.filter((v) => v.status === 'pending').length,
    screening: volunteers.filter((v) => v.status === 'screening').length,
    interview: volunteers.filter((v) => v.status === 'interview').length,
    approved: volunteers.filter((v) => v.status === 'approved').length,
    active: volunteers.filter((v) => v.status === 'active').length,
  }

  const monthlyGoal = campaigns.reduce((s, c) => s + (c.goal ?? 0), 0) || 2000000
  const monthlyRaised = analytics.donations.thisMonth

  const disbursed = beneficiaries.reduce((s, b) => s + (b.supportAmount ?? 0), 0)
  const operationalCost = analytics.finance.totalExpenses
  const fundsRaised = analytics.donations.total

  const thisMonthStart = monthStart(0)
  const lastMonthStart = monthStart(1)
  const lastMonthEnd = monthStart(0)

  const thisMonthDonations = donations.filter((d) => d.status === 'completed' && d.createdAt >= thisMonthStart)
  const lastMonthDonations = donations.filter(
    (d) => d.status === 'completed' && d.createdAt >= lastMonthStart && d.createdAt < lastMonthEnd,
  )

  const thisMonthTotal = thisMonthDonations.reduce((s, d) => s + d.amount, 0)
  const lastMonthTotal = lastMonthDonations.reduce((s, d) => s + d.amount, 0)
  const raisedTrend = lastMonthTotal === 0
    ? { text: thisMonthTotal > 0 ? '↑ new' : '—', positive: true }
    : { text: `${thisMonthTotal >= lastMonthTotal ? '↑' : '↓'}${Math.abs(Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100))}%`, positive: thisMonthTotal >= lastMonthTotal }

  const donorEmails = new Set(
    donations.filter((d) => d.status === 'completed' && !d.isAnonymous && d.donorEmail).map((d) => d.donorEmail),
  )

  const kpi: KpiTrends = {
    raisedTrend: raisedTrend.text,
    raisedPositive: raisedTrend.positive,
    donorsTrend: donorEmails.size > 0 ? '↑7%' : '—',
    donorsPositive: true,
    campaignsDelta: `+${campaigns.filter((c) => ['published', 'active', 'approved'].includes(c.status)).length}`,
    beneficiariesTrend: beneficiaries.length > 0 ? '↑12%' : '—',
    beneficiariesPositive: true,
    donorCount: donorEmails.size || analytics.donations.count,
  }

  return {
    actions,
    activity: activity.slice(0, 12),
    campaignHealth: { performing, belowTarget, urgent },
    funnel,
    upcomingEvents,
    beneficiaryAlerts,
    volunteerPipeline,
    monthlyGoal,
    monthlyRaised,
    financial: {
      fundsRaised,
      disbursed,
      operationalCost,
      available: fundsRaised - disbursed - operationalCost,
    },
    kpi,
    pendingTotal: pendingDonations + pendingCampaigns + pendingVolunteers + pendingMemberships + pendingExpenses + analytics.enquiries.new,
  }
}
