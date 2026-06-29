import { useEffect, useState } from 'react'
import { fetchCMS, fetchLifeCampaigns, getCMSSection } from '../api'
import { C } from '../constants/brand'
import CampaignCard from '../components/CampaignCard'
import PageHero from '../components/ui/PageHero'
import PageShell from '../components/ui/PageShell'

export default function LifePage() {
  const [hero, setHero] = useState({ title: '', subtitle: '', description: '', image: '' as string | null })
  const [benefits, setBenefits] = useState<{ title: string; description: string }[]>([])
  const [campaigns, setCampaigns] = useState<Awaited<ReturnType<typeof fetchLifeCampaigns>>>([])

  useEffect(() => {
    fetchCMS().then((cms) => {
      const medical = getCMSSection(cms, 'Medical Fundraising')
      if (medical) {
        setHero({
          title: medical.sub_title ?? medical.title ?? '',
          subtitle: 'Life Campaigns',
          description: medical.description ?? '',
          image: medical.image ?? null,
        })
      }
      const benefitsSection = getCMSSection(cms, 'Benefits Of Crowdfunding')
      setBenefits(
        (benefitsSection?.relatedCMS ?? [])
          .filter((s) => s.status === 1 || s.status === true)
          .map((s) => ({ title: s.title ?? '', description: s.description ?? s.sub_title ?? '' })),
      )
    }).catch(() => {})
    fetchLifeCampaigns().then(setCampaigns).catch(() => {})
  }, [])

  return (
    <>
      <div style={{ padding: '24px 0 0' }}>
        <PageHero label="Life" title={hero.title || 'Medical & Life Campaigns'} subtitle={hero.subtitle} description={hero.description} image={hero.image} />
      </div>
      <PageShell bg={C.white}>
        {benefits.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, margin: '32px 0 40px' }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 24, background: C.cream, borderRadius: 16, border: `1px solid rgba(212,164,55,0.3)` }}>
                <div style={{ fontWeight: 800, fontSize: 28, color: C.secondary, marginBottom: 8 }}>{b.title}</div>
                <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{b.description}</p>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontWeight: 800, fontSize: 28, color: C.primary, marginBottom: 24 }}>Active Life Campaigns</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </PageShell>
    </>
  )
}
