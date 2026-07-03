import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { addGalleryItem, deleteAlbum, getAllAlbumsAdmin, saveAlbum, type GalleryAlbum } from '../../lib/galleryService'

export default function GalleryAdminPage() {
  const { authed } = useAdminAuth()
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [form, setForm] = useState({ title: '', slug: '', coverImage: '', status: 'published' as const })
  const [newItemUrl, setNewItemUrl] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)

  const refresh = async () => setAlbums(await getAllAlbumsAdmin())
  useEffect(() => { if (authed) refresh() }, [authed])

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveAlbum(form)
    setForm({ title: '', slug: '', coverImage: '', status: 'published' })
    await refresh()
  }

  const handleAddItem = async () => {
    if (!selectedAlbum || !newItemUrl) return
    await addGalleryItem(selectedAlbum, newItemUrl)
    setNewItemUrl('')
    await refresh()
  }

  if (!authed) return <AdminLogin title="Gallery Admin" subtitle="Manage photo albums and media." />

  return (
    <AdminShell title="Gallery Management" subtitle="Albums, images, and videos">
      <form onSubmit={handleSaveAlbum} className="admin-form-panel" style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <input placeholder="Album title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <input placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
        <button type="submit" className="volunteer-btn volunteer-btn-primary">Create Album</button>
      </form>

      <div className="volunteer-admin-table-wrap">
        <table className="volunteer-admin-table">
          <thead><tr><th>Album</th><th>Items</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {albums.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td><td>{a.items.length}</td><td>{a.status}</td>
                <td>
                  <button type="button" onClick={() => setSelectedAlbum(a.id)}>Add Media</button>
                  <button type="button" onClick={async () => { await deleteAlbum(a.id); await refresh() }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAlbum && (
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <input placeholder="Image or video URL" value={newItemUrl} onChange={(e) => setNewItemUrl(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
          <button type="button" className="volunteer-btn volunteer-btn-primary" onClick={handleAddItem}>Add to Album</button>
        </div>
      )}
    </AdminShell>
  )
}
