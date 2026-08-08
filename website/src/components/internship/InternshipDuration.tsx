import AnimatedSection from '../ui/AnimatedSection'
import { INTERNSHIP_DURATIONS } from '../../constants/internshipContent'

export default function InternshipDuration() {
  return (
    <section className="internship-section internship-duration">
      <AnimatedSection>
        <p className="internship-eyebrow">Programme Options</p>
        <h2 className="internship-section-title">Internship Duration</h2>
        <p className="internship-section-desc">
          Choose a programme length that fits your academic calendar, career goals, or availability.
        </p>
      </AnimatedSection>

      <div className="internship-duration-grid">
        {INTERNSHIP_DURATIONS.map((item, index) => (
          <AnimatedSection key={item.program} delay={index * 60} className="internship-duration-card">
            <h3>{item.program}</h3>
            <p>{item.duration}</p>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
