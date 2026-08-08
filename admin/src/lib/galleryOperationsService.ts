import { readPersistedMetaMap, writePersistedMetaMap } from './persistMeta'
import { downloadCsv } from './adminExport'
import { getAllAlbumsAdmin, type GalleryAlbum, type GalleryItem } from './galleryService'

const GALLERY_META_KEY = 'sanveda_gallery_admin_meta'

export type AlbumCategory =
  | 'healthcare'
  | 'education'
  | 'events'
  | 'volunteers'
  | 'beneficiaries'
  | 'projects'
  | 'campaigns'
  | 'csr'
  | 'success_stories'
  | 'press'
  | 'annual_reports'

export type ApprovalStatus =
  | 'uploaded'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'draft'
  | 'archived'

export type MediaDocType =
  | 'photo'
  | 'video'
  | 'document'
  | 'youtube'
  | 'vimeo'
  | 'drone'
  | 'interview'

export interface BeforeAfterPair {
  id: string
  title: string
  beforeUrl: string
  afterUrl: string
  project: string
}

export interface SuccessStoryMedia {
  title: string
  beneficiary: string
  project: string
  quote: string
  impactScore: number
  hasVideo: boolean
}

export interface MediaAssetProfile {
  id: string
  title: string
  description?: string
  thumbnail: string
  url: string
  mediaType: 'image' | 'video' | 'document'
  docType: MediaDocType
  videoPlatform?: 'youtube' | 'vimeo' | 'upload'
  photographer?: string
  location?: string
  date: string
  project?: string
  event?: string
  focusArea?: string
  beneficiaries?: number
  tags: string[]
  aiTags: string[]
  approvalStatus: ApprovalStatus
  downloads: number
  views: number
  duration?: string
  resolution?: string
  sizeMb: number
}

export interface AlbumAdminMeta {
  category?: AlbumCategory
  project?: string
  campaign?: string
  focusArea?: string
  createdBy?: string
  approvalStatus?: ApprovalStatus
}

export interface AlbumProfile {
  id: string
  albumId: string
  slug: string
  title: string
  description?: string
  coverImage?: string
  category: AlbumCategory
  categoryLabel: string
  project?: string
  campaign?: string
  focusArea?: string
  createdBy: string
  createdDate: string
  status: ApprovalStatus
  photoCount: number
  videoCount: number
  documentCount: number
  totalItems: number
  downloads: number
  shares: number
  storageGb: number
  media: MediaAssetProfile[]
  successStories: SuccessStoryMedia[]
  beforeAfterPairs: BeforeAfterPair[]
  linkedProjects: string[]
  aiTags: string[]
  publicUrl: string
}

export interface GalleryFilters {
  search: string
  category: AlbumCategory | 'all'
  status: ApprovalStatus | 'all'
}

export interface GalleryDashboardData {
  albums: AlbumProfile[]
  kpis: {
    totalAlbums: number
    totalMediaFiles: number
    photos: number
    videos: number
    storageUsedGb: number
    publishedAlbums: number
  }
  uploadTrends: { label: string; value: number }[]
  contentDistribution: { label: string; value: number; pct: number }[]
  categoryUsage: { label: string; value: number; pct: number }[]
  storageBreakdown: { label: string; valueGb: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

export const ALBUM_CATEGORIES: { value: AlbumCategory; label: string }[] = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'events', label: 'Events' },
  { value: 'volunteers', label: 'Volunteers' },
  { value: 'beneficiaries', label: 'Beneficiaries' },
  { value: 'projects', label: 'Projects' },
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'csr', label: 'CSR Activities' },
  { value: 'success_stories', label: 'Success Stories' },
  { value: 'press', label: 'Press Coverage' },
  { value: 'annual_reports', label: 'Annual Reports' },
]

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'published', label: 'Published' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
] as const

const CATEGORY_LABEL: Record<AlbumCategory, string> = Object.fromEntries(
  ALBUM_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<AlbumCategory, string>

function readMetaMap(): Record<string, AlbumAdminMeta> {
  return readPersistedMetaMap<AlbumAdminMeta>('sanveda_gallery_admin_meta')
}

export function updateAlbumMeta(albumId: string, patch: Partial<AlbumAdminMeta>) {
  const map = readMetaMap()
  map[albumId] = { ...map[albumId], ...patch }
  writePersistedMetaMap(GALLERY_META_KEY, map)
}

function inferCategory(album: GalleryAlbum): AlbumCategory {
  const t = `${album.title} ${album.description ?? ''}`.toLowerCase()
  if (t.includes('health') || t.includes('medical')) return 'healthcare'
  if (t.includes('education') || t.includes('school')) return 'education'
  if (t.includes('event')) return 'events'
  if (t.includes('volunteer')) return 'volunteers'
  if (t.includes('campaign')) return 'campaigns'
  if (t.includes('csr')) return 'csr'
  if (t.includes('success') || t.includes('story')) return 'success_stories'
  if (t.includes('press')) return 'press'
  if (t.includes('annual') || t.includes('report')) return 'annual_reports'
  if (t.includes('beneficiar')) return 'beneficiaries'
  return 'projects'
}

function mapStatus(album: GalleryAlbum, meta?: AlbumAdminMeta): ApprovalStatus {
  if (meta?.approvalStatus) return meta.approvalStatus
  if (album.status === 'published') return 'published'
  if (album.status === 'archived') return 'archived'
  return 'draft'
}

function buildMediaItem(item: GalleryItem, album: GalleryAlbum, index: number): MediaAssetProfile {
  const isVideo = item.mediaType === 'video'
  const isDoc = item.url.endsWith('.pdf') || item.caption?.toLowerCase().includes('report')

  return {
    id: item.id,
    title: item.caption ?? `Media ${index + 1}`,
    description: item.caption,
    thumbnail: item.url,
    url: item.url,
    mediaType: isDoc ? 'document' : item.mediaType,
    docType: isDoc ? 'document' : isVideo ? 'video' : 'photo',
    videoPlatform: isVideo
      ? item.url.includes('youtube')
        ? 'youtube'
        : item.url.includes('vimeo')
          ? 'vimeo'
          : 'upload'
      : undefined,
    photographer: '',
    location: '',
    date: album.createdAt,
    project: '',
    event: undefined,
    focusArea: '',
    beneficiaries: 0,
    tags: [],
    aiTags: [],
    approvalStatus: album.status === 'published' ? 'published' : 'pending_review',
    downloads: 0,
    views: 0,
    duration: undefined,
    resolution: '',
    sizeMb: 0,
  }
}

function buildAlbumProfile(album: GalleryAlbum, meta?: AlbumAdminMeta): AlbumProfile {
  const category = meta?.category ?? inferCategory(album)
  const media = album.items.map((item, i) => buildMediaItem(item, album, i))

  const photoCount = media.filter((m) => m.mediaType === 'image').length
  const videoCount = media.filter((m) => m.mediaType === 'video').length
  const documentCount = media.filter((m) => m.mediaType === 'document').length
  const totalItems = media.length
  const storageGb = media.reduce((s, m) => s + m.sizeMb, 0) / 1024

  return {
    id: album.id,
    albumId: `GAL-${album.id.padStart(4, '0')}`,
    slug: album.slug,
    title: album.title,
    description: album.description,
    coverImage: album.coverImage ?? album.items[0]?.url ?? '/assets/focus-areas/community.jpg',
    category,
    categoryLabel: CATEGORY_LABEL[category],
    project: meta?.project,
    campaign: meta?.campaign,
    focusArea: meta?.focusArea ?? CATEGORY_LABEL[category],
    createdBy: meta?.createdBy ?? '',
    createdDate: album.createdAt,
    status: mapStatus(album, meta),
    photoCount,
    videoCount,
    documentCount,
    totalItems,
    downloads: 0,
    shares: 0,
    storageGb: Math.round(storageGb * 10) / 10,
    media,
    successStories: [],
    beforeAfterPairs: [],
    linkedProjects: meta?.project ? [meta.project] : [],
    aiTags: [],
    publicUrl: `/gallery/${album.slug}`,
  }
}

function enrichAlbums(raw: GalleryAlbum[]): AlbumProfile[] {
  const metaMap = readMetaMap()
  return raw.map((a) => buildAlbumProfile(a, metaMap[a.id]))
}

function computeKpis(albums: AlbumProfile[]) {
  const photos = albums.reduce((s, a) => s + a.photoCount, 0)
  const videos = albums.reduce((s, a) => s + a.videoCount, 0)
  const docs = albums.reduce((s, a) => s + a.documentCount, 0)
  return {
    totalAlbums: albums.length,
    totalMediaFiles: photos + videos + docs,
    photos,
    videos,
    storageUsedGb: Math.round(albums.reduce((s, a) => s + a.storageGb, 0) * 10) / 10,
    publishedAlbums: albums.filter((a) => a.status === 'published').length,
  }
}

function computeAnalytics(albums: AlbumProfile[]) {
  const uploadTrends: { label: string; value: number }[] = []

  const photos = albums.reduce((s, a) => s + a.photoCount, 0)
  const videos = albums.reduce((s, a) => s + a.videoCount, 0)
  const docs = albums.reduce((s, a) => s + a.documentCount, 0)
  const total = photos + videos + docs || 1

  const contentDistribution = [
    { label: 'Photos', value: photos, pct: Math.round((photos / total) * 100) },
    { label: 'Videos', value: videos, pct: Math.round((videos / total) * 100) },
    { label: 'Documents', value: docs, pct: Math.round((docs / total) * 100) },
  ]

  const catMap = new Map<string, number>()
  for (const a of albums) {
    catMap.set(a.categoryLabel, (catMap.get(a.categoryLabel) ?? 0) + a.totalItems)
  }
  const catTotal = [...catMap.values()].reduce((s, v) => s + v, 0) || 1
  const categoryUsage = [...catMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / catTotal) * 100) }))
    .sort((a, b) => b.value - a.value)

  const imageGb = albums.reduce((s, a) => s + a.photoCount * 0.02, 0)
  const videoGb = albums.reduce((s, a) => s + a.videoCount * 0.15, 0)
  const docGb = albums.reduce((s, a) => s + a.documentCount * 0.005, 0)
  const storageBreakdown =
    albums.length === 0
      ? []
      : [
          { label: 'Images', valueGb: Math.round(imageGb * 10) / 10 },
          { label: 'Videos', valueGb: Math.round(videoGb * 10) / 10 },
          { label: 'Documents', valueGb: Math.round(docGb * 10) / 10 },
        ]

  return { uploadTrends, contentDistribution, categoryUsage, storageBreakdown }
}

function computeAiInsights(albums: AlbumProfile[]) {
  return albums.length
    ? []
    : [
        {
          id: 'empty',
          message: 'No gallery albums yet. Upload photos and videos from the Media Library tab.',
          tone: 'info' as const,
        },
      ]
}

export async function getGalleryDashboardData(): Promise<GalleryDashboardData> {
  const raw = await getAllAlbumsAdmin().catch(() => [])
  const albums = enrichAlbums(raw)
  const kpis = computeKpis(albums)
  const analytics = computeAnalytics(albums)
  const aiInsights = computeAiInsights(albums)
  return { albums, kpis, aiInsights, ...analytics }
}

export function filterAlbums(albums: AlbumProfile[], filters: GalleryFilters): AlbumProfile[] {
  return albums.filter((a) => {
    if (filters.category !== 'all' && a.category !== filters.category) return false
    if (filters.status !== 'all' && a.status !== filters.status) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        a.categoryLabel.toLowerCase().includes(q) ||
        (a.project?.toLowerCase().includes(q) ?? false)
      )
    }
    return true
  })
}

export function exportGalleryCsv(albums: AlbumProfile[]) {
  const headers = ['Album', 'Category', 'Photos', 'Videos', 'Items', 'Status', 'Storage (GB)']
  const rows = albums.map((a) => [
    a.title,
    a.categoryLabel,
    a.photoCount,
    a.videoCount,
    a.totalItems,
    a.status,
    a.storageGb,
  ])
  downloadCsv('gallery-export.csv', headers, rows)
}
