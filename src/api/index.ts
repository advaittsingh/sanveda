import axios from 'axios'
import type { BlogPost, Campaign, CMSItem, MonthlyDonation } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

export async function fetchCMS(): Promise<CMSItem[]> {
  try {
    const { data } = await api.get<{ data: CMSItem[] }>('/cms')
    return data.data ?? []
  } catch {
    const res = await fetch('/cms-fallback.json')
    const data = await res.json()
    return data.data ?? []
  }
}

export function getCMSSection(sections: CMSItem[], name: string): CMSItem | undefined {
  return sections.find((s) => s.section === name)
}

export function getCMSSectionById(sections: CMSItem[], id: number): CMSItem | undefined {
  return sections.find((s) => s.id === id)
}

export async function fetchMonthlyDonations(): Promise<MonthlyDonation[]> {
  try {
    const { data } = await api.get<MonthlyDonation[] | { data: MonthlyDonation[] }>('/monthly-donations')
    if (Array.isArray(data)) return data
    return data.data ?? []
  } catch {
    return []
  }
}

export function getMonthlyDonationImage(item: MonthlyDonation): string {
  const carousel = item.monthly_image_carousel
  if (Array.isArray(carousel) && carousel.length > 0) return carousel[0]
  return item.thumbnail_image || item.banner_image || ''
}

export function getMonthlyDonorsCount(item: MonthlyDonation): number {
  return item.totalDonors ?? item.total_donors ?? 0
}

export function getCMSByPage(sections: CMSItem[], page: string): CMSItem | undefined {
  const target = page.toLowerCase()
  return sections.find((s) => (s.page ?? '').toLowerCase() === target)
}

export async function fetchCampaigns(params?: Record<string, string | number>): Promise<Campaign[]> {
  try {
    const { data } = await api.get<{ data: Campaign[] }>('/campaigns', { params })
    return data.data ?? []
  } catch {
    const res = await fetch('/campaigns-fallback.json')
    const data = await res.json()
    return data.data ?? []
  }
}

export async function fetchCampaignBySlug(slug: string): Promise<Campaign | null> {
  try {
    const { data } = await api.get<{ data: Campaign }>(`/campaigns/slug/${encodeURIComponent(slug)}`)
    return data.data ?? null
  } catch {
    return null
  }
}

export async function fetchFeaturedCampaigns(): Promise<Campaign[]> {
  return fetchCampaigns({ FeatureUrgentCampaign: 1, limit: 8 })
}

export async function fetchRecentCampaigns(): Promise<Campaign[]> {
  return fetchCampaigns({ featureRecentCampaign: 1, limit: 8 })
}

export async function fetchBlogs(): Promise<BlogPost[]> {
  try {
    const { data } = await api.get<BlogPost[]>('/blog')
    const blogs = Array.isArray(data) ? data.filter((b) => b.status === 1 || b.status === undefined) : []
    if (blogs.length) return blogs
  } catch {
    /* fall through to static fallback */
  }
  try {
    const res = await fetch('/blogs-fallback.json')
    const data = await res.json()
    return Array.isArray(data) ? data : data.data ?? []
  } catch {
    return []
  }
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    const n = amount / 10000000
    return `₹${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)} Cr`
  }
  if (amount >= 100000) {
    const n = amount / 100000
    return `₹${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}L`
  }
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function getCampaignSlug(campaign: Campaign): string {
  return campaign.redirects?.[0]?.primary_url ?? `campaign-${campaign.id}`
}

export interface RecentTransaction {
  id: number
  amount: string | number
  username: string
  profile_picture?: string | null
  createdAt: string
}

export async function fetchRecentTransactions(): Promise<{ data: RecentTransaction[]; totalAmount: number }> {
  try {
    const { data } = await api.get<{ data: RecentTransaction[]; totalAmount?: number }>('/recent-transactions')
    return { data: data.data ?? [], totalAmount: data.totalAmount ?? 0 }
  } catch {
    return { data: [], totalAmount: 0 }
  }
}

export function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return 'Just now'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins === 1) return '1min ago'
  if (mins < 60) return `${mins}min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs === 1) return '1hr ago'
  if (hrs < 24) return `${hrs}hr ago`
  const days = Math.floor(hrs / 24)
  return days === 1 ? '1day ago' : `${days}days ago`
}
