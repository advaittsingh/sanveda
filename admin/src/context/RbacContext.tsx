import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAdminAuth } from './AdminAuthContext'
import { moduleForPath, isTasksAdminPath } from '../lib/rbacRoutes'
import {
  getCurrentAdminAccess,
  hasActionPermission,
  type AdminRole,
  type CurrentAdminAccess,
} from '../lib/rbacService'

interface RbacContextValue {
  role: AdminRole
  loading: boolean
  canAccessModule: (module: string) => boolean
  canPerform: (module: string, action: string) => boolean
  canAccessPath: (pathname: string) => boolean
  filterNav: <T extends { to: string }>(items: T[]) => T[]
}

const RbacContext = createContext<RbacContextValue | null>(null)

export function RbacProvider({ children }: { children: ReactNode }) {
  const { authed } = useAdminAuth()
  const [role, setRole] = useState<AdminRole>('admin')
  const [access, setAccess] = useState<CurrentAdminAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const hasLoadedAccess = useRef(false)

  const refreshRole = useCallback(async () => {
    if (!authed) {
      hasLoadedAccess.current = false
      setAccess(null)
      setRole('admin')
      setLoading(false)
      return
    }
    // Only block the UI on the first load. Re-flipping loading unmounts admin
    // pages (via AdminRouteGuard) and re-fires their data loaders.
    if (!hasLoadedAccess.current) setLoading(true)
    try {
      const persistedAccess = await getCurrentAdminAccess()
      setAccess(persistedAccess)
      setRole((persistedAccess?.role as AdminRole | undefined) ?? 'admin')
      hasLoadedAccess.current = true
    } catch {
      setAccess(null)
      setRole('admin')
      hasLoadedAccess.current = false
    } finally {
      setLoading(false)
    }
  }, [authed])

  useEffect(() => {
    void refreshRole()
  }, [refreshRole])

  const value = useMemo((): RbacContextValue => ({
    role,
    loading,
    canAccessModule: (module) => hasActionPermission(access, module, 'view'),
    canPerform: (module, action) => hasActionPermission(access, module, action),
    canAccessPath: (pathname) => {
      if (isTasksAdminPath(pathname)) {
        return (
          hasActionPermission(access, 'volunteers', 'view') ||
          hasActionPermission(access, 'internships', 'view')
        )
      }
      const module = moduleForPath(pathname)
      return module === 'dashboard' ? Boolean(access) : hasActionPermission(access, module, 'view')
    },
    filterNav: (items) => items.filter((item) => {
      const path = item.to.split('?')[0]
      if (isTasksAdminPath(path)) {
        return (
          hasActionPermission(access, 'volunteers', 'view') ||
          hasActionPermission(access, 'internships', 'view')
        )
      }
      const module = moduleForPath(path)
      return module === 'dashboard' ? Boolean(access) : hasActionPermission(access, module, 'view')
    }),
  }), [role, loading, access])

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>
}

export function useRbac(): RbacContextValue {
  const ctx = useContext(RbacContext)
  if (!ctx) throw new Error('useRbac must be used within RbacProvider')
  return ctx
}

export function useModuleAccess(pathname: string): boolean {
  const { canAccessPath, loading } = useRbac()
  if (loading) return false
  return canAccessPath(pathname)
}
