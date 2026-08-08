import { Link } from 'react-router-dom'
import AnimatedSection from '../ui/AnimatedSection'
import { VOLUNTEER_PROCESS_STEPS } from '../../constants/volunteerContent'

export default function VolunteerProcess() {
  return (
    <section className="volunteer-section volunteer-process">
      <AnimatedSection>
        <p className="volunteer-eyebrow">How It Works</p>
        <h2 className="volunteer-section-title">Volunteer Application Process</h2>
      </AnimatedSection>

      <div className="volunteer-process-timeline">
        {VOLUNTEER_PROCESS_STEPS.map((step, index) => (
          <AnimatedSection key={step} delay={index * 70} className="volunteer-process-step">
            <div className="volunteer-process-dot">{index + 1}</div>
            <p>{step}</p>
            {index < VOLUNTEER_PROCESS_STEPS.length - 1 && (
              <span className="volunteer-process-arrow" aria-hidden>
                ↓
              </span>
            )}
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={200} className="volunteer-process-cta">
        <Link to="/volunteer/apply" className="volunteer-btn volunteer-btn-primary">
          Start Your Application
        </Link>
        <Link to="/volunteer/status" className="volunteer-btn volunteer-btn-secondary">
          Track Application Status
        </Link>
      </AnimatedSection>
    </section>
  )
}
