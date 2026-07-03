import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  deleteCampaign,
  getAllCampaignsAdmin,
  saveCampaign,
  type CampaignRecord,
  type CampaignStatus,
} from '../../lib/campaignService'

const STATUSES: CampaignStatus[] = ['draft', 'pending', 'active', 'closed']

const EMPTY: Partial<CampaignRecord> = {
  title: '',
  slug: '',
  goal: 5000000,
  raised: 0,
  description: '',
  exemption_tag: 'Tax Benefit',
  status: 'draft',
  banner_image: '/assets/fallBackBanner',
  thumbnail_image: '/assets/fallBackBanner',
  category: '["General"]',
  featureUrgent: 0,
  featureRecent: 0,
}

export default function CampaignAdminPage() {
  const { authed } = useAdminAuth()
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([])
  const [form, setForm] = useState<Partial<CampaignRecord>>(EMPTY)
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      setCampaigns(await getAllCampaignsAdmin())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title?.trim() || !form.slug?.trim()) {
      setError('Title and slug are required')
      return
    }

    try {
      await saveCampaign({
        ...form,
        id: editing ?? undefined,
        title: form.title.trim(),
        slug: form.slug.trim(),
      })
      setForm(EMPTY)
      setEditing(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const startEdit = (c: CampaignRecord) => {
    setEditing(c.id)
    setForm(c)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this campaign?')) return
    try {
      await deleteCampaign(id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (!authed) {
    return <AdminLogin title="Campaign Admin" subtitle="Manage crowdfunding campaigns." />
  }

  return (
    <AdminShell title="Campaign Management" subtitle="Create, edit, and publish campaigns">
      <div className="volunteer-admin-layout">
        <form className="volunteer-admin-profile admin-form-panel" onSubmit={handleSave}>
          <h2>{editing ? 'Edit Campaign' : 'New Campaign'}</h2>
          <label className="volunteer-field"><span>Title *</span><input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label className="volunteer-field"><span>Slug *</span><input value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></label>
          <label className="volunteer-field"><span>Description</span><textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="volunteer-field"><span>Goal (₹)</span><input type="number" value={form.goal ?? 0} onChange={(e) => setForm({ ...form, goal: Number(e.target.value) })} /></label>
          <label className="volunteer-field"><span>Status</span>
            <select value={form.status ?? 'draft'} onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="volunteer-field"><span>Banner Image URL</span><input value={form.banner_image ?? ''} onChange={(e) => setForm({ ...form, banner_image: e.target.value })} /></label>
          <div className="volunteer-admin-actions">
            <button type="submit" className="volunteer-btn volunteer-btn-primary">{editing ? 'Update' : 'Create'}</button>
            {editing ? <button type="button" onClick={() => { setEditing(null); setForm(EMPTY) }}>Cancel</button> : null}
          </div>
          {error ? <em>{error}</em> : null}
        </form>

        <div className="volunteer-admin-table-wrap">
          {loading ? <p className="volunteer-admin-empty">Loading…</p> : null}
          <table className="volunteer-admin-table">
            <thead><tr><th>Title</th><th>Slug</th><th>Goal</th><th>Raised</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.slug}</td>
                  <td>₹{c.goal.toLocaleString('en-IN')}</td>
                  <td>₹{c.raised.toLocaleString('en-IN')}</td>
                  <td><span className={`volunteer-status-badge status-${c.status}`}>{c.status}</span></td>
                  <td>
                    <button type="button" onClick={() => startEdit(c)}>Edit</button>
                    <button type="button" onClick={() => handleDelete(c.id)}>Delete</button>
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
