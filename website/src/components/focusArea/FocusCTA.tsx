import { useNavigate } from 'react-router-dom'
import { C } from '../../constants/brand'
import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent } from '../../constants/focusAreaContent'
import SecondaryButton from '../ui/SecondaryButton'
import { FocusSection } from './FocusSection'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusCTA({ area, mobile }: Props) {
  const navigate = useNavigate()
  const content = getFocusAreaContent(area)

  return (
    <FocusSection mobile={mobile} variant="dark" delay={280} className="focus-final-cta-section">
      <div className="focus-final-cta">
        <h2 className="focus-final-cta-title">{content.ctaTitle}</h2>
        <p className="focus-final-cta-desc">{content.ctaDescription}</p>
        <div className="focus-cta-actions">
          <SecondaryButton
            onClick={() => navigate('/campaigns')}
            style={{
              background: C.white,
              color: C.primary,
              padding: mobile ? '12px 24px' : '14px 32px',
              fontWeight: 700,
            }}
          >
            Donate Us
          </SecondaryButton>
          <button type="button" className="focus-hero-secondary-btn" onClick={() => navigate('/volunteer')}>
            Become Volunteer
          </button>
        </div>
      </div>
    </FocusSection>
  )
}
