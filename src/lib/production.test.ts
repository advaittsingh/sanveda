import { allowLocalStoragePersistence, isProductionDataMode } from './persistMeta'
import { describe, expect, it } from 'vitest'
import { canAccessRoute, moduleForPath } from './rbacRoutes'
import { canAccess } from './rbacService'
import { sanitizeHtml } from '../components/ui/HtmlContent'

describe('rbacRoutes', () => {
  it('maps admin paths to modules', () => {
    expect(moduleForPath('/admin/campaigns')).toBe('campaigns')
    expect(moduleForPath('/admin/tax-receipts')).toBe('finance')
    expect(moduleForPath('/admin/users')).toBe('users')
  })

  it('allows super_admin all finance routes', () => {
    expect(canAccessRoute('super_admin', '/admin/tax-receipts')).toBe(true)
    expect(canAccessRoute('super_admin', '/admin/settings')).toBe(true)
  })

  it('restricts finance role from campaigns', () => {
    expect(canAccessRoute('finance', '/admin/campaigns')).toBe(false)
    expect(canAccessRoute('finance', '/admin/donations')).toBe(true)
  })

  it('restricts volunteer role from finance', () => {
    expect(canAccessRoute('volunteer', '/admin/finance')).toBe(false)
    expect(canAccessRoute('volunteer', '/admin/volunteers')).toBe(true)
  })
})

describe('rbacService canAccess', () => {
  it('grants super_admin wildcard', () => {
    expect(canAccess('super_admin', 'anything')).toBe(true)
  })

  it('grants finance role donations module', () => {
    expect(canAccess('finance', 'donations')).toBe(true)
  })
})

describe('persistMeta production mode', () => {
  it('exports production helpers', () => {
    expect(typeof isProductionDataMode()).toBe('boolean')
    expect(typeof allowLocalStoragePersistence()).toBe('boolean')
  })
})

describe('HtmlContent sanitizeHtml', () => {
  it('strips script tags', () => {
    const dirty = '<p>Hello</p><script>alert(1)</script>'
    expect(sanitizeHtml(dirty)).not.toContain('script')
    expect(sanitizeHtml(dirty)).toContain('Hello')
  })

  it('preserves safe formatting', () => {
    const safe = '<p><strong>Sanveda</strong></p>'
    expect(sanitizeHtml(safe)).toContain('<strong>Sanveda</strong>')
  })
})
