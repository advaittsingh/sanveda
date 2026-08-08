import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface AdminLayoutContextValue {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  toggleNotifications: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null)

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])
  const toggleNotifications = useCallback(() => setNotificationsOpen((v) => !v), [])

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      notificationsOpen,
      setNotificationsOpen,
      toggleNotifications,
      searchQuery,
      setSearchQuery,
    }),
    [sidebarOpen, notificationsOpen, searchQuery, toggleSidebar, toggleNotifications],
  )

  return <AdminLayoutContext.Provider value={value}>{children}</AdminLayoutContext.Provider>
}

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext)
  if (!ctx) throw new Error('useAdminLayout must be used within AdminLayoutProvider')
  return ctx
}
