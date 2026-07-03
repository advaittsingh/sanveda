import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import ProjectAddModal, { type ProjectFormData } from '../../components/admin/projects/ProjectAddModal'
import ProjectAiInsights from '../../components/admin/projects/ProjectAiInsights'
import ProjectAnalytics from '../../components/admin/projects/ProjectAnalytics'
import ProjectFiltersPanel from '../../components/admin/projects/ProjectFiltersPanel'
import ProjectKpiCards from '../../components/admin/projects/ProjectKpiCards'
import ProjectPipeline from '../../components/admin/projects/ProjectPipeline'
import ProjectProfileDrawer from '../../components/admin/projects/ProjectProfileDrawer'
import ProjectToolbar, { ProjectEmptyState } from '../../components/admin/projects/ProjectToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  exportProjectsCsv,
  filterProjects,
  getProjectDashboardData,
  updateProjectMeta,
  type ProjectDashboardData,
  type ProjectFilters,
  type ProjectProfile,
} from '../../lib/projectOperationsService'
import { deleteProject, saveProject, type ProjectStatus } from '../../lib/projectService'

const defaultFilters: ProjectFilters = {
  search: '',
  focusArea: 'all',
  status: 'all',
  lifecycle: 'all',
  priority: 'all',
}

export default function ProjectAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<ProjectDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProjectFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table')
  const [activeProject, setActiveProject] = useState<ProjectProfile | null>(null)
  const [notes, setNotes] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getProjectDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredProjects = useMemo(() => {
    if (!dashboard) return []
    return filterProjects(dashboard.projects, filters)
  }, [dashboard, filters])

  const openProfile = (project: ProjectProfile) => {
    setActiveProject(project)
    setNotes('')
  }

  const setStatus = async (id: string, status: ProjectStatus) => {
    const p = activeProject ?? dashboard?.projects.find((x) => x.id === id)
    if (!p) return
    await saveProject({ id, title: p.title, slug: p.slug, status })
    await refresh()
    const refreshed = (await getProjectDashboardData()).projects.find((x) => x.id === id)
    if (refreshed) setActiveProject(refreshed)
  }

  const handleSaveNotes = async (id: string, adminNotes: string) => {
    updateProjectMeta(id, { adminNotes })
    await refresh()
  }

  const handleDelete = async (id: string) => {
    await deleteProject(id)
    setActiveProject(null)
    await refresh()
  }

  const handleSaveProject = async (data: ProjectFormData) => {
    if (!data.title.trim() || !data.slug.trim()) return
    await saveProject({
      id: editingId ?? undefined,
      title: data.title.trim(),
      slug: data.slug.trim(),
      focusArea: data.focusArea || undefined,
      description: data.description || undefined,
      budget: data.budget,
      spent: data.spent,
      beneficiariesCount: data.beneficiariesCount,
      progressPercent: data.progressPercent,
      status: data.status,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      managerName: data.managerName || undefined,
    })
    setShowAddModal(false)
    setEditingId(null)
    await refresh()
  }

  const handleAssignTeam = () => {
    const active = filteredProjects.filter((p) => p.status === 'active')
    window.alert(
      active.length
        ? `Team assignment queued for ${active.length} active project(s). Bulk assignment coming soon.`
        : 'No active projects in the current view.',
    )
  }

  const handleImport = () => {
    window.alert('CSV import coming soon. Use Export to download the current format.')
  }

  const handleGenerateReport = () => {
    exportProjectsCsv(filteredProjects)
  }

  if (!authed) {
    return <AdminLogin title="Project Admin" subtitle="Track humanitarian projects." />
  }

  if (loading || !dashboard) {
    return (
      <AdminShell title="Project Management" subtitle="Programme management and impact tracking">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const patchFilters = (patch: Partial<ProjectFilters>) => setFilters((prev) => ({ ...prev, ...patch }))

  const editingForm: ProjectFormData | null = editingId
    ? (() => {
        const p = dashboard.projects.find((x) => x.id === editingId)
        if (!p) return null
        return {
          title: p.title,
          slug: p.slug,
          focusArea: p.focusArea ?? '',
          description: p.description ?? '',
          budget: p.budget,
          spent: p.spent,
          beneficiariesCount: p.beneficiariesCount,
          progressPercent: p.progressPercent,
          status: p.status,
          startDate: p.startDate ?? '',
          endDate: p.endDate ?? '',
          managerName: p.managerName ?? '',
        }
      })()
    : null

  return (
    <AdminShell title="Project Management" subtitle="Program management, impact tracking, and financial monitoring">
      <div className="space-y-6">
        <ProjectKpiCards kpis={dashboard.kpis} />

        <ProjectToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateProject={() => { setEditingId(null); setShowAddModal(true) }}
          onImport={handleImport}
          onExport={() => exportProjectsCsv(filteredProjects)}
          onGenerateReport={handleGenerateReport}
          onAssignTeam={handleAssignTeam}
          search={filters.search}
          onSearchChange={(search) => patchFilters({ search })}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
        />

        {showFilters ? (
          <ProjectFiltersPanel
            filters={filters}
            onChange={patchFilters}
            focusAreaOptions={dashboard.focusAreaOptions}
          />
        ) : null}

        <AdminCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#0B2C6B]">Project Directory</h3>
            <p className="text-sm text-slate-500">{filteredProjects.length} projects</p>
          </div>

          {!filteredProjects.length ? (
            <ProjectEmptyState onCreateProject={() => setShowAddModal(true)} />
          ) : viewMode === 'pipeline' ? (
            <ProjectPipeline pipeline={dashboard.pipeline} onSelect={openProfile} />
          ) : (
            <DataTable
              data={filteredProjects}
              keyFn={(p) => p.id}
              onRowClick={openProfile}
              selectedKey={activeProject?.id}
              columns={[
                {
                  key: 'project',
                  header: 'Project',
                  render: (p) => (
                    <div>
                      <p className="font-semibold text-[#0B2C6B]">{p.title}</p>
                      <p className="text-xs text-slate-400">{p.projectId}</p>
                    </div>
                  ),
                },
                { key: 'focus', header: 'Focus Area', render: (p) => p.focusArea ?? '—' },
                { key: 'budget', header: 'Budget', render: (p) => p.budgetLabel },
                { key: 'utilized', header: 'Utilized', render: (p) => p.spentLabel },
                { key: 'team', header: 'Team', render: (p) => p.teamSize },
                { key: 'beneficiaries', header: 'Beneficiaries', render: (p) => p.beneficiaryBreakdown.total.toLocaleString('en-IN') },
                { key: 'progress', header: 'Progress', render: (p) => `${p.computedProgress}%` },
                { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (p) => (
                    <button
                      type="button"
                      className={`${adminBtnSecondary} !px-3 !py-1.5 text-xs`}
                      onClick={(e) => {
                        e.stopPropagation()
                        openProfile(p)
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

        <ProjectAnalytics
          projectsByFocus={dashboard.projectsByFocus}
          budgetByFocus={dashboard.budgetByFocus}
          completionBreakdown={dashboard.completionBreakdown}
        />

        <ProjectAiInsights insights={dashboard.aiInsights} />
      </div>

      <ProjectProfileDrawer
        project={activeProject}
        notes={notes}
        onNotesChange={setNotes}
        onClose={() => setActiveProject(null)}
        onStatusChange={setStatus}
        onSaveNotes={handleSaveNotes}
        onEdit={() => {
          if (activeProject) {
            setEditingId(activeProject.id)
            setShowAddModal(true)
          }
        }}
        onDelete={handleDelete}
      />

      <ProjectAddModal
        open={showAddModal}
        editing={editingForm}
        onClose={() => { setShowAddModal(false); setEditingId(null) }}
        onSave={handleSaveProject}
      />
    </AdminShell>
  )
}
