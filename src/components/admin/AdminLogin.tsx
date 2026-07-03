import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
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
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 font-[family-name:var(--font-display)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2C6B] text-white shadow-lg">
            <Shield size={28} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#5B9AE8]">Sanveda NGO OS</p>
          <h1 className="mt-2 text-2xl font-bold text-[#0B2C6B]">{title}</h1>
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
                className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10"
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
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10"
            />
          </label>

          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

          {!isSupabaseConfigured && (
            <p className="mb-4 text-xs text-slate-500">
              Demo mode: using local admin password. Configure Supabase for production auth.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#0B2C6B] py-3 text-sm font-semibold text-white transition hover:bg-[#0a2459] disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In to Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
