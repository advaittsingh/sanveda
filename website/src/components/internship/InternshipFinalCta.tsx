import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function InternshipFinalCta() {
  return (
    <section className="internship-final-cta">
      <AnimatedSection>
        <h2 className="internship-final-cta-title">Ready to Create Impact?</h2>
        <p className="internship-final-cta-desc">
          Join hundreds of interns making a difference across healthcare, education, and community
          development.
        </p>
        <Link to="/internship/apply" className="internship-btn internship-btn-primary">
          Apply For Internship
          <ArrowRight size={18} />
        </Link>
      </AnimatedSection>
    </section>
  )
}
