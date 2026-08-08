import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import EventAddModal, { type EventFormData } from '../../components/admin/events/EventAddModal'
import EventAiInsights from '../../components/admin/events/EventAiInsights'
import EventAnalytics from '../../components/admin/events/EventAnalytics'
import EventFiltersPanel from '../../components/admin/events/EventFiltersPanel'
import EventKpiCards from '../../components/admin/events/EventKpiCards'
import EventPipeline from '../../components/admin/events/EventPipeline'
import EventProfileDrawer from '../../components/admin/events/EventProfileDrawer'
import EventToolbar, { EventEmptyState } from '../../components/admin/events/EventToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  exportEventsCsv,
  filterEvents,
  getEventDashboardData,
  updateEventMeta,
  type EventDashboardData,
  type EventFilters,
  type EventProfile,
} from '../../lib/eventOperationsService'
import { deleteEvent, saveEvent, type EventStatus } from '../../lib/eventService'

const defaultFilters: EventFilters = {
  search: '',
  category: 'all',
  status: 'all',
  lifecycle: 'all',
  location: 'all',
}

export default function EventAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<EventDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<EventFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table')
  const [activeEvent, setActiveEvent] = useState<EventProfile | null>(null)
  const [notes, setNotes] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getEventDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredEvents = useMemo(() => {
    if (!dashboard) return []
    return filterEvents(dashboard.events, filters)
  }, [dashboard, filters])

  const openProfile = (event: EventProfile) => {
    setActiveEvent(event)
    setNotes(event.adminNotes ?? '')
  }

  const setStatus = async (id: string, status: EventStatus) => {
    const ev = activeEvent ?? dashboard?.events.find((e) => e.id === id)
    if (!ev) return
    await saveEvent({ id, title: ev.title, slug: ev.slug, eventDate: ev.eventDate, status })
    await refresh()
    const refreshed = (await getEventDashboardData()).events.find((e) => e.id === id)
    if (refreshed) setActiveEvent(refreshed)
  }

  const handleSaveNotes = async (id: string, adminNotes: string) => {
    await updateEventMeta(id, { adminNotes })
    await refresh()
  }

  const handleDelete = async (id: string) => {
    await deleteEvent(id)
    setActiveEvent(null)
    await refresh()
  }

  const handleSaveEvent = async (data: EventFormData) => {
    if (!data.title.trim() || !data.slug.trim() || !data.eventDate) return
    const saved = await saveEvent({
      id: editingId ?? undefined,
      title: data.title.trim(),
      slug: data.slug.trim(),
      description: data.description || undefined,
      location: data.location || undefined,
      eventDate: data.eventDate,
      endDate: data.endDate || undefined,
      capacity: data.capacity || undefined,
      status: data.status,
    })
    if (data.category) await updateEventMeta(saved.id, { category: data.category as EventProfile['category'] })
    setShowAddModal(false)
    setEditingId(null)
    await refresh()
  }

  if (!authed) {
    return <AdminLogin title="Event Admin" subtitle="Manage events and registrations." />
  }

  if (loading || !dashboard) {
    return (
      <AdminShell title="Event Management" subtitle="Event operations and engagement">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const patchFilters = (patch: Partial<EventFilters>) => setFilters((prev) => ({ ...prev, ...patch }))

  const editingForm: EventFormData | null = editingId
    ? (() => {
        const e = dashboard.events.find((x) => x.id === editingId)
        if (!e) return null
        return {
          title: e.title,
          slug: e.slug,
          description: e.description ?? '',
          location: e.location ?? '',
          eventDate: e.eventDate,
          endDate: e.endDate ?? '',
          capacity: e.capacity ?? 500,
          category: e.category,
          status: e.status,
        }
      })()
    : null

  return (
    <AdminShell title="Event Management" subtitle="Event operations, registration, volunteers, and fundraising">
      <div className="space-y-6">
        <EventKpiCards kpis={dashboard.kpis} />

        <EventToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateEvent={() => { setEditingId(null); setShowAddModal(true) }}
          onExport={() => exportEventsCsv(filteredEvents)}
          search={filters.search}
          onSearchChange={(search) => patchFilters({ search })}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
        />

        {showFilters ? (
          <EventFiltersPanel filters={filters} onChange={patchFilters} locationOptions={dashboard.locationOptions} />
        ) : null}

        <AdminCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#0B2C6B]">Event Directory</h3>
            <p className="text-sm text-slate-500">{filteredEvents.length} events</p>
          </div>

          {!filteredEvents.length ? (
            <EventEmptyState onCreateEvent={() => setShowAddModal(true)} />
          ) : viewMode === 'pipeline' ? (
            <EventPipeline pipeline={dashboard.pipeline} onSelect={openProfile} />
          ) : (
            <DataTable
              data={filteredEvents}
              keyFn={(e) => e.id}
              onRowClick={openProfile}
              selectedKey={activeEvent?.id}
              columns={[
                {
                  key: 'event',
                  header: 'Event',
                  render: (e) => (
                    <div>
                      <p className="font-semibold text-[#0B2C6B]">{e.title}</p>
                      <p className="text-xs text-slate-400">{e.eventCode}</p>
                    </div>
                  ),
                },
                { key: 'category', header: 'Category', render: (e) => e.category },
                { key: 'date', header: 'Date', render: (e) => e.dateLabel },
                { key: 'location', header: 'Location', render: (e) => e.location ?? '—' },
                { key: 'capacity', header: 'Capacity', render: (e) => e.capacity ?? '—' },
                { key: 'registered', header: 'Registered', render: (e) => e.registeredCount },
                { key: 'volunteers', header: 'Volunteers', render: (e) => e.volunteersAssigned },
                {
                  key: 'status',
                  header: 'Status',
                  render: (e) => (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      e.isLive ? 'bg-emerald-50 text-emerald-700' : e.isUpcoming ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {e.displayStatus}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (e) => (
                    <button
                      type="button"
                      className={`${adminBtnSecondary} !px-3 !py-1.5 text-xs`}
                      onClick={(ev) => { ev.stopPropagation(); openProfile(e) }}
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

        <EventAnalytics
          eventsByCategory={dashboard.eventsByCategory}
          attendanceTrends={dashboard.attendanceTrends}
          registrationSources={dashboard.registrationSources}
        />

        <EventAiInsights insights={dashboard.aiInsights} />
      </div>

      <EventProfileDrawer
        event={activeEvent}
        notes={notes}
        onNotesChange={setNotes}
        onClose={() => setActiveEvent(null)}
        onStatusChange={setStatus}
        onSaveNotes={handleSaveNotes}
        onEdit={() => {
          if (activeEvent) {
            setEditingId(activeEvent.id)
            setShowAddModal(true)
          }
        }}
        onDelete={handleDelete}
      />

      <EventAddModal
        open={showAddModal}
        editing={editingForm}
        onClose={() => { setShowAddModal(false); setEditingId(null) }}
        onSave={handleSaveEvent}
      />
    </AdminShell>
  )
}
