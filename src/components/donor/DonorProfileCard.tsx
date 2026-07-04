import { User, Mail, Hash, Calendar } from 'lucide-react'
import { C } from '../../constants/brand'
import type { DonorPortalData } from '../../lib/donorPortalService'
import { donorCardStyle } from './donorStyles'

interface Props {
  profile: DonorPortalData['profile']
  onSignOut: () => void
}

export default function DonorProfileCard({ profile, onSignOut }: Props) {
  return (
    <div
      style={{
        ...donorCardStyle,
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
        color: C.white,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 20,
      }}
    >
      <div style={{ flex: '1 1 280px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{profile.name}</h2>
            <span
              style={{
                display: 'inline-block',
                marginTop: 6,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {profile.tierLabel}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, fontSize: 14 }}>
          <Row icon={Mail} text={profile.email} />
          <Row icon={Hash} text={`Donor ID: ${profile.donorId}`} />
          <Row icon={Calendar} text={`Member since ${profile.memberSince}`} />
          {profile.phone ? <Row icon={User} text={profile.phone} /> : null}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <button
          type="button"
          onClick={onSignOut}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: C.white,
            borderRadius: 10,
            padding: '10px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function Row({ icon: Icon, text }: { icon: typeof User; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.95 }}>
      <Icon size={16} />
      <span>{text}</span>
    </div>
  )
}
