import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCampaigns } from '../../api'
import CampaignCard from '../CampaignCard'
import type { Campaign } from '../../types'

interface Props {
  currentId: number
  mobile?: boolean
}

export default function CampaignRelatedCampaigns({ currentId, mobile }: Props) {
  const navigate = useNavigate()
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
        width: '100%',
        borderRadius: mobile ? 16 : 36,
        backgroundColor: 'rgba(245, 248, 237, 0.5)',
        padding: mobile ? '32px 16px' : '48px 34px',
        marginBottom: mobile ? 0 : 60,
      }}
    >
      <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: mobile ? 22 : 32, color: '#1D1D1B', margin: '0 0 8px' }}>
        More Campaigns
      </h2>
      <p style={{ textAlign: 'center', color: '#4A4A49', margin: '0 0 28px', fontSize: mobile ? 14 : 16 }}>
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
        <button
          type="button"
          onClick={() => navigate('/campaigns')}
          className="th-donate-btn"
          style={{ width: mobile ? '100%' : 200, height: 44, maxWidth: 320 }}
        >
          View All Campaigns
        </button>
      </div>
    </div>
  )
}
