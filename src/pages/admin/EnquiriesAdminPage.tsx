import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import EnquiryAddModal from '../../components/admin/enquiries/EnquiryAddModal'
import EnquiryAiInsights from '../../components/admin/enquiries/EnquiryAiInsights'
import EnquiryAnalytics from '../../components/admin/enquiries/EnquiryAnalytics'
import EnquiryFiltersPanel from '../../components/admin/enquiries/EnquiryFiltersPanel'
import EnquiryKpiCards from '../../components/admin/enquiries/EnquiryKpiCards'
import EnquiryPipeline from '../../components/admin/enquiries/EnquiryPipeline'
import EnquiryProfileDrawer from '../../components/admin/enquiries/EnquiryProfileDrawer'
import EnquirySlaPanel from '../../components/admin/enquiries/EnquirySlaPanel'
import EnquiryToolbar, { EnquiryEmptyState } from '../../components/admin/enquiries/EnquiryToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  exportEnquiriesCsv,
  filterEnquiries,
  getEnquiryDashboardData,
  saveEnquiryProfile,
  type ConvertTarget,
  type EnquiryDashboardData,
  type EnquiryFilters,
  type EnquiryProfile,
  type WorkflowStage,
} from '../../lib/enquiryOperationsService'
import type { EnquiryStatus } from '../../lib/enquiryService'

const defaultFilters: EnquiryFilters = {
  search: '',
  category: 'all',
  priority: 'all',
  status: 'all',
  source: 'all',
  assignedTo: 'all',
}

function workflowToStatus(stage: WorkflowStage): EnquiryStatus {
  if (stage === 'new' || stage === 'assigned') return 'new'
  if (stage === 'in_progress' || stage === 'waiting') return 'in_progress'
  if (stage === 'resolved') return 'resolved'
  return 'closed'
}

export default function EnquiriesAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<EnquiryDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<EnquiryFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table')
  const [activeEnquiry, setActiveEnquiry] = useState<EnquiryProfile | null>(null)
  const [notes, setNotes] = useState('')
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('new')
  const [showAddModal, setShowAddModal] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getEnquiryDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredEnquiries = useMemo(() => {
    if (!dashboard) return []
    return filterEnquiries(dashboard.enquiries, filters)
  }, [dashboard, filters])

  const assignees = useMemo(() => {
    if (!dashboard) return []
    return [...new Set(dashboard.enquiries.map((e) => e.assignedTo))]
  }, [dashboard])

  const openEnquiry = (enquiry: EnquiryProfile) => {
    setActiveEnquiry(enquiry)
    setNotes(enquiry.internalNotes)
    setWorkflowStage(enquiry.workflowStage)
  }

  const handleSave = async () => {
    if (!activeEnquiry) return
    await saveEnquiryProfile(activeEnquiry.id, {
      workflowStage,
      internalNotes: notes,
      adminNotes: notes,
      status: workflowToStatus(workflowStage),
    })
    await refresh()
    const refreshed = (await getEnquiryDashboardData()).enquiries.find((e) => e.id === activeEnquiry.id)
    if (refreshed) {
      setActiveEnquiry(refreshed)
      setNotes(refreshed.internalNotes)
      setWorkflowStage(refreshed.workflowStage)
    }
  }

  const handleConvert = async (target: ConvertTarget) => {
    if (!activeEnquiry) return
    await saveEnquiryProfile(activeEnquiry.id, {
      convertedTo: [...(activeEnquiry.convertOptions.includes(target) ? [target] : []), target],
    })
    window.alert(`${activeEnquiry.name} marked for conversion to ${target}. Navigate to the respective module to complete.`)
    await refresh()
  }

  if (!authed) {
    return (
      <AdminLogin
        title="Enquiry Management"
        subtitle="Lead management, ticketing, and relationship CRM for Sanveda NGO OS."
      />
    )
  }

  const priorityBadge = (p: string) => {
    const cls = p === 'critical' ? 'text-red-700 bg-red-50' : p === 'high' ? 'text-amber-700 bg-amber-50' : p === 'medium' ? 'text-sky-700 bg-sky-50' : 'text-slate-600 bg-slate-100'
    return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${cls}`}>{p}</span>
  }

  return (
    <AdminShell
      title="Enquiry Management"
      subtitle="Lead management + support desk — track every donor, volunteer, partner, and beneficiary lead."
    >
      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading enquiries…</p></AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <EnquiryKpiCards kpis={dashboard.kpis} />
          <EnquirySlaPanel kpis={dashboard.kpis} />

          <AdminCard>
            <EnquiryToolbar
              onCreate={() => setShowAddModal(true)}
              onAssign={() => window.alert('Select enquiries and assign to team members.')}
              onBulkUpdate={() => window.alert('Bulk status update for selected tickets.')}
              onExport={() => exportEnquiriesCsv(filteredEnquiries)}
              onGenerateReport={() => window.alert('Generate enquiry summary report for leadership.')}
              search={filters.search}
              onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((v) => !v)}
            />
          </AdminCard>

          {showFilters ? (
            <EnquiryFiltersPanel filters={filters} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} assignees={assignees} />
          ) : null}

          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0B2C6B]">
                {viewMode === 'table' ? 'Lead / Ticket Table' : 'Ticket Pipeline'}
              </h3>
              <div className="flex rounded-xl border border-[#E5E7EB] p-0.5">
                <button type="button" className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${viewMode === 'table' ? 'bg-[#0B2C6B] text-white' : 'text-slate-600'}`}
                  onClick={() => setViewMode('table')}>Table</button>
                <button type="button" className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${viewMode === 'pipeline' ? 'bg-[#0B2C6B] text-white' : 'text-slate-600'}`}
                  onClick={() => setViewMode('pipeline')}>Pipeline</button>
              </div>
            </div>

            {filteredEnquiries.length === 0 ? (
              <EnquiryEmptyState onCreate={() => setShowAddModal(true)} />
            ) : viewMode === 'pipeline' ? (
              <EnquiryPipeline pipeline={dashboard.pipeline} onSelect={openEnquiry} />
            ) : (
              <DataTable
                columns={[
                  { key: 'ticket', header: 'Ticket', render: (e) => <span className="font-semibold text-[#0B2C6B]">{e.ticketId}</span> },
                  { key: 'name', header: 'Name', render: (e) => e.name },
                  { key: 'category', header: 'Category', render: (e) => e.categoryLabel },
                  { key: 'priority', header: 'Priority', render: (e) => priorityBadge(e.priority) },
                  { key: 'assigned', header: 'Assigned To', render: (e) => e.assignedTo },
                  { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.workflowStage} /> },
                  { key: 'source', header: 'Source', render: (e) => e.sourceLabel },
                  { key: 'created', header: 'Created', render: (e) => e.createdLabel },
                  {
                    key: 'actions',
                    header: '',
                    render: (e) => (
                      <button type="button" className={adminBtnSecondary} onClick={(ev) => { ev.stopPropagation(); openEnquiry(e) }}>
                        View
                      </button>
                    ),
                  },
                ]}
                data={filteredEnquiries}
                keyFn={(e) => e.id}
                onRowClick={openEnquiry}
                selectedKey={activeEnquiry?.id}
                loading={loading}
              />
            )}
          </AdminCard>

          <EnquiryAnalytics
            categoryDistribution={dashboard.categoryDistribution}
            monthlyTrends={dashboard.monthlyTrends}
            resolutionBreakdown={dashboard.resolutionBreakdown}
          />

          <EnquiryAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}

      <EnquiryProfileDrawer
        enquiry={activeEnquiry}
        notes={notes}
        workflowStage={workflowStage}
        onNotesChange={setNotes}
        onWorkflowChange={setWorkflowStage}
        onClose={() => setActiveEnquiry(null)}
        onSave={handleSave}
        onConvert={handleConvert}
      />

      <EnquiryAddModal open={showAddModal} onClose={() => setShowAddModal(false)} onSaved={refresh} />
    </AdminShell>
  )
}
