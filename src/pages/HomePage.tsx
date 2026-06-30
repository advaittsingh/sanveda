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

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCampaigns />
      <KeyFocusAreas />
      <Categories />
      <DonateMonthly />
      <OurImpact />
      <Testimonials />
      <LiveDonation />
      <OurSponsors />
      <OurBlogs />
    </>
  )
}
