import { Bell } from 'lucide-react'
import { C } from '../../constants/brand'
import type { DonorNotification } from '../../lib/donorPortalService'
import { donorCardStyle, donorSectionTitle } from './donorStyles'

interface Props {
  notifications: DonorNotification[]
}

export default function DonorNotifications({ notifications }: Props) {
  return (
    <section style={donorCardStyle}>
      <h2 style={{ ...donorSectionTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bell size={20} />
        Notifications
      </h2>

      {!notifications.length ? (
        <p style={{ color: C.textMuted, fontSize: 14 }}>Donation confirmations and receipt alerts will show here.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {notifications.map((n) => (
            <li
              key={n.id}
              style={{
                display: 'flex',
                gap: 10,
                padding: 12,
                borderRadius: 10,
                background: n.tone === 'success' ? '#f0fdf4' : C.cream,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: n.tone === 'success' ? '#15803d' : C.secondary }}>✓</span>
              <div>
                <div style={{ color: C.primary, fontWeight: 500 }}>{n.message}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                  {new Date(n.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
