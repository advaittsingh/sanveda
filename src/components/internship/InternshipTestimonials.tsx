import { ASSETS } from '../../constants/assets'
import AnimatedSection from '../ui/AnimatedSection'
import { INTERNSHIP_TESTIMONIALS } from '../../constants/internshipContent'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export default function InternshipTestimonials() {
  const mobile = useMediaQuery('(max-width: 767px)')

  return (
    <section className="internship-section internship-testimonials">
      <AnimatedSection>
        <p className="internship-eyebrow">Intern Stories</p>
        <h2 className="internship-section-title">What Our Interns Say</h2>
      </AnimatedSection>

      <div className="internship-testimonials-grid" data-mobile={mobile}>
        {INTERNSHIP_TESTIMONIALS.map((item, index) => (
          <AnimatedSection key={item.id} delay={index * 80} className="internship-testimonial-card">
            <img src={ASSETS.quote} alt="" width={32} className="internship-testimonial-quote" />
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
