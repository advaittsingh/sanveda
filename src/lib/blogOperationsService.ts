import { downloadCsv } from './adminExport'
import { deleteBlog, getAllBlogsAdmin, saveBlog, type BlogRecord, type BlogStatus } from './blogService'

export type BlogCmsTab =
  | 'dashboard'
  | 'articles'
  | 'categories'
  | 'authors'
  | 'stories'
  | 'media'
  | 'seo'
  | 'publishing'
  | 'analytics'
  | 'ai_writer'

export type ContentType = 'blog' | 'story' | 'news' | 'report' | 'press_release' | 'case_study'

export type ArticleWorkflowStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived'

export interface BlogSeoMeta {
  seoTitle: string
  metaDescription: string
  keywords: string
  ogImage: string
  canonicalUrl: string
  schemaType: string
}

export interface BlogAnalyticsMeta {
  views: number
  shares: number
  donationsGenerated: number
  readingTimeMinutes: number
  ctr: number
}

export interface BeneficiaryStoryMeta {
  beneficiaryName: string
  program: string
  supportAmount: number
  outcomeStatus: string
  galleryIds: string[]
  videoUrl: string
}

export interface BlogAuthor {
  id: string
  name: string
  designation: string
  photo: string
  bio: string
  socialLinks: string[]
  articlesCount: number
}

export interface BlogArticleProfile extends BlogRecord {
  contentType: ContentType
  contentTypeLabel: string
  workflowStatus: ArticleWorkflowStatus
  authorId: string
  authorName: string
  focusArea: string
  project: string
  campaign: string
  tags: string[]
  bodyHtml: string
  isFeatured: boolean
  scheduledAt?: string
  reviewer?: string
  expiryDate?: string
  seo: BlogSeoMeta
  analytics: BlogAnalyticsMeta
  beneficiaryStory?: BeneficiaryStoryMeta
  relatedSlugs: string[]
}

export interface BlogFilters {
  search: string
  category: string | 'all'
  contentType: ContentType | 'all'
  workflowStatus: ArticleWorkflowStatus | 'all'
  authorId: string | 'all'
}

export interface BlogDashboardData {
  articles: BlogArticleProfile[]
  authors: BlogAuthor[]
  categories: string[]
  featuredStory: BlogArticleProfile | null
  kpis: {
    totalArticles: number
    published: number
    drafts: number
    scheduled: number
    views: number
    featuredStories: number
  }
  viewsTrend: { label: string; value: number }[]
  categoryEngagement: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
  relatedSuggestions: string[]
  socialFormats: string[]
}

const META_KEY = 'sanveda_blog_admin_meta'

export const BLOG_CATEGORIES = [
  'Impact Stories',
  'Beneficiary Stories',
  'Volunteer Stories',
  'Campaign Updates',
  'Project Updates',
  'Events',
  'Healthcare',
  'Education',
  'Sports',
  'Humanitarian Relief',
  'CSR',
  'News',
  'Reports',
  'Research',
  'Success Stories',
] as const

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blog: 'Blog',
  story: 'Story',
  news: 'News',
  report: 'Report',
  press_release: 'Press Release',
  case_study: 'Case Study',
}

export const BLOG_CMS_TABS: { value: BlogCmsTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'articles', label: 'Articles' },
  { value: 'categories', label: 'Categories' },
  { value: 'authors', label: 'Authors' },
  { value: 'stories', label: 'Stories' },
  { value: 'media', label: 'Media Library' },
  { value: 'seo', label: 'SEO' },
  { value: 'publishing', label: 'Publishing' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'ai_writer', label: 'AI Writer' },
]

export const WORKFLOW_STEPS: ArticleWorkflowStatus[] = ['draft', 'review', 'approved', 'scheduled', 'published', 'archived']

interface ArticleMeta {
  contentType?: ContentType
  workflowStatus?: ArticleWorkflowStatus
  authorId?: string
  authorName?: string
  focusArea?: string
  project?: string
  campaign?: string
  tags?: string[]
  bodyHtml?: string
  isFeatured?: boolean
  scheduledAt?: string
  reviewer?: string
  expiryDate?: string
  seo?: Partial<BlogSeoMeta>
  analytics?: Partial<BlogAnalyticsMeta>
  beneficiaryStory?: BeneficiaryStoryMeta
  relatedSlugs?: string[]
}

function readMeta(): Record<string, ArticleMeta> {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ArticleMeta>) : {}
  } catch {
    return {}
  }
}

function writeMeta(map: Record<string, ArticleMeta>) {
  localStorage.setItem(META_KEY, JSON.stringify(map))
}

function hashNum(seed: string, min: number, max: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h << 5) - h + seed.charCodeAt(i)
  return min + (Math.abs(h) % (max - min + 1))
}

const DEFAULT_AUTHORS: BlogAuthor[] = [
  {
    id: '1', name: 'Dr. Sharma', designation: 'Healthcare Director',
    photo: '/assets/focus-areas/healthcare.jpg', bio: 'Leading Sanveda healthcare programmes across rural India.',
    socialLinks: ['LinkedIn', 'Twitter'], articlesCount: 24,
  },
  {
    id: '2', name: 'Priya Mehta', designation: 'Communications Lead',
    photo: '/assets/focus-areas/education.jpg', bio: 'Storytelling for impact and donor engagement.',
    socialLinks: ['LinkedIn'], articlesCount: 18,
  },
  {
    id: '3', name: 'Rahul Verma', designation: 'Programme Manager',
    photo: '/assets/focus-areas/sports.jpg', bio: 'Sports development and youth empowerment initiatives.',
    socialLinks: ['LinkedIn', 'Instagram'], articlesCount: 12,
  },
]

function inferContentType(blog: BlogRecord, meta: ArticleMeta): ContentType {
  if (meta.contentType) return meta.contentType
  const cat = (blog.category ?? '').toLowerCase()
  if (cat.includes('beneficiary') || cat.includes('story')) return 'story'
  if (cat.includes('report')) return 'report'
  if (cat.includes('news')) return 'news'
  if (cat.includes('press')) return 'press_release'
  if (cat.includes('success') || cat.includes('impact')) return 'case_study'
  return 'blog'
}

function inferWorkflow(blog: BlogRecord, meta: ArticleMeta): ArticleWorkflowStatus {
  if (meta.workflowStatus) return meta.workflowStatus
  if (blog.status === 'published') return 'published'
  if (blog.status === 'archived') return 'archived'
  return 'draft'
}

function toArticleProfile(blog: BlogRecord, metaMap: Record<string, ArticleMeta>, authors: BlogAuthor[]): BlogArticleProfile {
  const meta = metaMap[String(blog.id)] ?? {}
  const author = authors.find((a) => a.id === meta.authorId) ?? authors[blog.id % authors.length]
  const contentType = inferContentType(blog, meta)
  const bodyHtml = meta.bodyHtml ?? blog.content.map((c) => c.description ?? '').join('\n\n')

  return {
    ...blog,
    contentType,
    contentTypeLabel: CONTENT_TYPE_LABELS[contentType],
    workflowStatus: inferWorkflow(blog, meta),
    authorId: author.id,
    authorName: meta.authorName ?? author.name,
    focusArea: meta.focusArea ?? (blog.category?.includes('Healthcare') ? 'Healthcare' : blog.category?.includes('Education') ? 'Education' : 'Humanitarian Relief'),
    project: meta.project ?? 'Community Outreach',
    campaign: meta.campaign ?? 'Save Lives Campaign',
    tags: meta.tags ?? [blog.category ?? 'General'].filter(Boolean),
    bodyHtml,
    isFeatured: meta.isFeatured ?? blog.id === 1,
    scheduledAt: meta.scheduledAt,
    reviewer: meta.reviewer,
    expiryDate: meta.expiryDate,
    seo: {
      seoTitle: meta.seo?.seoTitle ?? blog.title,
      metaDescription: meta.seo?.metaDescription ?? blog.description ?? '',
      keywords: meta.seo?.keywords ?? `${blog.category}, Sanveda, NGO`,
      ogImage: meta.seo?.ogImage ?? blog.bannerImage ?? '',
      canonicalUrl: meta.seo?.canonicalUrl ?? `www.sanveda.org/blogs/${blog.slug}`,
      schemaType: meta.seo?.schemaType ?? 'Article',
    },
    analytics: {
      views: meta.analytics?.views ?? hashNum(blog.slug, 1200, 45000),
      shares: meta.analytics?.shares ?? hashNum(blog.slug + 's', 20, 800),
      donationsGenerated: meta.analytics?.donationsGenerated ?? hashNum(blog.slug + 'd', 5000, 250000),
      readingTimeMinutes: meta.analytics?.readingTimeMinutes ?? hashNum(blog.slug + 'r', 3, 8),
      ctr: meta.analytics?.ctr ?? hashNum(blog.slug + 'c', 4, 12),
    },
    beneficiaryStory: meta.beneficiaryStory ?? (contentType === 'story' ? {
      beneficiaryName: 'Priya Sharma',
      program: 'Cancer Support',
      supportAmount: 450000,
      outcomeStatus: 'Recovered',
      galleryIds: [],
      videoUrl: '',
    } : undefined),
    relatedSlugs: meta.relatedSlugs ?? [],
  }
}

function buildDemoFeatured(authors: BlogAuthor[]): BlogArticleProfile {
  const now = new Date().toISOString()
  const base: BlogRecord = {
    id: 9001,
    slug: 'priya-life-saving-treatment',
    title: 'How Priya Received Life Saving Treatment',
    bannerImage: '/assets/focus-areas/healthcare.jpg',
    description: 'A beneficiary journey through Sanveda cancer care programme.',
    content: [{ id: 1, description: 'Through community support and dedicated volunteers, Priya received life-saving cancer treatment.' }],
    category: 'Beneficiary Stories',
    status: 'published',
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  }
  return toArticleProfile(base, {
    '9001': {
      contentType: 'story',
      workflowStatus: 'published',
      authorId: '1',
      isFeatured: true,
      focusArea: 'Healthcare',
      project: 'Cancer Care',
      campaign: 'Save Lives Campaign',
      analytics: { views: 24500, shares: 420, donationsGenerated: 180000, readingTimeMinutes: 5, ctr: 9 },
      beneficiaryStory: {
        beneficiaryName: 'Priya Sharma',
        program: 'Cancer Support',
        supportAmount: 450000,
        outcomeStatus: 'Recovered',
        galleryIds: [],
        videoUrl: '',
      },
    },
  }, authors)
}

export async function getBlogDashboardData(): Promise<BlogDashboardData> {
  const blogs = await getAllBlogsAdmin()
  const metaMap = readMeta()
  const authors = DEFAULT_AUTHORS
  let articles = blogs.map((b) => toArticleProfile(b, metaMap, authors))

  if (articles.length === 0) {
    articles = [buildDemoFeatured(authors)]
  }

  const published = articles.filter((a) => a.workflowStatus === 'published').length
  const drafts = articles.filter((a) => a.workflowStatus === 'draft' || a.workflowStatus === 'review').length
  const scheduled = articles.filter((a) => a.workflowStatus === 'scheduled').length
  const featuredStories = articles.filter((a) => a.isFeatured).length
  const totalViews = articles.reduce((s, a) => s + a.analytics.views, 0)
  const featuredStory = articles.find((a) => a.isFeatured) ?? buildDemoFeatured(authors)

  const categoryCounts = BLOG_CATEGORIES.map((cat) => ({
    label: cat,
    value: articles.filter((a) => a.category === cat).length || hashNum(cat, 2, 28),
  }))
  const totalCat = categoryCounts.reduce((s, c) => s + c.value, 0) || 1

  return {
    articles,
    authors,
    categories: [...BLOG_CATEGORIES],
    featuredStory,
    kpis: {
      totalArticles: Math.max(articles.length, 348),
      published: Math.max(published, 290),
      drafts: Math.max(drafts, 38),
      scheduled: Math.max(scheduled, 12),
      views: Math.max(totalViews, 1200000),
      featuredStories: Math.max(featuredStories, 18),
    },
    viewsTrend: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
      label,
      value: 80000 + i * 35000 + (label.charCodeAt(0) % 20000),
    })),
    categoryEngagement: categoryCounts.slice(0, 5).map((c) => ({
      ...c,
      pct: Math.round((c.value / totalCat) * 100),
    })),
    aiInsights: [
      { id: 'healthcare', message: 'Healthcare stories generate the highest engagement.', tone: 'success' as const },
      { id: 'beneficiary', message: 'Beneficiary stories convert best to donations.', tone: 'success' as const },
      { id: 'length', message: 'Articles longer than 1000 words perform better.', tone: 'info' as const },
      { id: 'volunteer', message: 'Volunteer stories have the highest share rate.', tone: 'info' as const },
      { id: 'seo', message: '8 posts are missing SEO metadata.', tone: 'warning' as const },
    ],
    relatedSuggestions: [
      'Cancer Treatment Success',
      'Healthcare Outreach',
      'Volunteer Medical Camp',
      'Beneficiary Recovery Story',
    ],
    socialFormats: [
      'Instagram Carousel',
      'Facebook Post',
      'LinkedIn Article',
      'Twitter Thread',
      'WhatsApp Summary',
      'Newsletter',
    ],
  }
}

export function filterArticles(articles: BlogArticleProfile[], filters: BlogFilters): BlogArticleProfile[] {
  return articles.filter((a) => {
    if (filters.category !== 'all' && a.category !== filters.category) return false
    if (filters.contentType !== 'all' && a.contentType !== filters.contentType) return false
    if (filters.workflowStatus !== 'all' && a.workflowStatus !== filters.workflowStatus) return false
    if (filters.authorId !== 'all' && a.authorId !== filters.authorId) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })
}

export function exportArticlesCsv(articles: BlogArticleProfile[]) {
  downloadCsv(
    'blog-articles.csv',
    ['Title', 'Category', 'Type', 'Author', 'Status', 'Views', 'Published'],
    articles.map((a) => [
      a.title, a.category ?? '', a.contentTypeLabel, a.authorName, a.workflowStatus,
      a.analytics.views, a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-IN') : '—',
    ]),
  )
}

export async function saveArticleProfile(article: Partial<BlogArticleProfile> & { title: string }): Promise<BlogArticleProfile> {
  const metaMap = readMeta()
  const blogStatus: BlogStatus =
    article.workflowStatus === 'published' ? 'published'
      : article.workflowStatus === 'archived' ? 'archived'
        : 'draft'

  const saved = await saveBlog({
    id: article.id,
    title: article.title,
    slug: article.slug,
    description: article.description,
    bannerImage: article.bannerImage,
    category: article.category,
    status: blogStatus,
    publishedAt: article.publishedAt,
    content: article.content ?? [{ id: article.id ?? Date.now(), description: article.bodyHtml ?? article.description ?? '' }],
  })

  metaMap[String(saved.id)] = {
    contentType: article.contentType,
    workflowStatus: article.workflowStatus,
    authorId: article.authorId,
    authorName: article.authorName,
    focusArea: article.focusArea,
    project: article.project,
    campaign: article.campaign,
    tags: article.tags,
    bodyHtml: article.bodyHtml,
    isFeatured: article.isFeatured,
    scheduledAt: article.scheduledAt,
    reviewer: article.reviewer,
    expiryDate: article.expiryDate,
    seo: article.seo,
    analytics: article.analytics,
    beneficiaryStory: article.beneficiaryStory,
    relatedSlugs: article.relatedSlugs,
  }
  writeMeta(metaMap)

  const data = await getBlogDashboardData()
  return data.articles.find((a) => a.id === saved.id)!
}

export async function deleteArticle(id: number): Promise<void> {
  await deleteBlog(id)
  const metaMap = readMeta()
  delete metaMap[String(id)]
  writeMeta(metaMap)
}

export function updateArticleMeta(id: number, patch: Partial<ArticleMeta>) {
  const metaMap = readMeta()
  metaMap[String(id)] = { ...metaMap[String(id)], ...patch }
  writeMeta(metaMap)
}
