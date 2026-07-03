import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import InternshipAiInsights from '../../components/admin/internships/InternshipAiInsights'
import InternshipAnalytics from '../../components/admin/internships/InternshipAnalytics'
import InternshipFiltersPanel from '../../components/admin/internships/InternshipFiltersPanel'
import InternshipKpiCards from '../../components/admin/internships/InternshipKpiCards'
import InternshipPipeline from '../../components/admin/internships/InternshipPipeline'
import InternshipProfileDrawer from '../../components/admin/internships/InternshipProfileDrawer'
import InternshipProgramsAlumni from '../../components/admin/internships/InternshipProgramsAlumni'
import InternshipToolbar, { InternshipEmptyState } from '../../components/admin/internships/InternshipToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  downloadInternshipCertificate,
  updateInternship,
  type InternshipStatus,
} from '../../lib/internshipService'
import {
  exportInternsCsv,
  filterInterns,
  getInternshipDashboardData,
  type InternFilters,
  type InternProfile,
  type InternshipDashboardData,
} from '../../lib/internshipOperationsService'

const defaultFilters: InternFilters = {
  search: '',
  department: 'all',
  status: 'all',
  program: 'all',
  university: 'all',
}

export default function InternshipAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<InternshipDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<InternFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table')
  const [activeIntern, setActiveIntern] = useState<InternProfile | null>(null)
  const [notes, setNotes] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getInternshipDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredInterns = useMemo(() => {
    if (!dashboard) return []
    return filterInterns(dashboard.interns, filters)
  }, [dashboard, filters])

  const openProfile = (intern: InternProfile) => {
    setActiveIntern(intern)
    setNotes(intern.adminNotes ?? '')
  }

  const setStatus = async (id: string, status: InternshipStatus) => {
    const updated = await updateInternship(id, { status })
    await refresh()
    if (updated) {
      const refreshed = (await getInternshipDashboardData()).interns.find((i) => i.id === id)
      if (refreshed) setActiveIntern(refreshed)
    }
  }

  const handleSaveNotes = async (id: string, adminNotes: string) => {
    await updateInternship(id, { adminNotes })
    await refresh()
  }

  const handleBulkApprove = async () => {
    const pending = filteredInterns.filter((i) => i.status === 'pending' || i.status === 'review')
    for (const intern of pending.slice(0, 10)) {
      await updateInternship(intern.id, { status: 'approved' })
    }
    await refresh()
  }

  const handleGenerateCertificates = () => {
    const eligible = filteredInterns.filter((i) => i.certificateNumber)
    if (!eligible.length) {
      window.alert('No certificates available in the current view. Complete internships to generate certificates.')
      return
    }
    eligible.slice(0, 5).forEach((i) => downloadInternshipCertificate(i))
  }

  const handleAssignMentor = () => {
    const active = filteredInterns.filter((i) => i.status === 'active')
    window.alert(
      active.length
        ? `Mentor assignment queued for ${active.length} active intern(s). Bulk mentor assignment coming soon.`
        : 'No active interns in the current view.',
    )
  }

  const handleImport = () => {
    window.alert('CSV import coming soon. Use Export to download the current format.')
  }

  if (!authed) {
    return <AdminLogin title="Internship Admin" subtitle="Manage internship applications." />
  }

  if (loading || !dashboard) {
    return (
      <AdminShell title="Internship Management" subtitle="Campus recruitment and intern lifecycle">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const patchFilters = (patch: Partial<InternFilters>) => setFilters((prev) => ({ ...prev, ...patch }))

  return (
    <AdminShell title="Internship Management" subtitle="Campus recruitment, mentoring, and lifecycle management">
      <div className="space-y-6">
        <InternshipKpiCards kpis={dashboard.kpis} />

        <InternshipToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddIntern={() => window.open('/internship/apply', '_blank')}
          onImport={handleImport}
          onBulkApprove={handleBulkApprove}
          onAssignMentor={handleAssignMentor}
          onGenerateCertificates={handleGenerateCertificates}
          onExport={() => exportInternsCsv(filteredInterns)}
          search={filters.search}
          onSearchChange={(search) => patchFilters({ search })}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
        />

        {showFilters ? (
          <InternshipFiltersPanel
            filters={filters}
            onChange={patchFilters}
            departmentOptions={dashboard.departmentOptions}
            universityOptions={dashboard.universityOptions}
          />
        ) : null}

        <AdminCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#0B2C6B]">Intern Directory</h3>
            <p className="text-sm text-slate-500">{filteredInterns.length} applications</p>
          </div>

          {!filteredInterns.length ? (
            <InternshipEmptyState onAddIntern={() => window.open('/internship/apply', '_blank')} />
          ) : viewMode === 'pipeline' ? (
            <InternshipPipeline pipeline={dashboard.pipeline} onSelect={openProfile} />
          ) : (
            <DataTable
              data={filteredInterns}
              keyFn={(i) => i.id}
              onRowClick={openProfile}
              selectedKey={activeIntern?.id}
              columns={[
                {
                  key: 'intern',
                  header: 'Intern',
                  render: (i) => (
                    <div>
                      <p className="font-semibold text-[#0B2C6B]">{i.fullName}</p>
                      <p className="text-xs text-slate-400">{i.internId}</p>
                    </div>
                  ),
                },
                { key: 'university', header: 'University', render: (i) => i.university ?? '—' },
                { key: 'program', header: 'Program', render: (i) => i.programLabel },
                { key: 'duration', header: 'Duration', render: (i) => i.durationLabel },
                { key: 'mentor', header: 'Mentor', render: (i) => i.mentor },
                { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
                {
                  key: 'performance',
                  header: 'Performance',
                  render: (i) => (i.performanceScore ? `${i.performanceScore}%` : '—'),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (i) => (
                    <button
                      type="button"
                      className={`${adminBtnSecondary} !px-3 !py-1.5 text-xs`}
                      onClick={(e) => {
                        e.stopPropagation()
                        openProfile(i)
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

        <InternshipProgramsAlumni programs={dashboard.programs} alumniStats={dashboard.alumniStats} />

        <InternshipAnalytics
          applicationsByDepartment={dashboard.applicationsByDepartment}
          universityDistribution={dashboard.universityDistribution}
          completionFunnel={dashboard.completionFunnel}
        />

        <InternshipAiInsights insights={dashboard.aiInsights} />
      </div>

      <InternshipProfileDrawer
        intern={activeIntern}
        notes={notes}
        onNotesChange={setNotes}
        onClose={() => setActiveIntern(null)}
        onStatusChange={setStatus}
        onSaveNotes={handleSaveNotes}
      />
    </AdminShell>
  )
}
