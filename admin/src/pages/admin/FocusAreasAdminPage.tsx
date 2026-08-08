import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import FocusAreaAddModal from '../../components/admin/focus-areas/FocusAreaAddModal'
import FocusAreaAiInsights from '../../components/admin/focus-areas/FocusAreaAiInsights'
import FocusAreaAnalytics from '../../components/admin/focus-areas/FocusAreaAnalytics'
import FocusAreaCardGrid from '../../components/admin/focus-areas/FocusAreaCardGrid'
import FocusAreaFiltersPanel from '../../components/admin/focus-areas/FocusAreaFiltersPanel'
import FocusAreaKpiCards from '../../components/admin/focus-areas/FocusAreaKpiCards'
import FocusAreaProfileDrawer from '../../components/admin/focus-areas/FocusAreaProfileDrawer'
import FocusAreaToolbar, { FocusAreaEmptyState } from '../../components/admin/focus-areas/FocusAreaToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  exportFocusAreasCsv,
  filterFocusAreas,
  getFocusAreaDashboardData,
  type FocusAreaDashboardData,
  type FocusAreaFilters,
  type FocusAreaProfile,
} from '../../lib/focusAreaOperationsService'

const defaultFilters: FocusAreaFilters = {
  search: '',
  status: 'all',
  priority: 'all',
}

export default function FocusAreasAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<FocusAreaDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FocusAreaFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [activeArea, setActiveArea] = useState<FocusAreaProfile | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingArea, setEditingArea] = useState<FocusAreaProfile | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getFocusAreaDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredAreas = useMemo(() => {
    if (!dashboard) return []
    return filterFocusAreas(dashboard.focusAreas, filters)
  }, [dashboard, filters])

  const openProfile = (area: FocusAreaProfile) => setActiveArea(area)

  const handleEdit = () => {
    if (!activeArea) return
    setEditingArea(activeArea)
    setShowAddModal(true)
  }

  const handleSaved = async () => {
    await refresh()
    if (activeArea) {
      const refreshed = (await getFocusAreaDashboardData()).focusAreas.find((a) => a.slug === activeArea.slug)
      if (refreshed) setActiveArea(refreshed)
    }
  }

  if (!authed) {
    return (
      <AdminLogin
        title="Focus Areas"
        subtitle="Program portfolio management — the strategic taxonomy layer for Sanveda NGO OS."
      />
    )
  }

  return (
    <AdminShell
      title="Focus Areas"
      subtitle="Program portfolio management — map projects, campaigns, beneficiaries, and impact to strategic pillars."
    >
      {loading && !dashboard ? (
        <AdminCard>
          <p className="text-sm text-slate-500">Loading programme portfolio…</p>
        </AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <FocusAreaKpiCards kpis={dashboard.kpis} />

          <AdminCard>
            <FocusAreaToolbar
              onCreate={() => { setEditingArea(null); setShowAddModal(true) }}
              onImport={() => window.alert('CSV import will connect to the focus area data API.')}
              onExport={() => exportFocusAreasCsv(filteredAreas)}
              onGenerateReport={() => window.alert('Impact report generation will compile cross-module metrics per focus area.')}
              search={filters.search}
              onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((v) => !v)}
            />
          </AdminCard>

          {showFilters ? (
            <FocusAreaFiltersPanel
              filters={filters}
              onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
            />
          ) : null}

          {filteredAreas.length === 0 ? (
            <FocusAreaEmptyState onCreate={() => { setEditingArea(null); setShowAddModal(true) }} />
          ) : (
            <FocusAreaCardGrid areas={filteredAreas} onView={openProfile} />
          )}

          <FocusAreaAnalytics
            fundingDistribution={dashboard.fundingDistribution}
            beneficiaryDistribution={dashboard.beneficiaryDistribution}
            growthTrends={dashboard.growthTrends}
          />

          <FocusAreaAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <FocusAreaProfileDrawer
        area={activeArea}
        onClose={() => setActiveArea(null)}
        onEdit={handleEdit}
      />

      <FocusAreaAddModal
        open={showAddModal}
        editing={editingArea}
        onClose={() => { setShowAddModal(false); setEditingArea(null) }}
        onSaved={handleSaved}
      />
    </AdminShell>
  )
}
