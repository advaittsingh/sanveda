import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import VolunteerApplicationForm from '../components/volunteer/VolunteerApplicationForm'

export default function VolunteerApplyPage() {
  return (
    <div className="volunteer-page volunteer-apply-page">
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Volunteer', path: '/volunteer' },
          { label: 'Apply', path: null },
        ]}
      />

      <header className="volunteer-apply-header">
        <h1>Volunteer Application</h1>
        <p>Complete the form below to join Sanveda&apos;s humanitarian volunteer network.</p>
      </header>

      <div className="volunteer-apply-shell">
        <VolunteerApplicationForm />
      </div>
    </div>
  )
}
