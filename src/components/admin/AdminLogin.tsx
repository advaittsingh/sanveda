import { useState } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

interface Props {
  title: string
  subtitle: string
}

export default function AdminLogin({ title, subtitle }: Props) {
  const { error, mode, loginWithPassword, loginWithSupabase } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'supabase') {
        await loginWithSupabase(email, password)
      } else {
        loginWithPassword(password)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="volunteer-admin-login">
      <form onSubmit={handleSubmit} className="volunteer-admin-login-card">
        <h1>{title}</h1>
        <p>{subtitle}</p>

        {mode === 'supabase' && (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            required
          />
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        {error ? <em>{error}</em> : null}

        {!isSupabaseConfigured && (
          <small style={{ color: '#4A4A49', fontSize: 12 }}>
            Using local admin password. Configure Supabase for production admin auth.
          </small>
        )}

        <button type="submit" className="volunteer-btn volunteer-btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
