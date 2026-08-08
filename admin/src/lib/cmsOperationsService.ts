import { downloadCsv } from './adminExport'
import { dataApi } from './dataApiClient'

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
  'Hero Banner',
  'Statistics',
  'Featured Campaigns',
  'Focus Areas',
  'Impact Numbers',
  'Testimonials',
  'Volunteer CTA',
  'Blogs',
  'Partners',
  'Footer',
] as const

export const SECTION_BLOCK_TYPES = [
  'Hero Section',
  'Cards Section',
  'Statistics Section',
  'Testimonials',
  'Image Gallery',
  'Video Section',
  'CTA Section',
  'Timeline',
  'FAQ',
  'Accordion',
  'Impact Counter',
  'Partner Logos',
] as const

export const FORM_FIELD_TYPES = [
  'Text',
  'Email',
  'Phone',
  'Select',
  'Radio',
  'Checkbox',
  'Upload',
  'Date',
  'Textarea',
] as const

export const WORKFLOW_STEPS: PageStatus[] = [
  'draft',
  'review',
  'approved',
  'scheduled',
  'published',
  'archived',
]

export async function getCmsDashboardData(): Promise<CmsDashboardData> {
  const [
    { data: pageRows, error: pageError },
    { data: sectionRows, error: sectionError },
    { data: testimonialRows, error: testimonialError },
  ] = await Promise.all([
    dataApi.table('cms_pages').select('*').order('updated_at', { ascending: false }),
    dataApi.table('cms_sections').select('*').order('sort_order'),
    dataApi.table('testimonials').select('*').order('sort_order'),
  ])
  if (pageError) throw new Error(pageError.message)
  if (sectionError) throw new Error(sectionError.message)
  if (testimonialError) throw new Error(testimonialError.message)
  const pages: WebsitePage[] = (pageRows ?? []).map((row) => {
    const seo = row.seo && typeof row.seo === 'object' ? (row.seo as Record<string, unknown>) : {}
    return {
      id: String(row.id),
      title: String(row.title),
      url: String(row.path),
      status: row.status as PageStatus,
      lastUpdated: String(row.updated_at ?? row.published_at ?? ''),
      metaTitle: seo.title ? String(seo.title) : undefined,
      metaDescription: seo.description ? String(seo.description) : undefined,
    }
  })
  const homepageSections: HomepageSection[] = (sectionRows ?? []).map((row) => ({
    id: String(row.id),
    label: String(row.key),
    type: String(row.section_type),
    enabled: Boolean(row.is_enabled),
    order: Number(row.sort_order),
  }))
  const testimonials: CmsTestimonial[] = (testimonialRows ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    designation: String(row.designation ?? ''),
    photo: String(row.photo_url ?? ''),
    quote: String(row.quote),
    rating: Number(row.rating ?? 0),
    category: String(row.category ?? ''),
    featured: Boolean(row.is_featured),
  }))
  return {
    pages,
    homepageSections,
    heroBanners: [],
    navigation: [],
    statistics: [],
    testimonials,
    focusAreas: [],
    forms: [],
    announcements: [],
    redirects: [],
    sectionBlocks: [],
    footer: {
      aboutText: '',
      address: '',
      phone: '',
      email: '',
      policies: [],
    },
    kpis: {
      websitePages: pages.length,
      homepageSections: homepageSections.filter((section) => section.enabled).length,
      publishedContent: pages.filter((page) => page.status === 'published').length,
      draftContent: pages.filter((page) => page.status === 'draft').length,
      activeBanners: 0,
      lastPublished: pages.find((page) => page.status === 'published')?.lastUpdated ?? '—',
    },
    analytics: { visitors: 0, pageViews: 0, bounceRate: 0, donationConversion: 0, topPages: [] },
    trafficTrend: [],
    aiInsights: [
      {
        id: 'empty',
        message: 'Connect analytics integrations to see website traffic and conversion data.',
        tone: 'info' as const,
      },
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
    pages.map((p) => [
      p.title,
      p.url,
      p.status,
      new Date(p.lastUpdated).toLocaleDateString('en-IN'),
    ]),
  )
}

export function reorderHomepageSections(
  sections: HomepageSection[],
  fromIndex: number,
  toIndex: number,
): HomepageSection[] {
  const next = [...sections]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next.map((s, i) => ({ ...s, order: i + 1 }))
}

export async function saveHomepageSections(sections: HomepageSection[]) {
  await Promise.all(
    sections.map(async (section) => {
      const { error } = await dataApi
        .table('cms_sections')
        .update({
          is_enabled: section.enabled,
          sort_order: section.order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', section.id)
      if (error) throw new Error(error.message)
    }),
  )
}

export async function toggleHomepageSection(sectionId: string, enabled: boolean) {
  const { error } = await dataApi
    .table('cms_sections')
    .update({
      is_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sectionId)
  if (error) throw new Error(error.message)
}
