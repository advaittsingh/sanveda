import { describe, expect, it } from 'vitest'
import {
  ACCESS_MODULE_CATALOG,
  buildEffectivePermissionMatrix,
  getUserModuleAccess,
  getUserPermissions,
  modulePermissionLabel,
} from './adminUserOperationsService'

describe('buildEffectivePermissionMatrix', () => {
  it('grants super_admin full access across the shared catalog', () => {
    const matrix = buildEffectivePermissionMatrix('super_admin')
    expect(matrix).toHaveLength(ACCESS_MODULE_CATALOG.length)
    expect(matrix.every((row) => row.view && row.create && row.edit && row.delete && row.approve && row.export)).toBe(true)
  })

  it('grants volunteer ops only its legacy modules', () => {
    const matrix = buildEffectivePermissionMatrix('volunteer')
    const byKey = Object.fromEntries(matrix.map((row) => [row.module, row]))
    expect(byKey.volunteers?.view).toBe(true)
    expect(byKey.volunteers?.export).toBe(true)
    expect(byKey.campaigns?.view).toBe(false)
    expect(byKey.settings?.view).toBe(false)
    expect(byKey.donations?.view).toBe(false)
  })

  it('makes super_admin more permissive than volunteer', () => {
    const superAdmin = buildEffectivePermissionMatrix('super_admin')
    const volunteer = buildEffectivePermissionMatrix('volunteer')
    const superGranted = superAdmin.filter((row) => row.view).length
    const volunteerGranted = volunteer.filter((row) => row.view).length
    expect(superGranted).toBeGreaterThan(volunteerGranted)
  })

  it('prefers persisted permission rows over legacy defaults', () => {
    const matrix = buildEffectivePermissionMatrix('volunteer', [
      { module: 'campaigns', action: 'view' },
      { module: 'campaigns', action: 'export' },
    ])
    const campaigns = matrix.find((row) => row.module === 'campaigns')
    const volunteers = matrix.find((row) => row.module === 'volunteers')
    expect(campaigns).toMatchObject({ view: true, export: true, create: false })
    expect(volunteers?.view).toBe(false)
  })
})

describe('getUserPermissions / Access tab helpers', () => {
  it('returns full-access labels for super_admin when dashboard map is empty', () => {
    const perms = getUserPermissions('super_admin', {})
    expect(perms.every((row) => row.view)).toBe(true)
    expect(getUserModuleAccess('super_admin', {})).toEqual(
      ACCESS_MODULE_CATALOG.map((module) => module.label),
    )
  })

  it('maps module keys to Access-tab labels', () => {
    expect(modulePermissionLabel('memberships')).toBe('Members')
    expect(modulePermissionLabel('content')).toBe('CMS')
  })
})
