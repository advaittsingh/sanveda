import { useNavigate } from 'react-router-dom'
import CampaignCard from '../CampaignCard'
import ViewAllButton from '../ui/ViewAllButton'
import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent } from '../../constants/focusAreaContent'
import { FocusSection, FocusSectionHeader } from './FocusSection'
import type { Campaign } from '../../types'

interface Props {
  area: FocusArea
  campaigns: Campaign[]
  loading?: boolean
  mobile?: boolean
  onDonateFallback: () => void
}

export default function FocusCampaigns({ area, campaigns, loading, mobile, onDonateFallback }: Props) {
  const navigate = useNavigate()
  const content = getFocusAreaContent(area)

  return (
    <FocusSection mobile={mobile} id="focus-campaigns" delay={80} className="focus-campaigns-section">
      <FocusSectionHeader
        label="Take Action"
        title={`Current Campaigns In ${area.tabLabel}`}
        mobile={mobile}
        titleMaxWidth={mobile ? '300px' : '720px'}
      />

      {loading ? (
        <div className="focus-campaigns-loading">
          {Array.from({ length: Math.min(3, campaigns.length || 3) }).map((_, i) => (
            <div key={i} className="focus-campaign-skeleton" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="focus-campaigns-empty">
          <p>{content.emptyCampaignMessage}</p>
          <button type="button" className="btn-secondary focus-empty-cta" onClick={onDonateFallback}>
            {content.emptyCampaignCta}
          </button>
        </div>
      ) : (
        <>
          <div className="focus-campaigns-grid">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} mobile={mobile} />
            ))}
          </div>
          <div className="focus-campaigns-footer">
            <ViewAllButton text="View All Campaigns" mobile={mobile} onClick={() => navigate('/campaigns')} />
          </div>
        </>
      )}
    </FocusSection>
  )
}
