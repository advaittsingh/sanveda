import AnimatedSection from '../ui/AnimatedSection'
import { INTERNSHIP_STATS } from '../../constants/internshipContent'

export default function InternshipStats() {
  return (
    <section className="internship-stats-band" aria-label="Internship programme statistics">
      <div className="internship-stats-inner">
        {INTERNSHIP_STATS.map((stat, index) => (
          <AnimatedSection key={stat.label} delay={index * 50} className="internship-stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
