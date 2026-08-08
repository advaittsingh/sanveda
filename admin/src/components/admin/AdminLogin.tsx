import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { ASSETS } from '../../constants/assets'
import { BRAND, C } from '../../constants/brand'
import { adminBtnPrimary } from './ui/adminStyles'

interface Props {
  title: string
  subtitle: string
}

export default function AdminLogin({ title, subtitle }: Props) {
  const navigate = useNavigate()
  const { error, configured, login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await login(email, password)
      if (result === 'portal') navigate('/portal', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 font-[family-name:var(--font-display)]"
      style={{ backgroundColor: C.cream }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <img
            src={ASSETS.logo}
            alt={BRAND.shortName}
            className="mx-auto mb-4 h-20 w-20 rounded-full object-cover shadow-md"
          />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.secondaryLight }}>
            {BRAND.shortName} Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold" style={{ color: C.primary }}>{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Admin email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!configured}
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:ring-2"
              style={{ ['--tw-ring-color' as string]: `${C.primary}20` }}
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!configured}
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:ring-2"
            />
          </label>

          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

          {!configured && (
            <p className="mb-4 text-xs text-red-600">
              Admin sign-in is not configured on the server.
            </p>
          )}

          <button type="submit" disabled={submitting || !configured} className={`w-full py-3 ${adminBtnPrimary}`}>
            {submitting ? 'Signing in…' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Volunteer or intern?{' '}
          <Link to="/login?redirect=/portal" className="font-semibold text-[#0B2C6B] underline-offset-2 hover:underline">
            Open My Service Portal
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-400">{BRAND.tagline}</p>
      </motion.div>
    </div>
  )
}
