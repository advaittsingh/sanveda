import {
  Award,
  Briefcase,
  Clock,
  FileText,
  Heart,
  Network,
  PenLine,
  Users,
  type LucideIcon,
} from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { INTERNSHIP_BENEFITS } from '../../constants/internshipContent'

const BENEFIT_ICONS: Record<string, LucideIcon> = {
  certificate: Award,
  recommendation: FileText,
  experience: Briefcase,
  mentorship: Users,
  networking: Network,
  portfolio: PenLine,
  flexible: Clock,
  impact: Heart,
}

export default function InternshipBenefits() {
  return (
    <section className="internship-section internship-benefits">
      <AnimatedSection>
        <p className="internship-eyebrow">What You&apos;ll Get</p>
        <h2 className="internship-section-title">Internship Benefits</h2>
        <p className="internship-section-desc">
          More than a certificate — gain skills, connections, and experience that accelerate your career
          in the social sector.
        </p>
      </AnimatedSection>

      <div className="internship-benefits-grid">
        {INTERNSHIP_BENEFITS.map((benefit, index) => {
          const Icon = BENEFIT_ICONS[benefit.icon] ?? Award
          return (
            <AnimatedSection key={benefit.text} delay={index * 50} className="internship-benefit-card">
              <div className="internship-benefit-icon">
                <Icon size={20} />
              </div>
              <span>{benefit.text}</span>
            </AnimatedSection>
          )
        })}
      </div>
    </section>
  )
}
