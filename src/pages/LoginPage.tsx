import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ASSETS } from '../constants/assets'
import { BRAND, C } from '../constants/brand'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

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
              {mode === 'login' ? 'Login / Signup' : 'Create Account'}
            </h1>
          </div>

          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <input placeholder="Full name" required style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }} />
            )}
            <input type="email" placeholder="Email address" required style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }} />
            <input type="tel" placeholder="Phone number" style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }} />
            <input type="password" placeholder="Password" required style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }} />
            <button type="submit" className="btn-primary" style={{ padding: '14px', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Red Hat Display', marginTop: 8 }}>
              {mode === 'login' ? 'Continue' : 'Register'}
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
