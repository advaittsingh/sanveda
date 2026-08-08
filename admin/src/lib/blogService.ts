import type { BlogPost } from '../types'
import { readFirstValidDate } from '../utils/blogUtils'
import { dataApi } from './dataApiClient'

export type BlogStatus = 'draft' | 'published' | 'archived'

export interface BlogRecord {
  id: number
  slug: string
  title: string
  bannerImage?: string
  description?: string
  content: { id: number; description?: string; title?: string }[]
  category?: string
  status: BlogStatus
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function rowToBlog(row: Record<string, unknown>): BlogRecord {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    bannerImage: row.banner_image ? String(row.banner_image) : undefined,
    description: row.description ? String(row.description) : undefined,
    content: Array.isArray(row.content) ? row.content : [],
    category: row.category ? String(row.category) : undefined,
    status: row.status as BlogStatus,
    publishedAt: readFirstValidDate(row.published_at, row.publishedAt),
    createdAt: readFirstValidDate(row.created_at, row.createdAt, row.published_at, row.publishedAt) ?? '',
    updatedAt: String(row.updated_at),
  }
}

function toBlogPost(record: BlogRecord): BlogPost {
  return {
    id: record.id,
    title: record.title,
    status: record.status === 'published' ? 1 : 0,
    banner_image: record.bannerImage,
    description: record.description,
    category: record.category,
    createdAt: record.publishedAt ?? record.createdAt,
    BlogDescs: record.content.map((c) => ({
      id: c.id,
      description: c.description,
      title: c.title,
    })),
  }
}

export async function fetchPublishedBlogs(): Promise<BlogPost[]> {
  const { data, error } = await dataApi
    .publicTable('blogs')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => toBlogPost(rowToBlog(r)))
}

export async function fetchBlogById(id: number): Promise<BlogPost | null> {
  const blogs = await fetchPublishedBlogs()
  return blogs.find((b) => b.id === id) ?? null
}

export async function getAllBlogsAdmin(): Promise<BlogRecord[]> {
  const { data, error } = await dataApi
    .table('blogs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToBlog)
}

export async function saveBlog(
  input: Partial<BlogRecord> & { title: string },
): Promise<BlogRecord> {
  const now = new Date().toISOString()
  const slug = input.slug ?? slugify(input.title)

  const row = {
    slug,
    title: input.title,
    banner_image: input.bannerImage ?? null,
    description: input.description ?? null,
    content: input.content ?? [],
    category: input.category ?? null,
    status: input.status ?? 'draft',
    published_at: input.status === 'published' ? (input.publishedAt ?? now) : null,
    updated_at: now,
  }

  if (input.id) {
    const { data, error } = await dataApi
      .table('blogs')
      .update(row)
      .eq('id', input.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return rowToBlog(data)
  }

  const { data, error } = await dataApi
    .table('blogs')
    .insert(row)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return rowToBlog(data)
}

export async function deleteBlog(id: number): Promise<void> {
  const { error } = await dataApi.table('blogs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
