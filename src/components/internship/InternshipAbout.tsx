import AnimatedSection from '../ui/AnimatedSection'
import { INTERNSHIP_ABOUT } from '../../constants/internshipContent'

export default function InternshipAbout() {
  return (
    <section className="internship-section internship-about">
      <AnimatedSection>
        <p className="internship-eyebrow">Our Programme</p>
        <h2 className="internship-section-title">{INTERNSHIP_ABOUT.title}</h2>
        <p className="internship-section-desc">{INTERNSHIP_ABOUT.description}</p>
      </AnimatedSection>
    </section>
  )
}
