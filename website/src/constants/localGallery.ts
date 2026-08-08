import type { GalleryAlbum, GalleryItem } from '../lib/galleryService'

/**
 * Static media from `website/public/assets/gallary`.
 * Add filenames here when dropping new files into that folder.
 */
const GALLARY_FILES = [
  'WhatsApp Image 2026-07-24 at 23.16.59.jpeg',
  'WhatsApp Image 2026-07-24 at 23.16.59 (1).jpeg',
  'WhatsApp Image 2026-07-24 at 23.17.32.jpeg',
  'WhatsApp Video 2026-07-24 at 23.17.09.mp4',
  'WhatsApp Video 2026-07-24 at 23.17.16.mp4',
  'WhatsApp Video 2026-07-31 at 23.25.10.mp4',
  'WhatsApp Video 2026-07-31 at 23.25.24.mp4',
] as const

function assetUrl(filename: string): string {
  return `/assets/gallary/${encodeURIComponent(filename)}`
}

function isVideo(filename: string): boolean {
  return /\.(mp4|webm|mov|m4v)$/i.test(filename)
}

const items: GalleryItem[] = GALLARY_FILES.map((filename, index) => ({
  id: `local-gallary-${index + 1}`,
  albumId: 'local-gallary',
  mediaType: isVideo(filename) ? 'video' : 'image',
  url: assetUrl(filename),
  caption: undefined,
  sortOrder: index,
}))

/** Local album always shown on the public Gallery page. */
export const LOCAL_GALLERY_ALBUM: GalleryAlbum = {
  id: 'local-gallary',
  slug: 'sanveda-at-cjp-protest',
  title: 'Sanveda at CJP Protest',
  description: 'Photos and videos from Sanveda at the CJP protest.',
  coverImage: items.find((i) => i.mediaType === 'image')?.url ?? items[0]?.url,
  status: 'published',
  createdAt: '2026-07-24T00:00:00.000Z',
  items,
}

export function withLocalGalleryAlbums(albums: GalleryAlbum[]): GalleryAlbum[] {
  const withoutDup = albums.filter((a) => a.id !== LOCAL_GALLERY_ALBUM.id && a.slug !== LOCAL_GALLERY_ALBUM.slug)
  return [LOCAL_GALLERY_ALBUM, ...withoutDup]
}
