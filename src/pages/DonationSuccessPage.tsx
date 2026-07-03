import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { C } from '../constants/brand'
import { downloadReceipt, getDonationById, type Donation } from '../lib/donationService'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function DonationSuccessPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const [params] = useSearchParams()
  const [donation, setDonation] = useState<Donation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.get('id')
    if (!id) {
      setLoading(false)
      return
    }
    getDonationById(id)
      .then((d) => setDonation(d ?? null))
      .finally(() => setLoading(false))
  }, [params])

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Donation Successful', path: null },
        ]}
      />

      <div style={{ width: '94.44%', maxWidth: 560, margin: '0 auto', padding: mobile ? '32px 16px' : '48px 0', textAlign: 'center' }}>
        {loading ? (
          <p style={{ color: C.textMuted }}>Loading…</p>
        ) : donation ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h1 style={{ fontSize: mobile ? 24 : 32, fontWeight: 800, color: C.primary, margin: '0 0 12px' }}>
              Thank You for Your Donation!
            </h1>
            <p style={{ color: C.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
              Your contribution of <strong>₹{donation.amount.toLocaleString('en-IN')}</strong> to{' '}
              <strong>{donation.campaignTitle}</strong> has been recorded.
            </p>

            {donation.receiptNumber && (
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>
                Receipt No: <strong>{donation.receiptNumber}</strong>
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 12, justifyContent: 'center' }}>
              {donation.status === 'completed' && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => downloadReceipt(donation)}
                  style={{ padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
                >
                  Download 80G Receipt
                </button>
              )}
              <Link
                to="/dashboard"
                className="btn-primary"
                style={{ padding: '12px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}
              >
                View Dashboard
              </Link>
            </div>
          </>
        ) : (
          <p style={{ color: C.textMuted }}>Donation not found.</p>
        )}
      </div>
    </div>
  )
}
