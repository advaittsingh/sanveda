import { useNavigate } from 'react-router-dom'
import { C } from '../../constants/brand'
import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent, resolveFocusImage } from '../../constants/focusAreaContent'
import SecondaryButton from '../ui/SecondaryButton'
import { FocusSection } from './FocusSection'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusHero({ area, mobile }: Props) {
  const navigate = useNavigate()
  const content = getFocusAreaContent(area)
  const heroImage = resolveFocusImage(area.image)

  return (
    <FocusSection mobile={mobile} variant="plain" className="focus-hero-section">
      <div className="focus-hero-media">
        <img src={heroImage} alt={area.title} className="focus-hero-image" />
        <div className="focus-hero-overlay" />
        <div className="focus-hero-content">
          <p className="focus-hero-eyebrow">Our Key Focus Area</p>
          <h1 className="focus-hero-title">{area.title}</h1>
          <p className="focus-hero-tagline">{content.heroTagline}</p>
          <div className="focus-hero-actions">
            <SecondaryButton
              onClick={() => navigate('/campaigns')}
              style={{
                background: C.secondary,
                padding: mobile ? '12px 20px' : '14px 28px',
                fontSize: mobile ? 13 : 14,
              }}
            >
              Donate Us
            </SecondaryButton>
            <button
              type="button"
              className="focus-hero-secondary-btn"
              onClick={() => {
                document.getElementById('focus-campaigns')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Explore Campaigns
            </button>
          </div>
        </div>
      </div>
    </FocusSection>
  )
}
