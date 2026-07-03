import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { useAuth } from '../context/AuthContext'
import { C } from '../constants/brand'
import {
  completeDonation,
  createDonation,
  isRazorpayConfigured,
  openRazorpayCheckout,
} from '../lib/donationService'
import { isServerPaymentAvailable } from '../lib/paymentService'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function DonateCheckoutPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user, profile } = useAuth()

  const campaignSlug = params.get('slug') ?? ''
  const campaignTitle = params.get('title') ?? 'Sanveda Campaign'
  const initialAmount = Number(params.get('amount') ?? 3000)

  const [amount, setAmount] = useState(Math.max(100, initialAmount))
  const [donorName, setDonorName] = useState(profile?.fullName ?? '')
  const [donorEmail, setDonorEmail] = useState(user?.email ?? '')
  const [donorPhone, setDonorPhone] = useState(profile?.phone ?? '')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile?.fullName) setDonorName(profile.fullName)
    if (user?.email) setDonorEmail(user.email)
    if (profile?.phone) setDonorPhone(profile.phone)
  }, [user, profile])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount < 100) {
      setError('Minimum donation is ₹100')
      return
    }
    if (!donorEmail.trim()) {
      setError('Email is required for receipt')
      return
    }

    setLoading(true)
    setError('')

    try {
      const donation = await createDonation({
        campaignSlug,
        campaignTitle,
        amount,
        donorName: isAnonymous ? undefined : donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorPhone: donorPhone.trim(),
        isAnonymous,
        userId: user?.id,
      })

      if (!isRazorpayConfigured()) {
        const completed = await completeDonation(donation.id, `demo_${Date.now()}`)
        navigate(`/donation/success?id=${completed?.id ?? donation.id}`)
        return
      }

      await openRazorpayCheckout(
        donation,
        async (paymentId) => {
          if (isServerPaymentAvailable()) {
            navigate(`/donation/success?id=${donation.id}`)
            return
          }
          const completed = await completeDonation(donation.id, paymentId)
          navigate(`/donation/success?id=${completed?.id ?? donation.id}`)
        },
        (message) => setError(message),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment could not be started')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Campaigns', path: '/campaigns' },
          { label: 'Checkout', path: null },
        ]}
      />

      <div style={{ width: '94.44%', maxWidth: 560, margin: '0 auto', padding: mobile ? '24px 16px' : '40px 0' }}>
        <h1 style={{ fontSize: mobile ? 22 : 28, fontWeight: 800, color: C.primary, margin: '0 0 8px' }}>
          Complete Your Donation
        </h1>
        <p style={{ color: C.textMuted, margin: '0 0 24px', lineHeight: 1.6 }}>{campaignTitle}</p>

        {!isRazorpayConfigured() && (
          <p style={{ background: C.cream, padding: 12, borderRadius: 10, fontSize: 13, color: C.textMuted, marginBottom: 20 }}>
            Demo mode: Razorpay is not configured. Donations will be recorded locally and marked complete for testing.
          </p>
        )}

        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 600, color: C.primary, fontSize: 13 }}>Amount (₹) *</span>
            <input
              type="number"
              min={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
            <span style={{ fontSize: 14 }}>Donate anonymously</span>
          </label>

          {!isAnonymous && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontWeight: 600, color: C.primary, fontSize: 13 }}>Full Name</span>
              <input
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }}
              />
            </label>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 600, color: C.primary, fontSize: 13 }}>Email *</span>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              required
              style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 600, color: C.primary, fontSize: 13 }}>Phone</span>
            <input
              type="tel"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }}
            />
          </label>

          {error ? <p style={{ color: '#c0392b', margin: 0, fontSize: 14 }}>{error}</p> : null}

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: 14, border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Processing…' : `Donate ₹${amount.toLocaleString('en-IN')}`}
          </button>
        </form>

        {!user && (
          <p style={{ marginTop: 20, fontSize: 14, color: C.textMuted, textAlign: 'center' }}>
            <Link to="/login" style={{ color: C.secondary, fontWeight: 600 }}>Sign in</Link> to track donations in your dashboard.
          </p>
        )}
      </div>
    </div>
  )
}
