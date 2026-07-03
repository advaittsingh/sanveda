import { Check } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { INTERNSHIP_ELIGIBILITY } from '../../constants/internshipContent'

export default function InternshipEligibility() {
  return (
    <section className="internship-section internship-eligibility">
      <div className="internship-eligibility-panel">
        <AnimatedSection>
          <p className="internship-eyebrow internship-eyebrow-light">Eligibility</p>
          <h2 className="internship-section-title internship-section-title-light">Who Can Apply?</h2>
          <p className="internship-eligibility-desc">
            We welcome passionate individuals from diverse backgrounds who want to contribute to
            humanitarian work while building their careers.
          </p>
        </AnimatedSection>

        <ul className="internship-eligibility-list">
          {INTERNSHIP_ELIGIBILITY.map((item, index) => (
            <AnimatedSection key={item} delay={index * 40} className="internship-eligibility-item">
              <Check size={18} strokeWidth={2.5} />
              <span>{item}</span>
            </AnimatedSection>
          ))}
        </ul>
      </div>
    </section>
  )
}
