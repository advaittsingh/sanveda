import type { BlogPost, Campaign, CMSItem, MonthlyDonation } from '../types'
import { fetchPublishedBlogs } from '../lib/blogService'
import { loadCampaigns, filterCampaigns } from '../lib/campaignService'
import { dataApi } from '../lib/dataApiClient'

export async function fetchCMS(): Promise<CMSItem[]> {
  const [{ data: pages, error: pagesError }, { data: sections, error: sectionsError }, { data: testimonials, error: testimonialsError }] =
    await Promise.all([
      dataApi.publicTable('cms_pages').select('id, slug').eq('status', 'published'),
      dataApi.publicTable('cms_sections').select('*').eq('is_enabled', true).order('sort_order'),
      dataApi.publicTable('testimonials').select('*').eq('status', 'published').order('sort_order'),
    ])
  if (pagesError) throw new Error(pagesError.message)
  if (sectionsError) throw new Error(sectionsError.message)
  if (testimonialsError) throw new Error(testimonialsError.message)

  const pageById = new Map((pages ?? []).map((page) => [String(page.id), String(page.slug)]))
  const result: CMSItem[] = (sections ?? []).map((row, index) => {
    const content = row.content && typeof row.content === 'object'
      ? row.content as Omit<CMSItem, 'id'>
      : {}
    return {
      ...content,
      id: index + 1,
      section: String(row.key),
      page: row.page_id ? pageById.get(String(row.page_id)) : undefined,
    }
  })

  if (testimonials?.length) {
    result.push({
      id: result.length + 1,
      section: 'Testimonial',
      relatedCMS: testimonials.map((row, index) => ({
        id: index + 1,
        title: String(row.name),
        sub_title: row.designation ? String(row.designation) : undefined,
        description: String(row.quote),
        image: row.photo_url ? String(row.photo_url) : undefined,
        status: true,
      })),
    })
  }
  return result
}

export function getCMSSection(sections: CMSItem[], name: string): CMSItem | undefined {
  return sections.find((s) => s.section === name)
}

export function getCMSSectionById(sections: CMSItem[], id: number): CMSItem | undefined {
  return sections.find((s) => s.id === id)
}

export async function fetchMonthlyDonations(): Promise<MonthlyDonation[]> {
  try {
    const campaigns = await fetchCampaigns({ limit: 8 })
    return campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      slug: campaign.redirects?.[0]?.primary_url,
      thumbnail_image: campaign.thumbnail_image,
      banner_image: campaign.banner_image,
      monthly_image_carousel: [campaign.thumbnail_image, campaign.banner_image].filter(
        (value): value is string => Boolean(value),
      ),
      goal: campaign.goal,
      raised: campaign.raised,
      total_donors: campaign.total_donors,
      exemption_tag: campaign.exemption_tag,
      description: campaign.description,
    }))
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

async function loadSanvedaCampaigns(): Promise<Campaign[]> {
  return loadCampaigns()
}

export async function fetchCampaigns(params?: Record<string, string | number>): Promise<Campaign[]> {
  const campaigns = await loadSanvedaCampaigns()
  return filterCampaigns(campaigns, params)
}

export async function fetchCampaignBySlug(slug: string): Promise<Campaign | null> {
  const campaigns = await loadSanvedaCampaigns()
  return campaigns.find((c) => getCampaignSlug(c) === slug) ?? null
}

export async function fetchFeaturedCampaigns(): Promise<Campaign[]> {
  return fetchCampaigns({ featuredCampaign: 1, limit: 8 })
}

export async function fetchRecentCampaigns(): Promise<Campaign[]> {
  return fetchCampaigns({ featureRecentCampaign: 1, limit: 8 })
}

export async function fetchBlogs(): Promise<BlogPost[]> {
  return fetchPublishedBlogs()
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
    const { data, error } = await dataApi
      .publicTable('donations')
      .select('id,amount,is_anonymous,donor_name,created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw new Error(error.message)
    const rows = data ?? []
    const transactions: RecentTransaction[] = rows.map((row, index) => ({
      id: Number(row.id) || index + 1,
      amount: Number(row.amount ?? 0),
      username: row.is_anonymous ? 'Anonymous' : String(row.donor_name ?? 'Kind donor'),
      profile_picture: null,
      createdAt: String(row.created_at ?? new Date().toISOString()),
    }))
    const totalAmount = transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    return { data: transactions, totalAmount }
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
