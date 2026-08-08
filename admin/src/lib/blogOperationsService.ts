import { withAudit } from './auditMiddleware'
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
  return {}
}

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
  const author = authors.find((a) => a.id === meta.authorId)
  const contentType = inferContentType(blog, meta)
  const bodyHtml = meta.bodyHtml ?? blog.content.map((c) => c.description ?? '').join('\n\n')
  return {
    ...blog,
    contentType,
    contentTypeLabel: CONTENT_TYPE_LABELS[contentType],
    workflowStatus: inferWorkflow(blog, meta),
    authorId: author?.id ?? '',
    authorName: meta.authorName ?? author?.name ?? '',
    focusArea: meta.focusArea ?? '',
    project: meta.project ?? '',
    campaign: meta.campaign ?? '',
    tags: meta.tags ?? [blog.category ?? 'General'].filter(Boolean),
    bodyHtml,
    isFeatured: meta.isFeatured ?? false,
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
      views: meta.analytics?.views ?? 0,
      shares: meta.analytics?.shares ?? 0,
      donationsGenerated: meta.analytics?.donationsGenerated ?? 0,
      readingTimeMinutes: meta.analytics?.readingTimeMinutes ?? 0,
      ctr: meta.analytics?.ctr ?? 0,
    },
    beneficiaryStory: meta.beneficiaryStory,
    relatedSlugs: meta.relatedSlugs ?? [],
  }
}

export async function getBlogDashboardData(): Promise<BlogDashboardData> {
  const blogs = await getAllBlogsAdmin()
  const metaMap = readMeta()
  const authors: BlogAuthor[] = []
  const articles = blogs.map((b) => toArticleProfile(b, metaMap, authors))

  const published = articles.filter((a) => a.workflowStatus === 'published').length
  const drafts = articles.filter((a) => a.workflowStatus === 'draft' || a.workflowStatus === 'review').length
  const scheduled = articles.filter((a) => a.workflowStatus === 'scheduled').length
  const featuredStories = articles.filter((a) => a.isFeatured).length
  const totalViews = articles.reduce((s, a) => s + a.analytics.views, 0)
  const featuredStory = articles.find((a) => a.isFeatured) ?? null

  const categoryCounts = BLOG_CATEGORIES.map((cat) => ({
    label: cat,
    value: articles.filter((a) => a.category === cat).length,
  }))
  const totalCat = categoryCounts.reduce((s, c) => s + c.value, 0) || 1

  return {
    articles,
    authors,
    categories: [...BLOG_CATEGORIES],
    featuredStory,
    kpis: {
      totalArticles: articles.length,
      published,
      drafts,
      scheduled,
      views: totalViews,
      featuredStories,
    },
    viewsTrend: [],
    categoryEngagement: categoryCounts.slice(0, 5).map((c) => ({
      ...c,
      pct: Math.round((c.value / totalCat) * 100),
    })),
    aiInsights: articles.length === 0
      ? [{ id: 'empty', message: 'No articles yet. Publish your first story from the Articles tab.', tone: 'info' as const }]
      : [],
    relatedSuggestions: articles.slice(0, 4).map((a) => a.title),
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
  return withAudit(article.id ? 'UPDATE' : 'CREATE', 'blogs', String(article.id ?? 'new'), async () => {
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

    const data = await getBlogDashboardData()
    return data.articles.find((a) => a.id === saved.id)!
  })
}

export async function deleteArticle(id: number): Promise<void> {
  return withAudit('DELETE', 'blogs', String(id), async () => {
    await deleteBlog(id)
  })
}

export function updateArticleMeta(id: number, patch: Partial<ArticleMeta>) {
  void id
  void patch
  throw new Error('Extended article metadata is not backed by the canonical blogs table.')
}
