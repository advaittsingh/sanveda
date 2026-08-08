import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import CmsAiAssistantModal from '../../components/admin/cms/CmsAiAssistantModal'
import CmsAiInsights from '../../components/admin/cms/CmsAiInsights'
import CmsAnalytics from '../../components/admin/cms/CmsAnalytics'
import CmsKpiCards from '../../components/admin/cms/CmsKpiCards'
import CmsNav from '../../components/admin/cms/CmsNav'
import {
  CmsAnnouncementsPanel,
  CmsArchitecturePanel,
  CmsFocusAreasPanel,
  CmsFooterPanel,
  CmsFormsPanel,
  CmsHeroBannersPanel,
  CmsHomepageBuilder,
  CmsMediaPanel,
  CmsNavigationPanel,
  CmsPreviewPanel,
  CmsPublishingPanel,
  CmsRedirectsPanel,
  CmsSectionBlocksPanel,
  CmsSeoPanel,
  CmsSettingsPanel,
  CmsStatisticsPanel,
  CmsTestimonialsPanel,
} from '../../components/admin/cms/CmsSupportPanels'
import CmsToolbar from '../../components/admin/cms/CmsToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  exportPagesCsv,
  filterPages,
  getCmsDashboardData,
  reorderHomepageSections,
  saveHomepageSections,
  toggleHomepageSection,
  type CmsDashboardData,
  type CmsTab,
} from '../../lib/cmsOperationsService'

export default function CmsAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<CmsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<CmsTab>('dashboard')
  const [search, setSearch] = useState('')
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getCmsDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredPages = useMemo(() => {
    if (!dashboard) return []
    return filterPages(dashboard.pages, search)
  }, [dashboard, search])

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3500)
  }

  const handleReorder = async (from: number, to: number) => {
    if (!dashboard) return
    const next = reorderHomepageSections(dashboard.homepageSections, from, to)
    saveHomepageSections(next)
    await refresh()
    notify('Homepage section order updated.')
  }

  const handleToggleSection = async (id: string, enabled: boolean) => {
    toggleHomepageSection(id, enabled)
    await refresh()
  }

  const handlePreview = (device: 'desktop' | 'tablet' | 'mobile') => {
    window.open('/', '_blank')
    notify(`Opening ${device} preview of the website.`)
  }

  const showPageTable = tab === 'dashboard' || tab === 'pages'

  if (!authed) {
    return (
      <AdminLogin
        title="Website CMS"
        subtitle="Central Website Experience Manager — control every section of the public site without code."
      />
    )
  }

  return (
    <AdminShell
      title="Website CMS"
      subtitle="WordPress + Webflow + Experience Cloud — the master controller of the Sanveda public website"
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0B2C6B] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading CMS dashboard…</p></AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <CmsKpiCards kpis={dashboard.kpis} />
          <CmsNav active={tab} onChange={setTab} />

          {tab === 'dashboard' ? (
            <>
              <CmsStatisticsPanel statistics={dashboard.statistics} />
              <CmsAnalytics trafficTrend={dashboard.trafficTrend} analytics={dashboard.analytics} />
              <CmsPreviewPanel onPreview={handlePreview} />
              <CmsArchitecturePanel />
            </>
          ) : null}

          {showPageTable ? (
            <AdminCard>
              <CmsToolbar
                onNewPage={() => notify('New page wizard — connect to page builder.')}
                onAiAssistant={() => setShowAiAssistant(true)}
                onExport={() => { exportPagesCsv(filteredPages); notify('Pages exported to CSV.') }}
                onPreview={handlePreview}
                search={search}
                onSearchChange={setSearch}
              />
              <div className="mt-4">
                <DataTable
                  columns={[
                    { key: 'title', header: 'Page', render: (p) => <span className="font-medium">{p.title}</span> },
                    { key: 'url', header: 'URL', render: (p) => <span className="font-mono text-xs">{p.url}</span> },
                    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
                    {
                      key: 'updated',
                      header: 'Last Updated',
                      render: (p) => {
                        const d = new Date(p.lastUpdated)
                        const today = new Date()
                        if (d.toDateString() === today.toDateString()) return 'Today'
                        const yesterday = new Date(today.getTime() - 86400000)
                        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
                        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      },
                    },
                  ]}
                  data={filteredPages}
                  keyFn={(p) => p.id}
                  emptyMessage="No pages found."
                />
              </div>
            </AdminCard>
          ) : null}

          {tab === 'homepage' ? (
            <>
              <CmsHomepageBuilder
                sections={dashboard.homepageSections}
                onReorder={handleReorder}
                onToggle={handleToggleSection}
              />
              <CmsStatisticsPanel statistics={dashboard.statistics} />
            </>
          ) : null}

          {tab === 'navigation' || tab === 'menus' ? <CmsNavigationPanel links={dashboard.navigation} /> : null}
          {tab === 'hero_banners' ? <CmsHeroBannersPanel banners={dashboard.heroBanners} /> : null}
          {tab === 'sections' ? <CmsSectionBlocksPanel blocks={dashboard.sectionBlocks} /> : null}
          {tab === 'footer' ? <CmsFooterPanel footer={dashboard.footer} /> : null}
          {tab === 'forms' ? <CmsFormsPanel forms={dashboard.forms} /> : null}
          {tab === 'testimonials' ? <CmsTestimonialsPanel testimonials={dashboard.testimonials} /> : null}
          {tab === 'announcements' ? <CmsAnnouncementsPanel announcements={dashboard.announcements} /> : null}
          {tab === 'seo' ? <CmsSeoPanel pages={dashboard.pages} /> : null}
          {tab === 'redirects' ? <CmsRedirectsPanel redirects={dashboard.redirects} /> : null}
          {tab === 'settings' ? (
            <>
              <CmsSettingsPanel />
              <CmsPublishingPanel />
              <CmsMediaPanel />
            </>
          ) : null}

          {tab === 'analytics' ? (
            <CmsAnalytics trafficTrend={dashboard.trafficTrend} analytics={dashboard.analytics} />
          ) : null}

          {tab === 'homepage' || tab === 'sections' ? <CmsFocusAreasPanel focusAreas={dashboard.focusAreas} /> : null}

          <CmsAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <CmsAiAssistantModal
        open={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        onGenerate={(prompt) => notify(`AI section generation started: "${prompt.slice(0, 50)}…"`)}
      />
    </AdminShell>
  )
}
