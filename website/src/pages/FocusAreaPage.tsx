import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchCampaigns } from '../api'
import DonationImpact from '../components/focusArea/DonationImpact'
import FocusCampaigns from '../components/focusArea/FocusCampaigns'
import FocusCTA from '../components/focusArea/FocusCTA'
import FocusGallery from '../components/focusArea/FocusGallery'
import FocusHero from '../components/focusArea/FocusHero'
import FocusOverview from '../components/focusArea/FocusOverview'
import FocusPrograms from '../components/focusArea/FocusPrograms'
import FocusStats from '../components/focusArea/FocusStats'
import { campaignMatchesFocusArea, getFocusAreaBySlug } from '../constants/focusAreas'
import { useMediaQuery } from '../hooks/useMediaQuery'
import NotFoundPage from './NotFoundPage'
import type { Campaign } from '../types'

export default function FocusAreaPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const area = slug ? getFocusAreaBySlug(slug) : undefined
  const mobile = useMediaQuery('(max-width: 600px)')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

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
    <div className="focus-area-page">
      <FocusHero area={area} mobile={mobile} />
      <FocusOverview area={area} mobile={mobile} />
      <FocusCampaigns
        area={area}
        campaigns={filtered}
        loading={loading}
        mobile={mobile}
        onDonateFallback={() => navigate('/campaigns')}
      />
      <FocusPrograms area={area} mobile={mobile} />
      <FocusStats area={area} mobile={mobile} />
      <FocusGallery area={area} mobile={mobile} />
      <DonationImpact area={area} mobile={mobile} />
      <FocusCTA area={area} mobile={mobile} />
    </div>
  )
}
