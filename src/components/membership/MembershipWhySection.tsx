import { Calendar, FileText, Shield, TrendingUp, Users } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { MEMBERSHIP_WHY_ITEMS } from '../../constants/membershipContent'

const ICONS = {
  impact: TrendingUp,
  people: Users,
  calendar: Calendar,
  report: FileText,
  shield: Shield,
} as const

export default function MembershipWhySection() {
  return (
    <section className="membership-section membership-why">
      <AnimatedSection>
        <p className="membership-eyebrow">Why Join Sanveda?</p>
        <h2 className="membership-section-title">Why Become a Member?</h2>
        <p className="membership-section-desc">
          Membership is more than a contribution — it is a commitment to building a better tomorrow
          alongside a trusted humanitarian foundation.
        </p>
      </AnimatedSection>

      <div className="membership-why-grid">
        {MEMBERSHIP_WHY_ITEMS.map((item, index) => {
          const Icon = ICONS[item.icon]
          return (
            <AnimatedSection key={item.title} delay={index * 60} className="membership-why-card">
              <div className="membership-why-icon">
                <Icon size={22} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </AnimatedSection>
          )
        })}
      </div>
    </section>
  )
}
