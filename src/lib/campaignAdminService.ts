import type { CampaignRecord } from './campaignService'
import type {
  CampaignFilters,
  CampaignHealthLevel,
  CampaignKpis,
  DonationPeriodStats,
} from '../types/campaignAdmin'
import { getAllDonations } from './donationService'

export function parseCategory(cat: CampaignRecord['category']): string {
  if (!cat) return 'General'
  if (Array.isArray(cat)) return cat[0] ?? 'General'
  try {
    const parsed = JSON.parse(cat)
    return Array.isArray(parsed) ? String(parsed[0]) : String(cat)
  } catch {
    return String(cat)
  }
}

export function normalizeStatus(status: string): string {
  if (status === 'active') return 'published'
  if (status === 'pending') return 'review'
  if (status === 'closed') return 'completed'
  return status
}

export function campaignProgress(raised: number, goal: number): number {
  if (!goal) return 0
  return Math.min(100, Math.round((raised / goal) * 100))
}

export function getDaysLeft(campaign: CampaignRecord): number {
  const end = campaign.meta?.endDate
  if (!end) return 30
  const diff = new Date(end).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

export function getCampaignHealth(campaign: CampaignRecord): CampaignHealthLevel {
  const pct = campaignProgress(campaign.raised, campaign.goal)
  const daysLeft = getDaysLeft(campaign)
  const donors = campaign.total_donors ?? 0

  if (pct >= 50 || (pct >= 35 && daysLeft > 14)) return 'good'
  if (pct >= 20 || donors >= 10 || daysLeft > 7) return 'warning'
  return 'critical'
}

export function healthLabel(level: CampaignHealthLevel): { emoji: string; label: string; cls: string } {
  if (level === 'good') return { emoji: '🟢', label: 'Performing Well', cls: 'text-emerald-700' }
  if (level === 'warning') return { emoji: '🟡', label: 'Needs Promotion', cls: 'text-amber-700' }
  return { emoji: '🔴', label: 'Critical', cls: 'text-red-700' }
}

export function computeCampaignKpis(campaigns: CampaignRecord[]): CampaignKpis {
  const isActive = (s: string) => ['published', 'active', 'approved'].includes(s)
  const isPending = (s: string) => ['review', 'pending', 'approved'].includes(s)
  const isCompleted = (s: string) => ['completed', 'closed', 'archived'].includes(s)
  const isDraft = (s: string) => s === 'draft'

  return {
    active: campaigns.filter((c) => isActive(c.status)).length,
    pendingApproval: campaigns.filter((c) => isPending(c.status) && c.status !== 'approved').length,
    completed: campaigns.filter((c) => isCompleted(c.status)).length,
    drafts: campaigns.filter((c) => isDraft(c.status)).length,
    totalRaised: campaigns.reduce((s, c) => s + c.raised, 0),
    totalDonors: campaigns.reduce((s, c) => s + (c.total_donors ?? 0), 0),
  }
}

export function filterCampaigns(campaigns: CampaignRecord[], filters: CampaignFilters): CampaignRecord[] {
  let list = [...campaigns]
  const q = filters.query.trim().toLowerCase()

  if (q) {
    list = list.filter((c) => {
      const category = parseCategory(c.category).toLowerCase()
      const beneficiary = c.meta?.beneficiary?.name?.toLowerCase() ?? ''
      return (
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        category.includes(q) ||
        beneficiary.includes(q) ||
        (c.meta?.focusArea?.toLowerCase().includes(q) ?? false)
      )
    })
  }

  if (filters.category !== 'all') {
    list = list.filter((c) => parseCategory(c.category) === filters.category)
  }

  if (filters.status !== 'all') {
    list = list.filter((c) => normalizeStatus(c.status) === filters.status || c.status === filters.status)
  }

  if (filters.focusArea !== 'all') {
    list = list.filter((c) => (c.meta?.focusArea ?? parseCategory(c.category)) === filters.focusArea)
  }

  if (filters.createdBy !== 'all') {
    list = list.filter((c) => (c.meta?.createdBy ?? 'Admin') === filters.createdBy)
  }

  switch (filters.sort) {
    case 'oldest':
      list.sort((a, b) => (a.meta?.createdAt ?? '').localeCompare(b.meta?.createdAt ?? ''))
      break
    case 'raised':
      list.sort((a, b) => b.raised - a.raised)
      break
    case 'goal':
      list.sort((a, b) => b.goal - a.goal)
      break
    case 'progress':
      list.sort((a, b) => campaignProgress(b.raised, b.goal) - campaignProgress(a.raised, a.goal))
      break
    case 'donors':
      list.sort((a, b) => (b.total_donors ?? 0) - (a.total_donors ?? 0))
      break
    default:
      list.sort((a, b) => (b.meta?.createdAt ?? '').localeCompare(a.meta?.createdAt ?? ''))
  }

  return list
}

export function getFilterOptions(campaigns: CampaignRecord[]) {
  const categories = new Set<string>()
  const focusAreas = new Set<string>()
  const creators = new Set<string>()

  campaigns.forEach((c) => {
    categories.add(parseCategory(c.category))
    focusAreas.add(c.meta?.focusArea ?? parseCategory(c.category))
    creators.add(c.meta?.createdBy ?? 'Admin')
  })

  return {
    categories: ['all', ...Array.from(categories).sort()],
    focusAreas: ['all', ...Array.from(focusAreas).sort()],
    creators: ['all', ...Array.from(creators).sort()],
    statuses: ['all', 'draft', 'review', 'approved', 'published', 'paused', 'completed', 'rejected', 'archived'],
    sorts: [
      { value: 'newest', label: 'Newest' },
      { value: 'oldest', label: 'Oldest' },
      { value: 'raised', label: 'Most Raised' },
      { value: 'goal', label: 'Highest Goal' },
      { value: 'progress', label: 'Progress %' },
      { value: 'donors', label: 'Most Donors' },
    ],
  }
}

export async function getDonationPeriodStats(): Promise<DonationPeriodStats> {
  const donations = (await getAllDonations()).filter((d) => d.status === 'completed')
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = new Date(now.getTime() - 7 * 86400000).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  return {
    today: donations.filter((d) => d.createdAt >= startOfDay).reduce((s, d) => s + d.amount, 0),
    thisWeek: donations.filter((d) => d.createdAt >= startOfWeek).reduce((s, d) => s + d.amount, 0),
    thisMonth: donations.filter((d) => d.createdAt >= startOfMonth).reduce((s, d) => s + d.amount, 0),
  }
}

export function exportCampaignsCsv(campaigns: CampaignRecord[]) {
  const headers = ['Title', 'Slug', 'Category', 'Goal', 'Raised', 'Donors', 'Status', 'Progress %', 'Beneficiary']
  const rows = campaigns.map((c) => [
    c.title,
    c.slug,
    parseCategory(c.category),
    c.goal,
    c.raised,
    c.total_donors ?? 0,
    c.status,
    campaignProgress(c.raised, c.goal),
    c.meta?.beneficiary?.name ?? '',
  ])

  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sanveda-campaigns-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function getPendingCampaigns(campaigns: CampaignRecord[]): CampaignRecord[] {
  return campaigns.filter((c) => ['review', 'pending', 'draft'].includes(c.status))
}
