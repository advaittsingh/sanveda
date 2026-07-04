import { describe, expect, it } from 'vitest'
import {
  computeKpis,
  computePaymentFunnel,
  computeReconciliationFromDonations,
  inferGateway,
} from './donationCalculations'
import type { DonationCalcRecord } from './donationCalculations'

function mockDonation(overrides: Partial<DonationCalcRecord> = {}): DonationCalcRecord {
  return {
    id: '1',
    campaignTitle: 'Test Campaign',
    amount: 1000,
    currency: 'INR',
    isAnonymous: false,
    status: 'completed',
    createdAt: new Date().toISOString(),
    donorLabel: 'Test Donor',
    gateway: 'Razorpay',
    ...overrides,
  }
}

describe('donationCalculations', () => {
  it('computes KPI totals from completed donations', () => {
    const records = [
      mockDonation({ id: '1', amount: 500, status: 'completed' }),
      mockDonation({ id: '2', amount: 1500, status: 'completed' }),
      mockDonation({ id: '3', amount: 200, status: 'pending' }),
    ]
    const kpis = computeKpis(records, '30d')
    expect(kpis.totalRaised).toBe(2000)
    expect(kpis.pendingVerification).toBe(1)
    expect(kpis.successfulTransactions).toBe(2)
    expect(kpis.averageDonation).toBe(1000)
  })

  it('computes payment funnel from real statuses', () => {
    const records = [
      mockDonation({ status: 'completed' }),
      mockDonation({ id: '2', status: 'pending' }),
      mockDonation({ id: '3', status: 'failed' }),
    ]
    const funnel = computePaymentFunnel(records)
    expect(funnel.started).toBe(3)
    expect(funnel.successful).toBe(1)
    expect(funnel.pending).toBe(1)
    expect(funnel.failed).toBe(1)
  })

  it('does not invent reconciliation variance', () => {
    const records = [
      mockDonation({ razorpayPaymentId: 'pay_123', gateway: 'Razorpay' }),
    ]
    const recon = computeReconciliationFromDonations(records)
    expect(recon.collected).toBe(1000)
    expect(recon.difference).toBe(0)
    expect(recon.status).toBe('ok')
  })

  it('infers Razorpay gateway from payment id', () => {
    expect(inferGateway({ ...mockDonation(), razorpayPaymentId: 'pay_x' })).toBe('Razorpay')
    expect(inferGateway({ ...mockDonation(), status: 'pending' })).toBe('UPI')
  })
})
