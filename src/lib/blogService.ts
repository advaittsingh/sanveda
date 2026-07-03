import type { BlogPost } from '../types'
import { DEMO_BLOGS } from '../constants/blogs'
import { isSupabaseConfigured, requireSupabase } from './supabase'

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

const STORAGE_KEY = 'sanveda_blogs'

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
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    createdAt: String(row.created_at),
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
    createdAt: record.publishedAt ?? record.createdAt,
    BlogDescs: record.content.map((c) => ({
      id: c.id,
      description: c.description,
      title: c.title,
    })),
  }
}

function readLocal(): BlogRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEMO_BLOGS.map((b) => ({
      id: b.id,
      slug: slugify(b.title),
      title: b.title,
      bannerImage: b.banner_image,
      description: b.description,
      content: b.BlogDescs ?? [],
      status: 'published' as BlogStatus,
      createdAt: b.createdAt ?? new Date().toISOString(),
      updatedAt: b.createdAt ?? new Date().toISOString(),
    }))
    return JSON.parse(raw) as BlogRecord[]
  } catch {
    return []
  }
}

function writeLocal(items: BlogRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function fetchPublishedBlogs(): Promise<BlogPost[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (!error && data?.length) {
      return data.map((r) => toBlogPost(rowToBlog(r)))
    }
  }

  return readLocal()
    .filter((b) => b.status === 'published')
    .map(toBlogPost)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
}

export async function fetchBlogById(id: number): Promise<BlogPost | null> {
  const blogs = await fetchPublishedBlogs()
  return blogs.find((b) => b.id === id) ?? null
}

export async function getAllBlogsAdmin(): Promise<BlogRecord[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToBlog)
  }

  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function saveBlog(
  input: Partial<BlogRecord> & { title: string },
): Promise<BlogRecord> {
  const now = new Date().toISOString()
  const slug = input.slug ?? slugify(input.title)

  if (isSupabaseConfigured) {
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
      const { data, error } = await requireSupabase()
        .from('blogs')
        .update(row)
        .eq('id', input.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return rowToBlog(data)
    }

    const { data, error } = await requireSupabase()
      .from('blogs')
      .insert(row)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return rowToBlog(data)
  }

  const all = readLocal()
  if (input.id) {
    const index = all.findIndex((b) => b.id === input.id)
    const updated: BlogRecord = {
      ...all[index],
      ...input,
      slug,
      updatedAt: now,
    }
    all[index] = updated
    writeLocal(all)
    return updated
  }

  const created: BlogRecord = {
    id: Date.now(),
    slug,
    title: input.title,
    bannerImage: input.bannerImage,
    description: input.description,
    content: input.content ?? [],
    category: input.category,
    status: input.status ?? 'draft',
    publishedAt: input.status === 'published' ? now : undefined,
    createdAt: now,
    updatedAt: now,
  }
  all.unshift(created)
  writeLocal(all)
  return created
}

export async function deleteBlog(id: number): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase().from('blogs').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }

  writeLocal(readLocal().filter((b) => b.id !== id))
}
