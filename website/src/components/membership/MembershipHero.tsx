import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { ASSETS } from '../../constants/assets'
import {
  MEMBERSHIP_HERO_IMAGES,
  MEMBERSHIP_PAGE,
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
        </AnimatedSection>

        <AnimatedSection delay={120} className="membership-hero-visual">
          <div className="membership-hero-collage" data-mobile={mobile}>
            {MEMBERSHIP_HERO_IMAGES.map((src, index) => (
              <div key={src} className={`membership-hero-photo membership-hero-photo-${index + 1}`}>
                <img
                  src={src}
                  alt="Sanveda community and humanitarian work"
                  loading="lazy"
                  onError={(event) => {
                    const img = event.currentTarget
                    if (img.dataset.fallbackApplied === '1') return
                    img.dataset.fallbackApplied = '1'
                    img.src = ASSETS.fallBackCard
                  }}
                />
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
