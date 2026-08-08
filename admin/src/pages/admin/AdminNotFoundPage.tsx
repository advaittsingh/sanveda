import { Link } from 'react-router-dom'
import AdminShell from '../../components/admin/AdminShell'
import AdminCard from '../../components/admin/ui/AdminCard'
import { adminBtnPrimary } from '../../components/admin/ui/adminStyles'

export default function AdminNotFoundPage() {
  return (
    <AdminShell title="Page not found" subtitle="This admin URL does not match a module">
      <AdminCard className="mx-auto max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#0E4FA8]">404</p>
        <h1 className="mt-2 text-xl font-bold text-[#0B2C6B]">Admin page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The address may be outdated or mistyped. Membership management lives at{' '}
          <Link to="/admin/memberships" className="font-semibold text-[#0E4FA8] underline-offset-2 hover:underline">
            /admin/memberships
          </Link>
          .
        </p>
        <Link to="/admin" className={`${adminBtnPrimary} mt-6 inline-flex`}>
          Back to Dashboard
        </Link>
      </AdminCard>
    </AdminShell>
  )
}
