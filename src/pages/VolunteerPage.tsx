import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import VolunteerBenefits from '../components/volunteer/VolunteerBenefits'
import VolunteerCategories from '../components/volunteer/VolunteerCategories'
import VolunteerHero from '../components/volunteer/VolunteerHero'
import VolunteerProcess from '../components/volunteer/VolunteerProcess'
import VolunteerWhySection from '../components/volunteer/VolunteerWhySection'
import { VOLUNTEER_PAGE } from '../constants/volunteerContent'

export default function VolunteerPage() {
  return (
    <div className="volunteer-page">
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: VOLUNTEER_PAGE.breadcrumb, path: null }]} />
      <VolunteerHero />
      <VolunteerWhySection />
      <VolunteerCategories />
      <VolunteerBenefits />
      <VolunteerProcess />
    </div>
  )
}
