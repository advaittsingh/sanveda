import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent } from '../../constants/focusAreaContent'
import AnimatedSection from '../ui/AnimatedSection'
import SectionLabel from '../ui/SectionLabel'
import SectionTitle from '../ui/SectionTitle'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusPartners({ area, mobile }: Props) {
  const content = getFocusAreaContent(area)

  return (
    <AnimatedSection delay={280}>
      <section
        style={{
          width: mobile ? 'calc(100% - 32px)' : '94.44%',
          maxWidth: 1440,
          margin: '0 auto 48px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: mobile ? 16 : 24 }}>
          <SectionLabel mobile center>Collaboration</SectionLabel>
        </div>
        <div style={{ marginBottom: mobile ? 28 : 36 }}>
          <SectionTitle mobile={mobile} maxWidth="100%">
            Trusted Partners
          </SectionTitle>
        </div>
        <div className="focus-partners-row">
          {content.partners.map((partner) => (
            <span key={partner} className="focus-partner-pill">
              {partner}
            </span>
          ))}
        </div>
      </section>
    </AnimatedSection>
  )
}
