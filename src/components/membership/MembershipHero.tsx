import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import {
  MEMBERSHIP_HERO_IMAGES,
  MEMBERSHIP_PAGE,
  MEMBERSHIP_STATS,
} from '../../constants/membershipContent'
import { useMediaQuery } from '../../hooks/useMediaQuery'
export default function MembershipHero() {
  const mobile = useMediaQuery('(max-width: 767px)')

  return (
    <section className="membership-hero">
      <div className="membership-hero-grid">
        <AnimatedSection className="membership-hero-copy">
          <p className="membership-eyebrow">{MEMBERSHIP_PAGE.eyebrow}</p>
          <h1 className="membership-hero-title">{MEMBERSHIP_PAGE.title}</h1>
          <p className="membership-hero-subtitle">{MEMBERSHIP_PAGE.subtitle}</p>
          <div className="membership-hero-actions">
            <Link to="/membership/apply" className="membership-btn membership-btn-primary">
              Become a Member
              <ArrowRight size={18} />
            </Link>
            <a href="#membership-plans" className="membership-btn membership-btn-secondary">
              View Benefits
            </a>
          </div>
          <div className="membership-stats">
            {MEMBERSHIP_STATS.map((stat) => (
              <div key={stat.label} className="membership-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={120} className="membership-hero-visual">
          <div className="membership-hero-collage" data-mobile={mobile}>
            {MEMBERSHIP_HERO_IMAGES.map((src, index) => (
              <div key={src} className={`membership-hero-photo membership-hero-photo-${index + 1}`}>
                <img src={src} alt="Sanveda community and humanitarian work" loading="lazy" />
              </div>
            ))}
            <div className="membership-hero-badge">
              <Users size={20} />
              <span>500+ members strong</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
