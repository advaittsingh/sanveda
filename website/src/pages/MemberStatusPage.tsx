import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import SubPageBanner from '../components/ui/SubPageBanner'
import {
  downloadMembershipCertificate,
  findMembershipByEmailAndId,
  type Membership,
} from '../lib/membershipService'
import { useMediaQuery } from '../hooks/useMediaQuery'

type StatusLocationState = {
  justSubmitted?: boolean
  emailNote?: string
}

export default function MemberStatusPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const [params] = useSearchParams()
  const location = useLocation()
  const submitState = (location.state as StatusLocationState | null) ?? null
  const [email, setEmail] = useState('')
  const [applicationId, setApplicationId] = useState(params.get('id') ?? '')
  const [result, setResult] = useState<Membership | null | 'not-found'>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const found = await findMembershipByEmailAndId(email, applicationId)
      setResult(found ?? 'not-found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="volunteer-page volunteer-status-page">
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Membership', path: '/membership' }, { label: 'Status', path: null }]} />

      <div className="page-banner-wrap" data-mobile={mobile}>
        <SubPageBanner title="Membership Status" subtitle="Enter your email and application ID to check your membership status." />
      </div>

      <div className="volunteer-status-shell">
        {submitState?.justSubmitted ? (
          <p className="volunteer-status-submitted" role="status">
            {submitState.emailNote
              ? submitState.emailNote
              : 'Your application was saved successfully. Use your email and application ID below to track status.'}
          </p>
        ) : null}
        <form className="volunteer-status-form" onSubmit={handleSearch}>
          <label className="volunteer-field"><span>Email *</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="volunteer-field"><span>Application ID *</span><input value={applicationId} onChange={(e) => setApplicationId(e.target.value)} required /></label>
          <button type="submit" className="volunteer-btn volunteer-btn-primary" disabled={loading}>
            {loading ? 'Checking…' : 'Check Status'}
          </button>
        </form>

        {result && result !== 'not-found' && (
          <div className="volunteer-status-result">
            <h2>{result.fullName}</h2>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Tier:</strong> {result.tier}</p>
            {result.memberId ? <p><strong>Member ID:</strong> {result.memberId}</p> : null}
            {result.renewalDate ? <p><strong>Renewal Date:</strong> {result.renewalDate}</p> : null}
            {(result.status === 'active' || result.status === 'approved') && result.memberId && (
              <button type="button" className="volunteer-btn volunteer-btn-secondary" onClick={() => void downloadMembershipCertificate(result)}>
                Download Certificate
              </button>
            )}
          </div>
        )}

        {result === 'not-found' && <p className="volunteer-status-notfound">No application found.</p>}
      </div>
    </div>
  )
}
