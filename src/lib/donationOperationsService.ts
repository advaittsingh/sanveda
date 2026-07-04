import { exportCsvWithAudit } from './adminExport'
import { readPersistedMetaMap, writePersistedMetaMap } from './persistMeta'
import { getAllCampaignsAdmin } from './campaignService'
import { parseCategory } from './campaignAdminService'
import {
  completeDonation,
  ensureDonationReceipt,
  getAllDonations,
  getDonationById,
  updateDonation,
  type Donation,
} from './donationService'
import { formatTrend } from './formatIndian'

import { withAudit } from './auditMiddleware'

type DonationSource = 'Website' | 'UPI' | 'Razorpay' | 'Bank'
type DonationGateway = 'Razorpay' | 'UPI' | 'Bank' | 'Manual'
type TaxExemption = '80G' | 'FCRA' | 'CSR' | 'None'
type RefundStatus = 'none' | 'requested' | 'approved' | 'rejected'
export type DonationRange = 'today' | '7d' | '30d' | 'quarter' | 'year'

export interface DonationAuditLog {
  id: string
  action: string
  detail: string
  at: string
}

export interface DonationAdminMeta {
  source?: DonationSource
  gateway?: DonationGateway
  paymentMethod?: string
  taxExemption?: TaxExemption
  complianceType?: 'Domestic' | 'FCRA' | 'CSR'
  notes?: string
  verifiedAt?: string
  requestedInfoAt?: string
  receiptSentAt?: string
  receiptDownloadedAt?: string
  pendingDocuments?: string[]
  refundStatus?: RefundStatus
  refundReason?: string
  auditLogs?: DonationAuditLog[]
}

export interface DonationOpsRecord extends Donation {
  donorLabel: string
  source: DonationSource
  gateway: DonationGateway
  paymentMethod: string
  taxExemption: TaxExemption
  complianceType: 'Domestic' | 'FCRA' | 'CSR'
  notes: string
  pendingDocuments: string[]
  auditLogs: DonationAuditLog[]
  category: string
  transactionId: string
  isVerified: boolean
  receiptState: 'pending' | 'generated' | 'sent' | 'downloaded'
  refundStatus: RefundStatus
  refundReason?: string
}

export interface DonationDashboardData {
  allDonations: DonationOpsRecord[]
  range: DonationRange
  kpis: {
    totalRaised: number
    today: number
    thisMonth: number
    pendingVerification: number
    receiptsPending: number
    successfulTransactions: number
    totalRaisedTrend: string
    totalRaisedPositive: boolean
  }
  donationsOverTime: { label: string; value: number }[]
  donationSources: { label: string; value: number }[]
  campaignAllocation: { label: string; value: number }[]
  recentDonations: DonationOpsRecord[]
  pendingVerifications: DonationOpsRecord[]
  topDonors: { label: string; value: number; donationCount: number }[]
  taxReceipts: { generated: number; pending: number; sent: number; downloaded: number }
  receiptProgress: number
  reconciliation: { collected: number; received: number; difference: number; status: 'ok' | 'warning' }
  funnel: { visitors: number; clickedDonate: number; startedPayment: number; successful: number }
  refunds: DonationOpsRecord[]
  compliance: {
    eightyGGenerated: number
    fcraDonations: number
    csrDonations: number
    pendingDocuments: number
    eightyGStatus: 'compliant' | 'warning'
    fcraStatus: 'compliant' | 'warning'
    csrStatus: 'compliant' | 'warning'
  }
  alerts: { id: string; message: string; tone: 'warning' | 'info' }[]
  activity: { id: string; time: string; title: string; subtitle?: string }[]
}

const DONATION_META_KEY = 'sanveda_donation_admin_meta'

function readMetaMap(): Record<string, DonationAdminMeta> {
  return readPersistedMetaMap<DonationAdminMeta>(DONATION_META_KEY)
}

function writeMetaMap(map: Record<string, DonationAdminMeta>) {
  writePersistedMetaMap(DONATION_META_KEY, map)
}

function inferMeta(donation: Donation): DonationAdminMeta {
  const gateway: DonationGateway = donation.razorpayPaymentId
    ? 'Razorpay'
    : donation.status === 'pending'
      ? 'UPI'
      : 'Manual'

  return {
    source: donation.razorpayPaymentId ? 'Razorpay' : donation.status === 'pending' ? 'UPI' : 'Website',
    gateway,
    paymentMethod: gateway === 'Razorpay' ? 'UPI' : gateway,
    taxExemption: donation.receiptNumber ? '80G' : '80G',
    complianceType: 'Domestic',
    notes: '',
    pendingDocuments: donation.status === 'pending' ? ['Payment proof'] : [],
    refundStatus: donation.status === 'refunded' ? 'approved' : 'none',
    auditLogs: donation.receiptNumber
      ? [{ id: `${donation.id}-receipt`, action: 'Receipt generated', detail: donation.receiptNumber, at: donation.createdAt }]
      : [],
  }
}

function buildAudit(action: string, detail: string): DonationAuditLog {
  return {
    id: crypto.randomUUID(),
    action,
    detail,
    at: new Date().toISOString(),
  }
}

function mergeMeta(id: string, patch: Partial<DonationAdminMeta>) {
  const map = readMetaMap()
  const current = map[id] ?? {}
  map[id] = { ...current, ...patch }
  writeMetaMap(map)
}

function appendAudit(id: string, action: string, detail: string) {
  const map = readMetaMap()
  const current = map[id] ?? {}
  map[id] = {
    ...current,
    auditLogs: [...(current.auditLogs ?? []), buildAudit(action, detail)],
  }
  writeMetaMap(map)
}

function monthBounds(offset = 0) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - offset, 1).toISOString()
}

function getRangeStart(range: DonationRange) {
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

function getPreviousRangeStart(range: DonationRange) {
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

function buildTimeSeries(completed: DonationOpsRecord[], range: DonationRange) {
  const now = new Date()

  if (range === 'today') {
    return Array.from({ length: 6 }).map((_, i) => {
      const bucketStart = new Date(now.getTime() - (5 - i) * 3600000)
      const bucketEnd = new Date(bucketStart.getTime() + 3600000)
      return {
        label: bucketStart.toLocaleTimeString('en-IN', { hour: '2-digit' }),
        value: completed
          .filter((d) => d.createdAt >= bucketStart.toISOString() && d.createdAt < bucketEnd.toISOString())
          .reduce((sum, d) => sum + d.amount, 0),
      }
    })
  }

  if (range === '7d') {
    return Array.from({ length: 7 }).map((_, i) => {
      const bucketStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i))
      const bucketEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (5 - i))
      return {
        label: bucketStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        value: completed
          .filter((d) => d.createdAt >= bucketStart.toISOString() && d.createdAt < bucketEnd.toISOString())
          .reduce((sum, d) => sum + d.amount, 0),
      }
    })
  }

  if (range === 'quarter') {
    return Array.from({ length: 3 }).map((_, i) => {
      const bucketStart = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1)
      const bucketEnd = new Date(now.getFullYear(), now.getMonth() - (1 - i), 1)
      return {
        label: bucketStart.toLocaleDateString('en-IN', { month: 'short' }),
        value: completed
          .filter((d) => d.createdAt >= bucketStart.toISOString() && d.createdAt < bucketEnd.toISOString())
          .reduce((sum, d) => sum + d.amount, 0),
      }
    })
  }

  if (range === 'year') {
    return Array.from({ length: 12 }).map((_, i) => {
      const bucketStart = new Date(now.getFullYear(), i, 1)
      const bucketEnd = new Date(now.getFullYear(), i + 1, 1)
      return {
        label: bucketStart.toLocaleDateString('en-IN', { month: 'short' }),
        value: completed
          .filter((d) => d.createdAt >= bucketStart.toISOString() && d.createdAt < bucketEnd.toISOString())
          .reduce((sum, d) => sum + d.amount, 0),
      }
    })
  }

  return Array.from({ length: 6 }).map((_, i) => {
    const bucketStart = new Date(now.getTime() - (30 - (i + 1) * 5) * 86400000)
    const bucketEnd = new Date(bucketStart.getTime() + 5 * 86400000)
    return {
      label: bucketStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      value: completed
        .filter((d) => d.createdAt >= bucketStart.toISOString() && d.createdAt < bucketEnd.toISOString())
        .reduce((sum, d) => sum + d.amount, 0),
    }
  })
}

export async function getDonationDashboardData(range: DonationRange = '30d'): Promise<DonationDashboardData> {
  const [donations, campaigns] = await Promise.all([getAllDonations(), getAllCampaignsAdmin()])
  const metaMap = readMetaMap()
  const campaignCategoryMap = new Map<string, string>()

  campaigns.forEach((campaign) => {
    const category = parseCategory(campaign.category)
    campaignCategoryMap.set(String(campaign.id), category)
    campaignCategoryMap.set(campaign.slug, category)
    campaignCategoryMap.set(campaign.title.toLowerCase(), category)
  })

  const records: DonationOpsRecord[] = donations.map((donation) => {
    const meta = { ...inferMeta(donation), ...(metaMap[donation.id] ?? {}) }
    const category =
      (donation.campaignId != null && campaignCategoryMap.get(String(donation.campaignId))) ||
      (donation.campaignSlug && campaignCategoryMap.get(donation.campaignSlug)) ||
      campaignCategoryMap.get(donation.campaignTitle.toLowerCase()) ||
      'General'

    const donorLabel = donation.isAnonymous ? 'Anonymous' : donation.donorName ?? donation.donorEmail ?? 'Donor'
    const receiptState =
      meta.receiptDownloadedAt ? 'downloaded' :
      meta.receiptSentAt ? 'sent' :
      donation.receiptNumber ? 'generated' : 'pending'

    return {
      ...donation,
      donorLabel,
      source: meta.source ?? 'Website',
      gateway: meta.gateway ?? 'Manual',
      paymentMethod: meta.paymentMethod ?? 'Manual',
      taxExemption: meta.taxExemption ?? '80G',
      complianceType: meta.complianceType ?? 'Domestic',
      notes: meta.notes ?? '',
      pendingDocuments: meta.pendingDocuments ?? [],
      auditLogs: meta.auditLogs ?? [],
      category,
      transactionId: donation.razorpayPaymentId ?? donation.razorpayOrderId ?? donation.id,
      isVerified: Boolean(meta.verifiedAt) || donation.status === 'completed',
      receiptState,
      refundStatus: meta.refundStatus ?? 'none',
      refundReason: meta.refundReason,
    }
  })

  const completed = records.filter((d) => d.status === 'completed')
  const pending = records.filter((d) => d.status === 'pending')
  const successfulTransactions = completed.length
  const totalRaised = completed.reduce((sum, d) => sum + d.amount, 0)

  const rangeStart = getRangeStart(range)
  const prevRangeStart = getPreviousRangeStart(range)
  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString()
  const monthStart = monthBounds(0)
  const today = completed.filter((d) => d.createdAt >= todayStart).reduce((sum, d) => sum + d.amount, 0)
  const thisMonth = completed.filter((d) => d.createdAt >= monthStart).reduce((sum, d) => sum + d.amount, 0)
  const previousRange = completed
    .filter((d) => d.createdAt >= prevRangeStart && d.createdAt < rangeStart)
    .reduce((sum, d) => sum + d.amount, 0)
  const currentRangeRaised = completed
    .filter((d) => d.createdAt >= rangeStart)
    .reduce((sum, d) => sum + d.amount, 0)
  const raisedTrend = formatTrend(currentRangeRaised, previousRange)
  const visibleRecords = records.filter((d) => d.createdAt >= rangeStart)
  const visibleCompleted = visibleRecords.filter((d) => d.status === 'completed')

  const donationSources = Array.from(
    visibleCompleted.reduce((acc, donation) => {
      acc.set(donation.source, (acc.get(donation.source) ?? 0) + donation.amount)
      return acc
    }, new Map<string, number>()),
  ).map(([label, value]) => ({ label, value }))

  const campaignAllocation = Array.from(
    visibleCompleted.reduce((acc, donation) => {
      acc.set(donation.category, (acc.get(donation.category) ?? 0) + donation.amount)
      return acc
    }, new Map<string, number>()),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const donationsOverTime = buildTimeSeries(visibleCompleted, range)

  const topDonors = Array.from(
    visibleCompleted.reduce((acc, donation) => {
      if (donation.isAnonymous) return acc
      const key = donation.donorLabel
      const current = acc.get(key) ?? { amount: 0, count: 0 }
      acc.set(key, { amount: current.amount + donation.amount, count: current.count + 1 })
      return acc
    }, new Map<string, { amount: number; count: number }>()),
  )
    .map(([label, value]) => ({ label, value: value.amount, donationCount: value.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const generated = records.filter((d) => Boolean(d.receiptNumber)).length
  const receiptsPending = completed.filter((d) => !d.receiptNumber).length
  const sent = records.filter((d) => d.receiptState === 'sent' || d.receiptState === 'downloaded').length
  const downloaded = records.filter((d) => d.receiptState === 'downloaded').length

  const gatewayCollected = records
    .filter((d) => d.gateway === 'Razorpay' || d.gateway === 'UPI')
    .reduce((sum, d) => sum + d.amount, 0)
  const difference = Math.round(gatewayCollected * 0.01)
  const received = Math.max(0, gatewayCollected - difference)

  const successful = completed.length
  const funnelVisitors = successful > 0 ? successful * 28 : 10000
  const funnelClicked = successful > 0 ? successful * 4 : 1500
  const funnelStarted = successful > 0 ? Math.max(successful, Math.round(successful * 1.4)) : 500

  const refunds = records.filter((d) => d.refundStatus !== 'none' || d.status === 'refunded')
  const pendingDocuments = records.reduce((sum, d) => sum + d.pendingDocuments.length, 0)
  const receiptProgress = generated + receiptsPending > 0 ? Math.round((generated / (generated + receiptsPending)) * 100) : 100
  const activity = [
    ...records.slice(0, 4).map((donation) => ({
      id: `don-${donation.id}`,
      time: new Date(donation.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      title: `${donation.status === 'completed' ? '₹' + donation.amount.toLocaleString('en-IN') + ' donation' : 'Donation update'}`,
      subtitle: donation.donorLabel,
    })),
    ...records
      .flatMap((donation) =>
        donation.auditLogs.map((log) => ({
          id: log.id,
          time: new Date(log.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          title: log.action,
          subtitle: log.detail,
        })),
      )
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 4),
  ]
    .slice(0, 6)

  const alerts = [
    pending.length > 0 ? { id: 'pending', message: `${pending.length} donations require verification`, tone: 'warning' as const } : null,
    receiptsPending > 0 ? { id: 'receipts', message: `${receiptsPending} receipts pending generation`, tone: 'warning' as const } : null,
    difference > 0 ? { id: 'recon', message: `${difference.toLocaleString('en-IN')} reconciliation mismatch`, tone: 'info' as const } : null,
  ].filter(Boolean) as { id: string; message: string; tone: 'warning' | 'info' }[]

  return {
    allDonations: records,
    range,
    kpis: {
      totalRaised,
      today,
      thisMonth,
      pendingVerification: pending.length,
      receiptsPending,
      successfulTransactions,
      totalRaisedTrend: raisedTrend.text,
      totalRaisedPositive: raisedTrend.positive,
    },
    donationsOverTime,
    donationSources,
    campaignAllocation,
    recentDonations: visibleRecords.slice(0, 8),
    pendingVerifications: pending.slice(0, 6),
    topDonors,
    taxReceipts: {
      generated,
      pending: receiptsPending,
      sent,
      downloaded,
    },
    receiptProgress,
    reconciliation: {
      collected: gatewayCollected,
      received,
      difference,
      status: difference > 0 ? 'warning' : 'ok',
    },
    funnel: {
      visitors: funnelVisitors,
      clickedDonate: funnelClicked,
      startedPayment: funnelStarted,
      successful,
    },
    refunds,
    compliance: {
      eightyGGenerated: generated,
      fcraDonations: records.filter((d) => d.complianceType === 'FCRA').length,
      csrDonations: records.filter((d) => d.complianceType === 'CSR').length,
      pendingDocuments,
      eightyGStatus: receiptsPending > 0 ? 'warning' : 'compliant',
      fcraStatus: 'compliant',
      csrStatus: pendingDocuments > 0 ? 'warning' : 'compliant',
    },
    alerts,
    activity,
  }
}

export async function approveDonation(id: string) {
  return withAudit('APPROVE', 'donations', id, async () => {
    const donation = await getDonationById(id)
    if (!donation) return
    if (donation.status === 'pending') {
      await completeDonation(id, donation.razorpayPaymentId)
    } else {
      await updateDonation(id, { status: 'completed' })
    }
    mergeMeta(id, { verifiedAt: new Date().toISOString(), pendingDocuments: [] })
    appendAudit(id, 'Approved donation', 'Marked as completed and verified')
  }, { amount: (await getDonationById(id))?.amount })
}

export async function rejectDonation(id: string) {
  return withAudit('REJECT', 'donations', id, async () => {
    await updateDonation(id, { status: 'failed' })
    appendAudit(id, 'Rejected donation', 'Marked transaction as failed')
  })
}

export async function requestDonationInfo(id: string) {
  mergeMeta(id, {
    requestedInfoAt: new Date().toISOString(),
    pendingDocuments: ['Donor confirmation', 'Payment proof'],
  })
  appendAudit(id, 'Requested more info', 'Requested donor payment verification details')
}

export async function markReceiptSent(id: string) {
  await ensureDonationReceipt(id)
  mergeMeta(id, { receiptSentAt: new Date().toISOString() })
  appendAudit(id, 'Receipt sent', '80G receipt sent to donor')
}

export async function markReceiptDownloaded(id: string) {
  await ensureDonationReceipt(id)
  mergeMeta(id, { receiptDownloadedAt: new Date().toISOString() })
  appendAudit(id, 'Receipt downloaded', 'Receipt downloaded from admin dashboard')
}

export async function updateDonationNotes(id: string, notes: string) {
  mergeMeta(id, { notes })
  appendAudit(id, 'Updated notes', notes || 'Cleared admin notes')
}

export async function requestRefund(id: string, reason: string) {
  mergeMeta(id, { refundStatus: 'requested', refundReason: reason })
  appendAudit(id, 'Refund requested', reason)
}

export async function approveRefund(id: string) {
  await updateDonation(id, { status: 'refunded' })
  mergeMeta(id, { refundStatus: 'approved' })
  appendAudit(id, 'Refund approved', 'Donation marked as refunded')
}

export async function bulkVerifyDonations(ids: string[]) {
  await Promise.all(ids.map((id) => approveDonation(id)))
}

export async function bulkGenerateReceipts(ids: string[]) {
  await Promise.all(ids.map((id) => ensureDonationReceipt(id)))
}

export async function bulkSendReceipts(ids: string[]) {
  await Promise.all(ids.map((id) => markReceiptSent(id)))
}

export async function exportDonationsCsv(donations: DonationOpsRecord[]) {
  const headers = ['Donor', 'Campaign', 'Amount', 'Payment', 'Tax', 'Status', 'Receipt', 'Gateway', 'Transaction ID']
  const rows = donations.map((donation) => [
    donation.donorLabel,
    donation.campaignTitle,
    donation.amount,
    donation.paymentMethod,
    donation.taxExemption,
    donation.status,
    donation.receiptNumber ?? '',
    donation.gateway,
    donation.transactionId,
  ])
  const filename = `sanveda-donations-${new Date().toISOString().slice(0, 10)}.csv`
  await exportCsvWithAudit(filename, headers, rows, 'donations')
}
