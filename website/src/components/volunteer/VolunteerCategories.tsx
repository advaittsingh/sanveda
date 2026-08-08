import { Link } from 'react-router-dom'
import AnimatedSection from '../ui/AnimatedSection'
import { VOLUNTEER_CATEGORIES } from '../../constants/volunteerContent'

export default function VolunteerCategories() {
  return (
    <section id="volunteer-roles" className="volunteer-section volunteer-categories">
      <AnimatedSection>
        <p className="volunteer-eyebrow">Opportunities</p>
        <h2 className="volunteer-section-title">Volunteer Categories</h2>
        <p className="volunteer-section-desc">
          Explore roles that match your skills and passion. Select your preferred areas when you apply.
        </p>
      </AnimatedSection>

      <div className="volunteer-category-grid">
        {VOLUNTEER_CATEGORIES.map((category, index) => (
          <AnimatedSection key={category.title} delay={index * 50} className="volunteer-category-card">
            <span className="volunteer-category-emoji" aria-hidden>
              {category.emoji}
            </span>
            <h3>{category.title}</h3>
            <ul>
              {category.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link
              to={`/volunteer/apply?role=${category.role}`}
              className="volunteer-category-link"
            >
              Apply for this role
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
