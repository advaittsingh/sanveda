import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { getVolunteerApplication } from '../lib/volunteerStore'
import { STATUS_LABELS } from '../constants/volunteerContent'
import type { VolunteerApplication } from '../types/volunteer'

export default function VolunteerThankYouPage() {
  const [params] = useSearchParams()
  const id = params.get('id') ?? ''
  const [application, setApplication] = useState<VolunteerApplication | undefined>()

  useEffect(() => {
    if (!id) return
    getVolunteerApplication(id).then(setApplication)
  }, [id])

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

        {application ? (
          <div className="volunteer-thankyou-meta">
            <p>
              <strong>Application ID:</strong> {application.id}
            </p>
            <p>
              <strong>Status:</strong> {STATUS_LABELS[application.status]}
            </p>
            <p>
              <strong>Email:</strong> {application.email}
            </p>
          </div>
        ) : null}

        <div className="volunteer-thankyou-actions">
          <Link to={`/volunteer/status?id=${id}`} className="volunteer-btn volunteer-btn-primary">
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
