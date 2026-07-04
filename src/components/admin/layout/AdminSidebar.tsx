import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X } from 'lucide-react'
import { ADMIN_NAV } from '../../../constants/adminNav'
import { useAdminLayout } from '../../../context/AdminLayoutContext'
import { useRbac } from '../../../context/RbacContext'
import { ASSETS } from '../../../constants/assets'
import { BRAND, C } from '../../../constants/brand'

interface Props {
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function AdminSidebar({ collapsed, onToggleCollapse }: Props) {
  const { pathname } = useLocation()
  const { sidebarOpen, setSidebarOpen } = useAdminLayout()
  const { filterNav } = useRbac()

  const isActive = (to: string) =>
    to === '/admin' ? pathname === '/admin' : pathname === to || pathname.startsWith(`${to}/`)

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <img src={ASSETS.logo} alt={BRAND.shortName} className="h-9 w-auto object-contain brightness-0 invert" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.secondaryLight }}>
                {BRAND.shortName}
              </p>
              <p className="text-sm font-bold text-white">Admin</p>
            </div>
          </div>
        )}
        {collapsed && (
          <img src={ASSETS.logo} alt={BRAND.shortName} className="mx-auto h-8 w-auto object-contain brightness-0 invert" />
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-2 text-white/70 hover:bg-white/10 lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={18} className={collapsed ? 'rotate-180' : ''} />
        </button>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map((group) => (
          <div key={group.title || 'root'} className="mb-4">
            {group.title && !collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">{group.title}</p>
            ) : null}
            <ul className="space-y-0.5">
              {filterNav(group.items).map((item) => {
                const active = isActive(item.to)
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-white/50">{BRAND.name}</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 transition-all duration-300 lg:block ${collapsed ? 'w-[72px]' : 'w-64'}`}
        style={{ backgroundColor: C.primary }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu overlay"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl lg:hidden"
              style={{ backgroundColor: C.primary }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
