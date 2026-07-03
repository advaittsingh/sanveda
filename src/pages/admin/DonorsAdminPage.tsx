import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import DonorAiInsights from '../../components/admin/donors/DonorAiInsights'
import DonorAnalytics from '../../components/admin/donors/DonorAnalytics'
import DonorFiltersPanel from '../../components/admin/donors/DonorFiltersPanel'
import DonorKpiCards from '../../components/admin/donors/DonorKpiCards'
import DonorProfileDrawer from '../../components/admin/donors/DonorProfileDrawer'
import DonorToolbar, { DonorEmptyState } from '../../components/admin/donors/DonorToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  exportDonorsCsv,
  filterDonors,
  formatDonorType,
  getDonorDashboardData,
  updateDonorMeta,
  type DonorDashboardData,
  type DonorFilters,
  type DonorProfile,
} from '../../lib/donorOperationsService'

const defaultFilters: DonorFilters = {
  search: '',
  type: 'all',
  givingLevel: 'all',
  engagement: 'all',
  tag: 'all',
}

export default function DonorsAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<DonorDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<DonorFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [activeDonor, setActiveDonor] = useState<DonorProfile | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getDonorDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredDonors = useMemo(() => {
    if (!dashboard) return []
    return filterDonors(dashboard.donors, filters)
  }, [dashboard, filters])

  if (!authed) {
    return <AdminLogin title="Donor Management" subtitle="View donor profiles and giving history." />
  }

  if (loading || !dashboard) {
    return (
      <AdminShell title="Donor Management" subtitle="Track donor relationships and lifetime giving">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const patchFilters = (patch: Partial<DonorFilters>) => setFilters((prev) => ({ ...prev, ...patch }))

  const handleAddDonor = () => {
    const name = window.prompt('Donor name')
    const email = window.prompt('Donor email')
    if (!name?.trim() || !email?.trim()) return
    updateDonorMeta(email.trim().toLowerCase(), {
      phone: '',
      tags: [],
      followUpTasks: ['Send welcome email'],
    })
    refresh()
  }

  return (
    <AdminShell title="Donor Management" subtitle="Full donor relationship management and CRM">
      <div className="space-y-6">
        <DonorKpiCards kpis={dashboard.kpis} />

        <DonorToolbar
          onAddDonor={handleAddDonor}
          onImport={() => window.alert('CSV import will be available in a future release.')}
          onExport={() => exportDonorsCsv(filteredDonors)}
          onSendCampaign={() => window.alert('Campaign email composer coming soon.')}
          onGenerateReceipts={() => window.alert('Bulk receipt generation runs from the Donations module.')}
          search={filters.search}
          onSearchChange={(search) => patchFilters({ search })}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
        />

        {showFilters ? <DonorFiltersPanel filters={filters} onChange={patchFilters} /> : null}

        <AdminCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#0B2C6B]">Donor Directory</h3>
            <p className="text-sm text-slate-500">{filteredDonors.length} donors</p>
          </div>
          {!filteredDonors.length ? (
            <DonorEmptyState onAddDonor={handleAddDonor} onImport={() => patchFilters({ search: '' })} />
          ) : (
            <DataTable
              data={filteredDonors}
              keyFn={(d) => d.id}
              onRowClick={setActiveDonor}
              selectedKey={activeDonor?.id}
              columns={[
                {
                  key: 'donor',
                  header: 'Donor',
                  render: (d) => (
                    <div>
                      <p className="font-semibold text-[#0B2C6B]">{d.name}</p>
                      {d.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="mr-1 text-[10px] font-semibold text-[#0E4FA8]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'contact',
                  header: 'Contact',
                  render: (d) => (
                    <div className="text-xs">
                      <p>{d.email}</p>
                      <p className="text-slate-400">{d.phone}</p>
                    </div>
                  ),
                },
                {
                  key: 'type',
                  header: 'Type',
                  render: (d) => formatDonorType(d.type),
                },
                {
                  key: 'lifetime',
                  header: 'Lifetime Giving',
                  render: (d) => `₹${d.lifetimeGiving.toLocaleString('en-IN')}`,
                },
                {
                  key: 'count',
                  header: 'Donations',
                  render: (d) => d.donationCount,
                },
                {
                  key: 'last',
                  header: 'Last Donation',
                  render: (d) => new Date(d.lastDonation).toLocaleDateString('en-IN'),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (d) => <StatusBadge status={d.engagement} />,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (d) => (
                    <button
                      type="button"
                      className={`${adminBtnSecondary} !px-3 !py-1.5 text-xs`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveDonor(d)
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

        <DonorAnalytics
          donationsByMonth={dashboard.donationsByMonth}
          topDonors={dashboard.topDonors}
          donationSources={dashboard.donationSources}
        />

        <DonorAiInsights insights={dashboard.aiInsights} />
      </div>

      <DonorProfileDrawer donor={activeDonor} onClose={() => setActiveDonor(null)} />
    </AdminShell>
  )
}
