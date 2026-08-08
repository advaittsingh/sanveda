import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import GalleryAddModal from '../../components/admin/gallery/GalleryAddModal'
import GalleryAiInsights from '../../components/admin/gallery/GalleryAiInsights'
import GalleryAlbumCardGrid from '../../components/admin/gallery/GalleryAlbumCardGrid'
import GalleryAlbumProfileDrawer from '../../components/admin/gallery/GalleryAlbumProfileDrawer'
import GalleryAnalytics from '../../components/admin/gallery/GalleryAnalytics'
import GalleryFiltersPanel from '../../components/admin/gallery/GalleryFiltersPanel'
import GalleryKpiCards from '../../components/admin/gallery/GalleryKpiCards'
import GalleryToolbar, { GalleryEmptyState } from '../../components/admin/gallery/GalleryToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { addGalleryItem } from '../../lib/galleryService'
import { uploadPrivateFile } from '../../lib/privateStorageClient'
import {
  exportGalleryCsv,
  filterAlbums,
  getGalleryDashboardData,
  type GalleryDashboardData,
  type GalleryFilters,
  type AlbumProfile,
} from '../../lib/galleryOperationsService'

const defaultFilters: GalleryFilters = {
  search: '',
  category: 'all',
  status: 'all',
}

export default function GalleryAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<GalleryDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<GalleryFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [activeAlbum, setActiveAlbum] = useState<AlbumProfile | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<AlbumProfile | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getGalleryDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredAlbums = useMemo(() => {
    if (!dashboard) return []
    return filterAlbums(dashboard.albums, filters)
  }, [dashboard, filters])

  const openAlbum = (album: AlbumProfile) => setActiveAlbum(album)

  const handleEdit = () => {
    if (!activeAlbum) return
    setEditingAlbum(activeAlbum)
    setShowAddModal(true)
  }

  const handleSaved = async () => {
    await refresh()
    if (activeAlbum) {
      const refreshed = (await getGalleryDashboardData()).albums.find((a) => a.id === activeAlbum.id)
      if (refreshed) setActiveAlbum(refreshed)
    }
  }

  const handleUploadMedia = async () => {
    const albumId = activeAlbum?.id
    if (!albumId) {
      window.alert('Open an album first, then upload media to it.')
      return
    }
    const file = await new Promise<File | null>((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/jpeg,image/png,image/webp,video/mp4,video/webm'
      input.onchange = () => resolve(input.files?.[0] ?? null)
      input.click()
    })
    if (!file) return
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
    const stored = await uploadPrivateFile(
      mediaType === 'video' ? 'gallery-video' : 'gallery-image',
      albumId,
      file,
    )
    await addGalleryItem(albumId, stored.path, file.name, mediaType)
    await handleSaved()
  }

  if (!authed) {
    return (
      <AdminLogin
        title="Gallery Management"
        subtitle="Digital asset management — proof of impact for donors, CSR, and social media."
      />
    )
  }

  return (
    <AdminShell
      title="Gallery Management"
      subtitle="Proof-of-impact repository — albums, media assets, approval workflow, and analytics."
    >
      {loading && !dashboard ? (
        <AdminCard>
          <p className="text-sm text-slate-500">Loading media library…</p>
        </AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <GalleryKpiCards kpis={dashboard.kpis} />

          <AdminCard>
            <GalleryToolbar
              onCreateAlbum={() => { setEditingAlbum(null); setShowAddModal(true) }}
              onUploadMedia={handleUploadMedia}
              onBulkUpload={() => window.alert('Select an album and use Upload Media for private Blob storage.')}
              onImport={() => window.alert('CSV import will map albums and media metadata from external DAM systems.')}
              onExport={() => exportGalleryCsv(filteredAlbums)}
              search={filters.search}
              onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((v) => !v)}
            />
          </AdminCard>

          {showFilters ? (
            <GalleryFiltersPanel
              filters={filters}
              onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
            />
          ) : null}

          {filteredAlbums.length === 0 ? (
            <GalleryEmptyState onCreateAlbum={() => { setEditingAlbum(null); setShowAddModal(true) }} />
          ) : (
            <GalleryAlbumCardGrid albums={filteredAlbums} onOpen={openAlbum} />
          )}

          <GalleryAnalytics
            uploadTrends={dashboard.uploadTrends}
            contentDistribution={dashboard.contentDistribution}
            categoryUsage={dashboard.categoryUsage}
            storageBreakdown={dashboard.storageBreakdown}
          />

          <GalleryAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <GalleryAlbumProfileDrawer
        album={activeAlbum}
        onClose={() => setActiveAlbum(null)}
        onEdit={handleEdit}
        onUploadMedia={handleUploadMedia}
      />

      <GalleryAddModal
        open={showAddModal}
        editing={editingAlbum}
        onClose={() => { setShowAddModal(false); setEditingAlbum(null) }}
        onSaved={handleSaved}
      />
    </AdminShell>
  )
}
