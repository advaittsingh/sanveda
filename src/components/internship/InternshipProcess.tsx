import AnimatedSection from '../ui/AnimatedSection'
import { INTERNSHIP_PROCESS_STEPS } from '../../constants/internshipContent'
import InternshipCta from './InternshipCta'

export default function InternshipProcess() {
  return (
    <section className="internship-section internship-process">
      <AnimatedSection>
        <p className="internship-eyebrow">How It Works</p>
        <h2 className="internship-section-title">Internship Journey</h2>
        <p className="internship-section-desc">
          A clear, transparent process from application to your first day as a Sanveda intern.
        </p>
      </AnimatedSection>

      <div className="internship-process-timeline">
        {INTERNSHIP_PROCESS_STEPS.map((step, index) => (
          <AnimatedSection key={step} delay={index * 70} className="internship-process-step">
            <div className="internship-process-dot">{index + 1}</div>
            <p>{step}</p>
            {index < INTERNSHIP_PROCESS_STEPS.length - 1 && (
              <span className="internship-process-arrow" aria-hidden>
                ↓
              </span>
            )}
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={200}>
        <InternshipCta centered={false} />
      </AnimatedSection>
    </section>
  )
}
