import type { BlogPost } from '../types'

type BlogPostWithLegacyDates = BlogPost & {
  publishedAt?: string
  published_at?: string
  created_at?: string
}

function isValidDateString(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false
  return !Number.isNaN(new Date(trimmed).getTime())
}

export function readFirstValidDate(...candidates: unknown[]): string | undefined {
  for (const candidate of candidates) {
    if (candidate == null) continue
    const value = String(candidate)
    if (isValidDateString(value)) return value.trim()
  }
  return undefined
}

/** Resolve the ISO date string used for blog cards and detail pages. */
export function getBlogPostDateIso(post: BlogPost): string | undefined {
  const legacy = post as BlogPostWithLegacyDates
  return readFirstValidDate(
    post.createdAt,
    legacy.publishedAt,
    legacy.published_at,
    legacy.created_at,
  )
}

export function normalizeBlogPost(post: BlogPost): BlogPost {
  const createdAt = getBlogPostDateIso(post)
  if (!createdAt || createdAt === post.createdAt) return post
  return { ...post, createdAt }
}

export function blogExcerpt(post: BlogPost, maxLength = 160): string {
  const html = post.BlogDescs?.[0]?.description ?? post.description ?? ''
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

export function formatBlogDate(date?: string): string {
  const resolved = date ? readFirstValidDate(date) : undefined
  if (!resolved) return ''
  return new Date(resolved).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Rough reading time from HTML or plain text (~220 wpm). */
export function estimateReadingMinutes(htmlOrText: string): number {
  const text = htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return 0
  const words = text.split(' ').filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}
