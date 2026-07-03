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

const DONATION_META_KEY = 'sanveda_donation_admin_meta'

type DonationSource = 'Website' | 'UPI' | 'Razorpay' | 'Bank'
type DonationGateway = 'Razorpay' | 'UPI' | 'Bank' | 'Manual'
type TaxExemption = '80G' | 'FCRA' | 'CSR' | 'None'
type RefundStatus = 'none' | 'requested' | 'approved' | 'rejected'

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
  reconciliation: { collected: number; received: number; difference: number }
  funnel: { visitors: number; clickedDonate: number; startedPayment: number; successful: number }
  refunds: DonationOpsRecord[]
  compliance: { eightyGGenerated: number; fcraDonations: number; csrDonations: number; pendingDocuments: number }
}

function readMetaMap(): Record<string, DonationAdminMeta> {
  try {
    const raw = localStorage.getItem(DONATION_META_KEY)
    return raw ? (JSON.parse(raw) as Record<string, DonationAdminMeta>) : {}
  } catch {
    return {}
  }
}

function writeMetaMap(map: Record<string, DonationAdminMeta>) {
  localStorage.setItem(DONATION_META_KEY, JSON.stringify(map))
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

export async function getDonationDashboardData(): Promise<DonationDashboardData> {
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

  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString()
  const monthStart = monthBounds(0)
  const prevMonthStart = monthBounds(1)
  const today = completed.filter((d) => d.createdAt >= todayStart).reduce((sum, d) => sum + d.amount, 0)
  const thisMonth = completed.filter((d) => d.createdAt >= monthStart).reduce((sum, d) => sum + d.amount, 0)
  const previousMonth = completed
    .filter((d) => d.createdAt >= prevMonthStart && d.createdAt < monthStart)
    .reduce((sum, d) => sum + d.amount, 0)
  const raisedTrend = formatTrend(thisMonth, previousMonth)

  const donationSources = Array.from(
    records.reduce((acc, donation) => {
      acc.set(donation.source, (acc.get(donation.source) ?? 0) + donation.amount)
      return acc
    }, new Map<string, number>()),
  ).map(([label, value]) => ({ label, value }))

  const campaignAllocation = Array.from(
    records.reduce((acc, donation) => {
      acc.set(donation.category, (acc.get(donation.category) ?? 0) + donation.amount)
      return acc
    }, new Map<string, number>()),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const donationsOverTime = Array.from({ length: 6 }).map((_, i) => {
    const start = monthBounds(5 - i)
    const end = i === 5 ? undefined : monthBounds(4 - i)
    const label = new Date(start).toLocaleDateString('en-IN', { month: 'short' })
    const value = completed
      .filter((d) => d.createdAt >= start && (!end || d.createdAt < end))
      .reduce((sum, d) => sum + d.amount, 0)
    return { label, value }
  })

  const topDonors = Array.from(
    completed.reduce((acc, donation) => {
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

  return {
    allDonations: records,
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
    recentDonations: records.slice(0, 8),
    pendingVerifications: pending.slice(0, 6),
    topDonors,
    taxReceipts: {
      generated,
      pending: receiptsPending,
      sent,
      downloaded,
    },
    reconciliation: {
      collected: gatewayCollected,
      received,
      difference,
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
    },
  }
}

export async function approveDonation(id: string) {
  const donation = await getDonationById(id)
  if (!donation) return
  if (donation.status === 'pending') {
    await completeDonation(id, donation.razorpayPaymentId)
  } else {
    await updateDonation(id, { status: 'completed' })
  }
  mergeMeta(id, { verifiedAt: new Date().toISOString(), pendingDocuments: [] })
  appendAudit(id, 'Approved donation', 'Marked as completed and verified')
}

export async function rejectDonation(id: string) {
  await updateDonation(id, { status: 'failed' })
  appendAudit(id, 'Rejected donation', 'Marked transaction as failed')
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

export function exportDonationsCsv(donations: DonationOpsRecord[]) {
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

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `sanveda-donations-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
