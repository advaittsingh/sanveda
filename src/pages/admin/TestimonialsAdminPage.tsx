import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import TestimonialAiInsights from '../../components/admin/testimonials/TestimonialAiInsights'
import TestimonialAnalytics from '../../components/admin/testimonials/TestimonialAnalytics'
import TestimonialEditorModal from '../../components/admin/testimonials/TestimonialEditorModal'
import TestimonialFiltersPanel from '../../components/admin/testimonials/TestimonialFiltersPanel'
import TestimonialKpiCards from '../../components/admin/testimonials/TestimonialKpiCards'
import TestimonialNav from '../../components/admin/testimonials/TestimonialNav'
import TestimonialProfileDrawer from '../../components/admin/testimonials/TestimonialProfileDrawer'
import {
  TestimonialArchitecturePanel,
  TestimonialBeneficiaryPanel,
  TestimonialCategoriesPanel,
  TestimonialDonorPanel,
  TestimonialFeaturedPanel,
  TestimonialPlacementPanel,
  TestimonialProjectMappingPanel,
  TestimonialPublishingPanel,
  TestimonialReviewsPanel,
  TestimonialSentimentPanel,
  TestimonialSocialProofPanel,
  TestimonialStoryBuilder,
  TestimonialVideoPanel,
} from '../../components/admin/testimonials/TestimonialSupportPanels'
import TestimonialToolbar from '../../components/admin/testimonials/TestimonialToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnDanger, adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  deleteTestimonial,
  exportTestimonialsCsv,
  filterTestimonials,
  getTestimonialDashboardData,
  renderStars,
  saveTestimonial,
  type TestimonialDashboardData,
  type TestimonialFilters,
  type TestimonialProfile,
  type TestimonialTab,
} from '../../lib/testimonialOperationsService'

const defaultFilters: TestimonialFilters = {
  search: '',
  category: 'all',
  status: 'all',
  featured: 'all',
}

export default function TestimonialsAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<TestimonialDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TestimonialTab>('dashboard')
  const [filters, setFilters] = useState<TestimonialFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [active, setActive] = useState<TestimonialProfile | null>(null)
  const [editing, setEditing] = useState<Partial<TestimonialProfile> | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getTestimonialDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filtered = useMemo(() => {
    if (!dashboard) return []
    return filterTestimonials(dashboard.testimonials, filters)
  }, [dashboard, filters])

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3500)
  }

  const openAdd = () => {
    setEditing(null)
    setShowEditor(true)
  }

  const openEdit = (t: TestimonialProfile) => {
    setEditing(t)
    setShowEditor(true)
    setActive(null)
  }

  const handleSave = async (t: Partial<TestimonialProfile> & { name: string }) => {
    await saveTestimonial(t)
    setShowEditor(false)
    setEditing(null)
    await refresh()
    notify(`Testimonial from ${t.name} saved.`)
  }

  const handleDelete = async (id: string) => {
    await deleteTestimonial(id)
    setActive(null)
    await refresh()
    notify('Testimonial deleted.')
  }

  const handleApprove = async (t: TestimonialProfile) => {
    await saveTestimonial({ ...t, status: 'published' })
    await refresh()
    const updated = (await getTestimonialDashboardData()).testimonials.find((x) => x.id === t.id)
    if (updated) setActive(updated)
    notify(`Testimonial from ${t.name} approved and published.`)
  }

  const showTable = tab === 'dashboard' || tab === 'testimonials'

  if (!authed) {
    return (
      <AdminLogin
        title="Testimonials"
        subtitle="Trust, social proof & impact stories engine — why should someone trust Sanveda?"
      />
    )
  }

  return (
    <AdminShell
      title="Testimonials"
      subtitle="Trust Engine — donor proof, beneficiary stories, volunteer voices, and CSR partnerships"
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0B2C6B] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading testimonials dashboard…</p></AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <TestimonialKpiCards kpis={dashboard.kpis} />
          <TestimonialNav active={tab} onChange={setTab} />

          {tab === 'dashboard' ? (
            <>
              <TestimonialSocialProofPanel socialProof={dashboard.socialProof} />
              <TestimonialAnalytics categoryDistribution={dashboard.categoryDistribution} ratingDistribution={dashboard.ratingDistribution} />
              <TestimonialStoryBuilder />
              <TestimonialProjectMappingPanel />
              <TestimonialArchitecturePanel />
            </>
          ) : null}

          {showTable ? (
            <AdminCard>
              <TestimonialToolbar
                onAdd={openAdd}
                onExport={() => { exportTestimonialsCsv(filtered); notify('Testimonials exported to CSV.') }}
                onFeatureSelected={() => setTab('featured')}
                search={filters.search}
                onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((v) => !v)}
              />
              {showFilters ? (
                <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                  <TestimonialFiltersPanel filters={filters} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} />
                </div>
              ) : null}
              <div className="mt-4">
                <DataTable
                  columns={[
                    { key: 'name', header: 'Name', render: (t) => <span className="font-medium">{t.name}</span> },
                    { key: 'type', header: 'Type', render: (t) => t.categoryLabel },
                    { key: 'rating', header: 'Rating', render: (t) => <span className="text-amber-500">{renderStars(t.rating)}</span> },
                    { key: 'program', header: 'Program', render: (t) => t.program },
                    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
                    { key: 'featured', header: 'Featured', render: (t) => t.featured ? 'Yes' : 'No' },
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (t) => (
                        <div className="flex gap-2">
                          <button type="button" className={adminBtnSecondary} onClick={(e) => { e.stopPropagation(); setActive(t) }}>
                            {(t.status === 'submitted' || t.status === 'review') ? 'Review' : 'View'}
                          </button>
                          <button type="button" className={adminBtnDanger} onClick={(e) => { e.stopPropagation(); handleDelete(t.id) }}>Delete</button>
                        </div>
                      ),
                    },
                  ]}
                  data={filtered}
                  keyFn={(t) => t.id}
                  onRowClick={setActive}
                  selectedKey={active?.id}
                  emptyMessage="No testimonials found."
                />
              </div>
            </AdminCard>
          ) : null}

          {tab === 'video' ? <TestimonialVideoPanel testimonials={dashboard.testimonials} /> : null}
          {tab === 'featured' ? <TestimonialFeaturedPanel testimonials={dashboard.testimonials} /> : null}
          {tab === 'categories' ? (
            <>
              <TestimonialCategoriesPanel />
              <TestimonialDonorPanel testimonials={dashboard.testimonials} />
              <TestimonialBeneficiaryPanel testimonials={dashboard.testimonials} />
            </>
          ) : null}
          {tab === 'reviews' ? (
            <>
              <TestimonialReviewsPanel testimonials={dashboard.testimonials} />
              <TestimonialSentimentPanel testimonials={dashboard.testimonials} />
            </>
          ) : null}
          {tab === 'publishing' ? (
            <>
              <TestimonialPublishingPanel />
              <TestimonialPlacementPanel />
            </>
          ) : null}
          {tab === 'analytics' ? (
            <>
              <TestimonialAnalytics categoryDistribution={dashboard.categoryDistribution} ratingDistribution={dashboard.ratingDistribution} />
              <TestimonialSocialProofPanel socialProof={dashboard.socialProof} />
            </>
          ) : null}

          <TestimonialAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <TestimonialProfileDrawer
        testimonial={active}
        onClose={() => setActive(null)}
        onEdit={() => active && openEdit(active)}
        onApprove={() => active && handleApprove(active)}
      />
      <TestimonialEditorModal
        key={editing?.id ?? 'new'}
        open={showEditor}
        testimonial={editing}
        onClose={() => { setShowEditor(false); setEditing(null) }}
        onSave={handleSave}
      />
    </AdminShell>
  )
}
