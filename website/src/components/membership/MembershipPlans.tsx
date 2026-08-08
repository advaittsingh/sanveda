import { Link } from 'react-router-dom'
import {
  Award,
  Calendar,
  Check,
  FileText,
  Globe,
  Handshake,
  Mail,
  MessageCircle,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { MEMBERSHIP_TIERS } from '../../constants/membershipContent'
import MembershipCta from './MembershipCta'

const BENEFIT_ICONS: Record<string, LucideIcon> = {
  mail: Mail,
  calendar: Calendar,
  users: Users,
  message: MessageCircle,
  check: Check,
  file: FileText,
  globe: Globe,
  star: Star,
  award: Award,
  handshake: Handshake,
}

export default function MembershipPlans() {
  return (
    <section id="membership-plans" className="membership-section membership-plans">
      <AnimatedSection>
        <p className="membership-eyebrow">Membership Tiers</p>
        <h2 className="membership-section-title">Choose Your Membership</h2>
        <p className="membership-section-desc">
          Select the tier that fits your commitment level. Every member helps us expand humanitarian
          impact across India and beyond.
        </p>
      </AnimatedSection>

      <div className="membership-plans-grid">
        {MEMBERSHIP_TIERS.map((tier, index) => (
          <AnimatedSection
            key={tier.id}
            delay={index * 60}
            className="membership-plan-card"
            data-recommended={tier.recommended}
          >
            {tier.recommended && <span className="membership-plan-badge">Recommended</span>}
            <h3 className="membership-plan-name">{tier.name}</h3>
            <div className="membership-plan-price">
              <strong>{tier.price}</strong>
              <span>{tier.priceNote}</span>
            </div>
            <ul className="membership-plan-benefits">
              {tier.benefits.map((benefit) => {
                const Icon = BENEFIT_ICONS[benefit.icon] ?? Check
                return (
                  <li key={benefit.text}>
                    <Icon size={16} strokeWidth={2.5} />
                    <span>{benefit.text}</span>
                  </li>
                )
              })}
            </ul>
            <Link
              to={`/membership/apply?tier=${tier.id}`}
              className="membership-btn membership-btn-primary membership-plan-apply"
            >
              Apply Now
            </Link>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={180}>
        <MembershipCta className="membership-plans-cta" />
      </AnimatedSection>
    </section>
  )
}
