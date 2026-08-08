import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useRbac } from '../../context/RbacContext'
import AdminLogin from './AdminLogin'

interface Props {
  children: React.ReactNode
}

export default function AdminRouteGuard({ children }: Props) {
  const { authed, loading: authLoading } = useAdminAuth()
  const { canAccessPath, loading: rbacLoading } = useRbac()
  const { pathname } = useLocation()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-slate-500">Checking admin session…</p>
      </div>
    )
  }

  if (!authed) {
    return (
      <AdminLogin
        title="Admin Access"
        subtitle="Sign in with your authorized admin account."
      />
    )
  }

  if (rbacLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-slate-500">Verifying access permissions…</p>
      </div>
    )
  }

  if (!canAccessPath(pathname)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <h1 className="text-xl font-bold text-[#0B2C6B]">Access Denied</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Your role does not have permission to access this module. Contact a Super Admin if you need access.
        </p>
        <a href="/admin" className="mt-6 rounded-xl bg-[#0B2C6B] px-4 py-2 text-sm font-semibold text-white">
          Back to Dashboard
        </a>
      </div>
    )
  }

  return <>{children}</>
}

/** Redirect legacy paths */
export function AdminIndexRedirect() {
  return <Navigate to="/admin" replace />
}
