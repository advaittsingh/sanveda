import { downloadCsv } from './adminExport'
import { getAllDonations, type Donation } from './donationService'
import { formatIndianCompact, formatTrend } from './formatIndian'

const DONOR_META_KEY = 'sanveda_donor_admin_meta'

export type DonorType = 'individual' | 'corporate' | 'trust' | 'foundation' | 'international'
export type GivingLevel = 'first-time' | 'regular' | 'monthly' | 'major' | 'lifetime'
export type EngagementStatus = 'active' | 'dormant' | 'at-risk' | 'vip'

export interface DonorAdminMeta {
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
  type: DonorType
  givingLevel: GivingLevel
  engagement: EngagementStatus
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

function readMetaMap(): Record<string, DonorAdminMeta> {
  try {
    const raw = localStorage.getItem(DONOR_META_KEY)
    return raw ? (JSON.parse(raw) as Record<string, DonorAdminMeta>) : {}
  } catch {
    return {}
  }
}

function writeMetaMap(map: Record<string, DonorAdminMeta>) {
  localStorage.setItem(DONOR_META_KEY, JSON.stringify(map))
}

function readMonthlyEmails(): Set<string> {
  try {
    const raw = localStorage.getItem('sanveda_monthly_giving_subscribers')
    if (!raw) return new Set()
    const subs = JSON.parse(raw) as { donorEmail?: string; status?: string }[]
    return new Set(
      subs.filter((s) => s.status === 'active' && s.donorEmail).map((s) => s.donorEmail!.toLowerCase()),
    )
  } catch {
    return new Set()
  }
}

function inferDonorType(name: string, email: string, meta?: DonorAdminMeta): DonorType {
  if (meta?.type) return meta.type
  const n = name.toLowerCase()
  if (/(foundation|fund)/i.test(n)) return 'foundation'
  if (/trust/i.test(n)) return 'trust'
  if (/(pvt|ltd|llp|inc|corp|private|limited|company)/i.test(n)) return 'corporate'
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  if (domain && !domain.endsWith('.in') && !domain.endsWith('.co.in')) return 'international'
  return 'individual'
}

function inferGivingLevel(
  count: number,
  lifetime: number,
  isMonthly: boolean,
): GivingLevel {
  if (isMonthly) return 'monthly'
  if (lifetime >= 500000 || count >= 15) return 'lifetime'
  if (lifetime >= 100000) return 'major'
  if (count <= 1) return 'first-time'
  return 'regular'
}

function inferEngagement(lastDonation: string, lifetime: number): EngagementStatus {
  const days = Math.floor((Date.now() - new Date(lastDonation).getTime()) / 86400000)
  if (lifetime >= 200000) return 'vip'
  if (days <= 90) return 'active'
  if (days <= 180) return 'dormant'
  return 'at-risk'
}

function inferTags(profile: Omit<DonorProfile, 'tags'> & { tags?: string[] }, meta?: DonorAdminMeta): string[] {
  const tags = new Set(meta?.tags ?? [])
  if (profile.engagement === 'vip') tags.add('VIP')
  if (profile.isMonthly) tags.add('MonthlyDonor')
  if (profile.type === 'corporate') tags.add('CSR')
  if (profile.lifetimeGiving >= 50000 && profile.donationCount >= 3) tags.add('HighPotential')
  if (profile.lifetimeGiving >= 100000) tags.add('MajorDonor')
  return [...tags]
}

function inferPaymentMode(donation: Donation): string {
  if (donation.razorpayPaymentId) return 'UPI'
  return 'Website'
}

function buildTimeline(donations: DonorDonationRecord[]): DonorTimelineEvent[] {
  const events: DonorTimelineEvent[] = []
  for (const d of donations.slice(0, 5)) {
    events.push({ id: `${d.id}-received`, label: 'Donation Received', at: d.date })
    events.push({ id: `${d.id}-thanks`, label: 'Thank You Email Sent', at: d.date })
    if (d.receiptNumber) {
      events.push({ id: `${d.id}-receipt`, label: 'Tax Receipt Generated', at: d.date })
    }
  }
  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8)
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

function computeRetentionScore(count: number, frequencyDays: number | null, engagement: EngagementStatus): number {
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

function buildDonorProfiles(donations: Donation[]): DonorProfile[] {
  const metaMap = readMetaMap()
  const monthlyEmails = readMonthlyEmails()
  const grouped = new Map<string, Donation[]>()

  for (const d of donations.filter((x) => x.status === 'completed' && !x.isAnonymous)) {
    const key = (d.donorEmail ?? d.donorName ?? d.id).toLowerCase()
    const list = grouped.get(key) ?? []
    list.push(d)
    grouped.set(key, list)
  }

  const profiles: DonorProfile[] = []

  for (const [key, list] of grouped) {
    const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const first = sorted[sorted.length - 1]
    const latest = sorted[0]
    const meta = metaMap[key] ?? {}
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
    const isMonthly = monthlyEmails.has(email.toLowerCase())
    const type = inferDonorType(name, email, meta)
    const givingLevel = inferGivingLevel(list.length, lifetimeGiving, isMonthly)
    const engagement = inferEngagement(latest.createdAt, lifetimeGiving)
    const frequencyDays = computeFrequency(list.map((d) => d.createdAt))
    const retentionScore = computeRetentionScore(list.length, frequencyDays, engagement)

    const base = {
      id: key,
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
      engagementScore: engagementScoreLabel(retentionScore),
      isMonthly,
      donations: donationRecords,
      timeline: buildTimeline(donationRecords),
      followUpTasks: meta.followUpTasks ?? defaultFollowUpTasks(engagement),
    }

    profiles.push({ ...base, tags: inferTags(base, meta) })
  }

  return profiles.sort((a, b) => b.lifetimeGiving - a.lifetimeGiving)
}

function defaultFollowUpTasks(engagement: EngagementStatus): string[] {
  if (engagement === 'at-risk') return ['Call donor', 'Send thank-you letter']
  if (engagement === 'vip') return ['Invite to event', 'Schedule meeting']
  if (engagement === 'dormant') return ['Send re-engagement email', 'Call donor']
  return ['Send thank-you letter']
}

function computeKpis(donors: DonorProfile[], donations: Donation[]) {
  const completed = donations.filter((d) => d.status === 'completed')
  const lifetimeGiving = completed.reduce((s, d) => s + d.amount, 0)
  const activeDonors = donors.filter((d) => d.engagement === 'active' || d.engagement === 'vip').length
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

  const upgradeCandidates = donors.filter(
    (d) => !d.isMonthly && d.donationCount >= 2 && d.engagement === 'active',
  ).length

  const recoverable = donors
    .filter((d) => d.engagement === 'at-risk' || d.engagement === 'dormant')
    .reduce((s, d) => s + d.lifetimeGiving * 0.15, 0)

  const vipCandidates = donors.filter(
    (d) => d.engagement !== 'vip' && d.lifetimeGiving >= 100000,
  ).length

  return [
    {
      id: 'dormant',
      message: `${dormant90} donors haven't donated in 90 days`,
      tone: 'warning',
    },
    {
      id: 'upgrade',
      message: `${upgradeCandidates} donors likely to upgrade to monthly giving`,
      tone: 'info',
    },
    {
      id: 'recover',
      message: `${formatIndianCompact(Math.round(recoverable))} can potentially be recovered through follow-up`,
      tone: 'success',
    },
    {
      id: 'vip',
      message: `${vipCandidates} donors qualify for VIP recognition`,
      tone: 'info',
    },
  ]
}

export async function getDonorDashboardData(): Promise<DonorDashboardData> {
  const donations = await getAllDonations()
  const donors = buildDonorProfiles(donations)
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

export function updateDonorMeta(id: string, patch: Partial<DonorAdminMeta>) {
  const map = readMetaMap()
  map[id] = { ...map[id], ...patch }
  writeMetaMap(map)
}

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
    d.type,
    d.lifetimeGiving,
    d.donationCount,
    new Date(d.lastDonation).toLocaleDateString('en-IN'),
    d.engagement,
    d.tags.join('; '),
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

export function formatDonorType(type: DonorType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function formatGivingLevel(level: GivingLevel): string {
  if (level === 'first-time') return 'First-time'
  if (level === 'major') return 'Major Donor'
  if (level === 'lifetime') return 'Lifetime Donor'
  return level.charAt(0).toUpperCase() + level.slice(1)
}
