import { downloadCsv } from './adminExport'
import { MEMBERSHIP_TIERS } from '../constants/membershipContent'
import { getMemberships, type Membership, type MembershipStatus, type MembershipTier } from './membershipService'
import { formatIndianCompact } from './formatIndian'
import { groupWorkflowRows, listWorkflowRows, updateDomainRoot, type WorkflowRow } from './domainWorkflowService'

export type PipelineStage = 'applied' | 'review' | 'payment' | 'approved' | 'certificate' | 'active'
export type MemberActivity = 'active' | 'dormant' | 'vip'
export type MemberEngagement = 'volunteer' | 'donor' | 'event-participant' | 'general'

export interface TierBenefit {
  text: string
}

export interface MembershipTierConfig {
  id: MembershipTier
  name: string
  price: number
  priceLabel: string
  validityMonths: number | null
  benefits: TierBenefit[]
  active: boolean
}

export interface MemberContribution {
  date: string
  type: string
  amount: number
}

export interface MemberParticipation {
  label: string
  attended: boolean
}

export interface MemberAdminMeta {
  company?: string
  pan?: string
  dob?: string
  photoUrl?: string
  pipelineStage?: PipelineStage
  paymentStatus?: 'paid' | 'pending' | 'waived'
  activity?: MemberActivity
  engagement?: MemberEngagement[]
  badges?: string[]
  contributions?: MemberContribution[]
  participation?: MemberParticipation[]
  eventsAttended?: number
  volunteerHours?: number
  donations?: number
  campaignParticipation?: number
}

export interface MemberProfile extends Membership {
  tierLabel: string
  tierPrice: number
  joinedLabel: string
  expiresLabel: string
  totalContributions: number
  paymentStatus: 'paid' | 'pending' | 'waived'
  pipelineStage: PipelineStage
  activity: MemberActivity
  engagement: MemberEngagement[]
  badges: string[]
  contributions: MemberContribution[]
  participation: MemberParticipation[]
  engagementMetrics: {
    eventsAttended: number
    volunteerHours: number
    donations: number
    campaignParticipation: number
  }
  isRenewalDue: boolean
  isOverdue: boolean
  daysUntilRenewal: number | null
}

export interface MemberFilters {
  search: string
  tier: MembershipTier | 'all'
  status: MembershipStatus | 'all'
  activity: MemberActivity | 'all'
  engagement: MemberEngagement | 'all'
}

export interface RenewalSummary {
  dueThisMonth: number
  overdue: number
  upcoming: number
}

export interface MembershipDashboardData {
  members: MemberProfile[]
  tiers: MembershipTierConfig[]
  kpis: {
    totalMembers: number
    activeMembers: number
    pendingApplications: number
    renewalsDue: number
    lifetimeMembers: number
    membershipRevenue: number
  }
  pipeline: Record<PipelineStage, MemberProfile[]>
  renewals: RenewalSummary
  membershipGrowth: { label: string; value: number }[]
  tierDistribution: { label: string; value: number; pct: number }[]
  revenueByTier: { label: string; value: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

const TIER_PRICES: Record<MembershipTier, number> = {
  standard: 0,
  patron: 5000,
  founding: 25000,
}

export function getTierConfigs(): MembershipTierConfig[] {
  return MEMBERSHIP_TIERS.map((t) => ({
    id: t.id,
    name: t.name,
    price: TIER_PRICES[t.id],
    priceLabel: t.price === 'Free' ? 'Free' : t.price,
    validityMonths: t.id === 'founding' ? null : t.id === 'standard' ? null : 12,
    benefits: t.benefits.map((b) => ({ text: b.text })),
    active: true,
  }))
}

export function formatTierPriceDisplay(tier: MembershipTierConfig): string {
  return tier.price === 0
    ? 'Free'
    : `₹${tier.price.toLocaleString('en-IN')}${tier.validityMonths ? '/year' : ''}`
}

export function formatTierSelectLabel(tier: MembershipTierConfig): string {
  return `${tier.name} — ${formatTierPriceDisplay(tier)}`
}

export function saveTierConfigs(tiers: MembershipTierConfig[]) {
  void tiers
}

function getTierConfig(tiers: MembershipTierConfig[], id: MembershipTier): MembershipTierConfig {
  return tiers.find((t) => t.id === id) ?? getTierConfigs().find((t) => t.id === id)!
}

function inferPipelineStage(m: Membership, meta?: MemberAdminMeta): PipelineStage {
  if (meta?.pipelineStage) return meta.pipelineStage
  if (m.status === 'active') return 'active'
  if (m.status === 'approved' && m.certificateNumber) return 'certificate'
  if (m.status === 'approved') return 'approved'
  if (m.status === 'pending' && m.tier !== 'standard' && !meta?.paymentStatus) return 'payment'
  if (m.status === 'pending') return m.motivation ? 'review' : 'applied'
  return 'applied'
}

function inferActivity(m: Membership, meta?: MemberAdminMeta): MemberActivity {
  if (meta?.activity) return meta.activity
  if (m.status === 'active' && m.tier === 'founding') return 'vip'
  if (m.status === 'active') return 'active'
  if (m.status === 'expired') return 'dormant'
  const days = (Date.now() - new Date(m.updatedAt).getTime()) / 86400000
  if (days > 180) return 'dormant'
  return 'active'
}

function inferEngagement(m: Membership, meta?: MemberAdminMeta): MemberEngagement[] {
  void m
  return meta?.engagement ?? []
}

function inferBadges(m: Membership, meta?: MemberAdminMeta, contributions = 0): string[] {
  void m
  void contributions
  return meta?.badges ?? []
}

function buildContributions(m: Membership, tierPrice: number, meta?: MemberAdminMeta): MemberContribution[] {
  void m
  void tierPrice
  return meta?.contributions ?? []
}

function buildParticipation(meta?: MemberAdminMeta): MemberParticipation[] {
  if (meta?.participation?.length) return meta.participation
  return []
}

function getRenewalInfo(m: Membership) {
  if (!m.renewalDate || m.tier === 'standard') {
    return { isRenewalDue: false, isOverdue: false, daysUntilRenewal: null }
  }
  const renewal = new Date(m.renewalDate)
  const now = new Date()
  const daysUntil = Math.ceil((renewal.getTime() - now.getTime()) / 86400000)
  const isOverdue = daysUntil < 0 && m.status === 'active'
  const isRenewalDue = daysUntil >= 0 && daysUntil <= 30 && m.status === 'active'
  return { isRenewalDue, isOverdue, daysUntilRenewal: daysUntil }
}

function buildProfile(m: Membership, tiers: MembershipTierConfig[], metaMap: Record<string, MemberAdminMeta>): MemberProfile {
  const meta = metaMap[m.id] ?? {}
  const tierConfig = getTierConfig(tiers, m.tier)
  const contributions = buildContributions(m, tierConfig.price, meta)
  const totalContributions = contributions.reduce((s, c) => s + c.amount, 0)
  const renewal = getRenewalInfo(m)

  return {
    ...m,
    tierLabel: tierConfig.name,
    tierPrice: tierConfig.price,
    joinedLabel: new Date(m.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    expiresLabel: m.tier === 'founding'
      ? 'Lifetime'
      : m.renewalDate
        ? new Date(m.renewalDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : '—',
    totalContributions,
    paymentStatus: (m.paymentStatus as MemberProfile['paymentStatus'] | undefined) ?? meta.paymentStatus ?? 'pending',
    pipelineStage: (m.pipelineStage as PipelineStage | undefined) ?? inferPipelineStage(m, meta),
    activity: (m.activityStatus as MemberActivity | undefined) ?? inferActivity(m, meta),
    engagement: inferEngagement(m, meta),
    badges: inferBadges(m, meta, totalContributions),
    contributions,
    participation: buildParticipation(meta),
    engagementMetrics: {
      eventsAttended: meta.eventsAttended ?? 0,
      volunteerHours: meta.volunteerHours ?? 0,
      donations: meta.donations ?? contributions.filter((c) => c.type.includes('Donation')).reduce((s, c) => s + c.amount, 0),
      campaignParticipation: meta.campaignParticipation ?? 0,
    },
    ...renewal,
  }
}

export function formatTierLabel(tier: MembershipTier): string {
  const labels: Record<MembershipTier, string> = {
    standard: 'Standard',
    patron: 'Patron',
    founding: 'Founding',
  }
  return labels[tier]
}

function computeKpis(members: MemberProfile[]) {
  return {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === 'active').length,
    pendingApplications: members.filter((m) => m.status === 'pending').length,
    renewalsDue: members.filter((m) => m.isRenewalDue).length,
    lifetimeMembers: members.filter((m) => m.tier === 'founding' || m.expiresLabel === 'Lifetime').length,
    membershipRevenue: members.reduce((s, m) => s + m.totalContributions, 0),
  }
}

function computeRenewals(members: MemberProfile[]): RenewalSummary {
  return {
    dueThisMonth: members.filter((m) => m.isRenewalDue).length,
    overdue: members.filter((m) => m.isOverdue).length,
    upcoming: members.filter((m) => {
      if (m.daysUntilRenewal == null) return false
      return m.daysUntilRenewal > 30 && m.daysUntilRenewal <= 90
    }).length,
  }
}

function computeAnalytics(members: MemberProfile[]) {
  const monthMap = new Map<string, number>()
  for (const m of members) {
    const label = new Date(m.createdAt).toLocaleDateString('en-IN', { month: 'short' })
    monthMap.set(label, (monthMap.get(label) ?? 0) + 1)
  }
  const membershipGrowth = [...monthMap.entries()].slice(-6).map(([label, value]) => ({ label, value }))

  const tierMap = new Map<string, number>()
  for (const m of members.filter((x) => x.status === 'active' || x.status === 'approved')) {
    tierMap.set(m.tierLabel, (tierMap.get(m.tierLabel) ?? 0) + 1)
  }
  const tierTotal = [...tierMap.values()].reduce((s, v) => s + v, 0) || 1
  const tierDistribution = [...tierMap.entries()].map(([label, value]) => ({
    label,
    value,
    pct: Math.round((value / tierTotal) * 100),
  }))

  const revenueMap = new Map<string, number>()
  for (const m of members) {
    revenueMap.set(m.tierLabel, (revenueMap.get(m.tierLabel) ?? 0) + m.totalContributions)
  }
  const revenueByTier = [...revenueMap.entries()].map(([label, value]) => ({ label, value }))

  return { membershipGrowth, tierDistribution, revenueByTier }
}

function computeAiInsights(members: MemberProfile[], renewals: RenewalSummary) {
  const upgradeCandidates = members.filter(
    (m) => m.tier === 'standard' && m.status === 'active' && m.engagementMetrics.donations > 2000,
  ).length
  const dormant = members.filter((m) => m.activity === 'dormant').length
  const foundingRevenue = members.filter((m) => m.tier === 'founding').reduce((s, m) => s + m.totalContributions, 0)

  return [
    { id: 'renewals', message: `${renewals.dueThisMonth} members due for renewal this month`, tone: 'warning' as const },
    { id: 'upgrade', message: `${upgradeCandidates} members are likely to upgrade to Patron tier`, tone: 'info' as const },
    { id: 'dormant', message: `${dormant} dormant members need re-engagement`, tone: 'warning' as const },
    { id: 'founding', message: `Founding memberships generated ${formatIndianCompact(foundingRevenue)} this year`, tone: 'success' as const },
  ]
}

export async function getMembershipDashboardData(): Promise<MembershipDashboardData> {
  const raw = await getMemberships()
  const tiers = getTierConfigs()
  const ids = raw.map((member) => member.id)
  const [payments, participation] = await Promise.all([
    listWorkflowRows('membership_payments', 'membership_id', ids),
    listWorkflowRows('membership_participation', 'membership_id', ids),
  ])
  const paymentsByMember = groupWorkflowRows(payments, 'membership_id')
  const participationByMember = groupWorkflowRows(participation, 'membership_id')
  const metaMap = Object.fromEntries(raw.map((member) => {
    const participationRows = participationByMember.get(member.id) ?? []
    return [member.id, {
      contributions: (paymentsByMember.get(member.id) ?? [])
        .filter((row) => row.status === 'paid')
        .map((row: WorkflowRow) => ({
          date: row.payment_date ? String(row.payment_date) : String(row.created_at),
          type: 'Membership payment',
          amount: Number(row.amount),
        })),
      participation: participationRows.map((row: WorkflowRow) => ({
        label: String(row.label),
        attended: row.attended === true,
      })),
      eventsAttended: participationRows.filter((row) => row.participation_type === 'event' && row.attended === true).length,
      volunteerHours: participationRows
        .filter((row) => row.participation_type === 'volunteer')
        .reduce((sum, row) => sum + Number(row.hours ?? 0), 0),
      donations: participationRows
        .filter((row) => row.participation_type === 'donation')
        .reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
      campaignParticipation: participationRows.filter((row) => row.participation_type === 'campaign').length,
    } satisfies MemberAdminMeta]
  }))
  const members = raw.map((m) => buildProfile(m, tiers, metaMap))

  const pipeline: Record<PipelineStage, MemberProfile[]> = {
    applied: members.filter((m) => m.pipelineStage === 'applied'),
    review: members.filter((m) => m.pipelineStage === 'review'),
    payment: members.filter((m) => m.pipelineStage === 'payment'),
    approved: members.filter((m) => m.pipelineStage === 'approved'),
    certificate: members.filter((m) => m.pipelineStage === 'certificate'),
    active: members.filter((m) => m.pipelineStage === 'active'),
  }

  const kpis = computeKpis(members)
  const renewals = computeRenewals(members)
  const analytics = computeAnalytics(members)
  const aiInsights = computeAiInsights(members, renewals)

  return { members, tiers, kpis, pipeline, renewals, aiInsights, ...analytics }
}

export function filterMembers(members: MemberProfile[], filters: MemberFilters): MemberProfile[] {
  return members.filter((m) => {
    if (filters.tier !== 'all' && m.tier !== filters.tier) return false
    if (filters.status !== 'all' && m.status !== filters.status) return false
    if (filters.activity !== 'all' && m.activity !== filters.activity) return false
    if (filters.engagement !== 'all' && !m.engagement.includes(filters.engagement)) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.memberId ?? '').toLowerCase().includes(q) ||
        m.tierLabel.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export async function updateMemberMeta(id: string, patch: Partial<MemberAdminMeta>) {
  const rootPatch: Record<string, unknown> = {}
  if ('pipelineStage' in patch) rootPatch.pipeline_stage = patch.pipelineStage || null
  if ('paymentStatus' in patch) rootPatch.payment_status = patch.paymentStatus || null
  if ('activity' in patch) rootPatch.activity_status = patch.activity || null
  await updateDomainRoot('memberships', id, rootPatch)
}

export function exportMembersCsv(members: MemberProfile[]) {
  const headers = ['Name', 'Member ID', 'Tier', 'Joined', 'Expires', 'Contributions', 'Status', 'Email']
  const rows = members.map((m) => [
    m.fullName,
    m.memberId ?? '',
    m.tierLabel,
    m.joinedLabel,
    m.expiresLabel,
    m.totalContributions,
    m.status,
    m.email,
  ])
  downloadCsv('members-export.csv', headers, rows)
}

export const PIPELINE_STAGES: { stage: PipelineStage; label: string }[] = [
  { stage: 'applied', label: 'Applied' },
  { stage: 'review', label: 'Under Review' },
  { stage: 'payment', label: 'Payment Pending' },
  { stage: 'approved', label: 'Approved' },
  { stage: 'certificate', label: 'Certificate Generated' },
  { stage: 'active', label: 'Active Member' },
]

export const MEMBER_ACTIVITY_OPTIONS = [
  { value: 'all', label: 'All Activity' },
  { value: 'active', label: 'Active' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'vip', label: 'VIP' },
] as const

export const MEMBER_ENGAGEMENT_OPTIONS = [
  { value: 'all', label: 'All Engagement' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'donor', label: 'Donor' },
  { value: 'event-participant', label: 'Event Participant' },
  { value: 'general', label: 'General' },
] as const

export const MEMBER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'rejected', label: 'Rejected' },
] as const

export const TIER_FILTER_OPTIONS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'standard', label: 'Standard' },
  { value: 'patron', label: 'Patron' },
  { value: 'founding', label: 'Founding' },
] as const

export const BADGE_EMOJI: Record<string, string> = {
  'Founding Member': '🥇',
  'Lifetime Contributor': '💎',
  'Community Leader': '⭐',
  'Top Volunteer': '🎖️',
  'Impact Champion': '❤️',
}
