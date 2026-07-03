import { useEffect, useState } from 'react'
import { Bell, Menu, Search, Wallet, ChevronDown, LogOut } from 'lucide-react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { useAdminLayout } from '../../../context/AdminLayoutContext'
import { getDashboardAnalytics } from '../../../lib/analyticsService'

export default function AdminHeader() {
  const { signOut } = useAdminAuth()
  const { toggleSidebar, toggleNotifications, searchQuery, setSearchQuery } = useAdminLayout()
  const [profileOpen, setProfileOpen] = useState(false)
  const [raised, setRaised] = useState(0)
  const [pending, setPending] = useState(0)
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    getDashboardAnalytics().then((stats) => {
      setRaised(stats.donations.total)
      setPending(
        stats.volunteers.pending +
        stats.memberships.pending +
        stats.enquiries.new,
      )
      setNotifications(stats.enquiries.new + stats.volunteers.pending)
    })
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E5E7EB] bg-white/90 px-4 backdrop-blur-md lg:px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        className="rounded-xl border border-[#E5E7EB] p-2 text-[#0B2C6B] hover:bg-[#F8FAFC] lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campaigns, donors, volunteers…"
          className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm font-semibold text-[#0B2C6B] md:flex">
          <Wallet size={16} className="text-[#D4A73F]" />
          <span>₹{raised.toLocaleString('en-IN')} Raised</span>
        </div>

        <button
          type="button"
          onClick={toggleNotifications}
          className="relative rounded-xl border border-[#E5E7EB] p-2.5 text-[#0B2C6B] hover:bg-[#F8FAFC]"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4A73F] px-1 text-[10px] font-bold text-white">
              {notifications > 99 ? '99+' : notifications}
            </span>
          )}
        </button>

        {pending > 0 && (
          <span className="hidden rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 lg:inline">
            {pending} pending
          </span>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-2 py-1.5 hover:bg-[#F8FAFC]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2C6B] text-sm font-bold text-white">
              A
            </span>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">Admin</span>
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
