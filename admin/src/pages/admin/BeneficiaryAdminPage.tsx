import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import BeneficiaryAddModal, { type BeneficiaryFormData } from '../../components/admin/beneficiaries/BeneficiaryAddModal'
import BeneficiaryAiInsights from '../../components/admin/beneficiaries/BeneficiaryAiInsights'
import BeneficiaryAnalytics from '../../components/admin/beneficiaries/BeneficiaryAnalytics'
import BeneficiaryFiltersPanel from '../../components/admin/beneficiaries/BeneficiaryFiltersPanel'
import BeneficiaryGeographicPanel from '../../components/admin/beneficiaries/BeneficiaryGeographicPanel'
import BeneficiaryKpiCards from '../../components/admin/beneficiaries/BeneficiaryKpiCards'
import BeneficiaryPipeline from '../../components/admin/beneficiaries/BeneficiaryPipeline'
import BeneficiaryProfileDrawer from '../../components/admin/beneficiaries/BeneficiaryProfileDrawer'
import BeneficiaryToolbar, { BeneficiaryEmptyState } from '../../components/admin/beneficiaries/BeneficiaryToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  deleteBeneficiary,
  saveBeneficiary,
  type BeneficiaryStatus,
} from '../../lib/beneficiaryService'
import {
  exportBeneficiariesCsv,
  filterBeneficiaries,
  getBeneficiaryDashboardData,
  updateBeneficiaryMeta,
  type BeneficiaryDashboardData,
  type BeneficiaryFilters,
  type BeneficiaryProfile,
} from '../../lib/beneficiaryOperationsService'

const defaultFilters: BeneficiaryFilters = {
  search: '',
  category: 'all',
  status: 'all',
  program: 'all',
  location: 'all',
  priority: 'all',
}

export default function BeneficiaryAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<BeneficiaryDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<BeneficiaryFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table')
  const [activeBeneficiary, setActiveBeneficiary] = useState<BeneficiaryProfile | null>(null)
  const [notes, setNotes] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getBeneficiaryDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredBeneficiaries = useMemo(() => {
    if (!dashboard) return []
    return filterBeneficiaries(dashboard.beneficiaries, filters)
  }, [dashboard, filters])

  const openProfile = (beneficiary: BeneficiaryProfile) => {
    setActiveBeneficiary(beneficiary)
    setNotes(beneficiary.notes ?? '')
  }

  const setStatus = async (id: string, status: BeneficiaryStatus) => {
    await saveBeneficiary({ id, fullName: activeBeneficiary?.fullName ?? '', status })
    await refresh()
    const refreshed = (await getBeneficiaryDashboardData()).beneficiaries.find((b) => b.id === id)
    if (refreshed) setActiveBeneficiary(refreshed)
  }

  const handleSaveNotes = async (id: string, adminNotes: string) => {
    await saveBeneficiary({ id, fullName: activeBeneficiary?.fullName ?? '', notes: adminNotes })
    await updateBeneficiaryMeta(id, { adminNotes })
    await refresh()
  }

  const handleDelete = async (id: string) => {
    await deleteBeneficiary(id)
    setActiveBeneficiary(null)
    await refresh()
  }

  const handleSaveBeneficiary = async (data: BeneficiaryFormData) => {
    if (!data.fullName.trim()) return
    await saveBeneficiary({
      id: editingId ?? undefined,
      fullName: data.fullName.trim(),
      phone: data.phone || undefined,
      email: data.email || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      category: data.category || undefined,
      program: data.program || undefined,
      supportType: data.supportType || undefined,
      supportAmount: data.supportAmount,
      status: data.status,
      notes: data.notes || undefined,
    })
    setShowAddModal(false)
    setEditingId(null)
    await refresh()
  }

  if (!authed) {
    return <AdminLogin title="Beneficiary Admin" subtitle="Manage beneficiary records and support tracking." />
  }

  if (loading || !dashboard) {
    return (
      <AdminShell title="Beneficiary Management" subtitle="Case management and impact tracking">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const patchFilters = (patch: Partial<BeneficiaryFilters>) => setFilters((prev) => ({ ...prev, ...patch }))

  const editingForm: BeneficiaryFormData | null = editingId
    ? (() => {
        const b = dashboard.beneficiaries.find((x) => x.id === editingId)
        if (!b) return null
        return {
          fullName: b.fullName,
          phone: b.phone ?? '',
          email: b.email ?? '',
          city: b.city ?? '',
          state: b.state ?? '',
          category: b.categoryLabel,
          program: b.program ?? '',
          supportType: b.supportType ?? '',
          supportAmount: b.supportAmount,
          status: b.status,
          notes: b.notes ?? '',
        }
      })()
    : null

  return (
    <AdminShell title="Beneficiary Management" subtitle="Case management, support tracking, and impact outcomes">
      <div className="space-y-6">
        <BeneficiaryKpiCards kpis={dashboard.kpis} />

        <BeneficiaryToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddBeneficiary={() => { setEditingId(null); setShowAddModal(true) }}
          onExport={() => exportBeneficiariesCsv(filteredBeneficiaries)}
          search={filters.search}
          onSearchChange={(search) => patchFilters({ search })}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
        />

        {showFilters ? (
          <BeneficiaryFiltersPanel
            filters={filters}
            onChange={patchFilters}
            programOptions={dashboard.programOptions}
            locationOptions={dashboard.locationOptions}
          />
        ) : null}

        <AdminCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#0B2C6B]">Beneficiary Directory</h3>
            <p className="text-sm text-slate-500">{filteredBeneficiaries.length} beneficiaries</p>
          </div>

          {!filteredBeneficiaries.length ? (
            <BeneficiaryEmptyState onAddBeneficiary={() => setShowAddModal(true)} />
          ) : viewMode === 'pipeline' ? (
            <BeneficiaryPipeline pipeline={dashboard.pipeline} onSelect={openProfile} />
          ) : (
            <DataTable
              data={filteredBeneficiaries}
              keyFn={(b) => b.id}
              onRowClick={openProfile}
              selectedKey={activeBeneficiary?.id}
              columns={[
                {
                  key: 'beneficiary',
                  header: 'Beneficiary',
                  render: (b) => (
                    <div>
                      <p className="font-semibold text-[#0B2C6B]">{b.fullName}</p>
                      <p className="text-xs text-slate-400">{b.categoryLabel}</p>
                    </div>
                  ),
                },
                { key: 'id', header: 'ID', render: (b) => b.beneficiaryId },
                { key: 'program', header: 'Program', render: (b) => b.programLabel },
                { key: 'category', header: 'Category', render: (b) => b.categoryLabel },
                {
                  key: 'support',
                  header: 'Support Received',
                  render: (b) => `₹${b.supportReceived.toLocaleString('en-IN')}`,
                },
                { key: 'location', header: 'Location', render: (b) => b.locationLabel },
                { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
                { key: 'updated', header: 'Last Updated', render: (b) => b.lastUpdatedLabel },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (b) => (
                    <button
                      type="button"
                      className={`${adminBtnSecondary} !px-3 !py-1.5 text-xs`}
                      onClick={(e) => {
                        e.stopPropagation()
                        openProfile(b)
                      }}
                    >
                      <Eye size={13} className="mr-1" />
                      View
                    </button>
                  ),
                },
              ]}
            />
          )}
        </AdminCard>

        <BeneficiaryGeographicPanel
          geographic={dashboard.geographic}
          supportDistribution={dashboard.supportDistribution}
        />

        <BeneficiaryAnalytics
          beneficiariesByProgram={dashboard.beneficiariesByProgram}
          monthlyGrowth={dashboard.monthlyGrowth}
          supportByType={dashboard.supportByType}
        />

        <BeneficiaryAiInsights insights={dashboard.aiInsights} />
      </div>

      <BeneficiaryProfileDrawer
        beneficiary={activeBeneficiary}
        notes={notes}
        onNotesChange={setNotes}
        onClose={() => setActiveBeneficiary(null)}
        onStatusChange={setStatus}
        onSaveNotes={handleSaveNotes}
        onDelete={handleDelete}
      />

      <BeneficiaryAddModal
        open={showAddModal}
        editing={editingForm}
        onClose={() => { setShowAddModal(false); setEditingId(null) }}
        onSave={handleSaveBeneficiary}
      />
    </AdminShell>
  )
}
