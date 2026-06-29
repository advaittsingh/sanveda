import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCampaigns } from '../api'
import CampaignCard from '../components/CampaignCard'
import { campaignMatchesFocusArea, getFocusAreaBySlug } from '../constants/focusAreas'
import { C } from '../constants/brand'
import NotFoundPage from './NotFoundPage'
import type { Campaign } from '../types'

export default function FocusAreaPage() {
  const { slug } = useParams<{ slug: string }>()
  const area = slug ? getFocusAreaBySlug(slug) : undefined
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetchCampaigns({ limit: 80 })
      .then(setCampaigns)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!area) return []
    return campaigns.filter((c) => campaignMatchesFocusArea(c, area))
  }, [campaigns, area])

  if (!area) return <NotFoundPage />

  return (
    <div style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div
        style={{
          width: mobile ? 'calc(100% - 32px)' : '94.44%',
          maxWidth: 1440,
          margin: '0 auto 40px',
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
          borderRadius: mobile ? 16 : 24,
          padding: mobile ? '32px 24px' : '48px 56px',
          color: C.white,
        }}
      >
        <p style={{ color: C.goldLight, fontWeight: 700, fontSize: mobile ? 12 : 14, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Our Key Focus Area
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img src={area.icon} alt="" width={36} height={36} style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontWeight: 800, fontSize: mobile ? 24 : 36, margin: '0 0 16px', fontFamily: 'Red Hat Display' }}>
              {area.title}
            </h1>
            <p style={{ fontSize: mobile ? 14 : 16, lineHeight: 1.65, margin: 0, color: 'rgba(255,255,255,0.88)', maxWidth: 800 }}>
              {area.description}
            </p>
          </div>
        </div>
      </div>

      <div style={{ width: mobile ? 'calc(100% - 32px)' : '94.44%', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontWeight: 800, fontSize: mobile ? 20 : 28, color: C.primary, margin: 0, fontFamily: 'Red Hat Display' }}>
            Related Campaigns
          </h2>
          <Link to="/campaigns" style={{ color: C.secondary, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            View all campaigns →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ width: mobile ? 290 : 417, height: 480, background: '#e8e8e8', borderRadius: 16, flexShrink: 0 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: C.grayBg,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
            }}
          >
            <p style={{ color: C.textMuted, margin: '0 0 16px' }}>No campaigns in this focus area yet. Check back soon or explore all campaigns.</p>
            <Link to="/campaigns" className="btn-secondary" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', color: '#fff', fontWeight: 600 }}>
              Explore Campaigns
            </Link>
          </div>
        ) : (
          <div
            className="hide-scrollbar"
            style={{
              display: 'grid',
              gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 417px))',
              gap: 24,
              justifyContent: mobile ? 'stretch' : 'center',
            }}
          >
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} mobile={mobile} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
