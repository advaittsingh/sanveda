import { downloadCsv } from './adminExport'
import { getAllDonations, type Donation } from './donationService'
import { formatTrend } from './formatIndian'
import { groupWorkflowRows, listWorkflowRows } from './domainWorkflowService'
import { dataApi } from './dataApiClient'

export type DonorType = 'individual' | 'corporate' | 'trust' | 'foundation' | 'international'
export type GivingLevel = 'first-time' | 'regular' | 'monthly' | 'major' | 'lifetime'
export type EngagementStatus = 'active' | 'dormant' | 'at-risk' | 'vip'

export interface DonorAdminMeta {
  name?: string
  phone?: string
  address?: string
  pan?: string
  aadhaar?: string
  type?: DonorType
  tags?: string[]
  notes?: string
  followUpTasks?: string[]
}

export interface DonorDonationRecord {
  id: string
  date: string
  campaign: string
  amount: number
  mode: string
  receiptNumber?: string
}

export interface DonorTimelineEvent {
  id: string
  label: string
  at: string
}

export interface DonorProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  pan: string
  aadhaar: string
  dateJoined: string
  type: DonorType | null
  givingLevel: GivingLevel | null
  engagement: EngagementStatus | null
  tags: string[]
  lifetimeGiving: number
  donationCount: number
  lastDonation: string
  averageDonation: number
  donationFrequencyDays: number | null
  retentionScore: number
  engagementScore: 'Low' | 'Medium' | 'High'
  isMonthly: boolean
  donations: DonorDonationRecord[]
  timeline: DonorTimelineEvent[]
  followUpTasks: string[]
}

export interface DonorFilters {
  search: string
  type: DonorType | 'all'
  givingLevel: GivingLevel | 'all'
  engagement: EngagementStatus | 'all'
  tag: string | 'all'
}

export interface DonorDashboardData {
  donors: DonorProfile[]
  kpis: {
    totalDonors: number
    activeDonors: number
    lifetimeGiving: number
    monthlyRecurring: number
    averageDonation: number
    retentionRate: number
    lifetimeTrend: string
    lifetimeTrendPositive: boolean
  }
  donationsByMonth: { label: string; value: number }[]
  topDonors: { name: string; value: number }[]
  donationSources: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

function inferPaymentMode(donation: Donation): string {
  if (donation.razorpayPaymentId) return 'UPI'
  return 'Website'
}

function computeFrequency(dates: string[]): number | null {
  if (dates.length < 2) return null
  const sorted = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  let totalGap = 0
  for (let i = 1; i < sorted.length; i += 1) {
    totalGap += (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000
  }
  return Math.round(totalGap / (sorted.length - 1))
}

function computeRetentionScore(
  count: number,
  frequencyDays: number | null,
  engagement: EngagementStatus,
): number {
  let score = Math.min(count * 8, 40)
  if (frequencyDays && frequencyDays <= 60) score += 25
  else if (frequencyDays && frequencyDays <= 120) score += 15
  if (engagement === 'vip') score += 20
  else if (engagement === 'active') score += 15
  else if (engagement === 'dormant') score += 5
  return Math.min(score, 99)
}

function engagementScoreLabel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

function buildDonorProfiles(
  donations: Donation[],
  persistedProfiles: Record<string, Record<string, unknown>>,
  communications: Map<string, Record<string, unknown>[]>,
  tasks: Map<string, Record<string, unknown>[]>,
): DonorProfile[] {
  const grouped = new Map<string, Donation[]>()

  for (const d of donations.filter((x) => x.status === 'completed' && !x.isAnonymous)) {
    const key = (d.donorEmail ?? d.donorName ?? d.id).toLowerCase()
    const list = grouped.get(key) ?? []
    list.push(d)
    grouped.set(key, list)
  }

  const profiles: DonorProfile[] = []

  for (const [key, list] of grouped) {
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    const first = sorted[sorted.length - 1]
    const latest = sorted[0]
    const persisted = persistedProfiles[key]
    const profileId = persisted ? String(persisted.id) : ''
    const meta: DonorAdminMeta = persisted
      ? {
          phone: persisted.phone ? String(persisted.phone) : undefined,
          address: persisted.address ? String(persisted.address) : undefined,
          type: persisted.donor_type as DonorType | undefined,
          tags: Array.isArray(persisted.tags) ? persisted.tags.map(String) : [],
        }
      : {}
    const email = latest.donorEmail ?? first.donorEmail ?? '—'
    const name = latest.donorName ?? first.donorName ?? 'Donor'
    const lifetimeGiving = list.reduce((s, d) => s + d.amount, 0)
    const donationRecords: DonorDonationRecord[] = sorted.map((d) => ({
      id: d.id,
      date: d.createdAt,
      campaign: d.campaignTitle,
      amount: d.amount,
      mode: inferPaymentMode(d),
      receiptNumber: d.receiptNumber,
    }))
    const isMonthly = persisted?.is_monthly === true
    const type = meta.type ?? null
    const givingLevel = persisted?.giving_level ? (persisted.giving_level as GivingLevel) : null
    const engagement = persisted?.engagement_status
      ? (persisted.engagement_status as EngagementStatus)
      : null
    const frequencyDays = computeFrequency(list.map((d) => d.createdAt))
    const retentionScore = engagement
      ? computeRetentionScore(list.length, frequencyDays, engagement)
      : 0

    const base = {
      id: profileId || key,
      name,
      email,
      phone: meta.phone ?? latest.donorPhone ?? '—',
      address: meta.address ?? '—',
      pan: meta.pan ?? '—',
      aadhaar: meta.aadhaar ?? '—',
      dateJoined: first.createdAt,
      type,
      givingLevel,
      engagement,
      lifetimeGiving,
      donationCount: list.length,
      lastDonation: latest.createdAt,
      averageDonation: Math.round(lifetimeGiving / list.length),
      donationFrequencyDays: frequencyDays,
      retentionScore,
      engagementScore: engagement ? engagementScoreLabel(retentionScore) : 'Low',
      isMonthly,
      donations: donationRecords,
      timeline: (communications.get(profileId) ?? []).map((row) => ({
        id: String(row.id),
        label: [row.channel, row.subject].filter(Boolean).join(': '),
        at: String(row.occurred_at),
      })),
      followUpTasks: (tasks.get(profileId) ?? [])
        .filter((row) => row.status !== 'completed')
        .map((row) => String(row.title)),
    }

    profiles.push({ ...base, tags: meta.tags ?? [] })
  }

  return profiles.sort((a, b) => b.lifetimeGiving - a.lifetimeGiving)
}

function computeKpis(donors: DonorProfile[], donations: Donation[]) {
  const completed = donations.filter((d) => d.status === 'completed')
  const lifetimeGiving = completed.reduce((s, d) => s + d.amount, 0)
  const activeDonors = donors.filter(
    (d) => d.engagement === 'active' || d.engagement === 'vip',
  ).length
  const monthlyRecurring = donors.filter((d) => d.isMonthly).length
  const avgDonation = completed.length ? Math.round(lifetimeGiving / completed.length) : 0

  const now = Date.now()
  const yearMs = 365 * 86400000
  const retained = donors.filter((d) => {
    const dates = d.donations.map((x) => new Date(x.date).getTime())
    const hasRecent = dates.some((t) => now - t <= yearMs)
    const hasPrior = dates.some((t) => now - t > yearMs && now - t <= yearMs * 2)
    return hasRecent && hasPrior
  }).length
  const eligible = donors.filter((d) =>
    d.donations.some((x) => now - new Date(x.date).getTime() <= yearMs * 2),
  ).length
  const retentionRate = eligible ? Math.round((retained / eligible) * 100) : 0

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const priorStart = new Date(sixMonthsAgo)
  priorStart.setMonth(priorStart.getMonth() - 6)
  const recentTotal = completed
    .filter((d) => new Date(d.createdAt) >= sixMonthsAgo)
    .reduce((s, d) => s + d.amount, 0)
  const priorTotal = completed
    .filter((d) => new Date(d.createdAt) >= priorStart && new Date(d.createdAt) < sixMonthsAgo)
    .reduce((s, d) => s + d.amount, 0)
  const trend = formatTrend(recentTotal, priorTotal)

  return {
    totalDonors: donors.length,
    activeDonors,
    lifetimeGiving,
    monthlyRecurring,
    averageDonation: avgDonation,
    retentionRate,
    lifetimeTrend: trend.text,
    lifetimeTrendPositive: trend.positive,
  }
}

function computeAnalytics(donors: DonorProfile[], donations: Donation[]) {
  const monthMap = new Map<string, number>()
  for (const d of donations.filter((x) => x.status === 'completed')) {
    const label = new Date(d.createdAt).toLocaleDateString('en-IN', { month: 'short' })
    monthMap.set(label, (monthMap.get(label) ?? 0) + d.amount)
  }
  const donationsByMonth = [...monthMap.entries()]
    .slice(-6)
    .map(([label, value]) => ({ label, value }))

  const topDonors = donors.slice(0, 5).map((d) => ({ name: d.name, value: d.lifetimeGiving }))

  const sourceMap = { Website: 0, UPI: 0, Bank: 0, Offline: 0 }
  for (const d of donations.filter((x) => x.status === 'completed')) {
    if (d.razorpayPaymentId) sourceMap.UPI += d.amount
    else sourceMap.Website += d.amount
  }
  const sourceTotal = Object.values(sourceMap).reduce((s, v) => s + v, 0) || 1
  const donationSources = Object.entries(sourceMap).map(([label, value]) => ({
    label,
    value,
    pct: Math.round((value / sourceTotal) * 100),
  }))

  return { donationsByMonth, topDonors, donationSources }
}

function computeAiInsights(donors: DonorProfile[]): DonorDashboardData['aiInsights'] {
  const dormant90 = donors.filter((d) => {
    const days = (Date.now() - new Date(d.lastDonation).getTime()) / 86400000
    return days >= 90
  }).length

  return [
    {
      id: 'dormant',
      message: `${dormant90} donors haven't donated in 90 days`,
      tone: 'warning',
    },
  ]
}

export async function getDonorDashboardData(): Promise<DonorDashboardData> {
  const [donations, profiles] = await Promise.all([
    getAllDonations(),
    listWorkflowRows('donor_profiles'),
  ])
  const profileIds = profiles.map((row) => row.id)
  const [communications, tasks] = await Promise.all([
    listWorkflowRows('donor_communications', 'donor_id', profileIds),
    listWorkflowRows('donor_tasks', 'donor_id', profileIds),
  ])
  const persistedProfiles = Object.fromEntries(
    profiles.map((row) => [String(row.email).toLowerCase(), row]),
  )
  const donors = buildDonorProfiles(
    donations,
    persistedProfiles,
    groupWorkflowRows(communications, 'donor_id'),
    groupWorkflowRows(tasks, 'donor_id'),
  )
  const kpis = computeKpis(donors, donations)
  const analytics = computeAnalytics(donors, donations)
  const aiInsights = computeAiInsights(donors)

  return { donors, kpis, ...analytics, aiInsights }
}

export function filterDonors(donors: DonorProfile[], filters: DonorFilters): DonorProfile[] {
  return donors.filter((d) => {
    if (filters.type !== 'all' && d.type !== filters.type) return false
    if (filters.givingLevel !== 'all' && d.givingLevel !== filters.givingLevel) return false
    if (filters.engagement !== 'all' && d.engagement !== filters.engagement) return false
    if (filters.tag !== 'all' && !d.tags.includes(filters.tag)) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export async function updateDonorMeta(id: string, patch: Partial<DonorAdminMeta>) {
  const email = id.trim().toLowerCase()
  const { error } = await dataApi.table('donor_profiles').upsert(
    {
      email,
      full_name: patch.name ?? null,
      phone: patch.phone ?? null,
      address: patch.address ?? null,
      donor_type: patch.type ?? null,
      tags: patch.tags ?? [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'email' },
  )
  if (error) throw new Error(error.message)
}

/**
 * BUG-023: Type / Status / Tags empty cells are usually a data gap — donors who
 * have completed gifts but no `donor_profiles` row (null type/engagement, empty tags).
 * Export mirrors UI defaults so CSV matches the admin table, not raw DB nulls:
 * - Type → formatDonorType (em dash when unset)
 * - Status → engagement label, or "unclassified" (same as StatusBadge fallback)
 * - Tags → semicolon-joined list, or "" when none (UI shows no chips)
 */
export function exportDonorsCsv(donors: DonorProfile[]) {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Type',
    'Lifetime Giving',
    'Donations',
    'Last Donation',
    'Status',
    'Tags',
  ]
  const rows = donors.map((d) => [
    d.name,
    d.email,
    d.phone,
    formatDonorType(d.type),
    d.lifetimeGiving,
    d.donationCount,
    new Date(d.lastDonation).toLocaleDateString('en-IN'),
    formatEngagementStatus(d.engagement),
    (d.tags ?? []).join('; '),
  ])
  downloadCsv('donors-export.csv', headers, rows)
}

export const DONOR_TYPE_OPTIONS: { value: DonorType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'individual', label: 'Individual' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'trust', label: 'Trust' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'international', label: 'International' },
]

export const GIVING_LEVEL_OPTIONS: { value: GivingLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'first-time', label: 'First-time' },
  { value: 'regular', label: 'Regular' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'major', label: 'Major Donor' },
  { value: 'lifetime', label: 'Lifetime Donor' },
]

export const ENGAGEMENT_OPTIONS: { value: EngagementStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Engagement' },
  { value: 'active', label: 'Active' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'vip', label: 'VIP' },
]

export const DONOR_TAG_OPTIONS = [
  'VIP',
  'CSR',
  'Healthcare',
  'Education',
  'MonthlyDonor',
  'HighPotential',
  'MajorDonor',
  'Volunteer',
] as const

export function formatDonorType(type: DonorType | null): string {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : '—'
}

/** Matches DonorsAdminPage StatusBadge fallback (`engagement ?? 'unclassified'`). */
export function formatEngagementStatus(engagement: EngagementStatus | null): string {
  const status = engagement ?? 'unclassified'
  const known = ENGAGEMENT_OPTIONS.find((option) => option.value === status)
  if (known) return known.label
  return status.replace(/[_-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatGivingLevel(level: GivingLevel | null): string {
  if (!level) return '—'
  if (level === 'first-time') return 'First-time'
  if (level === 'major') return 'Major Donor'
  if (level === 'lifetime') return 'Lifetime Donor'
  return level.charAt(0).toUpperCase() + level.slice(1)
}
