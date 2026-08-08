import { dataApi } from './dataApiClient'
import { deletePrivateFile, deliveryUrl, storagePath } from './privateStorageClient'

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

export async function getPublishedAlbums(): Promise<GalleryAlbum[]> {
  const { data: albums, error } = await dataApi
    .publicTable('gallery_albums')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')
  if (error) throw new Error(error.message)

  const result: GalleryAlbum[] = []
  for (const album of albums ?? []) {
    const { data: items, error: itemsError } = await dataApi
      .publicTable('gallery_items')
      .select('*')
      .eq('album_id', album.id)
      .order('sort_order')
    if (itemsError) throw new Error(itemsError.message)
    result.push({
      id: String(album.id),
      slug: String(album.slug),
      title: String(album.title),
      description: album.description ? String(album.description) : undefined,
      coverImage: deliveryUrl(album.cover_image ? String(album.cover_image) : undefined),
      status: album.status as GalleryAlbum['status'],
      createdAt: String(album.created_at),
      items: (items ?? []).map((item) => ({
        id: String(item.id),
        albumId: String(item.album_id),
        mediaType: item.media_type as 'image' | 'video',
        url: deliveryUrl(String(item.url)) ?? String(item.url),
        caption: item.caption ? String(item.caption) : undefined,
        sortOrder: Number(item.sort_order ?? 0),
      })),
    })
  }
  return result
}

export async function getAllAlbumsAdmin(): Promise<GalleryAlbum[]> {
  const published = await getPublishedAlbums()
  const { data: drafts, error } = await dataApi.table('gallery_albums').select('*').neq('status', 'published')
  if (error) throw new Error(error.message)
  const draftAlbums: GalleryAlbum[] = (drafts ?? []).map((album) => ({
    id: String(album.id),
    slug: String(album.slug),
    title: String(album.title),
    description: album.description ? String(album.description) : undefined,
    coverImage: deliveryUrl(album.cover_image ? String(album.cover_image) : undefined),
    status: album.status as GalleryAlbum['status'],
    createdAt: String(album.created_at),
    items: [],
  }))
  return [...draftAlbums, ...published]
}

export async function saveAlbum(input: Partial<GalleryAlbum> & { title: string; slug: string }): Promise<GalleryAlbum> {
  const now = new Date().toISOString()

  const row = {
    slug: input.slug,
    title: input.title,
    description: input.description ?? null,
    cover_image: storagePath(input.coverImage) ?? null,
    status: input.status ?? 'draft',
    updated_at: now,
  }
  if (input.id) {
    const { data: previous, error: previousError } = await dataApi
      .table('gallery_albums')
      .select('cover_image')
      .eq('id', input.id)
      .maybeSingle()
    if (previousError) throw new Error(previousError.message)
    const { data, error } = await dataApi.table('gallery_albums').update(row).eq('id', input.id).select().single()
    if (error) throw new Error(error.message)
    const previousCover = previous?.cover_image ? String(previous.cover_image) : undefined
    if (previousCover && storagePath(previousCover) !== storagePath(input.coverImage)) {
      await deletePrivateFile(previousCover)
    }
    return { ...input as GalleryAlbum, id: String(data.id), items: input.items ?? [], createdAt: String(data.created_at) }
  }
  const { data, error } = await dataApi.table('gallery_albums').insert(row).select().single()
  if (error) throw new Error(error.message)
  return { id: String(data.id), slug: input.slug, title: input.title, status: input.status ?? 'draft', items: [], createdAt: String(data.created_at) }
}

export async function addGalleryItem(albumId: string, url: string, caption?: string, mediaType: 'image' | 'video' = 'image'): Promise<void> {
  const path = storagePath(url)
  const { error } = await dataApi.table('gallery_items').insert({
    album_id: albumId,
    url: path ?? url,
    caption: caption ?? null,
    media_type: mediaType,
    metadata: path && /^(gallery)\//.test(path) ? { storage: 'vercel-blob-private', pathname: path } : {},
  })
  if (error) throw new Error(error.message)
}

export async function deleteAlbum(id: string): Promise<void> {
  const [{ data: album, error: albumError }, { data: items, error: itemsError }] = await Promise.all([
    dataApi.table('gallery_albums').select('cover_image').eq('id', id).maybeSingle(),
    dataApi.table('gallery_items').select('url').eq('album_id', id),
  ])
  if (albumError) throw new Error(albumError.message)
  if (itemsError) throw new Error(itemsError.message)
  const { error } = await dataApi.table('gallery_albums').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await Promise.all([
    album?.cover_image ? deletePrivateFile(String(album.cover_image)) : Promise.resolve(),
    ...(items ?? []).map((item) => deletePrivateFile(String(item.url))),
  ])
}
