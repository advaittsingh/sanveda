import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import InternshipAbout from '../components/internship/InternshipAbout'
import InternshipBenefits from '../components/internship/InternshipBenefits'
import InternshipCta from '../components/internship/InternshipCta'
import InternshipDomains from '../components/internship/InternshipDomains'
import InternshipDuration from '../components/internship/InternshipDuration'
import InternshipEligibility from '../components/internship/InternshipEligibility'
import InternshipFaq from '../components/internship/InternshipFaq'
import InternshipFinalCta from '../components/internship/InternshipFinalCta'
import InternshipHero from '../components/internship/InternshipHero'
import InternshipProcess from '../components/internship/InternshipProcess'
import InternshipStats from '../components/internship/InternshipStats'
import InternshipTestimonials from '../components/internship/InternshipTestimonials'
import AnimatedSection from '../components/ui/AnimatedSection'
import { INTERNSHIP_PAGE } from '../constants/internshipContent'

export default function InternshipPage() {
  return (
    <div className="internship-page">
      <AboutBreadcrumb
        items={[{ label: 'Home', path: '/' }, { label: INTERNSHIP_PAGE.breadcrumb, path: null }]}
      />
      <InternshipHero />
      <InternshipStats />
      <AnimatedSection className="internship-section internship-post-hero-cta">
        <InternshipCta />
      </AnimatedSection>
      <InternshipAbout />
      <InternshipDomains />
      <InternshipBenefits />
      <InternshipEligibility />
      <InternshipDuration />
      <InternshipProcess />
      <InternshipTestimonials />
      <InternshipFaq />
      <InternshipFinalCta />
    </div>
  )
}
