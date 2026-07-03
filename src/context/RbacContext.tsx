import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAdminAuth } from './AdminAuthContext'
import { canAccessRoute, filterNavByRole } from '../lib/rbacRoutes'
import { canAccess, getCurrentAdminRole, type AdminRole } from '../lib/rbacService'

interface RbacContextValue {
  role: AdminRole
  loading: boolean
  canAccessModule: (module: string) => boolean
  canAccessPath: (pathname: string) => boolean
  filterNav: <T extends { to: string }>(items: T[]) => T[]
}

const RbacContext = createContext<RbacContextValue | null>(null)

export function RbacProvider({ children }: { children: ReactNode }) {
  const { authed } = useAdminAuth()
  const [role, setRole] = useState<AdminRole>('admin')
  const [loading, setLoading] = useState(true)

  const refreshRole = useCallback(async () => {
    if (!authed) {
      setRole('admin')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setRole(await getCurrentAdminRole())
    } finally {
      setLoading(false)
    }
  }, [authed])

  useEffect(() => {
    refreshRole()
  }, [refreshRole])

  const value = useMemo((): RbacContextValue => ({
    role,
    loading,
    canAccessModule: (module) => canAccess(role, module),
    canAccessPath: (pathname) => canAccessRoute(role, pathname),
    filterNav: (items) => filterNavByRole(items, role),
  }), [role, loading])

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>
}

export function useRbac(): RbacContextValue {
  const ctx = useContext(RbacContext)
  if (!ctx) throw new Error('useRbac must be used within RbacProvider')
  return ctx
}

export function useModuleAccess(pathname: string): boolean {
  const { canAccessPath, loading } = useRbac()
  if (loading) return true
  return canAccessPath(pathname)
}
