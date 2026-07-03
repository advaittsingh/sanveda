import { Link } from 'react-router-dom'
import FaqAccordion from '../faq/FaqAccordion'
import AnimatedSection from '../ui/AnimatedSection'
import { INTERNSHIP_FAQS } from '../../constants/internshipContent'

export default function InternshipFaq() {
  return (
    <section className="internship-section internship-faq">
      <AnimatedSection>
        <p className="internship-eyebrow">Common Questions</p>
        <h2 className="internship-section-title">Internship FAQ</h2>
        <p className="internship-section-desc">
          Everything you need to know before applying. Still have questions?{' '}
          <Link to="/contact">Contact our team</Link>.
        </p>
      </AnimatedSection>

      <AnimatedSection delay={80} className="internship-faq-accordion">
        <FaqAccordion items={[...INTERNSHIP_FAQS]} />
      </AnimatedSection>
    </section>
  )
}
