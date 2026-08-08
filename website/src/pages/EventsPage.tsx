import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { C } from '../constants/brand'
import { getPublishedEvents, registerForEvent, type Event } from '../lib/eventService'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function EventsPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const [events, setEvents] = useState<Event[]>([])
  const [registering, setRegistering] = useState<string | null>(null)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    getPublishedEvents().then(setEvents)
  }, [])

  const handleRegister = async (eventId: string) => {
    if (!form.fullName || !form.email) {
      setMessage('Please enter your name and email.')
      return
    }
    try {
      await registerForEvent(eventId, form.fullName, form.email, form.phone)
      setMessage('Registration successful!')
      setRegistering(null)
      setEvents(await getPublishedEvents())
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Events', path: null }]} />
      <section style={{ width: '94.44%', maxWidth: 1000, margin: '0 auto', padding: mobile ? '24px 16px' : '40px 0' }}>
        <h1 style={{ fontSize: mobile ? 28 : 40, fontWeight: 800, color: C.primary, margin: '0 0 32px' }}>Upcoming Events</h1>

        {!events.length && <p style={{ color: C.textMuted }}>No upcoming events. Check back soon.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {events.map((event) => (
            <article key={event.id} style={{ border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: mobile ? 'column' : 'row' }}>
              {event.bannerImage && <img src={event.bannerImage} alt="" style={{ width: mobile ? '100%' : 240, height: 160, objectFit: 'cover' }} />}
              <div style={{ padding: 24, flex: 1 }}>
                <h2 style={{ margin: '0 0 8px', color: C.primary, fontWeight: 700 }}>{event.title}</h2>
                <p style={{ margin: '0 0 8px', fontSize: 14, color: C.textMuted }}>
                  {new Date(event.eventDate).toLocaleString('en-IN')} {event.location ? `· ${event.location}` : ''}
                </p>
                <p style={{ margin: '0 0 16px', lineHeight: 1.6 }}>{event.description}</p>
                <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>
                  {event.registeredCount}{event.capacity ? ` / ${event.capacity}` : ''} registered
                </p>
                <button type="button" className="btn-primary" style={{ padding: '10px 20px', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }} onClick={() => setRegistering(event.id)}>
                  Register
                </button>
              </div>
            </article>
          ))}
        </div>

        {registering && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: C.white, borderRadius: 16, padding: 28, width: '90%', maxWidth: 400 }}>
              <h3 style={{ margin: '0 0 16px', color: C.primary }}>Event Registration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}` }} />
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}` }} />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}` }} />
                <button type="button" className="btn-primary" onClick={() => handleRegister(registering)} style={{ padding: 12, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Confirm Registration</button>
                <button type="button" onClick={() => setRegistering(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {message && <p style={{ marginTop: 20, color: C.secondary, fontWeight: 600 }}>{message}</p>}
        <p style={{ marginTop: 24 }}><Link to="/gallery" style={{ color: C.secondary, fontWeight: 600 }}>View event photos in our gallery →</Link></p>
      </section>
    </div>
  )
}
