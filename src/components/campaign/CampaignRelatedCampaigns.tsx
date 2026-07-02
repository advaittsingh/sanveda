import { useEffect, useState } from 'react'
import { fetchCampaigns } from '../../api'
import CampaignCard from '../CampaignCard'
import ViewAllButton from '../ui/ViewAllButton'
import { CD } from './campaignDetailTheme'
import { creamSectionStyle } from '../../constants/sectionStyles'
import type { Campaign } from '../../types'

interface Props {
  currentId: number
  mobile?: boolean
  onViewAll: () => void
}

export default function CampaignRelatedCampaigns({ currentId, mobile, onViewAll }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns({ limit: 4 })
      .then((data) => setCampaigns(data.filter((c) => c.id !== currentId).slice(0, 3)))
      .finally(() => setLoading(false))
  }, [currentId])

  if (loading || campaigns.length === 0) return null

  return (
    <div
      style={{
        ...creamSectionStyle(mobile ?? false),
        width: '100%',
        marginBottom: mobile ? 0 : 60,
      }}
    >
      <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: mobile ? 22 : 32, color: CD.primary, margin: '0 0 8px' }}>
        More Campaigns
      </h2>
      <p style={{ textAlign: 'center', color: CD.textMuted, margin: '0 0 28px', fontSize: mobile ? 14 : 16 }}>
        Explore other active Sanveda campaigns
      </p>
      <div
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: mobile ? 16 : 24,
          overflowX: 'auto',
          justifyContent: mobile ? 'flex-start' : 'center',
        }}
      >
        {campaigns.map((c) => (
          <div key={c.id} style={{ flexShrink: 0 }}>
            <CampaignCard campaign={c} mobile={mobile} />
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <ViewAllButton text="View All Campaigns" mobile={mobile} onClick={onViewAll} />
      </div>
    </div>
  )
}
