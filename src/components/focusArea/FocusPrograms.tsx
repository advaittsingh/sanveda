import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent } from '../../constants/focusAreaContent'
import { FocusSection, FocusSectionHeader } from './FocusSection'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusPrograms({ area, mobile }: Props) {
  const content = getFocusAreaContent(area)

  return (
    <FocusSection mobile={mobile} variant="cream" delay={120}>
      <FocusSectionHeader label="What We Support" title="Programs & Services" mobile={mobile} />
      <div className="focus-programs-grid">
        {content.programs.map((program) => (
          <article key={program.title} className="focus-program-card">
            <span className="focus-program-icon" aria-hidden>
              {program.icon}
            </span>
            <h3 className="focus-program-title">{program.title}</h3>
            <p className="focus-program-desc">{program.description}</p>
          </article>
        ))}
      </div>
    </FocusSection>
  )
}
