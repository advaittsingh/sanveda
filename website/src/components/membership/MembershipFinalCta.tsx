import AnimatedSection from '../ui/AnimatedSection'
import MembershipCta from './MembershipCta'

export default function MembershipFinalCta() {
  return (
    <section className="membership-final-cta">
      <AnimatedSection>
        <h2 className="membership-final-cta-title">Ready to Make an Impact?</h2>
        <p className="membership-final-cta-desc">
          Join hundreds of members supporting Sanveda&apos;s humanitarian mission. Apply today and
          become part of a community that turns compassion into action.
        </p>
        <MembershipCta />
      </AnimatedSection>
    </section>
  )
}
