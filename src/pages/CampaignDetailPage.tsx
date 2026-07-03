import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import CampaignCommentsSection from '../components/campaign/CampaignCommentsSection'
import CampaignDetailHero from '../components/campaign/CampaignDetailHero'
import CampaignDonorsSection from '../components/campaign/CampaignDonorsSection'
import CampaignFixedDonationBar from '../components/campaign/CampaignFixedDonationBar'
import CampaignMonthlySidebar from '../components/campaign/CampaignMonthlySidebar'
import CampaignProgressCard from '../components/campaign/CampaignProgressCard'
import CampaignProjectSection from '../components/campaign/CampaignProjectSection'
import CampaignRelatedCampaigns from '../components/campaign/CampaignRelatedCampaigns'
import CampaignSectionNav from '../components/campaign/CampaignSectionNav'
import { fetchCampaignBySlug } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type { Campaign } from '../types'

export default function CampaignDetailPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const desktopNav = useMediaQuery('(min-width: 1001px)')
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState(3000)

  useEffect(() => {
    if (!slug) return
    fetchCampaignBySlug(slug)
      .then(setCampaign)
      .finally(() => setLoading(false))
  }, [slug])

  const projects = useMemo(() => {
    if (!campaign) return []
    const blocks = campaign.CampaignDescriptions?.filter((d) => d.status === 1 || d.status === true) ?? []
    if (blocks.length) {
      return blocks.map((b, i) => ({ id: b.id ?? i, description: b.description }))
    }
    if (campaign.description && campaign.description !== 'No description provided') {
      return [{ id: 'desc', description: `<p>${campaign.description}</p>` }]
    }
    return []
  }, [campaign])

  const handleDonate = () => {
    if (!campaign) return
    const slug = campaign.redirects?.[0]?.primary_url ?? `campaign-${campaign.id}`
    const params = new URLSearchParams({
      slug,
      title: campaign.title,
      amount: String(amount),
    })
    navigate(`/donate/checkout?${params.toString()}`)
  }

  if (loading) {
    return (
      <div style={{ background: '#FFFFFF', paddingBottom: 120 }}>
        <div style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto', padding: '32px 16px' }}>
          <div style={{ height: 24, width: 240, background: '#F5F7FA', borderRadius: 8, marginBottom: 24 }} />
          <div style={{ height: 320, background: '#F5F7FA', borderRadius: 16 }} />
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div style={{ background: '#FFFFFF', padding: '40px 0 80px' }}>
        <AboutBreadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Campaigns', path: '/campaigns' },
            { label: 'Campaign Detail', path: null },
          ]}
        />
        <div style={{ width: '94.44%', maxWidth: 1440, margin: '40px auto', textAlign: 'center' }}>
          <h1 style={{ color: '#041B4D', fontWeight: 800 }}>Campaign not found</h1>
        </div>
      </div>
    )
  }

  const image = campaign.banner_image || campaign.thumbnail_image || ASSETS.fallBackBanner
  const donors = campaign.total_donors ?? 0
  const hideGoal = Number(campaign.hide_goal) === 1
  const hideRaised = Number(campaign.hide_raised) === 1
  const hideAll = Number((campaign as Campaign & { hideAll?: number }).hideAll) === 1
  const updates = campaign.updates ?? []
  const hasUpdates = updates.length > 0

  const contentSections = (
    <>
      <CampaignProjectSection projects={projects} mobile={mobile} />
      {hasUpdates && (
        <section id="updates" style={{ marginTop: 30, marginBottom: 30 }}>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: mobile ? 20 : 30, background: C.white }}>
            <h2 style={{ fontSize: mobile ? 14 : 24, fontWeight: 700, color: C.primary, margin: '0 0 16px' }}>Updates</h2>
            <p style={{ color: C.textMuted, margin: 0 }}>No updates posted yet.</p>
          </div>
        </section>
      )}
      <CampaignCommentsSection mobile={mobile} />
      <CampaignDonorsSection
        mobile={mobile}
        campaignSlug={campaign.redirects?.[0]?.primary_url ?? slug}
        campaignId={campaign.id}
      />
    </>
  )

  return (
    <div className="campaign-detail-page" style={{ background: C.white, paddingBottom: mobile ? 130 : 100 }}>
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Campaigns', path: '/campaigns' },
          { label: 'Campaign Detail', path: null },
        ]}
      />

      <div className="campaign-detail-shell">
        <CampaignDetailHero
          title={campaign.title}
          image={image}
          mobile={mobile}
          tablet={tablet}
          onDonate={handleDonate}
        />

        {!hideAll && (
          <div className="campaign-progress-overlap">
            <CampaignProgressCard
              goal={campaign.goal}
              raised={campaign.raised}
              donors={donors}
              hideGoal={hideGoal}
              hideRaised={hideRaised}
              mobile={mobile}
            />
          </div>
        )}

        {!desktopNav && (
          <div className="campaign-mobile-nav-wrap">
            <CampaignSectionNav
              hasProject={projects.length > 0}
              hasUpdates={hasUpdates}
              horizontal
              mobile={mobile}
              tablet={tablet}
            />
          </div>
        )}

        {desktopNav ? (
          <div className="campaign-detail-body">
            <aside className="campaign-detail-left">
              <CampaignSectionNav
                hasProject={projects.length > 0}
                hasUpdates={hasUpdates}
                mobile={mobile}
                tablet={tablet}
              />
              <CampaignMonthlySidebar mobile={mobile} tablet={tablet} />
            </aside>
            <div className="campaign-detail-right">{contentSections}</div>
          </div>
        ) : (
          <div className="campaign-detail-mobile-content">{contentSections}</div>
        )}

        {!mobile && (
          <CampaignRelatedCampaigns currentId={campaign.id} mobile={mobile} onViewAll={() => navigate('/campaigns')} />
        )}

        {!desktopNav && <CampaignMonthlySidebar mobile={mobile} tablet={tablet} />}
      </div>

      {mobile && (
        <CampaignRelatedCampaigns currentId={campaign.id} mobile={mobile} onViewAll={() => navigate('/campaigns')} />
      )}

      <CampaignFixedDonationBar
        amount={amount}
        onAmountChange={setAmount}
        onDonate={handleDonate}
      />
    </div>
  )
}
