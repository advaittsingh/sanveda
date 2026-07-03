import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import SubPageBanner from '../components/ui/SubPageBanner'
import { STATUS_LABELS } from '../constants/volunteerContent'
import { findApplicationByEmailAndId } from '../lib/volunteerStore'
import type { VolunteerApplication } from '../types/volunteer'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function VolunteerStatusPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [applicationId, setApplicationId] = useState(params.get('id') ?? '')
  const [result, setResult] = useState<VolunteerApplication | null | 'not-found'>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const found = await findApplicationByEmailAndId(email, applicationId)
      setResult(found ?? 'not-found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="volunteer-page volunteer-status-page">
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Volunteer', path: '/volunteer' },
          { label: 'Status', path: null },
        ]}
      />

      <div className="page-banner-wrap" data-mobile={mobile}>
        <SubPageBanner title="Track Your Application" subtitle="Enter your email and application ID to check your volunteer status." />
      </div>

      <div className="volunteer-status-shell">
        <form className="volunteer-status-form" onSubmit={handleSearch}>
          <label className="volunteer-field">
            <span>Email *</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="volunteer-field">
            <span>Application ID *</span>
            <input value={applicationId} onChange={(e) => setApplicationId(e.target.value)} required placeholder="SVD-APP-2026-..." />
          </label>
          <button type="submit" className="volunteer-btn volunteer-btn-primary" disabled={loading}>
            {loading ? 'Checking…' : 'Check Status'}
          </button>
        </form>

        {result && result !== 'not-found' && (
          <div className="volunteer-status-result">
            <h2>{result.fullName}</h2>
            <p>
              <strong>Status:</strong> {STATUS_LABELS[result.status]}
            </p>
            {result.volunteerId ? (
              <p>
                <strong>Volunteer ID:</strong> {result.volunteerId}
              </p>
            ) : null}
            <p>
              <strong>Roles:</strong> {result.preferredRoles.join(', ')}
            </p>
            <p>
              <strong>Applied:</strong> {new Date(result.createdAt).toLocaleDateString()}
            </p>
            {result.interviewDate ? (
              <p>
                <strong>Interview:</strong> {new Date(result.interviewDate).toLocaleString()}
              </p>
            ) : null}
            {result.assignedTeam ? (
              <p>
                <strong>Assigned Team:</strong> {result.assignedTeam}
              </p>
            ) : null}
          </div>
        )}

        {result === 'not-found' && (
          <p className="volunteer-status-notfound">No application found. Please check your email and application ID.</p>
        )}
      </div>
    </div>
  )
}
