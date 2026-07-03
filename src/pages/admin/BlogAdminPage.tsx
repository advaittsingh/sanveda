import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  deleteBlog,
  getAllBlogsAdmin,
  saveBlog,
  type BlogRecord,
  type BlogStatus,
} from '../../lib/blogService'

const STATUSES: BlogStatus[] = ['draft', 'published', 'archived']

const EMPTY: Partial<BlogRecord> = {
  title: '',
  slug: '',
  description: '',
  bannerImage: '/assets/fallBackBanner',
  category: 'General',
  status: 'draft',
  content: [{ id: 1, description: '' }],
}

export default function BlogAdminPage() {
  const { authed } = useAdminAuth()
  const [blogs, setBlogs] = useState<BlogRecord[]>([])
  const [form, setForm] = useState<Partial<BlogRecord>>(EMPTY)
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')

  const refresh = async () => setBlogs(await getAllBlogsAdmin())

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) {
      setError('Title is required')
      return
    }

    try {
      await saveBlog({
        ...form,
        id: editing ?? undefined,
        title: form.title.trim(),
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: [{ id: editing ?? Date.now(), description: form.description ?? '' }],
      })
      setForm(EMPTY)
      setEditing(null)
      setError('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  if (!authed) {
    return <AdminLogin title="Blog Admin" subtitle="Create and publish blog posts." />
  }

  return (
    <AdminShell title="Blog CMS" subtitle="Manage news and blog content">
      <div className="volunteer-admin-layout">
        <form className="volunteer-admin-profile admin-form-panel" onSubmit={handleSave}>
          <h2>{editing ? 'Edit Post' : 'New Post'}</h2>
          <label className="volunteer-field"><span>Title *</span><input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label className="volunteer-field"><span>Slug</span><input value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
          <label className="volunteer-field"><span>Category</span><input value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label className="volunteer-field"><span>Summary</span><textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="volunteer-field"><span>Banner Image</span><input value={form.bannerImage ?? ''} onChange={(e) => setForm({ ...form, bannerImage: e.target.value })} /></label>
          <label className="volunteer-field"><span>Status</span>
            <select value={form.status ?? 'draft'} onChange={(e) => setForm({ ...form, status: e.target.value as BlogStatus })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <div className="volunteer-admin-actions">
            <button type="submit" className="volunteer-btn volunteer-btn-primary">{editing ? 'Update' : 'Publish'}</button>
            {editing ? <button type="button" onClick={() => { setEditing(null); setForm(EMPTY) }}>Cancel</button> : null}
          </div>
          {error ? <em>{error}</em> : null}
        </form>

        <div className="volunteer-admin-table-wrap">
          <table className="volunteer-admin-table">
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b.id}>
                  <td>{b.title}</td>
                  <td>{b.category ?? '—'}</td>
                  <td><span className={`volunteer-status-badge status-${b.status}`}>{b.status}</span></td>
                  <td>
                    <button type="button" onClick={() => { setEditing(b.id); setForm(b) }}>Edit</button>
                    <button type="button" onClick={async () => { await deleteBlog(b.id); await refresh() }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
