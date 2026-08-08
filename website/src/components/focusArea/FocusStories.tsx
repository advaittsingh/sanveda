import { ASSETS } from '../../constants/assets'
import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent } from '../../constants/focusAreaContent'
import { creamSectionStyle } from '../../constants/sectionStyles'
import AnimatedSection from '../ui/AnimatedSection'
import SectionLabel from '../ui/SectionLabel'
import SectionTitle from '../ui/SectionTitle'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusStories({ area, mobile }: Props) {
  const content = getFocusAreaContent(area)

  return (
    <AnimatedSection delay={200}>
      <section style={creamSectionStyle(mobile ?? false, { marginBottom: mobile ? 32 : 48 })}>
        <div style={{ marginBottom: mobile ? 16 : 24 }}>
          <SectionLabel mobile center>Success Stories</SectionLabel>
        </div>
        <div style={{ marginBottom: mobile ? 28 : 40 }}>
          <SectionTitle mobile={mobile} maxWidth={mobile ? '300px' : '560px'}>
            Lives Transformed
          </SectionTitle>
        </div>
        <div className="focus-stories-grid">
          {content.stories.map((story) => (
            <blockquote key={story.author} className="focus-story-card">
              <img src={ASSETS.quote} alt="" width={32} height={32} className="focus-story-quote-icon" />
              <p className="focus-story-text">&ldquo;{story.quote}&rdquo;</p>
              <footer className="focus-story-author">— {story.author}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </AnimatedSection>
  )
}
