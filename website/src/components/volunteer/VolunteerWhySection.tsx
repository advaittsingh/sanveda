import { Award, Calendar, Heart, TrendingUp, Users } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { VOLUNTEER_WHY_CARDS } from '../../constants/volunteerContent'

const ICONS = {
  heart: Heart,
  growth: TrendingUp,
  people: Users,
  award: Award,
  calendar: Calendar,
  community: Users,
} as const

export default function VolunteerWhySection() {
  return (
    <section className="volunteer-section volunteer-why">
      <AnimatedSection>
        <p className="volunteer-eyebrow">Why Join Us</p>
        <h2 className="volunteer-section-title">Why Volunteer With Sanveda?</h2>
        <p className="volunteer-section-desc">
          Be part of a purpose-driven organization creating measurable humanitarian impact across India and beyond.
        </p>
      </AnimatedSection>

      <div className="volunteer-why-grid">
        {VOLUNTEER_WHY_CARDS.map((card, index) => {
          const Icon = ICONS[card.icon]
          return (
            <AnimatedSection key={card.title} delay={index * 60} className="volunteer-why-card">
              <div className="volunteer-why-icon">
                <Icon size={22} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </AnimatedSection>
          )
        })}
      </div>
    </section>
  )
}
