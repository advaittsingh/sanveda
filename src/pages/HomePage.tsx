import HeroSection from '../components/HeroSection'
import FeaturedCampaigns from '../components/FeaturedCampaigns'
import KeyFocusAreas from '../components/KeyFocusAreas'
import Categories from '../components/Categories'
import DonateMonthly from '../components/DonateMonthly'
import OurImpact from '../components/OurImpact'
import Testimonials from '../components/Testimonials'
import LiveDonation from '../components/LiveDonation'
import OurSponsors from '../components/OurSponsors'
import OurBlogs from '../components/OurBlogs'
import AnimatedSection from '../components/ui/AnimatedSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AnimatedSection delay={0}>
        <FeaturedCampaigns />
      </AnimatedSection>
      <AnimatedSection delay={80}>
        <KeyFocusAreas />
      </AnimatedSection>
      <AnimatedSection delay={120}>
        <Categories />
      </AnimatedSection>
      <AnimatedSection delay={160}>
        <DonateMonthly />
      </AnimatedSection>
      <AnimatedSection delay={200}>
        <OurImpact />
      </AnimatedSection>
      <AnimatedSection delay={240}>
        <Testimonials />
      </AnimatedSection>
      <AnimatedSection delay={280}>
        <LiveDonation />
      </AnimatedSection>
      <AnimatedSection delay={320}>
        <OurSponsors />
      </AnimatedSection>
      <AnimatedSection delay={360}>
        <OurBlogs />
      </AnimatedSection>
    </>
  )
}
