import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import BlogAiInsights from '../../components/admin/blogs/BlogAiInsights'
import BlogAiWriterModal from '../../components/admin/blogs/BlogAiWriterModal'
import BlogAnalytics from '../../components/admin/blogs/BlogAnalytics'
import BlogEditorModal from '../../components/admin/blogs/BlogEditorModal'
import BlogFiltersPanel from '../../components/admin/blogs/BlogFiltersPanel'
import BlogKpiCards from '../../components/admin/blogs/BlogKpiCards'
import BlogNav from '../../components/admin/blogs/BlogNav'
import {
  BlogAiWriterPanel,
  BlogArchitecturePanel,
  BlogArticleAnalyticsTable,
  BlogAuthorsPanel,
  BlogCategoriesPanel,
  BlogFeaturedStory,
  BlogMediaPanel,
  BlogProjectIntegrationPanel,
  BlogPublishingPanel,
  BlogRelatedContent,
  BlogSeoOverviewPanel,
  BlogSocialPublishing,
  BlogStoriesPanel,
} from '../../components/admin/blogs/BlogSupportPanels'
import BlogToolbar from '../../components/admin/blogs/BlogToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnDanger, adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  deleteArticle,
  exportArticlesCsv,
  filterArticles,
  getBlogDashboardData,
  saveArticleProfile,
  type BlogArticleProfile,
  type BlogCmsTab,
  type BlogDashboardData,
  type BlogFilters,
} from '../../lib/blogOperationsService'

const defaultFilters: BlogFilters = {
  search: '',
  category: 'all',
  contentType: 'all',
  workflowStatus: 'all',
  authorId: 'all',
}

export default function BlogAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<BlogDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<BlogCmsTab>('dashboard')
  const [filters, setFilters] = useState<BlogFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Partial<BlogArticleProfile> | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showAiWriter, setShowAiWriter] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getBlogDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filtered = useMemo(() => {
    if (!dashboard) return []
    return filterArticles(dashboard.articles, filters)
  }, [dashboard, filters])

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3500)
  }

  const openNew = () => {
    setEditingArticle(null)
    setShowEditor(true)
  }

  const openEdit = (article: BlogArticleProfile) => {
    setEditingArticle(article)
    setShowEditor(true)
  }

  const handleSave = async (article: Partial<BlogArticleProfile> & { title: string }) => {
    await saveArticleProfile(article)
    setShowEditor(false)
    setEditingArticle(null)
    await refresh()
    notify(`Article "${article.title}" saved.`)
  }

  const handleDelete = async (id: number) => {
    await deleteArticle(id)
    await refresh()
    notify('Article deleted.')
  }

  const showArticlesTable = tab === 'dashboard' || tab === 'articles'

  if (!authed) {
    return (
      <AdminLogin
        title="Blog CMS"
        subtitle="Content management, storytelling, and awareness engine for impact-driven fundraising."
      />
    )
  }

  return (
    <AdminShell
      title="Blog CMS"
      subtitle="Content Engine — impact stories, beneficiary journeys, campaign updates, and awareness content"
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0B2C6B] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading content dashboard…</p></AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <BlogKpiCards kpis={dashboard.kpis} />
          <BlogNav active={tab} onChange={setTab} />

          {tab === 'dashboard' ? (
            <>
              {dashboard.featuredStory ? <BlogFeaturedStory story={dashboard.featuredStory} /> : null}
              <BlogAnalytics viewsTrend={dashboard.viewsTrend} categoryEngagement={dashboard.categoryEngagement} />
              <BlogProjectIntegrationPanel />
              <BlogRelatedContent suggestions={dashboard.relatedSuggestions} />
              <BlogArchitecturePanel />
            </>
          ) : null}

          {showArticlesTable ? (
            <AdminCard>
              <BlogToolbar
                onNewArticle={openNew}
                onAiWriter={() => setShowAiWriter(true)}
                onExport={() => { exportArticlesCsv(filtered); notify('Articles exported to CSV.') }}
                search={filters.search}
                onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((v) => !v)}
              />
              {showFilters ? (
                <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                  <BlogFiltersPanel filters={filters} authors={dashboard.authors} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} />
                </div>
              ) : null}
              <div className="mt-4">
                <DataTable
                  columns={[
                    { key: 'title', header: 'Title', render: (a) => <span className="font-medium">{a.title}</span> },
                    { key: 'category', header: 'Category', render: (a) => a.category ?? '—' },
                    { key: 'type', header: 'Type', render: (a) => a.contentTypeLabel },
                    { key: 'author', header: 'Author', render: (a) => a.authorName },
                    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.workflowStatus} /> },
                    { key: 'views', header: 'Views', render: (a) => a.analytics.views.toLocaleString('en-IN') },
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (a) => (
                        <div className="flex gap-2">
                          <button type="button" className={adminBtnSecondary} onClick={(e) => { e.stopPropagation(); openEdit(a) }}>Edit</button>
                          <button type="button" className={adminBtnDanger} onClick={(e) => { e.stopPropagation(); handleDelete(a.id) }}>Delete</button>
                        </div>
                      ),
                    },
                  ]}
                  data={filtered}
                  keyFn={(a) => String(a.id)}
                  onRowClick={openEdit}
                  emptyMessage="No articles found."
                />
              </div>
            </AdminCard>
          ) : null}

          {tab === 'categories' ? <BlogCategoriesPanel /> : null}
          {tab === 'authors' ? <BlogAuthorsPanel authors={dashboard.authors} /> : null}
          {tab === 'stories' ? <BlogStoriesPanel articles={dashboard.articles} /> : null}
          {tab === 'media' ? <BlogMediaPanel /> : null}
          {tab === 'seo' ? <BlogSeoOverviewPanel articles={dashboard.articles} /> : null}
          {tab === 'publishing' ? <BlogPublishingPanel articles={dashboard.articles} /> : null}
          {tab === 'analytics' ? (
            <>
              <BlogAnalytics viewsTrend={dashboard.viewsTrend} categoryEngagement={dashboard.categoryEngagement} />
              <BlogArticleAnalyticsTable articles={dashboard.articles} />
            </>
          ) : null}
          {tab === 'ai_writer' ? (
            <>
              <BlogAiWriterPanel onOpen={() => setShowAiWriter(true)} />
              <BlogSocialPublishing formats={dashboard.socialFormats} />
            </>
          ) : null}

          <BlogAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <BlogEditorModal
        key={editingArticle?.id ?? 'new'}
        open={showEditor}
        article={editingArticle}
        authors={dashboard?.authors ?? []}
        onClose={() => { setShowEditor(false); setEditingArticle(null) }}
        onSave={handleSave}
      />
      <BlogAiWriterModal
        open={showAiWriter}
        onClose={() => setShowAiWriter(false)}
        onGenerate={(prompt) => notify(`AI content generation started: "${prompt.slice(0, 50)}…"`)}
      />
    </AdminShell>
  )
}
