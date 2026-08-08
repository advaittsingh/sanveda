import { Link } from 'react-router-dom'
import AdminCard from '../ui/AdminCard'

interface Event {
  id: string
  title: string
  date: string
  location?: string
}

export default function UpcomingEventsWidget({ events }: { events: Event[] }) {
  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0B2C6B]">Upcoming Events</h3>
        <Link to="/admin/events" className="text-xs font-medium text-[#0E4FA8] hover:underline">Manage</Link>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-slate-500">No upcoming events scheduled.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="flex gap-3 rounded-xl border border-[#E5E7EB] px-3 py-2.5">
              <span className="w-12 shrink-0 text-xs font-bold text-[#0E4FA8]">{e.date}</span>
              <div>
                <p className="text-sm font-medium text-slate-800">{e.title}</p>
                {e.location ? <p className="text-xs text-slate-500">{e.location}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  )
}
