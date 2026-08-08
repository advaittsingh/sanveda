import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import CampaignKpiCards from '../../components/admin/campaigns/CampaignKpiCards'
import CampaignToolbar from '../../components/admin/campaigns/CampaignToolbar'
import CampaignGridCard from '../../components/admin/campaigns/CampaignGridCard'
import CampaignDataGrid from '../../components/admin/campaigns/CampaignDataGrid'
import CampaignWizard from '../../components/admin/campaigns/CampaignWizard'
import CampaignDetailPanel from '../../components/admin/campaigns/CampaignDetailPanel'
import DonationStatsWidget from '../../components/admin/campaigns/DonationStatsWidget'
import PendingCampaignsSection from '../../components/admin/campaigns/PendingCampaignsSection'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  bulkUpdateCampaignStatus,
  deleteCampaign,
  getAllCampaignsAdmin,
  saveCampaign,
  type CampaignRecord,
} from '../../lib/campaignService'
import {
  computeCampaignKpis,
  exportCampaignsCsv,
  filterCampaigns,
  getDonationPeriodStats,
  getFilterOptions,
  getPendingCampaigns,
} from '../../lib/campaignAdminService'
import type { CampaignFilters, DonationPeriodStats } from '../../types/campaignAdmin'
import { adminBtnDanger, adminBtnPrimary, adminBtnSecondary } from '../../components/admin/ui/adminStyles'

const DEFAULT_FILTERS: CampaignFilters = {
  query: '',
  category: 'all',
  status: 'all',
  focusArea: 'all',
  createdBy: 'all',
  sort: 'newest',
}

export default function CampaignAdminPage() {
  const { authed } = useAdminAuth()
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([])
  const [donationStats, setDonationStats] = useState<DonationPeriodStats>({ today: 0, thisWeek: 0, thisMonth: 0 })
  const [filters, setFilters] = useState<CampaignFilters>(DEFAULT_FILTERS)
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editing, setEditing] = useState<CampaignRecord | null>(null)
  const [detail, setDetail] = useState<CampaignRecord | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [all, stats] = await Promise.all([getAllCampaignsAdmin(), getDonationPeriodStats()])
      setCampaigns(all)
      setDonationStats(stats)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filterOptions = useMemo(() => getFilterOptions(campaigns), [campaigns])
  const filtered = useMemo(() => filterCampaigns(campaigns, filters), [campaigns, filters])
  const kpis = useMemo(() => computeCampaignKpis(campaigns), [campaigns])
  const pending = useMemo(() => getPendingCampaigns(campaigns), [campaigns])

  const handleSave = async (data: Partial<CampaignRecord> & { title: string; slug: string }) => {
    await saveCampaign(data)
    setWizardOpen(false)
    setEditing(null)
    await refresh()
  }

  const handleDelete = async (c: CampaignRecord) => {
    if (!confirm(`Delete "${c.title}"?`)) return
    try {
      await deleteCampaign(c.id)
      setDetail(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handlePause = async (c: CampaignRecord) => {
    await saveCampaign({ ...c, status: 'paused' })
    await refresh()
  }

  const handleApprove = async (c: CampaignRecord) => {
    await saveCampaign({ ...c, status: 'published' })
    await refresh()
  }

  const handlePreview = (c: CampaignRecord) => {
    window.open(`/campaign/${c.slug}`, '_blank')
  }

  const handleBulk = async (action: 'approve' | 'pause' | 'delete' | 'export') => {
    const ids = Array.from(selectedIds)
    if (!ids.length) return

    if (action === 'export') {
      exportCampaignsCsv(campaigns.filter((c) => selectedIds.has(c.id)))
      return
    }

    if (action === 'delete') {
      if (!confirm(`Delete ${ids.length} campaigns?`)) return
      await Promise.all(ids.map((id) => deleteCampaign(id)))
    } else {
      await bulkUpdateCampaignStatus(ids, action === 'approve' ? 'published' : 'paused')
    }

    setSelectedIds(new Set())
    await refresh()
  }

  const handleImport = async (file: File) => {
    try {
      const text = await file.text()
      const imported = JSON.parse(text) as CampaignRecord[]
      if (!Array.isArray(imported)) throw new Error('Invalid file format')
      for (const c of imported) {
        await saveCampaign({ ...c, id: undefined, title: c.title, slug: c.slug || `import-${Date.now()}` })
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    }
  }

  if (!authed) {
    return <AdminLogin title="Campaign Management" subtitle="Manage crowdfunding campaigns." />
  }

  return (
    <AdminShell title="Campaign Management" subtitle="Crowdfunding operations center — create, approve, and monitor campaigns">
      <div className="space-y-6">
        <CampaignKpiCards kpis={kpis} />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DonationStatsWidget stats={donationStats} />
          </div>
        </div>

        <CampaignToolbar
          filters={filters}
          options={filterOptions}
          view={view}
          onFiltersChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          onViewChange={setView}
          onCreate={() => { setEditing(null); setWizardOpen(true) }}
          onExport={() => exportCampaignsCsv(filtered)}
          onImport={handleImport}
        />

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <span className="text-sm font-medium text-slate-600">{selectedIds.size} selected</span>
            <button type="button" className={adminBtnPrimary} onClick={() => handleBulk('approve')}>Approve</button>
            <button type="button" className={adminBtnSecondary} onClick={() => handleBulk('pause')}>Pause</button>
            <button type="button" className={adminBtnSecondary} onClick={() => handleBulk('export')}>Export</button>
            <button type="button" className={adminBtnDanger} onClick={() => handleBulk('delete')}>Delete</button>
          </div>
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <CampaignGridCard
                key={c.id}
                campaign={c}
                selected={selectedIds.has(c.id)}
                onSelect={(id, checked) => {
                  setSelectedIds((prev) => {
                    const next = new Set(prev)
                    if (checked) next.add(id)
                    else next.delete(id)
                    return next
                  })
                }}
                onEdit={(camp) => { setEditing(camp); setWizardOpen(true) }}
                onView={setDetail}
                onPreview={handlePreview}
                onPause={handlePause}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <CampaignDataGrid
            campaigns={filtered}
            selectedIds={selectedIds}
            loading={loading}
            onToggleSelect={(id) => {
              setSelectedIds((prev) => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id)
                else next.add(id)
                return next
              })
            }}
            onToggleAll={(checked) => {
              setSelectedIds(checked ? new Set(filtered.map((c) => c.id)) : new Set())
            }}
            onView={setDetail}
            onEdit={(c) => { setEditing(c); setWizardOpen(true) }}
            onPreview={handlePreview}
            onPause={handlePause}
            onDelete={handleDelete}
          />
        )}

        <PendingCampaignsSection
          campaigns={pending}
          onApprove={handleApprove}
          onView={setDetail}
        />
      </div>

      <CampaignWizard
        open={wizardOpen}
        initial={editing}
        onClose={() => { setWizardOpen(false); setEditing(null) }}
        onSave={handleSave}
      />

      <CampaignDetailPanel
        campaign={detail}
        onClose={() => setDetail(null)}
        onEdit={(c) => { setDetail(null); setEditing(c); setWizardOpen(true) }}
        onPreview={handlePreview}
        onPause={handlePause}
        onDelete={handleDelete}
      />
    </AdminShell>
  )
}
