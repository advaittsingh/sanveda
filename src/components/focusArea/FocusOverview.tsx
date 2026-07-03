import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent, resolveFocusImage } from '../../constants/focusAreaContent'
import SectionLabel from '../ui/SectionLabel'
import { FocusSection } from './FocusSection'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusOverview({ area, mobile }: Props) {
  const content = getFocusAreaContent(area)
  const image = resolveFocusImage(content.overviewImage, resolveFocusImage(area.image))

  return (
    <FocusSection mobile={mobile} variant="cream" delay={40} className="focus-overview-section">
      <div className="focus-overview-grid">
        <div className="focus-overview-image-col">
          <div className="focus-overview-image-wrap">
            <img src={image} alt={content.overviewTitle} className="focus-overview-image" loading="lazy" />
            <div className="focus-overview-image-badge" style={{ backgroundColor: area.accent }}>
              <img src={area.icon} alt="" width={28} height={28} />
            </div>
          </div>
        </div>

        <div className="focus-overview-copy">
          <SectionLabel mobile={mobile}>About This Focus Area</SectionLabel>
          <h2 className="focus-overview-title">{content.overviewTitle}</h2>
          <p className="focus-overview-body">{content.overviewBody}</p>

          <div className="focus-overview-support-box">
            <h3 className="focus-overview-subhead">Sanveda supports</h3>
            <ul className="focus-overview-checklist">
              {content.overviewBullets.map((item) => (
                <li key={item}>
                  <span className="focus-overview-check" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </FocusSection>
  )
}
