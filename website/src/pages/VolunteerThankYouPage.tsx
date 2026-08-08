import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { STATUS_LABELS } from '../constants/volunteerContent'
import type { VolunteerStatus } from '../types/volunteer'

type ThankYouState = {
  id?: string
  email?: string
  status?: VolunteerStatus
}

export default function VolunteerThankYouPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const state = (location.state as ThankYouState | null) ?? null
  const id = state?.id || params.get('id') || ''
  const email = state?.email || ''
  const status = state?.status

  return (
    <div className="volunteer-page volunteer-thankyou-page">
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Volunteer', path: '/volunteer' },
          { label: 'Thank You', path: null },
        ]}
      />

      <div className="volunteer-thankyou-card">
        <CheckCircle2 size={56} className="volunteer-thankyou-icon" />
        <h1>Application Submitted!</h1>
        <p>
          Thank you for applying to volunteer with Sanveda. Our team will review your application and contact you
          within 5–7 working days.
        </p>

        {id ? (
          <div className="volunteer-thankyou-meta">
            <p>
              <strong>Application ID:</strong> {id}
            </p>
            {status ? (
              <p>
                <strong>Status:</strong> {STATUS_LABELS[status]}
              </p>
            ) : null}
            {email ? (
              <p>
                <strong>Email:</strong> {email}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="volunteer-thankyou-actions">
          <Link
            to={id ? `/volunteer/status?id=${encodeURIComponent(id)}` : '/volunteer/status'}
            className="volunteer-btn volunteer-btn-primary"
          >
            Track Application Status
          </Link>
          <Link to="/volunteer" className="volunteer-btn volunteer-btn-secondary">
            Back to Volunteer Page
          </Link>
        </div>
      </div>
    </div>
  )
}
