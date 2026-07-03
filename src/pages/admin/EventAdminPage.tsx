import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getEvents, getEventRegistrations, saveEvent, type Event, type EventRegistration } from '../../lib/eventService'

export default function EventAdminPage() {
  const { authed } = useAdminAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [regs, setRegs] = useState<EventRegistration[]>([])
  const [selected, setSelected] = useState<Event | null>(null)
  const [form, setForm] = useState<Partial<Event>>({ title: '', slug: '', eventDate: '', status: 'draft' })

  const refresh = async () => setEvents(await getEvents())
  useEffect(() => { if (authed) refresh() }, [authed])

  const viewRegs = async (event: Event) => {
    setSelected(event)
    setRegs(await getEventRegistrations(event.id))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug || !form.eventDate) return
    await saveEvent({ ...form, title: form.title, slug: form.slug, eventDate: form.eventDate })
    setForm({ title: '', slug: '', eventDate: '', status: 'draft' })
    await refresh()
  }

  if (!authed) return <AdminLogin title="Event Admin" subtitle="Manage events and registrations." />

  return (
    <AdminShell title="Event Management" subtitle="Create events and view attendees">
      <form className="admin-form-panel" onSubmit={handleSave} style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <input placeholder="Title" value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Slug" value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <input type="datetime-local" value={form.eventDate?.slice(0, 16) ?? ''} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
        <input placeholder="Location" value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <select value={form.status ?? 'draft'} onChange={(e) => setForm({ ...form, status: e.target.value as Event['status'] })}>
          <option value="draft">draft</option><option value="published">published</option><option value="cancelled">cancelled</option>
        </select>
        <button type="submit" className="volunteer-btn volunteer-btn-primary">Create Event</button>
      </form>

      <div className="volunteer-admin-layout">
        <div className="volunteer-admin-table-wrap">
          <table className="volunteer-admin-table">
            <thead><tr><th>Title</th><th>Date</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}><td>{ev.title}</td><td>{new Date(ev.eventDate).toLocaleDateString()}</td>
                  <td>{ev.registeredCount}{ev.capacity ? `/${ev.capacity}` : ''}</td><td>{ev.status}</td>
                  <td><button type="button" onClick={() => viewRegs(ev)}>Attendees</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && (
          <aside className="volunteer-admin-profile">
            <h2>{selected.title} — Attendees</h2>
            {regs.map((r) => <p key={r.id}>{r.fullName} · {r.email}</p>)}
            {!regs.length && <p>No registrations yet.</p>}
          </aside>
        )}
      </div>
    </AdminShell>
  )
}
