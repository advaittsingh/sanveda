import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import MembershipFaq from '../components/membership/MembershipFaq'
import MembershipFinalCta from '../components/membership/MembershipFinalCta'
import MembershipHero from '../components/membership/MembershipHero'
import MembershipPlans from '../components/membership/MembershipPlans'
import MembershipProcess from '../components/membership/MembershipProcess'
import MembershipTestimonials from '../components/membership/MembershipTestimonials'
import MembershipWhySection from '../components/membership/MembershipWhySection'
import MembershipCta from '../components/membership/MembershipCta'
import AnimatedSection from '../components/ui/AnimatedSection'
import { MEMBERSHIP_PAGE } from '../constants/membershipContent'

export default function MembershipPage() {
  return (
    <div className="membership-page">
      <AboutBreadcrumb
        items={[{ label: 'Home', path: '/' }, { label: MEMBERSHIP_PAGE.breadcrumb, path: null }]}
      />
      <MembershipHero />
      <AnimatedSection className="membership-section membership-post-hero-cta">
        <MembershipCta />
      </AnimatedSection>
      <MembershipPlans />
      <MembershipWhySection />
      <MembershipProcess />
      <MembershipTestimonials />
      <MembershipFaq />
      <MembershipFinalCta />
    </div>
  )
}
