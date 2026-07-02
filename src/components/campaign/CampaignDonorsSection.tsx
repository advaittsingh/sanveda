import { useState } from 'react'
import { ASSETS } from '../../constants/assets'
import { CD } from './campaignDetailTheme'

interface Props {
  mobile?: boolean
}

export default function CampaignDonorsSection({ mobile }: Props) {
  const [tab, setTab] = useState<0 | 1>(0)

  return (
    <section id="donors" style={{ marginBottom: 30 }}>
      <div
        style={{
          border: `1px solid ${CD.border}`,
          borderRadius: 12,
          padding: 20,
          width: '100%',
          boxShadow: '0 1.341px 10.727px 0 rgba(0, 0, 0, 0.10)',
          background: '#FFFFFF',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 26,
            gap: 12,
          }}
        >
          <h2 style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: mobile ? 14 : 24, fontWeight: 700, color: CD.primary, margin: 0 }}>
            <img src={ASSETS.starIcon} alt="" width={mobile ? 18 : 24} height={mobile ? 18 : 24} />
            Donors
          </h2>
          <img
            src={ASSETS.yellowHearts}
            alt=""
            width={mobile ? 20 : 44}
            height={mobile ? 20 : 44}
            style={{ transform: 'scaleX(-1)', filter: 'brightness(0.75) contrast(1.1)', flexShrink: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: mobile ? 8 : 12, marginBottom: 20 }}>
          {(['Top Donors', 'Recent Donors'] as const).map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(i as 0 | 1)}
              style={{
                fontWeight: 600,
                padding: mobile ? '10px 13px' : '12px 20px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: mobile ? 10 : 14,
                color: tab === i ? '#FFFFFF' : CD.textMuted,
                backgroundColor: tab === i ? CD.secondary : '#FFFFFF',
                fontFamily: 'Red Hat Display, sans-serif',
                transition: 'all 0.3s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: CD.textMuted, fontSize: 14, margin: '8px 0 0' }}>
          {tab === 0 ? 'No top donors yet.' : 'No recent donors yet.'}
        </p>
      </div>
    </section>
  )
}
