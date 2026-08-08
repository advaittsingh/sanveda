import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Donation } from '../donationService'
import { buildReceipt80GData, presentString } from './buildReceiptData'
import { receiptPdfFilename } from './receipt80GPdf'

vi.mock('./ngoProfile', () => ({
  loadNgoReceiptProfile: vi.fn(async () => ({
    ngoName: 'Sanveda',
    legalName: 'Sanveda Global Humanitarian Foundation',
    tagline: 'Hope in action',
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
  financialYearFromDate: () => 'FY 2026-27',
}))

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(async () => 'data:image/png;base64,qq'),
  },
}))

vi.mock('../verificationService', () => ({
  ensureVerificationCode: vi.fn(async ({ referenceId }: { referenceId: string }) => referenceId),
}))

describe('presentString', () => {
  it('rejects nullish and literal undefined/null strings', () => {
    expect(presentString(undefined)).toBeUndefined()
    expect(presentString(null)).toBeUndefined()
    expect(presentString('undefined')).toBeUndefined()
    expect(presentString('null')).toBeUndefined()
    expect(presentString('  ')).toBeUndefined()
    expect(presentString('SVD-80G-2026-9001')).toBe('SVD-80G-2026-9001')
  })
})

describe('receiptPdfFilename', () => {
  it('uses the Sanveda_Donation_Receipt pattern', () => {
    expect(receiptPdfFilename('SVD-80G-2026-9001')).toBe(
      'Sanveda_Donation_Receipt_SVD-80G-2026-9001.pdf',
    )
  })

  it('never embeds the literal word undefined', () => {
    expect(receiptPdfFilename(undefined)).toBe('Sanveda_Donation_Receipt_PENDING.pdf')
    expect(receiptPdfFilename('undefined')).toBe('Sanveda_Donation_Receipt_PENDING.pdf')
    expect(receiptPdfFilename(null)).toBe('Sanveda_Donation_Receipt_PENDING.pdf')
  })
})

describe('buildReceipt80GData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps a complete donation without undefined fields', async () => {
    const donation: Donation = {
      id: '88888888-0000-4000-8000-000000000011',
      campaignTitle: 'Mid-Day Meals',
      amount: 2000,
      currency: 'INR',
      isAnonymous: false,
      donorName: 'Priya Sharma',
      donorEmail: 'priya.sharma@example.com',
      status: 'completed',
      razorpayPaymentId: 'pay_demo_9011',
      receiptNumber: 'SVD-80G-2026-9011',
      createdAt: '2026-07-01T10:00:00.000Z',
    }

    const data = await buildReceipt80GData(donation)
    expect(data.receiptNumber).toBe('SVD-80G-2026-9011')
    expect(data.donorName).toBe('Priya Sharma')
    expect(data.campaign).toBe('Mid-Day Meals')
    expect(data.transactionId).toBe('pay_demo_9011')
    expect(data.donationDate).not.toBe('Invalid Date')
    expect(data.donationDate).not.toContain('undefined')
    expect(receiptPdfFilename(data.receiptNumber)).not.toContain('undefined')
  })

  it('does not leak undefined/Invalid Date when ledger-shaped fields are passed', async () => {
    // Simulates the old Transactions bug: TransactionRecord-like shape fed into the builder.
    const broken = {
      id: 'tx-1',
      amount: 2000,
      currency: 'INR',
      isAnonymous: false,
      donorName: 'Priya Sharma',
      status: 'completed' as const,
      gateway: 'Razorpay',
      date: '2026-07-01T10:00:00.000Z',
      campaign: 'Mid-Day Meals',
      gatewayReference: 'pay_demo_9011',
      receiptNumber: undefined,
      createdAt: undefined as unknown as string,
      campaignTitle: undefined as unknown as string,
      razorpayPaymentId: undefined,
    }

    const data = await buildReceipt80GData(broken as Donation)
    expect(data.receiptNumber).toMatch(/^SVD-80G-\d{4}-PENDING$/)
    expect(data.receiptNumber).not.toBe('undefined')
    expect(data.donorName).toBe('Priya Sharma')
    expect(data.campaign).toBe('Mid-Day Meals')
    expect(data.transactionId).toBe('pay_demo_9011')
    expect(data.donationDate).not.toBe('Invalid Date')
    expect(data.donationDate).not.toContain('undefined')
    expect(receiptPdfFilename(data.receiptNumber)).toBe(
      `Sanveda_Donation_Receipt_${data.receiptNumber}.pdf`,
    )
  })
})
