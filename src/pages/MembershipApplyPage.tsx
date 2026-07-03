import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { useAuth } from '../context/AuthContext'
import { C } from '../constants/brand'
import { submitMembershipApplication } from '../lib/membershipService'
import type { MembershipTier } from '../lib/membershipService'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function MembershipApplyPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    occupation: '',
    motivation: '',
    tier: 'standard' as MembershipTier,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const app = await submitMembershipApplication({ ...form, userId: user?.id })
      navigate(`/membership/status?id=${app.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', required = true) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontWeight: 600, fontSize: 13, color: C.primary }}>{label}{required ? ' *' : ''}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required={required}
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
              <option value="standard">Standard Member</option>
              <option value="patron">Patron Member</option>
              <option value="founding">Founding Member</option>
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
