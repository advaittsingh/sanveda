import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'
import { ASSETS } from '../../constants/assets'
import { BRAND, C } from '../../constants/brand'
import { adminBtnPrimary } from './ui/adminStyles'

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
            className="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.secondaryLight }}>
            {BRAND.shortName} Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold" style={{ color: C.primary }}>{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          {mode === 'supabase' && (
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Admin email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:ring-2"
                style={{ ['--tw-ring-color' as string]: `${C.primary}20` }}
              />
            </label>
          )}

          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:ring-2"
            />
          </label>

          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

          {!isSupabaseConfigured && (
            <p className="mb-4 text-xs text-slate-500">
              Local dev mode: configure Supabase for production admin auth.
            </p>
          )}

          <button type="submit" disabled={submitting} className={`w-full py-3 ${adminBtnPrimary}`}>
            {submitting ? 'Signing in…' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">{BRAND.tagline}</p>
      </motion.div>
    </div>
  )
}
