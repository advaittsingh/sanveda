import { downloadCsv } from './adminExport'

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

const META_KEY = 'sanveda_testimonial_admin_meta'

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

function readMeta(): TestimonialProfile[] | null {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? (JSON.parse(raw) as TestimonialProfile[]) : null
  } catch {
    return null
  }
}

function writeMeta(items: TestimonialProfile[]) {
  localStorage.setItem(META_KEY, JSON.stringify(items))
}

function buildDemoTestimonials(): TestimonialProfile[] {
  return [
    {
      id: '1', name: 'Rahul Sharma', photo: '/assets/focus-areas/healthcare.jpg',
      designation: 'Donor', organization: '', category: 'donor', categoryLabel: 'Donor',
      rating: 5, title: 'Complete transparency', program: 'Healthcare',
      testimonial: 'Sanveda provided complete transparency and showed me exactly how my donation transformed lives.',
      videoUrl: '', focusArea: 'Healthcare', project: 'Cancer Care', campaign: 'Save Lives',
      status: 'published', featured: true, placements: ['homepage', 'donation_page'],
      date: new Date().toISOString(), sentiment: 'very_positive', sentimentScore: 96,
      donorTotalDonations: 250000, donorSince: '2022',
    },
    {
      id: '2', name: 'Priya Verma', photo: '/assets/focus-areas/education.jpg',
      designation: 'Beneficiary', organization: '', category: 'beneficiary', categoryLabel: 'Beneficiary',
      rating: 5, title: 'Life-changing support', program: 'Education',
      testimonial: 'The scholarship programme gave me a future I never thought possible.',
      videoUrl: '', focusArea: 'Education', project: 'Scholarship Drive', campaign: 'Education Fund',
      status: 'review', featured: false, placements: ['campaign_page'],
      date: new Date().toISOString(), sentiment: 'very_positive', sentimentScore: 98,
      beneficiarySupport: 450000, beneficiaryOutcome: 'Recovered',
    },
    {
      id: '3', name: 'Aman Gupta', photo: '/assets/focus-areas/sports.jpg',
      designation: 'Volunteer', organization: '', category: 'volunteer', categoryLabel: 'Volunteer',
      rating: 5, title: 'Changed my perspective', program: 'Community Outreach',
      testimonial: 'Volunteering at Sanveda changed my perspective on community service.',
      videoUrl: 'https://youtube.com/watch?v=example', videoPlatform: 'youtube',
      focusArea: 'Humanitarian Relief', project: 'Medical Camps', campaign: 'Volunteer Drive',
      status: 'published', featured: true, placements: ['volunteer_page', 'homepage'],
      date: new Date().toISOString(), sentiment: 'positive', sentimentScore: 92,
      volunteerHours: 420, volunteerProjects: 12, videoDuration: '2:45', videoViews: 12400, videoShares: 320,
    },
    {
      id: '4', name: 'ABC Corporation', photo: '/assets/OurImpact-e70006e2.png',
      designation: 'CSR Partner', organization: 'ABC Corp', category: 'csr', categoryLabel: 'CSR Partner',
      rating: 5, title: 'Excellent reporting', program: 'Education',
      testimonial: 'Sanveda provided excellent reporting and transparency for our CSR partnership.',
      videoUrl: '', focusArea: 'Education', project: 'School Infrastructure', campaign: 'CSR Education',
      status: 'published', featured: false, placements: ['about_us'],
      date: new Date().toISOString(), sentiment: 'positive', sentimentScore: 94,
      csrBudget: 5000000,
    },
    {
      id: '5', name: 'Priya Sharma', photo: '/assets/focus-areas/healthcare.jpg',
      designation: 'Cancer Survivor', organization: '', category: 'success_story', categoryLabel: 'Success Story',
      rating: 5, title: 'Patient Story', program: 'Cancer Treatment',
      testimonial: 'From diagnosis to recovery — Sanveda stood with my family every step of the way.',
      videoUrl: 'https://vimeo.com/example', videoPlatform: 'vimeo',
      focusArea: 'Healthcare', project: 'Cancer Care', campaign: 'Save Lives',
      status: 'featured', featured: true, placements: ['homepage', 'campaign_page', 'donation_page'],
      date: new Date().toISOString(), sentiment: 'very_positive', sentimentScore: 99,
      beneficiarySupport: 450000, beneficiaryOutcome: 'Recovered',
      videoDuration: '4:12', videoViews: 45200, videoShares: 890,
    },
  ]
}

export async function getTestimonialDashboardData(): Promise<TestimonialDashboardData> {
  const stored = readMeta()
  const testimonials = stored ?? buildDemoTestimonials()

  const published = testimonials.filter((t) => t.status === 'published' || t.status === 'featured').length
  const pendingReview = testimonials.filter((t) => t.status === 'submitted' || t.status === 'review').length
  const featured = testimonials.filter((t) => t.featured).length
  const videoTestimonials = testimonials.filter((t) => t.videoUrl).length
  const avgRating = testimonials.reduce((s, t) => s + t.rating, 0) / (testimonials.length || 1)

  return {
    testimonials,
    kpis: {
      totalTestimonials: Math.max(testimonials.length, 428),
      published: Math.max(published, 312),
      pendingReview: Math.max(pendingReview, 42),
      featured: Math.max(featured, 24),
      videoTestimonials: Math.max(videoTestimonials, 56),
      avgRating: Math.round(avgRating * 10) / 10 || 4.8,
    },
    socialProof: {
      averageRating: 4.9,
      totalTestimonials: Math.max(testimonials.length, 428),
      videoViews: 245000,
      shares: 12000,
      sentimentScore: 94,
    },
    categoryDistribution: [
      { label: 'Donors', value: 35, pct: 35 },
      { label: 'Beneficiaries', value: 30, pct: 30 },
      { label: 'Volunteers', value: 20, pct: 20 },
      { label: 'CSR', value: 15, pct: 15 },
    ],
    ratingDistribution: [
      { label: '★★★★★', value: 82, pct: 82 },
      { label: '★★★★', value: 15, pct: 15 },
      { label: '★★★', value: 3, pct: 3 },
    ],
    aiInsights: [
      { id: 'beneficiary', message: 'Beneficiary testimonials have the highest donor conversion.', tone: 'success' as const },
      { id: 'video', message: 'Video testimonials outperform text by 4x.', tone: 'success' as const },
      { id: 'healthcare', message: 'Healthcare stories receive the most engagement.', tone: 'info' as const },
      { id: 'featured', message: '12 testimonials should be featured on the homepage.', tone: 'warning' as const },
      { id: 'volunteer', message: 'Volunteer stories drive recruitment.', tone: 'info' as const },
    ],
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
  const all = readMeta() ?? buildDemoTestimonials()
  const category = input.category ?? 'donor'
  const record: TestimonialProfile = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    photo: input.photo ?? '/assets/focus-areas/healthcare.jpg',
    designation: input.designation ?? '',
    organization: input.organization ?? '',
    category,
    categoryLabel: CATEGORY_LABEL[category],
    rating: input.rating ?? 5,
    title: input.title ?? '',
    testimonial: input.testimonial ?? '',
    videoUrl: input.videoUrl ?? '',
    videoPlatform: input.videoPlatform,
    focusArea: input.focusArea ?? 'Healthcare',
    project: input.project ?? '',
    campaign: input.campaign ?? '',
    program: input.program ?? input.focusArea ?? 'General',
    status: input.status ?? 'submitted',
    featured: input.featured ?? false,
    placements: input.placements ?? [],
    date: input.date ?? new Date().toISOString(),
    sentiment: input.sentiment ?? 'positive',
    sentimentScore: input.sentimentScore ?? 90,
    donorTotalDonations: input.donorTotalDonations,
    donorSince: input.donorSince,
    beneficiarySupport: input.beneficiarySupport,
    beneficiaryOutcome: input.beneficiaryOutcome,
    volunteerHours: input.volunteerHours,
    volunteerProjects: input.volunteerProjects,
    csrBudget: input.csrBudget,
    videoDuration: input.videoDuration,
    videoViews: input.videoViews,
    videoShares: input.videoShares,
  }

  const index = all.findIndex((t) => t.id === record.id)
  if (index >= 0) all[index] = { ...all[index], ...record }
  else all.unshift(record)
  writeMeta(all)
  return record
}

export async function deleteTestimonial(id: string): Promise<void> {
  const all = readMeta() ?? buildDemoTestimonials()
  writeMeta(all.filter((t) => t.id !== id))
}

export function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating))
}

export function formatRatingDisplay(rating: number): string {
  return `${rating}/5`
}
