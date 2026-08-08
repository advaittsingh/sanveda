import { Link } from 'react-router-dom'
import { ArrowRight, Award, GraduationCap, MapPin, Users } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import {
  INTERNSHIP_HERO_HIGHLIGHTS,
  INTERNSHIP_HERO_IMAGES,
  INTERNSHIP_PAGE,
} from '../../constants/internshipContent'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const HIGHLIGHT_ICONS = {
  location: MapPin,
  graduate: GraduationCap,
  certificate: Award,
  mentorship: Users,
} as const

export default function InternshipHero() {
  const mobile = useMediaQuery('(max-width: 767px)')

  return (
    <section className="internship-hero">
      <div className="internship-hero-grid">
        <AnimatedSection className="internship-hero-copy">
          <p className="internship-eyebrow">{INTERNSHIP_PAGE.eyebrow}</p>
          <h1 className="internship-hero-title">{INTERNSHIP_PAGE.title}</h1>
          <p className="internship-hero-subtitle">{INTERNSHIP_PAGE.subtitle}</p>

          <ul className="internship-hero-highlights">
            {INTERNSHIP_HERO_HIGHLIGHTS.map((item) => {
              const Icon = HIGHLIGHT_ICONS[item.icon]
              return (
                <li key={item.text}>
                  <Icon size={18} strokeWidth={2.25} />
                  <span>{item.text}</span>
                </li>
              )
            })}
          </ul>

          <div className="internship-hero-actions">
            <Link to="/internship/apply" className="internship-btn internship-btn-primary">
              Apply Now
              <ArrowRight size={18} />
            </Link>
            <a href="#internship-domains" className="internship-btn internship-btn-secondary">
              View Open Roles
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={120} className="internship-hero-visual">
          <div className="internship-hero-collage" data-mobile={mobile}>
            {INTERNSHIP_HERO_IMAGES.map((src, index) => (
              <div key={src} className={`internship-hero-photo internship-hero-photo-${index + 1}`}>
                <img src={src} alt="Sanveda interns and humanitarian work" loading="lazy" />
              </div>
            ))}
            <div className="internship-hero-badge">
              <GraduationCap size={20} />
              <span>500+ interns trained</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
