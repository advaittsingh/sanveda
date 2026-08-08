import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import ReportAiGeneratorModal from '../../components/admin/reports/ReportAiGeneratorModal'
import ReportAiInsights from '../../components/admin/reports/ReportAiInsights'
import ReportAnalytics from '../../components/admin/reports/ReportAnalytics'
import ReportBuilderModal from '../../components/admin/reports/ReportBuilderModal'
import ReportCategoryNav from '../../components/admin/reports/ReportCategoryNav'
import ReportDomainPanels from '../../components/admin/reports/ReportDomainPanels'
import ReportKpiCards from '../../components/admin/reports/ReportKpiCards'
import ReportTemplatesGrid from '../../components/admin/reports/ReportTemplatesGrid'
import ReportToolbar from '../../components/admin/reports/ReportToolbar'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  exportReportListCsv,
  filterTemplates,
  getReportDashboardData,
  type ReportCategory,
  type ReportDashboardData,
  type ReportFormat,
  type ReportTemplate,
} from '../../lib/reportOperationsService'

export default function ReportsAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<ReportDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<ReportCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showBuilder, setShowBuilder] = useState(false)
  const [showAiGenerator, setShowAiGenerator] = useState(false)
  const [scrollToTemplates, setScrollToTemplates] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getReportDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredTemplates = useMemo(() => {
    if (!dashboard) return []
    let list = filterTemplates(dashboard.templates, category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.categoryLabel.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      )
    }
    return list
  }, [dashboard, category, search])

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3500)
  }

  const handleGenerate = (label: string) => {
    notify(`Generating "${label}" — PDF and Excel will be ready shortly.`)
  }

  const handleBuilderGenerate = (name: string, format: ReportFormat) => {
    notify(`Custom report "${name}" queued as ${format.toUpperCase()}.`)
  }

  const handleAiGenerate = (prompt: string) => {
    notify(`AI report generation started: "${prompt.slice(0, 60)}…"`)
  }

  const handleExport = () => {
    if (dashboard) exportReportListCsv(filteredTemplates.length ? filteredTemplates : dashboard.templates)
    notify('Report list exported to CSV.')
  }

  const handleTemplateGenerate = (template: ReportTemplate) => {
    handleGenerate(template.name)
  }

  useEffect(() => {
    if (scrollToTemplates) {
      document.getElementById('report-templates')?.scrollIntoView({ behavior: 'smooth' })
      setScrollToTemplates(false)
    }
  }, [scrollToTemplates])

  if (!authed) {
    return (
      <AdminLogin
        title="Reporting Center"
        subtitle="Intelligence, compliance, and impact reporting hub for trustees, auditors, donors, and management."
      />
    )
  }

  return (
    <AdminShell
      title="Reporting Center"
      subtitle="CEO/CFO/Trustee cockpit — how much came in, where it went, who benefited, and what impact was created"
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0B2C6B] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {loading || !dashboard ? (
        <div className="py-20 text-center text-sm text-slate-500">Loading reporting dashboard…</div>
      ) : (
        <div className="space-y-8">
          <ReportKpiCards kpis={dashboard.kpis} />

          <ReportToolbar
            onCreateReport={() => setShowBuilder(true)}
            onScheduleReport={() => notify('Schedule Report — configure frequency and recipients in the next release.')}
            onTemplates={() => setScrollToTemplates(true)}
            onExport={handleExport}
            onAiGenerator={() => setShowAiGenerator(true)}
            search={search}
            onSearchChange={setSearch}
          />

          <ReportCategoryNav active={category} onChange={setCategory} />

          {(category === 'all' || category === 'analytics') ? (
            <ReportAnalytics
              donationTrends={dashboard.donationTrends}
              expenseDistribution={dashboard.expenseDistribution}
              geographicImpact={dashboard.geographicImpact}
            />
          ) : null}

          <div id="report-templates">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#0B2C6B]">Report Templates</h2>
              <p className="text-sm text-slate-500">Predefined reports across all categories</p>
            </div>
            <ReportTemplatesGrid templates={filteredTemplates} onGenerate={handleTemplateGenerate} />
          </div>

          <ReportDomainPanels data={dashboard} category={category} onGenerate={handleGenerate} />

          <ReportAiInsights insights={dashboard.aiInsights} />
        </div>
      )}

      <ReportBuilderModal
        open={showBuilder}
        onClose={() => setShowBuilder(false)}
        onGenerate={handleBuilderGenerate}
      />
      <ReportAiGeneratorModal
        open={showAiGenerator}
        onClose={() => setShowAiGenerator(false)}
        onGenerate={handleAiGenerate}
      />
    </AdminShell>
  )
}
