import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import VolunteerAiInsights from '../../components/admin/volunteers/VolunteerAiInsights'
import VolunteerAnalytics from '../../components/admin/volunteers/VolunteerAnalytics'
import VolunteerFiltersPanel from '../../components/admin/volunteers/VolunteerFiltersPanel'
import VolunteerKanban from '../../components/admin/volunteers/VolunteerKanban'
import VolunteerKpiCards from '../../components/admin/volunteers/VolunteerKpiCards'
import VolunteerProfileDrawer from '../../components/admin/volunteers/VolunteerProfileDrawer'
import VolunteerTeamManagement from '../../components/admin/volunteers/VolunteerTeamManagement'
import VolunteerToolbar, { VolunteerEmptyState } from '../../components/admin/volunteers/VolunteerToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { downloadVolunteerIdCard } from '../../lib/documentService'
import { registerVerification } from '../../lib/verificationService'
import {
  notifyVolunteerByEmail,
  updateVolunteerApplication,
} from '../../lib/volunteerStore'
import type { VolunteerStatus } from '../../types/volunteer'
import {
  exportVolunteersCsv,
  filterVolunteers,
  getVolunteerDashboardData,
  type VolunteerDashboardData,
  type VolunteerFilters,
  type VolunteerProfile,
} from '../../lib/volunteerOperationsService'

const defaultFilters: VolunteerFilters = {
  search: '',
  status: 'all',
  department: 'all',
  team: 'all',
}

export default function VolunteerAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<VolunteerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<VolunteerFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [activeVolunteer, setActiveVolunteer] = useState<VolunteerProfile | null>(null)
  const [team, setTeam] = useState('')
  const [notes, setNotes] = useState('')
  const [interviewDate, setInterviewDate] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getVolunteerDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredVolunteers = useMemo(() => {
    if (!dashboard) return []
    return filterVolunteers(dashboard.volunteers, filters)
  }, [dashboard, filters])

  const teamOptions = useMemo(() => {
    if (!dashboard) return []
    return [...new Set(dashboard.volunteers.map((v) => v.assignedTeam).filter(Boolean))] as string[]
  }, [dashboard])

  const openProfile = (vol: VolunteerProfile) => {
    setActiveVolunteer(vol)
    setTeam(vol.assignedTeam ?? '')
    setNotes(vol.adminNotes ?? '')
    setInterviewDate(vol.interviewDate ? vol.interviewDate.slice(0, 16) : '')
  }

  const setStatus = async (id: string, status: VolunteerStatus) => {
    const updated = await updateVolunteerApplication(id, { status })
    await refresh()
    if (updated) {
      const refreshed = (await getVolunteerDashboardData()).volunteers.find((v) => v.id === id)
      if (refreshed) setActiveVolunteer(refreshed)

      if (status === 'approved' && updated.volunteerId) {
        notifyVolunteerByEmail(
          updated,
          'Sanveda Volunteer Application Approved',
          `Dear ${updated.fullName},\n\nCongratulations! Your volunteer application has been approved.\nVolunteer ID: ${updated.volunteerId}\n\nWelcome to the Sanveda family.`,
        )
        await registerVerification({
          type: 'volunteer_id',
          holderName: updated.fullName,
          referenceId: updated.volunteerId,
          metadata: { applicationId: updated.id },
        }).catch(() => {})
      }
      if (status === 'rejected') {
        notifyVolunteerByEmail(
          updated,
          'Sanveda Volunteer Application Update',
          `Dear ${updated.fullName},\n\nThank you for your interest in volunteering with Sanveda.`,
        )
      }
    }
  }

  const handleSave = async (
    id: string,
    patch: { assignedTeam?: string; adminNotes?: string; interviewDate?: string },
  ) => {
    const updated = await updateVolunteerApplication(id, patch)
    await refresh()
    if (updated) {
      const refreshed = (await getVolunteerDashboardData()).volunteers.find((v) => v.id === id)
      if (refreshed) setActiveVolunteer(refreshed)
    }
  }

  const handleBulkApprove = async () => {
    const pending = filteredVolunteers.filter((v) => v.status === 'pending' || v.status === 'screening')
    for (const vol of pending.slice(0, 10)) {
      await setStatus(vol.id, 'approved')
    }
  }

  const handleGenerateIdCards = () => {
    const approved = filteredVolunteers.filter((v) => v.volunteerId)
    if (!approved.length) {
      window.alert('No approved volunteers with ID cards in the current view.')
      return
    }
    approved.slice(0, 5).forEach((v) => downloadVolunteerIdCard(v))
  }

  if (!authed) {
    return <AdminLogin title="Volunteer Admin" subtitle="Sign in to manage volunteer applications." />
  }

  if (loading || !dashboard) {
    return (
      <AdminShell title="Volunteer Management" subtitle="Applications, approvals, assignments, and ID cards">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const patchFilters = (patch: Partial<VolunteerFilters>) => setFilters((prev) => ({ ...prev, ...patch }))

  return (
    <AdminShell title="Volunteer Management" subtitle="Full NGO volunteer workforce management system">
      <div className="space-y-6">
        <VolunteerKpiCards kpis={dashboard.kpis} />

        <VolunteerToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddVolunteer={() => window.open('/volunteer/apply', '_blank')}
          onImport={() => window.alert('CSV import will be available in a future release.')}
          onBulkApprove={handleBulkApprove}
          onGenerateIdCards={handleGenerateIdCards}
          onExport={() => exportVolunteersCsv(filteredVolunteers)}
          search={filters.search}
          onSearchChange={(search) => patchFilters({ search })}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
        />

        {showFilters ? (
          <VolunteerFiltersPanel filters={filters} teams={teamOptions} onChange={patchFilters} />
        ) : null}

        <VolunteerTeamManagement teams={dashboard.teams} />

        <AdminCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#0B2C6B]">Volunteer Directory</h3>
            <p className="text-sm text-slate-500">{filteredVolunteers.length} volunteers</p>
          </div>

          {!filteredVolunteers.length ? (
            <VolunteerEmptyState
              onAddVolunteer={() => window.open('/volunteer/apply', '_blank')}
              onImport={() => patchFilters({ search: '' })}
            />
          ) : viewMode === 'kanban' ? (
            <VolunteerKanban pipeline={dashboard.pipeline} onSelect={openProfile} />
          ) : (
            <DataTable
              data={filteredVolunteers}
              keyFn={(v) => v.id}
              onRowClick={openProfile}
              selectedKey={activeVolunteer?.id}
              columns={[
                {
                  key: 'volunteer',
                  header: 'Volunteer',
                  render: (v) => (
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B2C6B]/10 text-sm font-bold text-[#0B2C6B]">
                        {v.fullName.charAt(0)}
                      </span>
                      <span className="font-semibold text-[#0B2C6B]">{v.fullName}</span>
                    </div>
                  ),
                },
                { key: 'role', header: 'Role', render: (v) => v.primaryRole },
                { key: 'dept', header: 'Department', render: (v) => v.department },
                { key: 'location', header: 'Location', render: (v) => v.location },
                { key: 'exp', header: 'Experience', render: (v) => v.experienceLabel },
                { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
                { key: 'hours', header: 'Hours', render: (v) => v.volunteerHours },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (v) => (
                    <button
                      type="button"
                      className={`${adminBtnSecondary} !px-3 !py-1.5 text-xs`}
                      onClick={(e) => {
                        e.stopPropagation()
                        openProfile(v)
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

        <VolunteerAnalytics
          volunteersByDepartment={dashboard.volunteersByDepartment}
          volunteerGrowth={dashboard.volunteerGrowth}
          retentionRates={dashboard.retentionRates}
          hoursByDepartment={dashboard.hoursByDepartment}
        />

        <VolunteerAiInsights insights={dashboard.aiInsights} />
      </div>

      <VolunteerProfileDrawer
        volunteer={activeVolunteer}
        onClose={() => setActiveVolunteer(null)}
        onStatusChange={setStatus}
        onSave={handleSave}
        team={team}
        notes={notes}
        interviewDate={interviewDate}
        onTeamChange={setTeam}
        onNotesChange={setNotes}
        onInterviewDateChange={setInterviewDate}
      />
    </AdminShell>
  )
}
