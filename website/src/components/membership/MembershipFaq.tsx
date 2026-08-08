import { Link } from 'react-router-dom'
import FaqAccordion from '../faq/FaqAccordion'
import AnimatedSection from '../ui/AnimatedSection'
import { MEMBERSHIP_FAQS } from '../../constants/membershipContent'

export default function MembershipFaq() {
  return (
    <section className="membership-section membership-faq">
      <AnimatedSection>
        <p className="membership-eyebrow">Common Questions</p>
        <h2 className="membership-section-title">Membership FAQ</h2>
        <p className="membership-section-desc">
          Everything you need to know before applying. Still have questions?{' '}
          <Link to="/contact">Contact our team</Link>.
        </p>
      </AnimatedSection>

      <AnimatedSection delay={80} className="membership-faq-accordion">
        <FaqAccordion items={[...MEMBERSHIP_FAQS]} />
      </AnimatedSection>
    </section>
  )
}
