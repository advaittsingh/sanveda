import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AdminLayoutProvider } from '../../../context/AdminLayoutContext'
import { C } from '../../../constants/brand'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import NotificationDrawer from './NotificationDrawer'
import '../adminLayout.css'

interface Props {
  children: ReactNode
}

export default function AdminLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <AdminLayoutProvider>
      <div className="flex h-screen overflow-hidden font-[family-name:var(--font-display)]" style={{ backgroundColor: C.cream }}>
        <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminHeader />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 xl:p-8"
          >
            {children}
          </motion.main>
        </div>

        <NotificationDrawer />
      </div>
    </AdminLayoutProvider>
  )
}
