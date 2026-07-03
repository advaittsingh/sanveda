import { readPersistedMetaMap, writePersistedMetaMap } from './persistMeta'
import { downloadCsv } from './adminExport'

export type CmsTab =
  | 'dashboard'
  | 'pages'
  | 'homepage'
  | 'navigation'
  | 'hero_banners'
  | 'sections'
  | 'footer'
  | 'forms'
  | 'testimonials'
  | 'announcements'
  | 'analytics'
  | 'seo'
  | 'menus'
  | 'redirects'
  | 'settings'

export type PageStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived'

export interface WebsitePage {
  id: string
  title: string
  url: string
  status: PageStatus
  lastUpdated: string
  metaTitle?: string
  metaDescription?: string
}

export interface HomepageSection {
  id: string
  label: string
  type: string
  enabled: boolean
  order: number
}

export interface HeroBanner {
  id: string
  title: string
  subtitle: string
  image: string
  buttonText: string
  buttonUrl: string
  status: 'published' | 'draft'
}

export interface NavLink {
  id: string
  label: string
  url: string
  group: 'main' | 'footer' | 'quick' | 'mobile' | 'social'
}

export interface LiveStatistic {
  id: string
  label: string
  value: string
}

export interface CmsTestimonial {
  id: string
  name: string
  designation: string
  photo: string
  quote: string
  rating: number
  category: string
  featured: boolean
}

export interface FocusAreaCms {
  id: string
  title: string
  description: string
  image: string
  projects: number
  campaigns: number
  beneficiaries: number
}

export interface CmsForm {
  id: string
  name: string
  fields: string[]
  submissions: number
}

export interface AnnouncementBar {
  id: string
  message: string
  ctaText: string
  ctaUrl: string
  startDate: string
  endDate: string
  priority: number
  active: boolean
}

export interface UrlRedirect {
  id: string
  oldUrl: string
  newUrl: string
}

export interface SectionBlock {
  id: string
  name: string
  type: string
  reusable: boolean
}

export interface CmsDashboardData {
  pages: WebsitePage[]
  homepageSections: HomepageSection[]
  heroBanners: HeroBanner[]
  navigation: NavLink[]
  statistics: LiveStatistic[]
  testimonials: CmsTestimonial[]
  focusAreas: FocusAreaCms[]
  forms: CmsForm[]
  announcements: AnnouncementBar[]
  redirects: UrlRedirect[]
  sectionBlocks: SectionBlock[]
  footer: {
    aboutText: string
    address: string
    phone: string
    email: string
    policies: string[]
  }
  kpis: {
    websitePages: number
    homepageSections: number
    publishedContent: number
    draftContent: number
    activeBanners: number
    lastPublished: string
  }
  analytics: {
    visitors: number
    pageViews: number
    bounceRate: number
    donationConversion: number
    topPages: string[]
  }
  trafficTrend: { label: string; value: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

export const CMS_TABS: { value: CmsTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'pages', label: 'Pages' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'hero_banners', label: 'Hero Banners' },
  { value: 'sections', label: 'Sections' },
  { value: 'footer', label: 'Footer' },
  { value: 'forms', label: 'Forms' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'seo', label: 'SEO' },
  { value: 'menus', label: 'Menus' },
  { value: 'redirects', label: 'Redirects' },
  { value: 'settings', label: 'Settings' },
]

export const HOMEPAGE_SECTION_LABELS = [
  'Hero Banner', 'Statistics', 'Featured Campaigns', 'Focus Areas', 'Impact Numbers',
  'Testimonials', 'Volunteer CTA', 'Blogs', 'Partners', 'Footer',
] as const

export const SECTION_BLOCK_TYPES = [
  'Hero Section', 'Cards Section', 'Statistics Section', 'Testimonials',
  'Image Gallery', 'Video Section', 'CTA Section', 'Timeline', 'FAQ',
  'Accordion', 'Impact Counter', 'Partner Logos',
] as const

export const FORM_FIELD_TYPES = [
  'Text', 'Email', 'Phone', 'Select', 'Radio', 'Checkbox', 'Upload', 'Date', 'Textarea',
] as const

export const WORKFLOW_STEPS: PageStatus[] = ['draft', 'review', 'approved', 'scheduled', 'published', 'archived']

const META_KEY = 'sanveda_cms_admin_meta'

function readMeta(): Record<string, unknown> {
  return readPersistedMetaMap(META_KEY) as Record<string, unknown>
}

function writeMeta(data: Record<string, unknown>) {
  writePersistedMetaMap(META_KEY, data as Record<string, Record<string, unknown>>)
}

function buildPages(): WebsitePage[] {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 86400000).toISOString()
  const lastWeek = new Date(now.getTime() - 7 * 86400000).toISOString()
  return [
    { id: '1', title: 'Home', url: '/', status: 'published', lastUpdated: now.toISOString() },
    { id: '2', title: 'About', url: '/about', status: 'published', lastUpdated: yesterday },
    { id: '3', title: 'Donate', url: '/donate', status: 'published', lastUpdated: now.toISOString() },
    { id: '4', title: 'Volunteer', url: '/volunteer', status: 'draft', lastUpdated: now.toISOString() },
    { id: '5', title: 'Membership', url: '/membership', status: 'published', lastUpdated: lastWeek },
    { id: '6', title: 'Campaigns', url: '/campaigns', status: 'published', lastUpdated: yesterday },
    { id: '7', title: 'Blogs', url: '/blogs', status: 'published', lastUpdated: yesterday },
    { id: '8', title: 'Contact', url: '/contact', status: 'published', lastUpdated: lastWeek },
  ]
}

function buildHomepageSections(): HomepageSection[] {
  return HOMEPAGE_SECTION_LABELS.map((label, i) => ({
    id: String(i + 1),
    label,
    type: label.toLowerCase().replace(/\s+/g, '_'),
    enabled: true,
    order: i + 1,
  }))
}

export async function getCmsDashboardData(): Promise<CmsDashboardData> {
  const meta = readMeta()
  const storedSections = meta.homepageSections as HomepageSection[] | undefined

  return {
    pages: buildPages(),
    homepageSections: storedSections ?? buildHomepageSections(),
    heroBanners: [
      {
        id: '1', title: 'Transform Lives', subtitle: 'Support healthcare initiatives',
        image: '/assets/hero-banner.jpg', buttonText: 'Donate Now', buttonUrl: '/donate', status: 'published',
      },
      {
        id: '2', title: 'Education for Every Child', subtitle: 'Scholarships that change futures',
        image: '/assets/focus-areas/education.jpg', buttonText: 'Learn More', buttonUrl: '/campaigns', status: 'draft',
      },
    ],
    navigation: [
      { id: '1', label: 'Home', url: '/', group: 'main' },
      { id: '2', label: 'Explore Campaigns', url: '/campaigns', group: 'main' },
      { id: '3', label: 'Monthly Giving', url: '/monthly-donation', group: 'main' },
      { id: '4', label: 'Blogs', url: '/blogs', group: 'main' },
      { id: '5', label: 'Volunteer', url: '/volunteer', group: 'main' },
      { id: '6', label: 'Internship', url: '/internship', group: 'main' },
      { id: '7', label: 'Events', url: '/events', group: 'main' },
      { id: '8', label: 'Gallery', url: '/gallery', group: 'main' },
      { id: '9', label: 'Membership', url: '/membership', group: 'main' },
      { id: '10', label: 'Contact', url: '/contact', group: 'main' },
      { id: '11', label: 'Facebook', url: 'https://facebook.com', group: 'social' },
      { id: '12', label: 'Instagram', url: 'https://instagram.com', group: 'social' },
      { id: '13', label: 'Privacy Policy', url: '/privacy', group: 'footer' },
      { id: '14', label: 'Terms', url: '/terms', group: 'footer' },
    ],
    statistics: [
      { id: '1', label: 'Campaigns', value: '324' },
      { id: '2', label: 'Donors', value: '45,000' },
      { id: '3', label: 'Beneficiaries', value: '120,000' },
      { id: '4', label: 'Volunteers', value: '2,300' },
    ],
    testimonials: [
      {
        id: '1', name: 'Rahul Sharma', designation: 'Donor', photo: '/assets/focus-areas/healthcare.jpg',
        quote: 'Sanveda changed lives in my community.', rating: 5, category: 'Donor', featured: true,
      },
      {
        id: '2', name: 'Priya Mehta', designation: 'Volunteer', photo: '/assets/focus-areas/education.jpg',
        quote: 'Volunteering here gave my life purpose.', rating: 5, category: 'Volunteer', featured: false,
      },
    ],
    focusAreas: [
      { id: '1', title: 'Healthcare', description: 'Medical camps and cancer care programmes', image: '/assets/focus-areas/healthcare.jpg', projects: 12, campaigns: 8, beneficiaries: 5420 },
      { id: '2', title: 'Education', description: 'Scholarships and school infrastructure', image: '/assets/focus-areas/education.jpg', projects: 8, campaigns: 6, beneficiaries: 3200 },
      { id: '3', title: 'Sports', description: 'Youth development through sports', image: '/assets/focus-areas/sports.jpg', projects: 5, campaigns: 4, beneficiaries: 1800 },
      { id: '4', title: 'Humanitarian Relief', description: 'Disaster response and emergency aid', image: '/assets/OurImpact-e70006e2.png', projects: 6, campaigns: 5, beneficiaries: 8500 },
      { id: '5', title: 'Community Development', description: 'Livelihood and rural empowerment', image: '/assets/hero-banner.jpg', projects: 4, campaigns: 3, beneficiaries: 2100 },
      { id: '6', title: 'Mental Wellness', description: 'Counselling and therapeutic support', image: '/assets/focus-areas/healthcare.jpg', projects: 3, campaigns: 2, beneficiaries: 950 },
    ],
    forms: [
      { id: '1', name: 'Volunteer Form', fields: ['Text', 'Email', 'Phone', 'Textarea'], submissions: 845 },
      { id: '2', name: 'Membership Form', fields: ['Text', 'Email', 'Select', 'Checkbox'], submissions: 420 },
      { id: '3', name: 'Internship Form', fields: ['Text', 'Email', 'Upload', 'Date'], submissions: 312 },
      { id: '4', name: 'Contact Form', fields: ['Text', 'Email', 'Textarea'], submissions: 1240 },
      { id: '5', name: 'Beneficiary Form', fields: ['Text', 'Phone', 'Select', 'Upload'], submissions: 680 },
    ],
    announcements: [
      {
        id: '1', message: '🚨 Flood Relief Campaign Live', ctaText: 'Donate Now', ctaUrl: '/campaigns',
        startDate: '2026-07-01', endDate: '2026-07-31', priority: 1, active: true,
      },
    ],
    redirects: [
      { id: '1', oldUrl: '/old-blog', newUrl: '/blogs/new' },
      { id: '2', oldUrl: '/donation', newUrl: '/campaigns' },
    ],
    sectionBlocks: SECTION_BLOCK_TYPES.map((name, i) => ({
      id: String(i + 1), name, type: name.toLowerCase().replace(/\s+/g, '_'), reusable: true,
    })),
    footer: {
      aboutText: 'Sanveda Global Humanitarian Foundation — transforming lives through healthcare, education, and community support.',
      address: 'New Delhi, India',
      phone: '+91 98765 43210',
      email: 'info@sanveda.org',
      policies: ['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Return Policy'],
    },
    kpis: {
      websitePages: 42,
      homepageSections: 18,
      publishedContent: 325,
      draftContent: 24,
      activeBanners: 8,
      lastPublished: 'Today',
    },
    analytics: {
      visitors: 125000,
      pageViews: 1200000,
      bounceRate: 34,
      donationConversion: 8,
      topPages: ['Healthcare', 'Donate', 'Volunteer', 'Campaigns', 'About'],
    },
    trafficTrend: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
      label,
      value: 15000 + i * 8000 + (label.charCodeAt(0) % 5000),
    })),
    aiInsights: [
      { id: 'healthcare', message: 'Healthcare pages generate the most donations.', tone: 'success' as const },
      { id: 'volunteer', message: 'Volunteer pages have the highest engagement.', tone: 'success' as const },
      { id: 'ctr', message: 'Homepage CTR increased by 18%.', tone: 'success' as const },
      { id: 'seo', message: 'Three pages lack SEO metadata.', tone: 'warning' as const },
      { id: 'mobile', message: 'Mobile conversion rate dropped by 5%.', tone: 'warning' as const },
    ],
  }
}

export function filterPages(pages: WebsitePage[], search: string): WebsitePage[] {
  if (!search.trim()) return pages
  const q = search.toLowerCase()
  return pages.filter((p) => p.title.toLowerCase().includes(q) || p.url.toLowerCase().includes(q))
}

export function exportPagesCsv(pages: WebsitePage[]) {
  downloadCsv(
    'website-pages.csv',
    ['Page', 'URL', 'Status', 'Last Updated'],
    pages.map((p) => [p.title, p.url, p.status, new Date(p.lastUpdated).toLocaleDateString('en-IN')]),
  )
}

export function reorderHomepageSections(sections: HomepageSection[], fromIndex: number, toIndex: number): HomepageSection[] {
  const next = [...sections]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next.map((s, i) => ({ ...s, order: i + 1 }))
}

export function saveHomepageSections(sections: HomepageSection[]) {
  const meta = readMeta()
  meta.homepageSections = sections
  writeMeta(meta)
}

export function toggleHomepageSection(sectionId: string, enabled: boolean) {
  const meta = readMeta()
  const sections = (meta.homepageSections as HomepageSection[] | undefined) ?? buildHomepageSections()
  meta.homepageSections = sections.map((s) => (s.id === sectionId ? { ...s, enabled } : s))
  writeMeta(meta)
}
