import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { VOLUNTEER_HERO_IMAGES, VOLUNTEER_PAGE } from '../../constants/volunteerContent'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export default function VolunteerHero() {
  const mobile = useMediaQuery('(max-width: 767px)')

  return (
    <section className="volunteer-hero">
      <div className="volunteer-hero-grid">
        <AnimatedSection className="volunteer-hero-copy">
          <p className="volunteer-eyebrow">Join Our Mission</p>
          <h1 className="volunteer-hero-title">{VOLUNTEER_PAGE.title}</h1>
          <p className="volunteer-hero-subtitle">{VOLUNTEER_PAGE.subtitle}</p>
          <div className="volunteer-hero-actions">
            <Link to="/volunteer/apply" className="volunteer-btn volunteer-btn-primary">
              Apply Now
              <ArrowRight size={18} />
            </Link>
            <a href="#volunteer-roles" className="volunteer-btn volunteer-btn-secondary">
              Explore Roles
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={120} className="volunteer-hero-visual">
          <div className="volunteer-hero-collage" data-mobile={mobile}>
            {VOLUNTEER_HERO_IMAGES.map((src, index) => (
              <div key={src} className={`volunteer-hero-photo volunteer-hero-photo-${index + 1}`}>
                <img src={src} alt="Sanveda volunteers in action" loading="lazy" />
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
