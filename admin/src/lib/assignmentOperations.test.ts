import { beforeEach, describe, expect, it, vi } from 'vitest'

const listWorkflowRows = vi.fn()
const createWorkflowRow = vi.fn()
const updateWorkflowRow = vi.fn()
const tableSelect = vi.fn()

vi.mock('./domainWorkflowService', () => ({
  listWorkflowRows: (...args: unknown[]) => listWorkflowRows(...args),
  createWorkflowRow: (...args: unknown[]) => createWorkflowRow(...args),
  updateWorkflowRow: (...args: unknown[]) => updateWorkflowRow(...args),
}))

vi.mock('./dataApiClient', () => ({
  dataApi: {
    table: () => ({
      select: (...args: unknown[]) => tableSelect(...args),
    }),
  },
}))

import {
  ensureProjectTeamMember,
  getProjectTitleMap,
  hasActiveAssignment,
  mapUiAssignmentStatus,
  updateAssignmentStatus,
} from './assignmentOperations'

describe('mapUiAssignmentStatus', () => {
  it('maps database statuses to UI labels', () => {
    expect(mapUiAssignmentStatus('assigned')).toBe('upcoming')
    expect(mapUiAssignmentStatus('active')).toBe('active')
    expect(mapUiAssignmentStatus('completed')).toBe('completed')
    expect(mapUiAssignmentStatus('cancelled')).toBe('cancelled')
  })
})

describe('hasActiveAssignment', () => {
  it('detects duplicate active project links', () => {
    const rows = [
      { id: '1', project_id: 'p1', status: 'completed' },
      { id: '2', project_id: 'p1', status: 'assigned' },
    ]
    expect(hasActiveAssignment(rows, 'project_id', 'p1')).toBe(true)
    expect(hasActiveAssignment(rows, 'project_id', 'p2')).toBe(false)
  })
})

describe('ensureProjectTeamMember', () => {
  beforeEach(() => {
    listWorkflowRows.mockReset()
    createWorkflowRow.mockReset()
  })

  it('returns existing team row instead of inserting', async () => {
    listWorkflowRows.mockResolvedValue([
      { id: 'tm1', member_name: 'Ada Lovelace', role: 'Volunteer', project_id: 'p1' },
    ])
    const row = await ensureProjectTeamMember({
      projectId: 'p1',
      memberName: 'Ada Lovelace',
      role: 'Volunteer',
    })
    expect(row.id).toBe('tm1')
    expect(createWorkflowRow).not.toHaveBeenCalled()
  })

  it('creates project_team when missing', async () => {
    listWorkflowRows.mockResolvedValue([])
    createWorkflowRow.mockResolvedValue({ id: 'tm2', member_name: 'Grace', role: 'Intern' })
    const row = await ensureProjectTeamMember({
      projectId: 'p1',
      memberName: 'Grace',
      role: 'Intern',
    })
    expect(createWorkflowRow).toHaveBeenCalledWith(
      'project_team',
      expect.objectContaining({
        project_id: 'p1',
        member_name: 'Grace',
        role: 'Intern',
      }),
    )
    expect(row.id).toBe('tm2')
  })
})

describe('getProjectTitleMap', () => {
  beforeEach(() => {
    tableSelect.mockReset()
  })

  it('maps project ids to titles', async () => {
    tableSelect.mockReturnValue({
      in: vi.fn().mockResolvedValue({
        data: [
          { id: 'p1', title: 'Health Camp' },
          { id: 'p2', title: 'School Kit' },
        ],
        error: null,
      }),
    })
    const map = await getProjectTitleMap(['p1', 'p2', 'p1'])
    expect(map.get('p1')).toBe('Health Camp')
    expect(map.get('p2')).toBe('School Kit')
  })
})

describe('updateAssignmentStatus', () => {
  beforeEach(() => {
    updateWorkflowRow.mockReset()
  })

  it('sets ends_at when completing', async () => {
    updateWorkflowRow.mockResolvedValue({ id: 'a1', status: 'completed' })
    await updateAssignmentStatus('volunteer_assignments', 'a1', 'completed')
    expect(updateWorkflowRow).toHaveBeenCalledWith(
      'volunteer_assignments',
      'a1',
      expect.objectContaining({ status: 'completed', ends_at: expect.any(String) }),
    )
  })
})
