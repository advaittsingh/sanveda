import AnimatedSection from '../ui/AnimatedSection'
import { MEMBERSHIP_PROCESS_STEPS } from '../../constants/membershipContent'

export default function MembershipProcess() {
  return (
    <section className="membership-section membership-process">
      <AnimatedSection>
        <p className="membership-eyebrow">How It Works</p>
        <h2 className="membership-section-title">Membership Application Process</h2>
        <p className="membership-section-desc">
          Our streamlined process makes it easy to join. Most applications are reviewed within a week.
        </p>
      </AnimatedSection>

      <div className="membership-process-timeline">
        {MEMBERSHIP_PROCESS_STEPS.map((step, index) => (
          <AnimatedSection key={step} delay={index * 70} className="membership-process-step">
            <div className="membership-process-dot">{index + 1}</div>
            <p>{step}</p>
            {index < MEMBERSHIP_PROCESS_STEPS.length - 1 && (
              <span className="membership-process-arrow" aria-hidden>
                ↓
              </span>
            )}
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
