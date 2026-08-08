import { Check } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { VOLUNTEER_BENEFITS } from '../../constants/volunteerContent'

export default function VolunteerBenefits() {
  return (
    <section className="volunteer-section volunteer-benefits">
      <div className="volunteer-benefits-panel">
        <AnimatedSection>
          <p className="volunteer-eyebrow volunteer-eyebrow-light">Benefits</p>
          <h2 className="volunteer-section-title volunteer-section-title-light">What You Gain</h2>
        </AnimatedSection>
        <ul className="volunteer-benefits-list">
          {VOLUNTEER_BENEFITS.map((benefit, index) => (
            <AnimatedSection key={benefit} delay={index * 40} className="volunteer-benefit-item">
              <Check size={18} />
              <span>{benefit}</span>
            </AnimatedSection>
          ))}
        </ul>
      </div>
    </section>
  )
}
