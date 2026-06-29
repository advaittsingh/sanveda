import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCampaignBySlug, formatCurrency } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import type { Campaign } from '../types'
import PageShell from '../components/ui/PageShell'
import HtmlContent from '../components/ui/HtmlContent'

const AMOUNTS = [500, 1000, 2000, 5000]

function getProgress(raised: number, goal: number) {
  if (!goal) return 0
  return Math.min(Math.round((raised / goal) * 100), 100)
}

export default function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState(1000)

  useEffect(() => {
    if (!slug) return
    fetchCampaignBySlug(slug)
      .then(setCampaign)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <PageShell><div style={{ height: 400, background: C.grayBg, borderRadius: 16 }} /></PageShell>
  }

  if (!campaign) {
    return (
      <PageShell>
        <h1 style={{ color: C.primary, fontWeight: 800 }}>Campaign not found</h1>
      </PageShell>
    )
  }

  const progress = getProgress(campaign.raised, campaign.goal)
  const image = campaign.banner_image || campaign.thumbnail_image || ASSETS.fallBackBanner
  const storyBlocks = campaign.CampaignDescriptions?.filter((d) => d.status === 1 || d.status === true) ?? []
  const storyHtml = storyBlocks.map((b) => b.description).join('') || (campaign.description !== 'No description provided' ? campaign.description : '')

  return (
    <PageShell bg={C.grayBg}>
      <div className="campaign-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 32, alignItems: 'start' }}>
        <div>
          <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 24, background: C.white, border: `1px solid ${C.border}` }}>
            <img src={image} alt={campaign.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '24px 28px' }}>
              {campaign.exemption_tag && (
                <span style={{ display: 'inline-block', background: C.secondary, color: C.white, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, marginBottom: 12, textTransform: 'uppercase' }}>
                  {campaign.exemption_tag}
                </span>
              )}
              <h1 style={{ fontWeight: 800, fontSize: 28, color: C.primary, margin: '0 0 16px', lineHeight: 1.3 }}>{campaign.title}</h1>

              {!campaign.hide_raised && !campaign.hide_goal && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span style={{ fontWeight: 700, color: C.gold }}>{progress}% funded</span>
                    <span style={{ color: C.textMuted }}>{campaign.total_donors ?? 0} donors</span>
                  </div>
                  <div style={{ height: 10, background: '#E8E8E8', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${C.secondary}, ${C.primary})` }} />
                  </div>
                  <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>Raised</div>
                      <div style={{ fontWeight: 800, color: C.gold, fontSize: 18 }}>{formatCurrency(campaign.raised)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>Goal</div>
                      <div style={{ fontWeight: 800, color: C.primary, fontSize: 18 }}>{formatCurrency(campaign.goal)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {storyHtml && (
            <div style={{ background: C.white, borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, color: C.primary, margin: '0 0 16px' }}>Story</h2>
              <HtmlContent html={storyHtml} />
            </div>
          )}
        </div>

        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 24, border: `2px solid ${C.gold}`, boxShadow: '0 8px 24px rgba(4,27,77,0.08)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: C.primary, margin: '0 0 16px' }}>Choose Amount</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 10,
                    border: amount === a ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                    background: amount === a ? C.cream : C.white,
                    fontWeight: 700,
                    color: C.primary,
                    cursor: 'pointer',
                    fontFamily: 'Red Hat Display',
                  }}
                >
                  ₹{a.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 16, fontSize: 16, fontFamily: 'Red Hat Display', boxSizing: 'border-box' }}
            />
            <button type="button" className="btn-donate" style={{ width: '100%', padding: '14px 20px', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: 'Red Hat Display' }}>
              Donate ₹{amount.toLocaleString('en-IN')}
            </button>
            <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
              Secure payment · Tax benefits may apply
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
