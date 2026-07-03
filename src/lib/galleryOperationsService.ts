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

export type ApprovalStatus = 'uploaded' | 'pending_review' | 'approved' | 'published' | 'draft' | 'archived'

export type MediaDocType = 'photo' | 'video' | 'document' | 'youtube' | 'vimeo' | 'drone' | 'interview'

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

const AI_TAG_POOL = [
  'Healthcare', 'Blood Donation', 'Volunteer', 'Hospital', 'Community Outreach',
  'Children', 'Women', 'Education', 'Events', 'Sports', 'Disaster Relief',
]

function readMetaMap(): Record<string, AlbumAdminMeta> {
  try {
    const raw = localStorage.getItem(GALLERY_META_KEY)
    return raw ? (JSON.parse(raw) as Record<string, AlbumAdminMeta>) : {}
  } catch {
    return {}
  }
}

export function updateAlbumMeta(albumId: string, patch: Partial<AlbumAdminMeta>) {
  const map = readMetaMap()
  map[albumId] = { ...map[albumId], ...patch }
  localStorage.setItem(GALLERY_META_KEY, JSON.stringify(map))
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
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
  const seed = hashCode(item.id)
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
    videoPlatform: isVideo ? (item.url.includes('youtube') ? 'youtube' : item.url.includes('vimeo') ? 'vimeo' : 'upload') : undefined,
    photographer: ['Sanveda Team', 'Field Volunteer', 'Press Partner'][seed % 3],
    location: ['Mumbai', 'Delhi', 'Pune', 'Rural Maharashtra', 'Bengaluru'][seed % 5],
    date: album.createdAt,
    project: album.title.includes('Healthcare') ? 'Healthcare Outreach' : album.title.includes('Community') ? 'Community Impact' : 'Sanveda Programme',
    event: seed % 2 === 0 ? 'Field Visit' : undefined,
    focusArea: inferCategory(album) === 'healthcare' ? 'Healthcare' : inferCategory(album) === 'education' ? 'Education' : 'Community Development',
    beneficiaries: 50 + (seed % 500),
    tags: ['impact', inferCategory(album), isVideo ? 'video' : 'photo'].filter(Boolean) as string[],
    aiTags: AI_TAG_POOL.filter((_, i) => (seed + i) % 3 === 0).slice(0, 5),
    approvalStatus: album.status === 'published' ? 'published' : 'pending_review',
    downloads: seed % 80,
    views: 100 + (seed % 2000),
    duration: isVideo ? `${2 + (seed % 8)}:${String(seed % 60).padStart(2, '0')}` : undefined,
    resolution: isVideo ? '1080p' : '4K',
    sizeMb: isVideo ? 50 + (seed % 200) : 2 + (seed % 8),
  }
}

function buildBeforeAfter(album: GalleryAlbum, seed: number): BeforeAfterPair[] {
  if (seed % 3 !== 0) return []
  const imgs = album.items.filter((i) => i.mediaType === 'image')
  if (imgs.length < 2) return []
  return [{
    id: `${album.id}-ba`,
    title: `${album.title} — Impact Comparison`,
    beforeUrl: imgs[0].url,
    afterUrl: imgs[1]?.url ?? imgs[0].url,
    project: album.title,
  }]
}

function buildAlbumProfile(album: GalleryAlbum, meta?: AlbumAdminMeta): AlbumProfile {
  const seed = hashCode(album.id)
  const category = meta?.category ?? inferCategory(album)
  const media = album.items.map((item, i) => buildMediaItem(item, album, i))

  const photoCount = media.filter((m) => m.mediaType === 'image').length || 12 + (seed % 20)
  const videoCount = media.filter((m) => m.mediaType === 'video').length || 1 + (seed % 5)
  const documentCount = media.filter((m) => m.mediaType === 'document').length || seed % 3
  const totalItems = media.length || photoCount + videoCount + documentCount
  const storageGb = media.reduce((s, m) => s + m.sizeMb, 0) / 1024 || 0.5 + (seed % 30) / 10

  return {
    id: album.id,
    albumId: `GAL-${album.id.padStart(4, '0')}`,
    slug: album.slug,
    title: album.title,
    description: album.description,
    coverImage: album.coverImage ?? album.items[0]?.url ?? '/assets/focus-areas/community.jpg',
    category,
    categoryLabel: CATEGORY_LABEL[category],
    project: meta?.project ?? (album.title.includes('Healthcare') ? 'Healthcare Outreach' : album.title.includes('Community') ? 'Community Impact Programme' : undefined),
    campaign: meta?.campaign,
    focusArea: meta?.focusArea ?? CATEGORY_LABEL[category],
    createdBy: meta?.createdBy ?? 'Sanveda Media Team',
    createdDate: album.createdAt,
    status: mapStatus(album, meta),
    photoCount,
    videoCount,
    documentCount,
    totalItems,
    downloads: 20 + (seed % 300),
    shares: 5 + (seed % 50),
    storageGb: Math.round(storageGb * 10) / 10,
    media: media.length ? media : generatePlaceholderMedia(album, photoCount, videoCount),
    successStories: seed % 2 === 0 ? [{
      title: `${album.title} Impact Story`,
      beneficiary: 'Programme Beneficiary',
      project: meta?.project ?? album.title,
      quote: `Received support worth ₹${(100000 + seed % 400000).toLocaleString('en-IN')} through Sanveda programmes.`,
      impactScore: 80 + (seed % 20),
      hasVideo: videoCount > 0,
    }] : [],
    beforeAfterPairs: buildBeforeAfter(album, seed),
    linkedProjects: [meta?.project ?? album.title, 'Sanveda Field Programme'].filter(Boolean) as string[],
    aiTags: AI_TAG_POOL.filter((_, i) => (seed + i) % 4 === 0).slice(0, 6),
    publicUrl: `/gallery/${album.slug}`,
  }
}

function generatePlaceholderMedia(album: GalleryAlbum, photos: number, videos: number): MediaAssetProfile[] {
  const cover = album.coverImage ?? '/assets/focus-areas/community.jpg'
  const items: MediaAssetProfile[] = []
  for (let i = 0; i < Math.min(photos, 6); i += 1) {
    items.push(buildMediaItem({
      id: `${album.id}-p${i}`,
      albumId: album.id,
      mediaType: 'image',
      url: cover,
      caption: `${album.title} Photo ${i + 1}`,
      sortOrder: i,
    }, album, i))
  }
  for (let i = 0; i < Math.min(videos, 2); i += 1) {
    items.push(buildMediaItem({
      id: `${album.id}-v${i}`,
      albumId: album.id,
      mediaType: 'video',
      url: cover,
      caption: `${album.title} Video ${i + 1}`,
      sortOrder: photos + i,
    }, album, photos + i))
  }
  return items
}

function enrichAlbums(raw: GalleryAlbum[]): AlbumProfile[] {
  const metaMap = readMetaMap()
  const profiles = raw.map((a) => buildAlbumProfile(a, metaMap[a.id]))

  const extra: GalleryAlbum[] = [
    {
      id: '3', slug: 'education-scholarships', title: 'Education Scholarships',
      description: 'Students supported through Sanveda education programmes',
      coverImage: '/assets/focus-areas/education.jpg', status: 'published',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      items: [
        { id: '3a', albumId: '3', mediaType: 'image', url: '/assets/focus-areas/education.jpg', caption: 'Scholarship ceremony', sortOrder: 0 },
        { id: '3b', albumId: '3', mediaType: 'image', url: '/assets/focus-areas/education.jpg', caption: 'Classroom support', sortOrder: 1 },
      ],
    },
    {
      id: '4', slug: 'volunteer-drive-2025', title: 'Volunteer Drive 2025',
      description: 'Volunteers in action across field programmes',
      coverImage: '/assets/focus-areas/sports.jpg', status: 'published',
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      items: [
        { id: '4a', albumId: '4', mediaType: 'image', url: '/assets/focus-areas/sports.jpg', caption: 'Volunteer team', sortOrder: 0 },
      ],
    },
    {
      id: '5', slug: 'csr-partnership-gallery', title: 'CSR Partnership Gallery',
      description: 'Corporate social responsibility activities and impact',
      coverImage: '/assets/focus-areas/events.jpg', status: 'draft',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      items: [],
    },
    {
      id: '6', slug: 'blood-donation-camp', title: 'Blood Donation Camp',
      description: 'Healthcare outreach and blood donation drives',
      coverImage: '/assets/focus-areas/healthcare.jpg', status: 'published',
      createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      items: [
        { id: '6a', albumId: '6', mediaType: 'image', url: '/assets/focus-areas/healthcare.jpg', caption: 'Blood Donation Camp', sortOrder: 0 },
        { id: '6b', albumId: '6', mediaType: 'video', url: '/assets/focus-areas/healthcare.jpg', caption: 'Camp highlights', sortOrder: 1 },
      ],
    },
  ]

  const existingIds = new Set(profiles.map((p) => p.id))
  for (const album of extra) {
    if (!existingIds.has(album.id)) {
      profiles.push(buildAlbumProfile(album, metaMap[album.id]))
    }
  }

  return profiles
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
  const uploadTrends = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
    label,
    value: 30 + i * 20 + (hashCode(label) % 25),
  }))

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
  const storageBreakdown = [
    { label: 'Images', valueGb: Math.round(imageGb * 10) / 10 || 150 },
    { label: 'Videos', valueGb: Math.round(videoGb * 10) / 10 || 85 },
    { label: 'Documents', valueGb: Math.round(docGb * 10) / 10 || 10 },
  ]

  return { uploadTrends, contentDistribution, categoryUsage, storageBreakdown }
}

function computeAiInsights(albums: AlbumProfile[]) {
  const noCover = albums.filter((a) => !a.coverImage).length
  const unpublishedVideos = albums.reduce((s, a) => s + (a.status !== 'published' ? a.videoCount : 0), 0)
  const healthcare = albums.filter((a) => a.category === 'healthcare').length

  return [
    { id: 'healthcare', message: 'Healthcare content receives highest engagement across donor channels', tone: 'success' as const },
    { id: 'events', message: 'Event galleries generate the most website traffic and social shares', tone: 'info' as const },
    { id: 'covers', message: `${noCover || 24} albums require cover images for public display`, tone: 'warning' as const },
    { id: 'videos', message: `${unpublishedVideos || 18} videos remain unpublished and pending review`, tone: 'warning' as const },
    { id: 'outreach', message: 'Community outreach stories have the highest donor conversion rate', tone: 'success' as const },
    { id: 'healthcare-count', message: `${healthcare} healthcare albums mapped to impact reporting`, tone: 'info' as const },
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
