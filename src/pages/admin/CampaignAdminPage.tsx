import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnDanger, adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../../components/admin/ui/adminStyles'
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

function progress(raised: number, goal: number) {
  if (!goal) return 0
  return Math.min(100, Math.round((raised / goal) * 100))
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

  const setStatus = async (c: CampaignRecord, status: CampaignStatus) => {
    await saveCampaign({ ...c, status })
    await refresh()
  }

  if (!authed) {
    return <AdminLogin title="Campaign Management" subtitle="Manage crowdfunding campaigns." />
  }

  return (
    <AdminShell title="Campaign Management" subtitle="Create, publish, and monitor fundraising campaigns">
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <AdminCard>
          <h2 className="mb-4 text-base font-semibold text-[#0B2C6B]">{editing ? 'Edit Campaign' : 'New Campaign'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <label className="block">
              <span className={adminLabelClass}>Title *</span>
              <input className={adminInputClass} value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Slug *</span>
              <input className={adminInputClass} value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Description</span>
              <textarea className={adminInputClass} rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Goal (₹)</span>
              <input type="number" className={adminInputClass} value={form.goal ?? 0} onChange={(e) => setForm({ ...form, goal: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Status</span>
              <select className={adminInputClass} value={form.status ?? 'draft'} onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={adminLabelClass}>Banner Image URL</span>
              <input className={adminInputClass} value={form.banner_image ?? ''} onChange={(e) => setForm({ ...form, banner_image: e.target.value })} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className={adminBtnPrimary}>{editing ? 'Update' : 'Create'}</button>
              {editing ? (
                <button type="button" className={adminBtnSecondary} onClick={() => { setEditing(null); setForm(EMPTY) }}>Cancel</button>
              ) : null}
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>
        </AdminCard>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <AdminCard key={c.id} className="overflow-hidden p-0">
                <img src={c.banner_image || c.thumbnail_image} alt="" className="h-32 w-full object-cover" />
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#0B2C6B] line-clamp-2">{c.title}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#D4A73F]" style={{ width: `${progress(c.raised, c.goal)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">
                    ₹{c.raised.toLocaleString('en-IN')} / ₹{c.goal.toLocaleString('en-IN')} · {progress(c.raised, c.goal)}%
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className={adminBtnSecondary} onClick={() => startEdit(c)}>Edit</button>
                    {c.status !== 'active' && (
                      <button type="button" className={adminBtnPrimary} onClick={() => setStatus(c, 'active')}>Activate</button>
                    )}
                    {c.status === 'active' && (
                      <button type="button" className={adminBtnSecondary} onClick={() => setStatus(c, 'closed')}>Pause</button>
                    )}
                    <button type="button" className={adminBtnDanger} onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>

          <DataTable
            loading={loading}
            data={campaigns}
            keyFn={(c) => String(c.id)}
            columns={[
              { key: 'title', header: 'Campaign', render: (c) => c.title },
              { key: 'goal', header: 'Goal', render: (c) => `₹${c.goal.toLocaleString('en-IN')}` },
              { key: 'raised', header: 'Raised', render: (c) => `₹${c.raised.toLocaleString('en-IN')}` },
              { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
              {
                key: 'actions',
                header: 'Actions',
                render: (c) => (
                  <button type="button" className={adminBtnSecondary} onClick={() => startEdit(c)}>Edit</button>
                ),
              },
            ]}
          />
        </div>
      </div>
    </AdminShell>
  )
}
