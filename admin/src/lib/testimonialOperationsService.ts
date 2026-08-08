import { downloadCsv } from './adminExport'
import { dataApi } from './dataApiClient'

export type TestimonialTab =
  | 'dashboard'
  | 'testimonials'
  | 'video'
  | 'featured'
  | 'categories'
  | 'reviews'
  | 'publishing'
  | 'analytics'

export type TestimonialCategory =
  | 'donor'
  | 'volunteer'
  | 'beneficiary'
  | 'member'
  | 'intern'
  | 'csr'
  | 'celebrity'
  | 'medical_partner'
  | 'event'
  | 'success_story'

export type TestimonialStatus = 'submitted' | 'review' | 'approved' | 'published' | 'featured' | 'archived'

export type Sentiment = 'positive' | 'very_positive' | 'neutral' | 'negative' | 'critical'

export type VideoPlatform = 'youtube' | 'vimeo' | 'upload' | 'instagram'

export type WebsitePlacement =
  | 'homepage'
  | 'campaign_page'
  | 'donation_page'
  | 'volunteer_page'
  | 'membership_page'
  | 'about_us'
  | 'project_pages'

export interface TestimonialProfile {
  id: string
  name: string
  photo: string
  designation: string
  organization: string
  category: TestimonialCategory
  categoryLabel: string
  rating: number
  title: string
  testimonial: string
  videoUrl: string
  videoPlatform?: VideoPlatform
  focusArea: string
  project: string
  campaign: string
  program: string
  status: TestimonialStatus
  featured: boolean
  placements: WebsitePlacement[]
  date: string
  sentiment: Sentiment
  sentimentScore: number
  donorTotalDonations?: number
  donorSince?: string
  beneficiarySupport?: number
  beneficiaryOutcome?: string
  volunteerHours?: number
  volunteerProjects?: number
  csrBudget?: number
  videoDuration?: string
  videoViews?: number
  videoShares?: number
}

export interface TestimonialFilters {
  search: string
  category: TestimonialCategory | 'all'
  status: TestimonialStatus | 'all'
  featured: 'all' | 'yes' | 'no'
}

export interface TestimonialDashboardData {
  testimonials: TestimonialProfile[]
  kpis: {
    totalTestimonials: number
    published: number
    pendingReview: number
    featured: number
    videoTestimonials: number
    avgRating: number
  }
  socialProof: {
    averageRating: number
    totalTestimonials: number
    videoViews: number
    shares: number
    sentimentScore: number
  }
  categoryDistribution: { label: string; value: number; pct: number }[]
  ratingDistribution: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

export const TESTIMONIAL_CATEGORIES: { value: TestimonialCategory; label: string }[] = [
  { value: 'donor', label: 'Donor Testimonials' },
  { value: 'volunteer', label: 'Volunteer Testimonials' },
  { value: 'beneficiary', label: 'Beneficiary Testimonials' },
  { value: 'member', label: 'Member Testimonials' },
  { value: 'intern', label: 'Intern Testimonials' },
  { value: 'csr', label: 'CSR Partner Testimonials' },
  { value: 'celebrity', label: 'Celebrity Endorsements' },
  { value: 'medical_partner', label: 'Medical Partner Testimonials' },
  { value: 'event', label: 'Event Testimonials' },
  { value: 'success_story', label: 'Success Stories' },
]

export const TESTIMONIAL_TABS: { value: TestimonialTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'video', label: 'Video Testimonials' },
  { value: 'featured', label: 'Featured Stories' },
  { value: 'categories', label: 'Categories' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'publishing', label: 'Publishing' },
  { value: 'analytics', label: 'Analytics' },
]

export const WORKFLOW_STEPS: TestimonialStatus[] = ['submitted', 'review', 'approved', 'published', 'featured']

export const PLACEMENT_LABELS: Record<WebsitePlacement, string> = {
  homepage: 'Homepage',
  campaign_page: 'Campaign Page',
  donation_page: 'Donation Page',
  volunteer_page: 'Volunteer Page',
  membership_page: 'Membership Page',
  about_us: 'About Us',
  project_pages: 'Project Pages',
}

const CATEGORY_LABEL = Object.fromEntries(TESTIMONIAL_CATEGORIES.map((c) => [c.value, c.label])) as Record<TestimonialCategory, string>

function rowToTestimonial(row: Record<string, unknown>): TestimonialProfile {
  const category = (row.category || 'donor') as TestimonialCategory
  return {
    id: String(row.id),
    name: String(row.name),
    photo: row.photo_url ? String(row.photo_url) : '',
    designation: row.designation ? String(row.designation) : '',
    organization: '',
    category,
    categoryLabel: CATEGORY_LABEL[category] ?? category,
    rating: Number(row.rating ?? 0),
    title: '',
    testimonial: String(row.quote),
    videoUrl: '',
    focusArea: '',
    project: '',
    campaign: '',
    program: '',
    status: row.is_featured && row.status === 'published' ? 'featured' : row.status as TestimonialStatus,
    featured: Boolean(row.is_featured),
    placements: [],
    date: String(row.created_at),
    sentiment: 'neutral',
    sentimentScore: 0,
  }
}

export async function getTestimonialDashboardData(): Promise<TestimonialDashboardData> {
  const { data, error } = await dataApi.table('testimonials').select('*').order('sort_order')
  if (error) throw new Error(error.message)
  const testimonials = (data ?? []).map(rowToTestimonial)

  const published = testimonials.filter((t) => t.status === 'published' || t.status === 'featured').length
  const pendingReview = testimonials.filter((t) => t.status === 'submitted' || t.status === 'review').length
  const featured = testimonials.filter((t) => t.featured).length
  const videoTestimonials = testimonials.filter((t) => t.videoUrl).length
  const avgRating = testimonials.length
    ? testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length
    : 0

  const totalViews = testimonials.reduce((s, t) => s + (t.videoViews ?? 0), 0)
  const totalShares = testimonials.reduce((s, t) => s + (t.videoShares ?? 0), 0)

  return {
    testimonials,
    kpis: {
      totalTestimonials: testimonials.length,
      published,
      pendingReview,
      featured,
      videoTestimonials,
      avgRating: Math.round(avgRating * 10) / 10,
    },
    socialProof: {
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : 0,
      totalTestimonials: testimonials.length,
      videoViews: totalViews,
      shares: totalShares,
      sentimentScore: testimonials.length
        ? Math.round(testimonials.reduce((s, t) => s + (t.sentimentScore ?? 0), 0) / testimonials.length)
        : 0,
    },
    categoryDistribution: [...new Map(testimonials.map((t) => [t.categoryLabel, 0])).keys()].map((label) => {
      const value = testimonials.filter((t) => t.categoryLabel === label).length
      return { label, value, pct: testimonials.length ? Math.round((value / testimonials.length) * 100) : 0 }
    }),
    ratingDistribution: [5, 4, 3, 2, 1].map((rating) => {
      const value = testimonials.filter((t) => t.rating === rating).length
      return { label: '★'.repeat(rating), value, pct: testimonials.length ? Math.round((value / testimonials.length) * 100) : 0 }
    }),
    aiInsights: testimonials.length === 0
      ? [{ id: 'empty', message: 'No testimonials yet. Add your first verified story from the Testimonials tab.', tone: 'info' as const }]
      : [],
  }
}

export function filterTestimonials(items: TestimonialProfile[], filters: TestimonialFilters): TestimonialProfile[] {
  return items.filter((t) => {
    if (filters.category !== 'all' && t.category !== filters.category) return false
    if (filters.status !== 'all' && t.status !== filters.status) return false
    if (filters.featured === 'yes' && !t.featured) return false
    if (filters.featured === 'no' && t.featured) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        t.name.toLowerCase().includes(q) ||
        t.program.toLowerCase().includes(q) ||
        t.testimonial.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export function exportTestimonialsCsv(items: TestimonialProfile[]) {
  downloadCsv(
    'testimonials.csv',
    ['Name', 'Type', 'Rating', 'Program', 'Status', 'Featured'],
    items.map((t) => [t.name, t.categoryLabel, t.rating, t.program, t.status, t.featured ? 'Yes' : 'No']),
  )
}

export async function saveTestimonial(input: Partial<TestimonialProfile> & { name: string }): Promise<TestimonialProfile> {
  const category = input.category ?? 'donor'
  const canonicalStatus =
    input.status === 'published' || input.status === 'featured' ? 'published'
      : input.status === 'review' ? 'review'
        : input.status === 'archived' ? 'archived'
          : 'draft'
  const row = {
    name: input.name,
    photo_url: input.photo || null,
    designation: input.designation || null,
    category,
    rating: input.rating ?? null,
    quote: input.testimonial ?? '',
    status: canonicalStatus,
    is_featured: input.featured ?? input.status === 'featured',
    updated_at: new Date().toISOString(),
  }
  const query = input.id
    ? dataApi.table('testimonials').update(row).eq('id', input.id)
    : dataApi.table('testimonials').insert(row)
  const { data, error } = await query.select().single()
  if (error) throw new Error(error.message)
  return rowToTestimonial(data)
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await dataApi.table('testimonials').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating))
}

export function formatRatingDisplay(rating: number): string {
  return `${rating}/5`
}
