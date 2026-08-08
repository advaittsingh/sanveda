import type { AdminRole } from './rbacService'
import { canAccess } from './rbacService'

/** Maps admin route prefixes to RBAC module keys. */
export const ROUTE_MODULE_MAP: Record<string, string> = {
  '/admin': 'dashboard',
  '/admin/campaigns': 'campaigns',
  '/admin/donations': 'donations',
  '/admin/monthly-giving': 'donations',
  '/admin/transactions': 'donations',
  '/admin/donors': 'donations',
  '/admin/volunteers': 'volunteers',
  '/admin/memberships': 'memberships',
  '/admin/members': 'memberships',
  '/admin/beneficiaries': 'beneficiaries',
  '/admin/internships': 'internships',
  '/admin/projects': 'projects',
  '/admin/events': 'events',
  '/admin/gallery': 'gallery',
  '/admin/documents': 'documents',
  '/admin/enquiries': 'enquiries',
  '/admin/focus-areas': 'focus_areas',
  '/admin/finance': 'finance',
  '/admin/income': 'finance',
  '/admin/expenses': 'finance',
  '/admin/reports': 'finance',
  '/admin/tax-receipts': 'finance',
  '/admin/blogs': 'blogs',
  '/admin/cms': 'content',
  '/admin/testimonials': 'content',
  '/admin/users': 'users',
  '/admin/roles': 'users',
  '/admin/audit': 'audit',
  '/admin/settings': 'settings',
}

export function moduleForPath(pathname: string): string {
  const sorted = Object.keys(ROUTE_MODULE_MAP).sort((a, b) => b.length - a.length)
  for (const route of sorted) {
    if (route === '/admin' ? pathname === '/admin' : pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith(`${route}?`)) {
      return ROUTE_MODULE_MAP[route]
    }
  }
  return 'dashboard'
}

/** Paths that require view on either volunteers or internships. */
export function isTasksAdminPath(pathname: string): boolean {
  const path = pathname.split('?')[0]
  return path === '/admin/tasks' || path.startsWith('/admin/tasks/')
}

export function canAccessRoute(role: AdminRole, pathname: string): boolean {
  if (isTasksAdminPath(pathname)) {
    return canAccess(role, 'volunteers') || canAccess(role, 'internships')
  }
  const mod = moduleForPath(pathname)
  if (mod === 'dashboard') return true
  if (mod === 'settings' || mod === 'users') return role === 'super_admin' || role === 'admin'
  return canAccess(role, mod)
}

export function filterNavByRole<T extends { to: string }>(items: T[], role: AdminRole): T[] {
  return items.filter((item) => {
    const path = item.to.split('?')[0]
    return canAccessRoute(role, path)
  })
}
