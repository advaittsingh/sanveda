import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import AuditAiInsights from '../../components/admin/audit/AuditAiInsights'
import AuditAnalytics from '../../components/admin/audit/AuditAnalytics'
import AuditFiltersPanel from '../../components/admin/audit/AuditFiltersPanel'
import AuditKpiCards from '../../components/admin/audit/AuditKpiCards'
import AuditLogDrawer from '../../components/admin/audit/AuditLogDrawer'
import AuditNav from '../../components/admin/audit/AuditNav'
import AuditSeverityBadge from '../../components/admin/audit/AuditSeverityBadge'
import {
  AuditActionTypesPanel,
  AuditApprovalsPanel,
  AuditCompliancePanel,
  AuditDataChangesPanel,
  AuditExportsPanel,
  AuditFinancialPanel,
  AuditMembershipPanel,
  AuditSecurityPanel,
  AuditSettingsPanel,
  AuditVolunteerPanel,
} from '../../components/admin/audit/AuditSupportPanels'
import AuditToolbar from '../../components/admin/audit/AuditToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  exportAuditCsv,
  filterAuditLogs,
  formatAuditTime,
  getAuditDashboardData,
  parseAuditTab,
  type AuditDashboardData,
  type AuditFilters,
  type AuditLogEntry,
  type AuditTab,
  type QuickFilter,
} from '../../lib/auditOperationsService'

const defaultFilters: AuditFilters = {
  search: '',
  dateFrom: '',
  dateTo: '',
  user: '',
  department: 'all',
  module: 'all',
  action: 'all',
  severity: 'all',
  status: 'all',
  ip: '',
  quick: 'all',
}

export default function AuditAdminPage() {
  const { authed } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [dashboard, setDashboard] = useState<AuditDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<AuditTab>(() => parseAuditTab(searchParams.get('tab')))
  const [filters, setFilters] = useState<AuditFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [active, setActive] = useState<AuditLogEntry | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getAuditDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  useEffect(() => {
    setTab(parseAuditTab(searchParams.get('tab')))
  }, [searchParams])

  const setTabAndUrl = (t: AuditTab) => {
    setTab(t)
    setSearchParams(t === 'dashboard' ? {} : { tab: t }, { replace: true })
  }

  const filtered = useMemo(() => {
    if (!dashboard) return []
    return filterAuditLogs(dashboard.logs, filters)
  }, [dashboard, filters])

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3500)
  }

  const handleQuickChange = (quick: QuickFilter) => {
    setFilters((f) => ({ ...f, quick }))
  }

  const handleExport = () => {
    exportAuditCsv(filtered)
    notify('Audit logs exported to CSV.')
  }

  const showActivityTable = tab === 'dashboard' || tab === 'activity'

  if (!authed) {
    return (
      <AdminLogin
        title="Audit Logs"
        subtitle="Track every action performed across the NGO ecosystem."
      />
    )
  }

  return (
    <AdminShell
      title="Audit Logs"
      subtitle="Track every action performed across the NGO ecosystem."
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0B2C6B] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading audit center…</p></AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <AuditKpiCards kpis={dashboard.kpis} />
          <AuditNav active={tab} onChange={setTabAndUrl} />

          {tab === 'dashboard' ? (
            <>
              <AuditAnalytics actionsByModule={dashboard.actionsByModule} adminActivity={dashboard.adminActivity} />
              <AuditActionTypesPanel />
            </>
          ) : null}

          {showActivityTable ? (
            <AdminCard>
              <AuditToolbar
                search={filters.search}
                onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
                quick={filters.quick}
                onQuickChange={handleQuickChange}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((v) => !v)}
                onExportCsv={handleExport}
              />
              {showFilters ? (
                <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                  <AuditFiltersPanel filters={filters} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} />
                </div>
              ) : null}
              <div className="mt-4">
                <DataTable
                  loading={loading}
                  columns={[
                    { key: 'time', header: 'Time', render: (l) => <span className="text-xs">{formatAuditTime(l.createdAt)}</span> },
                    { key: 'user', header: 'User', render: (l) => <span className="font-medium">{l.userName}</span> },
                    { key: 'role', header: 'Role', render: (l) => l.role },
                    { key: 'action', header: 'Action', render: (l) => l.action },
                    { key: 'module', header: 'Module', render: (l) => l.module },
                    { key: 'object', header: 'Object', render: (l) => l.object },
                    { key: 'result', header: 'Result', render: (l) => <StatusBadge status={l.status} /> },
                    { key: 'severity', header: 'Severity', render: (l) => <AuditSeverityBadge severity={l.severity} /> },
                    { key: 'ip', header: 'IP', render: (l) => <span className="text-xs">{l.ip}</span> },
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (l) => (
                        <button type="button" className={adminBtnSecondary} onClick={(e) => { e.stopPropagation(); setActive(l) }}>
                          View
                        </button>
                      ),
                    },
                  ]}
                  data={filtered}
                  keyFn={(l) => l.id}
                  onRowClick={setActive}
                  selectedKey={active?.id}
                  emptyMessage="No audit entries found."
                />
              </div>
            </AdminCard>
          ) : null}

          {tab === 'security' ? <AuditSecurityPanel logs={dashboard.securityLogs} /> : null}
          {tab === 'financial' ? <AuditFinancialPanel logs={dashboard.financialLogs} /> : null}
          {tab === 'volunteer' ? <AuditVolunteerPanel logs={dashboard.volunteerLogs} /> : null}
          {tab === 'membership' ? <AuditMembershipPanel logs={dashboard.membershipLogs} /> : null}
          {tab === 'approvals' ? <AuditApprovalsPanel logs={dashboard.logs} /> : null}
          {tab === 'datachanges' ? <AuditDataChangesPanel changes={dashboard.dataChanges} /> : null}
          {tab === 'compliance' ? <AuditCompliancePanel reports={dashboard.complianceReports} /> : null}
          {tab === 'ai' ? <AuditAiInsights alerts={dashboard.aiAlerts} /> : null}
          {tab === 'exports' ? (
            <AuditExportsPanel
              onExportCsv={handleExport}
              onGenerateAudit={() => notify('Audit report generation queued.')}
              onGenerateCompliance={() => notify('Compliance report generation queued.')}
            />
          ) : null}
          {tab === 'settings' ? <AuditSettingsPanel /> : null}

          {tab !== 'ai' ? <AuditAiInsights alerts={dashboard.aiAlerts} /> : null}
        </div>
      ) : null}

      <AuditLogDrawer log={active} onClose={() => setActive(null)} />
    </AdminShell>
  )
}
