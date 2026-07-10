import { useEffect, useState } from 'react'
import { Bell, Menu, ChevronDown, LogOut } from 'lucide-react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { useAdminLayout } from '../../../context/AdminLayoutContext'
import { getOperationsDashboard } from '../../../lib/operationsDashboardService'
import { formatIndianCompact, currentFinancialYear } from '../../../lib/formatIndian'
import { BRAND, C } from '../../../constants/brand'
import GlobalSearch from '../dashboard/GlobalSearch'
import QuickCreateMenu from '../dashboard/QuickCreateMenu'

export default function AdminHeader() {
  const { signOut } = useAdminAuth()
  const { toggleSidebar, toggleNotifications } = useAdminLayout()
  const [profileOpen, setProfileOpen] = useState(false)
  const [raised, setRaised] = useState(0)
  const [pending, setPending] = useState(0)
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    getOperationsDashboard().then((ops) => {
      setRaised(ops.financial.fundsRaised)
      setPending(ops.pendingTotal)
      setNotifications(ops.actions.length + ops.activity.length > 0 ? Math.min(ops.pendingTotal, 99) : 0)
    })
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center gap-3 overflow-hidden border-b border-[#E5E7EB] bg-white/90 px-4 backdrop-blur-md lg:px-6 xl:px-8">
      <button
        type="button"
        onClick={toggleSidebar}
        className="rounded-xl border border-[#E5E7EB] p-2 hover:bg-[#F5F7FA] lg:hidden"
        style={{ color: C.primary }}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="hidden rounded-xl border border-[#E5E7EB] bg-[#F5F7FA] px-3 py-2 text-xs font-semibold lg:inline" style={{ color: C.primary }}>
          FY {currentFinancialYear()}
        </span>

        <div className="hidden flex-col items-end sm:flex">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Raised</span>
          <span className="text-sm font-bold" style={{ color: C.primary }}>{formatIndianCompact(raised)}</span>
        </div>

        {pending > 0 && (
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Pending</span>
            <span className="text-sm font-bold text-amber-700">{pending}</span>
          </div>
        )}

        <QuickCreateMenu />

        <button
          type="button"
          onClick={toggleNotifications}
          className="relative rounded-xl border border-[#E5E7EB] p-2.5 hover:bg-[#F5F7FA]"
          style={{ color: C.primary }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0E4FA8] px-1 text-[10px] font-bold text-white">
              {notifications > 99 ? '99+' : notifications}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-2 py-1.5 hover:bg-[#F8FAFC]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: C.primary }}>
              {BRAND.shortName.charAt(0)}
            </span>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">{BRAND.shortName} Admin</span>
            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <>
              <button type="button" className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} aria-label="Close profile menu" />
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); signOut() }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
