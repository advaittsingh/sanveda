import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import AdminCard from '../../components/admin/ui/AdminCard'
import { adminInputClass, adminLabelClass, adminBtnPrimary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function SettingsAdminPage() {
  const { authed } = useAdminAuth()

  if (!authed) {
    return <AdminLogin title="Settings" subtitle="Configure platform settings." />
  }

  return (
    <AdminShell title="Platform Settings" subtitle="Organization profile and system configuration">
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <h3 className="mb-4 font-semibold text-[#0B2C6B]">Organization</h3>
          <div className="space-y-4">
            <label className="block">
              <span className={adminLabelClass}>Foundation Name</span>
              <input className={adminInputClass} defaultValue="Sanveda Global Humanitarian Foundation" />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Support Email</span>
              <input className={adminInputClass} type="email" defaultValue="info@sanveda.org" />
            </label>
            <label className="block">
              <span className={adminLabelClass}>80G Registration</span>
              <input className={adminInputClass} placeholder="Registration number" />
            </label>
            <button type="button" className={adminBtnPrimary}>Save Organization</button>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="mb-4 font-semibold text-[#0B2C6B]">Integrations</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
              <span>Supabase</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {isSupabaseConfigured ? 'Connected' : 'Demo mode'}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
              <span>Razorpay Payments</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Configure in Vercel</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
              <span>Email (Resend)</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Edge functions</span>
            </li>
          </ul>
        </AdminCard>
      </div>
    </AdminShell>
  )
}
