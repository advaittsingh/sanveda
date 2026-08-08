import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Code,
  Heart,
  Settings,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { INTERNSHIP_DOMAINS } from '../../constants/internshipContent'

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  healthcare: Heart,
  education: BookOpen,
  marketing: TrendingUp,
  operations: Settings,
  fundraising: Briefcase,
  technology: Code,
}

export default function InternshipDomains() {
  return (
    <section id="internship-domains" className="internship-section internship-domains">
      <AnimatedSection>
        <p className="internship-eyebrow">Open Roles</p>
        <h2 className="internship-section-title">Available Internship Domains</h2>
        <p className="internship-section-desc">
          Choose a domain that matches your skills and interests. Each role offers structured learning,
          real projects, and mentor support.
        </p>
      </AnimatedSection>

      <div className="internship-domains-grid">
        {INTERNSHIP_DOMAINS.map((domain, index) => {
          const Icon = DOMAIN_ICONS[domain.icon] ?? Briefcase
          return (
            <AnimatedSection key={domain.id} delay={index * 60} className="internship-domain-card">
              <div className="internship-domain-icon">
                <Icon size={22} />
              </div>
              <h3>{domain.title}</h3>
              <div className="internship-domain-meta">
                <span>
                  <strong>Duration:</strong> {domain.duration}
                </span>
                <span>
                  <strong>Mode:</strong> {domain.mode}
                </span>
              </div>
              <Link
                to={`/internship/apply?department=${domain.id}`}
                className="internship-domain-link"
              >
                Apply for this role
                <ArrowRight size={16} />
              </Link>
            </AnimatedSection>
          )
        })}
      </div>
    </section>
  )
}
