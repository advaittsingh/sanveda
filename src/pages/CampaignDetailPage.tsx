import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import CampaignDetailStats from '../components/campaign/CampaignDetailStats'
import CampaignDetailTabs from '../components/campaign/CampaignDetailTabs'
import CampaignDonationPanel from '../components/campaign/CampaignDonationPanel'
import { fetchCampaignBySlug } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type { Campaign } from '../types'

export default function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
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
    return (
      <div style={{ background: C.white, paddingBottom: 80 }}>
        <div style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto', padding: '32px 16px' }}>
          <div style={{ height: 24, width: 240, background: C.grayBg, borderRadius: 8, marginBottom: 24 }} />
          <div style={{ height: 420, background: C.grayBg, borderRadius: 20 }} />
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div style={{ background: C.white, padding: '40px 0 80px' }}>
        <AboutBreadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Campaigns', path: '/campaigns' },
            { label: 'Campaign Detail', path: null },
          ]}
        />
        <div style={{ width: '94.44%', maxWidth: 1440, margin: '40px auto', textAlign: 'center' }}>
          <h1 style={{ color: C.primary, fontWeight: 800 }}>Campaign not found</h1>
        </div>
      </div>
    )
  }

  const image = campaign.banner_image || campaign.thumbnail_image || ASSETS.fallBackBanner
  const storyBlocks = campaign.CampaignDescriptions?.filter((d) => d.status === 1 || d.status === true) ?? []
  const storyHtml =
    storyBlocks.map((b) => b.description).join('') ||
    (campaign.description && campaign.description !== 'No description provided' ? `<p>${campaign.description}</p>` : '')
  const donors = campaign.total_donors ?? 0
  const hideGoal = Number(campaign.hide_goal) === 1
  const hideRaised = Number(campaign.hide_raised) === 1
  const crumbTitle =
    campaign.title.length > 48 ? `${campaign.title.slice(0, 48)}…` : campaign.title

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 100 : 80 }}>
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Campaigns', path: '/campaigns' },
          { label: crumbTitle, path: null },
        ]}
      />

      <div
        className="campaign-detail-layout"
        style={{
          width: '94.44%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: mobile ? '8px 0 0' : '16px 0 0',
        }}
      >
        <div className="campaign-detail-main">
          <div
            style={{
              position: 'relative',
              borderRadius: mobile ? 16 : 20,
              overflow: 'hidden',
              marginBottom: mobile ? 20 : 24,
              background: '#F5F5F5',
            }}
          >
            <img
              src={image}
              alt={campaign.title}
              style={{
                width: '100%',
                display: 'block',
                maxHeight: mobile ? 260 : 480,
                objectFit: 'cover',
                aspectRatio: mobile ? '16 / 10' : '16 / 9',
              }}
            />
            {campaign.exemption_tag && (
              <span
                style={{
                  position: 'absolute',
                  right: mobile ? 12 : 16,
                  top: mobile ? 12 : 16,
                  background: C.secondary,
                  color: C.white,
                  fontWeight: 700,
                  fontSize: mobile ? 10 : 12,
                  height: mobile ? 28 : 32,
                  borderRadius: 4,
                  padding: mobile ? '0 12px' : '0 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  textTransform: 'uppercase',
                }}
              >
                {campaign.exemption_tag}
              </span>
            )}
          </div>

          <h1
            style={{
              fontWeight: 800,
              fontSize: mobile ? 22 : tablet ? 28 : 32,
              color: '#1D1D1B',
              margin: '0 0 20px',
              lineHeight: 1.35,
              textTransform: 'capitalize',
            }}
          >
            {campaign.title}
          </h1>

          <CampaignDetailStats
            goal={campaign.goal}
            raised={campaign.raised}
            donors={donors}
            hideGoal={hideGoal}
            hideRaised={hideRaised}
            mobile={mobile}
          />

          {mobile && (
            <div style={{ margin: '24px 0' }}>
              <CampaignDonationPanel amount={amount} onAmountChange={setAmount} mobile />
            </div>
          )}

          <div style={{ marginTop: mobile ? 24 : 32 }}>
            <CampaignDetailTabs
              storyHtml={storyHtml}
              updates={campaign.updates}
              mobile={mobile}
            />
          </div>
        </div>

        {!mobile && (
          <aside className="campaign-detail-sidebar">
            <CampaignDonationPanel amount={amount} onAmountChange={setAmount} />
          </aside>
        )}
      </div>

      {mobile && (
        <div className="campaign-detail-mobile-donate">
          <button
            type="button"
            className="btn-donate"
            style={{
              width: '100%',
              padding: '14px 20px',
              border: 'none',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
              fontFamily: 'Red Hat Display, sans-serif',
            }}
          >
            Donate ₹{amount.toLocaleString('en-IN')}
          </button>
        </div>
      )}
    </div>
  )
}
