import { useState } from 'react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { C } from '../constants/brand'
import { isVerificationValid, verifyCode, type VerificationRecord } from '../lib/verificationService'
import { useMediaQuery } from '../hooks/useMediaQuery'

const TYPE_LABELS: Record<string, string> = {
  donation_receipt: '80G Donation Receipt',
  membership_certificate: 'Membership Certificate',
  volunteer_id: 'Volunteer ID',
  internship_certificate: 'Internship Certificate',
}

export default function VerifyPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const [code, setCode] = useState('')
  const [result, setResult] = useState<VerificationRecord | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const record = await verifyCode(code)
    if (!record) {
      setError('No document found with this verification code.')
      setLoading(false)
      return
    }

    const check = isVerificationValid(record)
    if (!check.valid) {
      setError(check.reason ?? 'Document is not valid.')
      setLoading(false)
      return
    }

    setResult(record)
    setLoading(false)
  }

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Verify Document', path: null }]} />

      <div style={{ width: '94.44%', maxWidth: 560, margin: '0 auto', padding: mobile ? '32px 16px' : '48px 0' }}>
        <h1 style={{ fontSize: mobile ? 24 : 32, fontWeight: 800, color: C.primary, margin: '0 0 12px' }}>
          Document Verification
        </h1>
        <p style={{ color: C.textMuted, marginBottom: 28, lineHeight: 1.6 }}>
          Enter the verification code printed on your receipt, certificate, or ID card to confirm authenticity.
        </p>

        <form onSubmit={handleVerify} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SVD-XXXXXXXX"
            required
            style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'monospace', letterSpacing: '0.05em' }}
          />
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 24px', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? '…' : 'Verify'}
          </button>
        </form>

        {error && <p style={{ color: '#c0392b', marginBottom: 16 }}>{error}</p>}

        {result && (
          <div style={{ border: `2px solid #155724`, borderRadius: 16, padding: 24, background: '#d4edda22' }}>
            <p style={{ color: '#155724', fontWeight: 800, fontSize: 18, margin: '0 0 16px' }}>✓ Verified Authentic</p>
            <p><strong>Document Type:</strong> {TYPE_LABELS[result.type] ?? result.type}</p>
            <p><strong>Holder:</strong> {result.holderName}</p>
            <p><strong>Reference:</strong> {result.referenceId}</p>
            <p><strong>Verification Code:</strong> {result.code}</p>
            {result.validUntil && <p><strong>Valid Until:</strong> {result.validUntil}</p>}
            <p style={{ fontSize: 12, color: C.textMuted, marginTop: 16, marginBottom: 0 }}>
              Issued by Sanveda Global Humanitarian Foundation
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
