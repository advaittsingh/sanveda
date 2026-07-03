import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import SubPageBanner from '../components/ui/SubPageBanner'
import { findInternshipByEmailAndId, downloadInternshipCertificate, type Internship } from '../lib/internshipService'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function InternshipStatusPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [applicationId, setApplicationId] = useState(params.get('id') ?? '')
  const [result, setResult] = useState<Internship | null | 'not-found'>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const found = await findInternshipByEmailAndId(email, applicationId)
    setResult(found ?? 'not-found')
    setLoading(false)
  }

  return (
    <div className="volunteer-page volunteer-status-page">
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Internships', path: '/internship' }, { label: 'Status', path: null }]} />
      <div className="page-banner-wrap" data-mobile={mobile}>
        <SubPageBanner title="Internship Status" subtitle="Track your internship application." />
      </div>
      <div className="volunteer-status-shell">
        <form className="volunteer-status-form" onSubmit={handleSearch}>
          <label className="volunteer-field"><span>Email *</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="volunteer-field"><span>Application ID *</span><input value={applicationId} onChange={(e) => setApplicationId(e.target.value)} required placeholder="SVD-INT-..." /></label>
          <button type="submit" className="volunteer-btn volunteer-btn-primary" disabled={loading}>{loading ? 'Checking…' : 'Check Status'}</button>
        </form>
        {result && result !== 'not-found' && (
          <div className="volunteer-status-result">
            <h2>{result.fullName}</h2>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Department:</strong> {result.preferredDepartment ?? '—'}</p>
            {result.certificateNumber && (
              <button type="button" className="volunteer-btn volunteer-btn-secondary" onClick={() => downloadInternshipCertificate(result)}>Download Certificate</button>
            )}
          </div>
        )}
        {result === 'not-found' && <p className="volunteer-status-notfound">No application found.</p>}
      </div>
    </div>
  )
}
