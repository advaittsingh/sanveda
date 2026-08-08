import { describe, expect, it } from 'vitest'
import { hasServiceAccess, type ServicePortalData } from './servicePortalService'

const empty: ServicePortalData = {
  volunteer: null,
  internship: null,
  volunteerAssignments: [],
  internshipAssignments: [],
  volunteerTasks: [],
  internTasks: [],
  projectTasks: [],
}

describe('hasServiceAccess', () => {
  it('is false when neither volunteer nor internship is linked', () => {
    expect(hasServiceAccess(empty)).toBe(false)
  })

  it('is true when a volunteer profile exists', () => {
    expect(
      hasServiceAccess({
        ...empty,
        volunteer: {
          id: 'SVD-APP-2026-ABC',
          status: 'active',
          fullName: 'Ada',
          email: 'ada@example.com',
          preferredRoles: [],
          createdAt: '',
          updatedAt: '',
        },
      }),
    ).toBe(true)
  })
})
