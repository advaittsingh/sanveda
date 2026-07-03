import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { useAuth } from '../context/AuthContext'
import { C } from '../constants/brand'
import { downloadReceipt, getDonationsByUser, type Donation } from '../lib/donationService'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function DonorDashboardPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const navigate = useNavigate()
  const { user, loading: authLoading, isConfigured } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/login?redirect=/dashboard')
      return
    }

    getDonationsByUser(user.id)
      .then(setDonations)
      .finally(() => setLoading(false))
  }, [user, authLoading, navigate])

  if (authLoading || loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: C.textMuted }}>
        Loading your dashboard…
      </div>
    )
  }

  const total = donations.filter((d) => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0)

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'My Dashboard', path: null }]} />

      <div style={{ width: '94.44%', maxWidth: 900, margin: '0 auto', padding: mobile ? '24px 16px' : '40px 0' }}>
        <h1 style={{ fontSize: mobile ? 24 : 32, fontWeight: 800, color: C.primary, margin: '0 0 8px' }}>
          Donor Dashboard
        </h1>
        <p style={{ color: C.textMuted, margin: '0 0 32px' }}>{user?.email}</p>

        {!isConfigured && (
          <p style={{ background: C.cream, padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 24 }}>
            Demo mode: donations are stored in your browser. Connect Supabase for persistent records.
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, color: C.textMuted }}>Total Donated</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.primary }}>₹{total.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, color: C.textMuted }}>Donations</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.primary }}>{donations.length}</div>
          </div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, color: C.textMuted }}>Receipts</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.primary }}>
              {donations.filter((d) => d.receiptNumber).length}
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.primary, marginBottom: 16 }}>Donation History</h2>

        {!donations.length ? (
          <div style={{ textAlign: 'center', padding: 40, border: `1px dashed ${C.border}`, borderRadius: 12 }}>
            <p style={{ color: C.textMuted, marginBottom: 16 }}>You haven&apos;t made any donations yet.</p>
            <Link to="/campaigns" className="btn-primary" style={{ padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
              Explore Campaigns
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {donations.map((d) => (
              <div
                key={d.id}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: mobile ? 16 : 20,
                  display: 'flex',
                  flexDirection: mobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: mobile ? 'flex-start' : 'center',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: C.primary }}>{d.campaignTitle}</div>
                  <div style={{ fontSize: 13, color: C.textMuted }}>
                    {new Date(d.createdAt).toLocaleDateString('en-IN')} · {d.status}
                    {d.receiptNumber ? ` · ${d.receiptNumber}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontWeight: 800, color: C.secondary }}>₹{d.amount.toLocaleString('en-IN')}</span>
                  {d.status === 'completed' && d.receiptNumber && (
                    <button
                      type="button"
                      onClick={() => downloadReceipt(d)}
                      style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    >
                      Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
