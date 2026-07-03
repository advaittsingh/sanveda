import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import DocumentAddModal from '../../components/admin/documents/DocumentAddModal'
import DocumentAiInsights from '../../components/admin/documents/DocumentAiInsights'
import DocumentAnalytics from '../../components/admin/documents/DocumentAnalytics'
import DocumentCardGrid from '../../components/admin/documents/DocumentCardGrid'
import DocumentCompliancePanel from '../../components/admin/documents/DocumentCompliancePanel'
import DocumentFiltersPanel from '../../components/admin/documents/DocumentFiltersPanel'
import DocumentFolderTree from '../../components/admin/documents/DocumentFolderTree'
import DocumentKpiCards from '../../components/admin/documents/DocumentKpiCards'
import DocumentProfileDrawer from '../../components/admin/documents/DocumentProfileDrawer'
import DocumentToolbar, { DocumentEmptyState } from '../../components/admin/documents/DocumentToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { downloadHtmlDocument } from '../../lib/documentService'
import {
  exportDocumentsCsv,
  filterDocuments,
  getDocumentDashboardData,
  REPORT_TYPES,
  type DocumentDashboardData,
  type DocumentFilters,
  type DocumentProfile,
} from '../../lib/documentOperationsService'

const defaultFilters: DocumentFilters = {
  search: '',
  category: 'all',
  folder: 'all',
  status: 'all',
  visibility: 'all',
}

export default function DocumentsAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<DocumentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<DocumentFilters>(defaultFilters)
  const [activeFolder, setActiveFolder] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [activeDoc, setActiveDoc] = useState<DocumentProfile | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState<DocumentProfile | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getDocumentDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredDocuments = useMemo(() => {
    if (!dashboard) return []
    const folderFilter = activeFolder === 'all' ? filters : { ...filters, folder: activeFolder as DocumentFilters['folder'] }
    return filterDocuments(dashboard.documents, folderFilter)
  }, [dashboard, filters, activeFolder])

  const handleDownload = (doc: DocumentProfile) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank')
      return
    }
    downloadHtmlDocument(
      `<html><body><h1>${doc.title}</h1><p>${doc.description ?? ''}</p><p>Document ID: ${doc.documentId}</p></body></html>`,
      `${doc.documentId}.html`,
    )
  }

  const handleEdit = () => {
    if (!activeDoc) return
    setEditingDoc(activeDoc)
    setShowAddModal(true)
  }

  const handleSaved = async () => {
    await refresh()
    if (activeDoc) {
      const refreshed = (await getDocumentDashboardData()).documents.find((d) => d.id === activeDoc.id)
      if (refreshed) setActiveDoc(refreshed)
    }
  }

  if (!authed) {
    return (
      <AdminLogin
        title="Documents Management"
        subtitle="Trust and compliance repository — DMS for donors, CSR partners, government, and auditors."
      />
    )
  }

  return (
    <AdminShell
      title="Documents Management"
      subtitle="Document Management System + Compliance Repository — single source of truth for NGO governance."
    >
      {loading && !dashboard ? (
        <AdminCard>
          <p className="text-sm text-slate-500">Loading document repository…</p>
        </AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <DocumentKpiCards kpis={dashboard.kpis} />

          <DocumentCompliancePanel
            compliance={dashboard.complianceDashboard}
            alerts={dashboard.expiryAlerts}
          />

          <AdminCard>
            <DocumentToolbar
              onUpload={() => { setEditingDoc(null); setShowAddModal(true) }}
              onCreateFolder={() => window.alert('Folder creation will organize documents into Legal, Compliance, Finance, Projects, and more.')}
              onBulkUpload={() => window.alert('Bulk upload will connect to Supabase Storage with metadata extraction.')}
              onGenerateReport={() => window.alert(`Generate: ${REPORT_TYPES.join(', ')}`)}
              onExport={() => exportDocumentsCsv(filteredDocuments)}
              search={filters.search}
              onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((v) => !v)}
            />
          </AdminCard>

          {showFilters ? (
            <DocumentFiltersPanel
              filters={filters}
              onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
            />
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[240px_1fr]">
            <DocumentFolderTree
              folders={dashboard.folderStructure}
              activeFolder={activeFolder}
              onSelectFolder={setActiveFolder}
            />

            <div>
              {filteredDocuments.length === 0 ? (
                <DocumentEmptyState onUpload={() => { setEditingDoc(null); setShowAddModal(true) }} />
              ) : (
                <DocumentCardGrid
                  documents={filteredDocuments}
                  onView={setActiveDoc}
                  onDownload={handleDownload}
                />
              )}
            </div>
          </div>

          <DocumentAnalytics
            uploadTrends={dashboard.uploadTrends}
            categoryUsage={dashboard.categoryUsage}
            analytics={dashboard.analytics}
          />

          <DocumentAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <DocumentProfileDrawer
        document={activeDoc}
        onClose={() => setActiveDoc(null)}
        onEdit={handleEdit}
        onDownload={() => activeDoc && handleDownload(activeDoc)}
      />

      <DocumentAddModal
        open={showAddModal}
        editing={editingDoc}
        onClose={() => { setShowAddModal(false); setEditingDoc(null) }}
        onSaved={handleSaved}
      />
    </AdminShell>
  )
}
