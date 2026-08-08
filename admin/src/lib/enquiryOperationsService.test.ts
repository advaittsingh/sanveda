import { describe, expect, it } from 'vitest'
import { buildEnquiryProfile } from './enquiryOperationsService'
import type { Enquiry } from './enquiryService'

function baseEnquiry(overrides: Partial<Enquiry> = {}): Enquiry {
  return {
    id: '44444444-0000-4000-8000-000000000001',
    name: 'Rohit Malhotra',
    phone: '+91 90000 33001',
    email: 'rohit.malhotra@example.com',
    subject: 'CSR partnership enquiry',
    message: 'Looking to discuss a partnership.',
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    escalated: false,
    ...overrides,
  }
}

describe('buildEnquiryProfile', () => {
  it('maps Contact Us rows with null category/source to safe defaults', () => {
    const profile = buildEnquiryProfile(baseEnquiry({
      category: undefined,
      priority: undefined,
      source: undefined,
      workflowStage: undefined,
      ticketCode: undefined,
    }))

    expect(profile.category).toBe('general')
    expect(profile.categoryLabel).toBe('General')
    expect(profile.source).toBe('website')
    expect(profile.sourceLabel).toBe('Website')
    expect(profile.workflowStage).toBe('new')
    expect(profile.assignedTo).toBe('Unassigned')
  })

  it('does not crash on legacy seed categories and workflow stages', () => {
    const profiles = [
      buildEnquiryProfile(baseEnquiry({ category: 'volunteering', workflowStage: 'triage', status: 'new' })),
      buildEnquiryProfile(baseEnquiry({
        id: '2',
        category: 'donor_support',
        workflowStage: 'engagement',
        status: 'in_progress',
      })),
      buildEnquiryProfile(baseEnquiry({
        id: '3',
        category: 'not_a_real_category',
        workflowStage: 'resolution',
        status: 'in_progress',
      })),
    ]

    expect(profiles[0].category).toBe('volunteer')
    expect(profiles[0].workflowStage).toBe('new')
    expect(profiles[1].category).toBe('donations')
    expect(profiles[1].workflowStage).toBe('in_progress')
    expect(profiles[2].category).toBe('general')
    expect(profiles[2].categoryLabel).toBe('General')
    expect(profiles[2].workflowStage).toBe('resolved')
  })
})
