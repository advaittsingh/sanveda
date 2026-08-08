import { useEffect, useMemo, useState } from 'react'
import { ASSETS } from '../../constants/assets'
import { getDonationsByCampaign, type Donation } from '../../lib/donationService'
import { CD } from './campaignDetailTheme'

interface Props {
  mobile?: boolean
  campaignSlug?: string
  campaignId?: number
}

function donorLabel(d: Donation): string {
  if (d.isAnonymous) return 'Anonymous Donor'
  return d.donorName ?? 'Donor'
}

export default function CampaignDonorsSection({ mobile, campaignSlug, campaignId }: Props) {
  const [tab, setTab] = useState<0 | 1>(0)
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDonationsByCampaign(campaignSlug, campaignId)
      .then(setDonations)
      .finally(() => setLoading(false))
  }, [campaignSlug, campaignId])

  const topDonors = useMemo(() => {
    const byDonor = new Map<string, { name: string; total: number }>()
    for (const d of donations) {
      const key = d.isAnonymous ? 'anon' : (d.donorEmail ?? d.donorName ?? d.id)
      const existing = byDonor.get(key)
      if (existing) existing.total += d.amount
      else byDonor.set(key, { name: donorLabel(d), total: d.amount })
    }
    return [...byDonor.values()].sort((a, b) => b.total - a.total).slice(0, 10)
  }, [donations])

  const recentDonors = useMemo(
    () => [...donations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
    [donations],
  )

  const list = tab === 0 ? topDonors : recentDonors
  const empty = tab === 0 ? 'No top donors yet.' : 'No recent donors yet.'

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

        {loading ? (
          <p style={{ textAlign: 'center', color: CD.textMuted, fontSize: 14, margin: '8px 0 0' }}>Loading donors…</p>
        ) : list.length === 0 ? (
          <p style={{ textAlign: 'center', color: CD.textMuted, fontSize: 14, margin: '8px 0 0' }}>{empty}</p>
        ) : tab === 0 ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {topDonors.map((d, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${CD.border}`, fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: CD.primary }}>{d.name}</span>
                <span style={{ color: CD.textMuted }}>₹{d.total.toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {recentDonors.map((d) => (
              <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${CD.border}`, fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: CD.primary }}>{donorLabel(d)}</span>
                <span style={{ color: CD.textMuted }}>₹{d.amount.toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
