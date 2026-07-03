import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ASSETS } from '../constants/assets'
import { BRAND, C } from '../constants/brand'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const { signIn, signUp, isConfigured } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!isConfigured) {
      setError('Account login requires Supabase. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate(redirect)
      } else {
        await signUp(email, password, fullName, phone)
        setMessage('Account created! Check your email to verify, then sign in.')
        setMode('login')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: C.grayBg }}>
      <div
        style={{
          flex: 1,
          display: 'none',
          background: BRAND.gradient,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
        className="login-panel-left"
      >
        <div style={{ textAlign: 'center', color: C.white, maxWidth: 400 }}>
          <img src={ASSETS.logo} alt={BRAND.name} style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 24 }} />
          <h2 style={{ fontWeight: 800, fontSize: 28, margin: '0 0 12px' }}>Welcome to {BRAND.shortName}</h2>
          <p style={{ opacity: 0.9, lineHeight: 1.6 }}>{BRAND.tagline}</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420, background: C.white, borderRadius: 20, padding: 36, border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(4,27,77,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src={ASSETS.logo} alt={BRAND.name} style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 12 }} />
            <h1 style={{ fontWeight: 800, fontSize: 24, color: C.primary, margin: 0 }}>
              {mode === 'login' ? 'Donor Login' : 'Create Donor Account'}
            </h1>
          </div>

          {!isSupabaseConfigured && (
            <p style={{ fontSize: 13, color: C.textMuted, background: C.cream, padding: 12, borderRadius: 10, marginBottom: 16 }}>
              Configure Supabase in <code>.env</code> to enable donor accounts and donation history.
            </p>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <input
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }}
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }}
            />
            {mode === 'register' && (
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }}
              />
            )}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }}
            />
            {error ? <p style={{ color: '#c0392b', margin: 0, fontSize: 13 }}>{error}</p> : null}
            {message ? <p style={{ color: C.secondary, margin: 0, fontSize: 13 }}>{message}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '14px', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Red Hat Display', marginTop: 8 }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Register'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: C.textMuted }}>
            {mode === 'login' ? (
              <>New here? <button type="button" onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: C.secondary, fontWeight: 700, cursor: 'pointer' }}>Create account</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: C.secondary, fontWeight: 700, cursor: 'pointer' }}>Login</button></>
            )}
          </p>

          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ color: C.textMuted, fontSize: 13, textDecoration: 'none' }}>← Back to home</Link>
          </p>
        </div>
      </div>

      <style>{`@media (min-width: 900px) { .login-panel-left { display: flex !important; } }`}</style>
    </div>
  )
}
