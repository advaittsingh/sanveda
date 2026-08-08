import { beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadCsv } from './adminExport'
import {
  exportDonorsCsv,
  formatEngagementStatus,
  formatDonorType,
  type DonorProfile,
} from './donorOperationsService'

vi.mock('./adminExport', () => ({
  downloadCsv: vi.fn(),
}))

function donor(overrides: Partial<DonorProfile> = {}): DonorProfile {
  return {
    id: 'd1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 90000 00001',
    address: 'Delhi',
    pan: '—',
    aadhaar: '—',
    dateJoined: '2026-01-01T00:00:00.000Z',
    type: 'individual',
    givingLevel: 'regular',
    engagement: 'active',
    tags: ['VIP', 'MonthlyDonor'],
    lifetimeGiving: 10000,
    donationCount: 2,
    lastDonation: '2026-07-01T00:00:00.000Z',
    averageDonation: 5000,
    donationFrequencyDays: 30,
    retentionScore: 70,
    engagementScore: 'High',
    isMonthly: true,
    donations: [],
    timeline: [],
    followUpTasks: [],
    ...overrides,
  }
}

describe('BUG-023 donors CSV export', () => {
  beforeEach(() => {
    vi.mocked(downloadCsv).mockClear()
  })

  it('uses the same Type/Status/Tags presentation as the admin UI for nulls', () => {
    exportDonorsCsv([
      donor(),
      donor({
        id: 'd2',
        name: 'Ananya Iyer',
        email: 'ananya@example.com',
        type: null,
        engagement: null,
        tags: [],
      }),
    ])

    expect(downloadCsv).toHaveBeenCalledOnce()
    const [, headers, rows] = vi.mocked(downloadCsv).mock.calls[0]!
    expect(headers).toContain('Type')
    expect(headers).toContain('Status')
    expect(headers).toContain('Tags')

    expect(rows[0]).toEqual([
      'Priya Sharma',
      'priya@example.com',
      '+91 90000 00001',
      'Individual',
      10000,
      2,
      expect.any(String),
      'Active',
      'VIP; MonthlyDonor',
    ])

    expect(rows[1]?.[3]).toBe(formatDonorType(null))
    expect(rows[1]?.[3]).toBe('—')
    expect(rows[1]?.[7]).toBe(formatEngagementStatus(null))
    expect(rows[1]?.[7]).toBe('Unclassified')
    expect(rows[1]?.[8]).toBe('')
  })
})
