import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { fetchCampaigns } from '../api'
import type { Campaign } from '../types'
import CampaignCard, { parseCategory } from '../components/CampaignCard'
import SectionLabel from '../components/ui/SectionLabel'
import SectionTitle from '../components/ui/SectionTitle'
import { C } from '../constants/brand'

const PATH_CATEGORIES: Record<string, string> = {
  '/urgent': 'Urgent',
  '/children': 'Children',
  '/animals': 'Animals',
  '/disability': 'Disability',
  '/disaster-relief': 'Disaster Relief',
  '/education-campaigns': 'Education',
  '/elderly': 'Elderly',
  '/faith': 'Faith',
  '/hunger': 'Hunger',
  '/diy': 'DIY',
  '/women': 'Women',
  '/medical-campaigns': 'Medical',
}

export default function CampaignsPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = PATH_CATEGORIES[location.pathname]
  const isSearch = location.pathname === '/search'

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
    setLoading(true)
    fetchCampaigns({ limit: 48 })
      .then((data) => {
        let filtered = data
        if (category) {
          filtered = data.filter((c) => parseCategory(c.category).some((cat) => cat.toLowerCase().includes(category.toLowerCase())))
        }
        if (query) {
          const q = query.toLowerCase()
          filtered = filtered.filter((c) => c.title.toLowerCase().includes(q))
        }
        setCampaigns(filtered)
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false))
  }, [category, query])

  const pageTitle = isSearch && query ? `Search: "${query}"` : category ? `${category} Campaigns` : 'Explore Campaigns'

  return (
    <div style={{ padding: mobile ? '24px 0' : '40px 0', background: C.white }}>
      <div style={{ width: '94.44%', maxWidth: '1440px', margin: '0 auto', padding: mobile ? '0 16px' : 0 }}>
        <SectionLabel mobile={mobile}>Campaigns</SectionLabel>
        <div style={{ margin: '12px 0 32px' }}>
          <SectionTitle mobile={mobile} maxWidth="100%">{pageTitle}</SectionTitle>
        </div>

        {!loading && campaigns.length === 0 && (
          <p style={{ textAlign: 'center', color: C.textMuted, padding: '40px 0' }}>No campaigns found.</p>
        )}

        <div className="hide-scrollbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: mobile ? 'center' : 'flex-start' }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ width: 300, height: 320, background: C.grayBg, borderRadius: 12 }} />
              ))
            : campaigns.map((c) => <CampaignCard key={c.id} campaign={c} mobile={mobile} />)}
        </div>
      </div>
    </div>
  )
}
