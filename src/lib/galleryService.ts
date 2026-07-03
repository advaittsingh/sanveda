import { isSupabaseConfigured, requireSupabase } from './supabase'

export interface GalleryAlbum {
  id: string
  slug: string
  title: string
  description?: string
  coverImage?: string
  status: 'draft' | 'published' | 'archived'
  items: GalleryItem[]
  createdAt: string
}

export interface GalleryItem {
  id: string
  albumId: string
  mediaType: 'image' | 'video'
  url: string
  caption?: string
  sortOrder: number
}

const STORAGE_KEY = 'sanveda_gallery'

const DEMO_ALBUMS: GalleryAlbum[] = [
  {
    id: '1',
    slug: 'community-impact',
    title: 'Community Impact',
    description: 'Moments from our field programmes',
    coverImage: '/assets/focus-areas/community.jpg',
    status: 'published',
    createdAt: new Date().toISOString(),
    items: [
      { id: '1a', albumId: '1', mediaType: 'image', url: '/assets/focus-areas/community.jpg', caption: 'Community engagement', sortOrder: 0 },
      { id: '1b', albumId: '1', mediaType: 'image', url: '/assets/founder-nayma.png', caption: 'Team outreach', sortOrder: 1 },
    ],
  },
  {
    id: '2',
    slug: 'healthcare-outreach',
    title: 'Healthcare Outreach',
    description: 'Medical camps and therapeutic support',
    coverImage: '/assets/focus-areas/healthcare.jpg',
    status: 'published',
    createdAt: new Date().toISOString(),
    items: [
      { id: '2a', albumId: '2', mediaType: 'image', url: '/assets/focus-areas/healthcare.jpg', caption: 'Healthcare camp', sortOrder: 0 },
    ],
  },
]

function readLocal(): GalleryAlbum[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEMO_ALBUMS
  } catch {
    return DEMO_ALBUMS
  }
}

function writeLocal(items: GalleryAlbum[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function getPublishedAlbums(): Promise<GalleryAlbum[]> {
  if (isSupabaseConfigured) {
    const { data: albums, error } = await requireSupabase()
      .from('gallery_albums')
      .select('*')
      .eq('status', 'published')
      .order('sort_order')

    if (error || !albums?.length) return readLocal().filter((a) => a.status === 'published')

    const result: GalleryAlbum[] = []
    for (const album of albums) {
      const { data: items } = await requireSupabase()
        .from('gallery_items')
        .select('*')
        .eq('album_id', album.id)
        .order('sort_order')

      result.push({
        id: String(album.id),
        slug: String(album.slug),
        title: String(album.title),
        description: album.description ? String(album.description) : undefined,
        coverImage: album.cover_image ? String(album.cover_image) : undefined,
        status: album.status as GalleryAlbum['status'],
        createdAt: String(album.created_at),
        items: (items ?? []).map((item) => ({
          id: String(item.id),
          albumId: String(item.album_id),
          mediaType: item.media_type as 'image' | 'video',
          url: String(item.url),
          caption: item.caption ? String(item.caption) : undefined,
          sortOrder: Number(item.sort_order ?? 0),
        })),
      })
    }
    return result
  }

  return readLocal().filter((a) => a.status === 'published')
}

export async function getAllAlbumsAdmin(): Promise<GalleryAlbum[]> {
  if (isSupabaseConfigured) {
    const published = await getPublishedAlbums()
    const { data: drafts } = await requireSupabase().from('gallery_albums').select('*').neq('status', 'published')
    if (!drafts?.length) return published

    const draftAlbums: GalleryAlbum[] = drafts.map((album) => ({
      id: String(album.id),
      slug: String(album.slug),
      title: String(album.title),
      description: album.description ? String(album.description) : undefined,
      coverImage: album.cover_image ? String(album.cover_image) : undefined,
      status: album.status as GalleryAlbum['status'],
      createdAt: String(album.created_at),
      items: [],
    }))
    return [...draftAlbums, ...published]
  }
  return readLocal()
}

export async function saveAlbum(input: Partial<GalleryAlbum> & { title: string; slug: string }): Promise<GalleryAlbum> {
  const now = new Date().toISOString()

  if (isSupabaseConfigured) {
    const row = {
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      cover_image: input.coverImage ?? null,
      status: input.status ?? 'draft',
      updated_at: now,
    }

    if (input.id) {
      const { data, error } = await requireSupabase().from('gallery_albums').update(row).eq('id', input.id).select().single()
      if (error) throw new Error(error.message)
      return { ...input as GalleryAlbum, id: String(data.id), items: input.items ?? [], createdAt: now }
    }

    const { data, error } = await requireSupabase().from('gallery_albums').insert(row).select().single()
    if (error) throw new Error(error.message)
    return { id: String(data.id), slug: input.slug, title: input.title, status: input.status ?? 'draft', items: [], createdAt: now }
  }

  const album: GalleryAlbum = {
    id: input.id ?? crypto.randomUUID(),
    slug: input.slug,
    title: input.title,
    description: input.description,
    coverImage: input.coverImage,
    status: input.status ?? 'draft',
    items: input.items ?? [],
    createdAt: now,
  }
  const all = readLocal()
  if (input.id) {
    const i = all.findIndex((a) => a.id === input.id)
    all[i] = { ...all[i], ...album }
  } else {
    all.unshift(album)
  }
  writeLocal(all)
  return album
}

export async function addGalleryItem(albumId: string, url: string, caption?: string, mediaType: 'image' | 'video' = 'image'): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase().from('gallery_items').insert({
      album_id: albumId,
      url,
      caption: caption ?? null,
      media_type: mediaType,
    })
    if (error) throw new Error(error.message)
    return
  }

  const all = readLocal()
  const album = all.find((a) => a.id === albumId)
  if (!album) return
  album.items.push({
    id: crypto.randomUUID(),
    albumId,
    mediaType,
    url,
    caption,
    sortOrder: album.items.length,
  })
  writeLocal(all)
}

export async function deleteAlbum(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await requireSupabase().from('gallery_albums').delete().eq('id', id)
    return
  }
  writeLocal(readLocal().filter((a) => a.id !== id))
}
