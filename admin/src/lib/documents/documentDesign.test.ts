import { beforeEach, describe, expect, it, vi } from 'vitest'
import { humanizeLabel } from './documentDesign'

vi.mock('../receipt80G/ngoProfile', () => ({
  loadNgoReceiptProfile: vi.fn(async () => ({
    ngoName: 'Sanveda',
    legalName: 'Sanveda Global Humanitarian Foundation',
    tagline:
      "India's Humanitarian Assistance for Ayurvedic healing, Sports & Health Force by Hamdan pathan.",
    registrationNumber: 'REG-1',
    pan: 'AAATS1234A',
    eightyGNumber: '80G-TEST',
    twelveANumber: '12A-TEST',
    website: 'https://sanveda.example',
    supportEmail: 'hello@sanveda.example',
    phone: '+91 90000 00000',
    address: 'Test Address',
    logo: '/logo.svg',
    primaryColor: '#041B4D',
    accentColor: '#059669',
    receiptPrefix: 'SVD-80G',
    financialYear: 'FY 2026-27',
    verificationBaseUrl: 'https://sanveda.example',
  })),
}))

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(async () => 'data:image/png;base64,qq'),
  },
}))

describe('humanizeLabel', () => {
  it('converts snake_case and kebab-case to title case', () => {
    expect(humanizeLabel('health_camps')).toBe('Health Camps')
    expect(humanizeLabel('social-media')).toBe('Social Media')
    expect(humanizeLabel('founding')).toBe('Founding')
  })
})

describe('generateAppointmentLetterHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses shared document components and appointment title', async () => {
    const { generateAppointmentLetterHtml } = await import('../documentService')
    const html = await generateAppointmentLetterHtml({
      recipientName: 'Test Volunteer',
      role: 'healthcare',
      department: 'Healthcare',
      startDate: '22 July 2026',
      type: 'volunteer',
      referenceId: 'SVG-2026-TEST01',
    })
    expect(html).toContain('data-component="HeaderBand"')
    expect(html).toContain('APPOINTMENT LETTER')
    expect(html).toContain('Healthcare')
    expect(html).toContain('SVG-2026-TEST01')
    expect(html).toContain('data-component="DocumentFooter"')
  })
})

describe('generateMembershipCertificateHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('includes HeaderBand and MEMBERSHIP CERTIFICATE markers', async () => {
    const { generateMembershipCertificateHtml } = await import('../membershipService')
    const html = await generateMembershipCertificateHtml({
      id: 'mem-1',
      fullName: 'Test Member',
      email: 'member@example.com',
      phone: '+91 90000 00000',
      tier: 'founding',
      status: 'active',
      memberId: 'SVD-MEM-2026-9003',
      certificateNumber: 'CERT-9003',
      renewalDate: '2027-12-31',
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    })

    expect(html).toContain('data-component="HeaderBand"')
    expect(html).toContain('MEMBERSHIP CERTIFICATE')
    expect(html).toContain('FOUNDING MEMBER')
    expect(html).toContain('data:image/png;base64,qq')
  })
})
