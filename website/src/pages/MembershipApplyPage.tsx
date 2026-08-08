import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { useAuth } from '../context/AuthContext'
import { C } from '../constants/brand'
import { APPLICATION_EMAIL_DEGRADED_MESSAGE } from '../lib/emailService'
import { formatTierSelectLabel, getTierConfigs } from '../lib/membershipOperationsService'
import { submitMembershipApplication } from '../lib/membershipService'
import type { MembershipTier } from '../lib/membershipService'
import { useMediaQuery } from '../hooks/useMediaQuery'

const MEMBERSHIP_TIER_OPTIONS = getTierConfigs()

export default function MembershipApplyPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tierParam = searchParams.get('tier')
  const initialTier: MembershipTier =
    tierParam === 'patron' || tierParam === 'founding' || tierParam === 'standard'
      ? tierParam
      : 'standard'
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    // Intentionally blank — do not pre-fill from session (avoids leaking account email / append typos).
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    occupation: '',
    motivation: '',
    tier: initialTier,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { membership, emailSent } = await submitMembershipApplication({ ...form, userId: user?.id })
      navigate(`/membership/status?id=${membership.id}`, {
        state: emailSent
          ? { justSubmitted: true }
          : { justSubmitted: true, emailNote: APPLICATION_EMAIL_DEGRADED_MESSAGE },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed')
    } finally {
      setLoading(false)
    }
  }

  const placeholders: Partial<Record<keyof typeof form, string>> = {
    fullName: 'Enter your full name',
    email: 'you@example.com',
    phone: 'Enter your phone number',
    address: 'Street address',
    city: 'City',
    state: 'State',
    country: 'Country',
    occupation: 'Occupation (optional)',
  }

  const field = (label: string, key: keyof typeof form, type = 'text', required = true) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontWeight: 600, fontSize: 13, color: C.primary }}>{label}{required ? ' *' : ''}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required={required}
        placeholder={placeholders[key]}
        autoComplete={key === 'email' ? 'email' : key === 'fullName' ? 'name' : key === 'phone' ? 'tel' : undefined}
        style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }}
      />
    </label>
  )

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Membership', path: '/membership' }, { label: 'Apply', path: null }]} />

      <div style={{ width: '94.44%', maxWidth: 640, margin: '0 auto', padding: mobile ? '24px 16px' : '40px 0' }}>
        <h1 style={{ fontSize: mobile ? 24 : 32, fontWeight: 800, color: C.primary, marginBottom: 24 }}>Membership Application</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {field('Full Name', 'fullName')}
          {field('Email', 'email', 'email')}
          {field('Phone', 'phone', 'tel')}
          {field('Address', 'address')}
          {field('City', 'city')}
          {field('State', 'state')}
          {field('Country', 'country')}
          {field('Occupation', 'occupation', 'text', false)}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: C.primary }}>Membership Tier *</span>
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as MembershipTier })} style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }}>
              {MEMBERSHIP_TIER_OPTIONS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {formatTierSelectLabel(tier)}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: C.primary }}>Why do you want to join? *</span>
            <textarea required rows={4} value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }} />
          </label>

          {error ? <p style={{ color: '#c0392b', margin: 0 }}>{error}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: 14, border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}
