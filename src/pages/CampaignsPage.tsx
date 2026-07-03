import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { fetchCampaigns } from '../api'
import type { Campaign } from '../types'
import CampaignCard, { parseCategory } from '../components/CampaignCard'
import SectionLabel from '../components/ui/SectionLabel'
import SectionTitle from '../components/ui/SectionTitle'
import { C } from '../constants/brand'
import { useBreakpoints } from '../hooks/useMediaQuery'

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
  '/sports-campaigns': 'Sports',
}

export default function CampaignsPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = PATH_CATEGORIES[location.pathname]
  const isSearch = location.pathname === '/search'

  const { mobile } = useBreakpoints()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

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
      <div className="site-shell" style={{ padding: mobile ? '0 16px' : 0 }}>
        <SectionLabel mobile={mobile}>Campaigns</SectionLabel>
        <div style={{ margin: '12px 0 32px' }}>
          <SectionTitle mobile={mobile} maxWidth="100%">{pageTitle}</SectionTitle>
        </div>

        {!loading && campaigns.length === 0 && (
          <p style={{ textAlign: 'center', color: C.textMuted, padding: '40px 0' }}>No campaigns found.</p>
        )}

        <div className="campaigns-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ width: '100%', height: 320, background: C.grayBg, borderRadius: 12 }} />
              ))
            : campaigns.map((c) => <CampaignCard key={c.id} campaign={c} mobile={mobile} fluid />)}
        </div>
      </div>
    </div>
  )
}
