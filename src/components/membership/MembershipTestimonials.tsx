import { ASSETS } from '../../constants/assets'
import AnimatedSection from '../ui/AnimatedSection'
import { MEMBERSHIP_TESTIMONIALS } from '../../constants/membershipContent'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export default function MembershipTestimonials() {
  const mobile = useMediaQuery('(max-width: 767px)')

  return (
    <section className="membership-section membership-testimonials">
      <AnimatedSection>
        <p className="membership-eyebrow">Member Stories</p>
        <h2 className="membership-section-title">What Our Members Say</h2>
      </AnimatedSection>

      <div className="membership-testimonials-grid" data-mobile={mobile}>
        {MEMBERSHIP_TESTIMONIALS.map((item, index) => (
          <AnimatedSection key={item.id} delay={index * 80} className="membership-testimonial-card">
            <img src={ASSETS.quote} alt="" width={32} className="membership-testimonial-quote" />
            <blockquote>{item.quote}</blockquote>
            <footer>
              <strong>{item.name}</strong>
              <span>{item.role}</span>
            </footer>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
