import type { Donation } from './donationService'
import { formatTrend } from './formatIndian'

export type DonationRange = 'today' | '7d' | '30d' | 'quarter' | 'year'

export interface DonationCalcRecord extends Donation {
  donorLabel: string
  gateway: string
  receiptNumber?: string
}

export function monthBounds(offset = 0) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - offset, 1).toISOString()
}

export function getRangeStart(range: DonationRange) {
  const now = new Date()
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    case '7d':
      return new Date(now.getTime() - 7 * 86400000).toISOString()
    case 'quarter':
      return new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString()
    case 'year':
      return new Date(now.getFullYear(), 0, 1).toISOString()
    default:
      return new Date(now.getTime() - 30 * 86400000).toISOString()
  }
}

export function getPreviousRangeStart(range: DonationRange) {
  const now = new Date()
  switch (range) {
    case 'today':
      return new Date(now.getTime() - 86400000).toISOString()
    case '7d':
      return new Date(now.getTime() - 14 * 86400000).toISOString()
    case 'quarter':
      return new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString()
    case 'year':
      return new Date(now.getFullYear() - 1, 0, 1).toISOString()
    default:
      return new Date(now.getTime() - 60 * 86400000).toISOString()
  }
}

export function buildTimeSeries(completed: DonationCalcRecord[], range: DonationRange) {
  const now = new Date()

  if (range === 'today') {
    return Array.from({ length: 6 }).map((_, i) => {
      const bucketStart = new Date(now.getTime() - (5 - i) * 3600000)
      const bucketEnd = new Date(bucketStart.getTime() + 3600000)
      return {
        label: bucketStart.toLocaleTimeString('en-IN', { hour: '2-digit' }),
        value: sumInRange(completed, bucketStart.toISOString(), bucketEnd.toISOString()),
      }
    })
  }

  if (range === '7d') {
    return Array.from({ length: 7 }).map((_, i) => {
      const bucketStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i))
      const bucketEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (5 - i))
      return {
        label: bucketStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        value: sumInRange(completed, bucketStart.toISOString(), bucketEnd.toISOString()),
      }
    })
  }

  if (range === 'quarter') {
    return Array.from({ length: 3 }).map((_, i) => {
      const bucketStart = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1)
      const bucketEnd = new Date(now.getFullYear(), now.getMonth() - (1 - i), 1)
      return {
        label: bucketStart.toLocaleDateString('en-IN', { month: 'short' }),
        value: sumInRange(completed, bucketStart.toISOString(), bucketEnd.toISOString()),
      }
    })
  }

  if (range === 'year') {
    return Array.from({ length: 12 }).map((_, i) => {
      const bucketStart = new Date(now.getFullYear(), i, 1)
      const bucketEnd = new Date(now.getFullYear(), i + 1, 1)
      return {
        label: bucketStart.toLocaleDateString('en-IN', { month: 'short' }),
        value: sumInRange(completed, bucketStart.toISOString(), bucketEnd.toISOString()),
      }
    })
  }

  return Array.from({ length: 6 }).map((_, i) => {
    const bucketStart = new Date(now.getTime() - (30 - (i + 1) * 5) * 86400000)
    const bucketEnd = new Date(bucketStart.getTime() + 5 * 86400000)
    return {
      label: bucketStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      value: sumInRange(completed, bucketStart.toISOString(), bucketEnd.toISOString()),
    }
  })
}

function sumInRange(records: DonationCalcRecord[], start: string, end: string) {
  return records
    .filter((d) => d.createdAt >= start && d.createdAt < end)
    .reduce((sum, d) => sum + d.amount, 0)
}

export function computeKpis(records: DonationCalcRecord[], range: DonationRange) {
  const completed = records.filter((d) => d.status === 'completed')
  const pending = records.filter((d) => d.status === 'pending')
  const failed = records.filter((d) => d.status === 'failed')

  const totalRaised = completed.reduce((sum, d) => sum + d.amount, 0)
  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString()
  const monthStart = monthBounds(0)
  const rangeStart = getRangeStart(range)
  const prevRangeStart = getPreviousRangeStart(range)

  const today = completed.filter((d) => d.createdAt >= todayStart).reduce((sum, d) => sum + d.amount, 0)
  const thisMonth = completed.filter((d) => d.createdAt >= monthStart).reduce((sum, d) => sum + d.amount, 0)
  const currentRangeRaised = completed.filter((d) => d.createdAt >= rangeStart).reduce((sum, d) => sum + d.amount, 0)
  const previousRange = completed
    .filter((d) => d.createdAt >= prevRangeStart && d.createdAt < rangeStart)
    .reduce((sum, d) => sum + d.amount, 0)
  const raisedTrend = formatTrend(currentRangeRaised, previousRange)
  const receiptsPending = completed.filter((d) => !d.receiptNumber).length

  return {
    totalRaised,
    today,
    thisMonth,
    pendingVerification: pending.length,
    receiptsPending,
    successfulTransactions: completed.length,
    failedPayments: failed.length,
    totalRaisedTrend: raisedTrend.text,
    totalRaisedPositive: raisedTrend.positive,
    averageDonation: completed.length ? Math.round(totalRaised / completed.length) : 0,
    repeatDonorRate: computeRepeatRate(completed),
  }
}

function computeRepeatRate(completed: DonationCalcRecord[]) {
  const nonAnonymous = completed.filter((d) => !d.isAnonymous)
  const donorCounts = new Map<string, number>()
  for (const d of nonAnonymous) {
    const key = d.donorEmail ?? d.donorPhone ?? d.donorLabel
    donorCounts.set(key, (donorCounts.get(key) ?? 0) + 1)
  }
  if (donorCounts.size === 0) return 0
  const repeat = [...donorCounts.values()].filter((c) => c > 1).length
  return Math.round((repeat / donorCounts.size) * 100)
}

export function computePaymentFunnel(records: DonationCalcRecord[]) {
  const pending = records.filter((d) => d.status === 'pending').length
  const failed = records.filter((d) => d.status === 'failed').length
  const successful = records.filter((d) => d.status === 'completed').length
  const started = pending + failed + successful
  return { started, pending, failed, successful }
}

export function computeReconciliationFromDonations(records: DonationCalcRecord[]) {
  const gatewayCollected = records
    .filter((d) => d.status === 'completed' && (d.gateway === 'Razorpay' || d.razorpayPaymentId))
    .reduce((sum, d) => sum + d.amount, 0)

  return {
    collected: gatewayCollected,
    received: gatewayCollected,
    difference: 0,
    status: 'ok' as const,
  }
}

export function inferGateway(donation: Donation): 'Razorpay' | 'UPI' | 'Bank' | 'Manual' {
  if (donation.razorpayPaymentId || donation.razorpayOrderId) return 'Razorpay'
  if (donation.status === 'pending') return 'UPI'
  return 'Manual'
}

export function inferSource(gateway: ReturnType<typeof inferGateway>): 'Website' | 'UPI' | 'Razorpay' | 'Bank' {
  if (gateway === 'Razorpay') return 'Razorpay'
  if (gateway === 'UPI') return 'UPI'
  if (gateway === 'Bank') return 'Bank'
  return 'Website'
}
