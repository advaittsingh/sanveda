import { exportCsvWithAudit } from './adminExport'
import { withAudit } from './auditMiddleware'
import { getAllCampaignsAdmin } from './campaignService'
import { parseCategory } from './campaignAdminService'
import {
  buildTimeSeries,
  computeKpis,
  computePaymentFunnel,
  computeReconciliationFromDonations,
  inferGateway,
  inferSource,
  getRangeStart,
  type DonationRange,
} from './donationCalculations'
import {
  completeDonation,
  ensureDonationReceipt,
  getAllDonations,
  getDonationById,
  updateDonation,
  type Donation,
} from './donationService'
import { donationReceiptEmailHtml, sendTransactionalEmail } from './emailService'
import {
  createRefundRequest,
  fetchAllOpsMeta,
  fetchRefunds,
  fetchReconciliation,
  getAuditLogsForDonation,
  recordReceiptEvent,
  updateRefundStatus,
  upsertOpsMeta,
  type DonationRefundRow,
  type PaymentReconciliationRow,
} from './donationOpsRepository'

export type { DonationRange }

type DonationSource = 'Website' | 'UPI' | 'Razorpay' | 'Bank'
type DonationGateway = 'Razorpay' | 'UPI' | 'Bank' | 'Manual'
type TaxExemption = '80G' | 'FCRA' | 'CSR' | 'None'
type RefundStatus = 'none' | 'requested' | 'approved' | 'processing' | 'completed' | 'rejected'

export interface DonationAuditLog {
  id: string
  action: string
  detail: string
  at: string
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
  receiptState: 'pending' | 'generated' | 'sent' | 'downloaded' | 'reissued'
  refundStatus: RefundStatus
  refundReason?: string
}

export interface DonationTableFilters {
  search: string
  status: 'all' | Donation['status']
  receipt: 'all' | 'pending' | 'generated' | 'sent' | 'downloaded'
  gateway: 'all' | DonationGateway
}

export interface DonationDashboardData {
  allDonations: DonationOpsRecord[]
  range: DonationRange
  kpis: ReturnType<typeof computeKpis>
  donationsOverTime: { label: string; value: number }[]
  donationSources: { label: string; value: number }[]
  campaignAllocation: { label: string; value: number }[]
  pendingVerifications: DonationOpsRecord[]
  failedPayments: DonationOpsRecord[]
  topDonors: { label: string; value: number; donationCount: number }[]
  taxReceipts: { generated: number; pending: number; sent: number; downloaded: number }
  receiptProgress: number
  reconciliation: { collected: number; received: number; difference: number; status: 'ok' | 'warning' }
  paymentFunnel: ReturnType<typeof computePaymentFunnel>
  refunds: DonationRefundRow[]
  refundRecords: DonationOpsRecord[]
  compliance: {
    eightyGGenerated: number
    fcraDonations: number
    csrDonations: number
    pendingDocuments: number
    eightyGStatus: 'compliant' | 'warning' | 'unknown'
    fcraStatus: 'compliant' | 'warning' | 'unknown'
    csrStatus: 'compliant' | 'warning' | 'unknown'
  }
  alerts: { id: string; message: string; tone: 'warning' | 'info' }[]
  activity: { id: string; time: string; title: string; subtitle?: string }[]
  reconciliationHistory: PaymentReconciliationRow[]
  analytics: {
    averageDonation: number
    repeatDonorRate: number
  }
}

function mapRecord(
  donation: Donation,
  meta: Awaited<ReturnType<typeof fetchAllOpsMeta>>[string] | undefined,
  category: string,
  auditLogs: DonationAuditLog[],
): DonationOpsRecord {
  const gateway = (meta?.gateway as DonationGateway | undefined) ?? inferGateway(donation)
  const source = (meta?.source as DonationSource | undefined) ?? inferSource(gateway)
  const donorLabel = donation.isAnonymous ? 'Anonymous' : donation.donorName ?? donation.donorEmail ?? 'Donor'

  const receiptState =
    meta?.receiptReissuedAt ? 'reissued' :
    meta?.receiptDownloadedAt ? 'downloaded' :
    meta?.receiptSentAt ? 'sent' :
    donation.receiptNumber ? 'generated' : 'pending'

  const refundStatus = (meta?.refundStatus as RefundStatus | undefined) ??
    (donation.status === 'refunded' ? 'completed' : 'none')

  return {
    ...donation,
    donorLabel,
    source,
    gateway,
    paymentMethod: meta?.paymentMethod ?? (gateway === 'Razorpay' ? 'UPI/Card/Netbanking' : gateway),
    taxExemption: (meta?.taxExemption as TaxExemption | undefined) ?? (donation.receiptNumber ? '80G' : '80G'),
    complianceType: (meta?.complianceType as 'Domestic' | 'FCRA' | 'CSR' | undefined) ?? 'Domestic',
    notes: meta?.notes ?? '',
    pendingDocuments: meta?.pendingDocuments ?? (donation.status === 'pending' ? ['Payment proof'] : []),
    auditLogs,
    category,
    transactionId: donation.razorpayPaymentId ?? donation.razorpayOrderId ?? donation.id,
    isVerified: Boolean(meta?.verifiedAt) || donation.status === 'completed',
    receiptState,
    refundStatus,
    refundReason: meta?.refundReason,
  }
}

export async function getDonationDashboardData(range: DonationRange = '30d'): Promise<DonationDashboardData> {
  const [donations, campaigns, metaMap, refunds, reconciliationHistory] = await Promise.all([
    getAllDonations(),
    getAllCampaignsAdmin(),
    fetchAllOpsMeta(),
    fetchRefunds(),
    fetchReconciliation(),
  ])

  const campaignCategoryMap = new Map<string, string>()
  campaigns.forEach((campaign) => {
    const category = parseCategory(campaign.category)
    campaignCategoryMap.set(String(campaign.id), category)
    campaignCategoryMap.set(campaign.slug, category)
    campaignCategoryMap.set(campaign.title.toLowerCase(), category)
  })

  const records: DonationOpsRecord[] = await Promise.all(
    donations.map(async (donation) => {
      const meta = metaMap[donation.id]
      const category =
        (donation.campaignId != null && campaignCategoryMap.get(String(donation.campaignId))) ||
        (donation.campaignSlug && campaignCategoryMap.get(donation.campaignSlug)) ||
        campaignCategoryMap.get(donation.campaignTitle.toLowerCase()) ||
        'General'
      const auditLogs = await getAuditLogsForDonation(donation.id)
      return mapRecord(donation, meta, category, auditLogs)
    }),
  )

  const pending = records.filter((d) => d.status === 'pending')
  const failed = records.filter((d) => d.status === 'failed')
  const kpis = computeKpis(records, range)
  const rangeStart = getRangeStart(range)
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
      acc.set(donation.campaignTitle, (acc.get(donation.campaignTitle) ?? 0) + donation.amount)
      return acc
    }, new Map<string, number>()),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

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
  const sent = records.filter((d) => d.receiptState === 'sent' || d.receiptState === 'downloaded').length
  const downloaded = records.filter((d) => d.receiptState === 'downloaded').length
  const receiptProgress = generated + kpis.receiptsPending > 0
    ? Math.round((generated / (generated + kpis.receiptsPending)) * 100)
    : generated > 0 ? 100 : 0

  const baseReconciliation = computeReconciliationFromDonations(records)
  const latestRecon = reconciliationHistory[0]
  const reconciliation = latestRecon
    ? {
        collected: latestRecon.gatewayAmount,
        received: latestRecon.bankAmount,
        difference: latestRecon.variance,
        status: latestRecon.variance !== 0 ? 'warning' as const : 'ok' as const,
      }
    : baseReconciliation

  const refundRecords = records.filter((d) => d.refundStatus !== 'none' || d.status === 'refunded')
  const pendingDocuments = records.reduce((sum, d) => sum + d.pendingDocuments.length, 0)
  const fcraCount = records.filter((d) => d.complianceType === 'FCRA').length
  const csrCount = records.filter((d) => d.complianceType === 'CSR').length

  const activity = records
    .slice(0, 8)
    .map((donation) => ({
      id: `don-${donation.id}`,
      time: new Date(donation.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      title: donation.status === 'completed'
        ? `₹${donation.amount.toLocaleString('en-IN')} donation`
        : `Donation ${donation.status}`,
      subtitle: donation.donorLabel,
    }))

  const alerts = [
    pending.length > 0 ? { id: 'pending', message: `${pending.length} donations require verification`, tone: 'warning' as const } : null,
    kpis.receiptsPending > 0 ? { id: 'receipts', message: `${kpis.receiptsPending} 80G receipts pending generation`, tone: 'warning' as const } : null,
    failed.length > 0 ? { id: 'failed', message: `${failed.length} failed payment attempts`, tone: 'warning' as const } : null,
    refunds.filter((r) => r.status === 'pending').length > 0
      ? { id: 'refunds', message: `${refunds.filter((r) => r.status === 'pending').length} refund requests awaiting approval`, tone: 'info' as const }
      : null,
    reconciliation.difference > 0
      ? { id: 'recon', message: `₹${reconciliation.difference.toLocaleString('en-IN')} settlement variance`, tone: 'info' as const }
      : null,
  ].filter(Boolean) as { id: string; message: string; tone: 'warning' | 'info' }[]

  return {
    allDonations: records,
    range,
    kpis,
    donationsOverTime,
    donationSources,
    campaignAllocation,
    pendingVerifications: pending,
    failedPayments: failed,
    topDonors,
    taxReceipts: {
      generated,
      pending: kpis.receiptsPending,
      sent,
      downloaded,
    },
    receiptProgress,
    reconciliation,
    paymentFunnel: computePaymentFunnel(records),
    refunds,
    refundRecords,
    compliance: {
      eightyGGenerated: generated,
      fcraDonations: fcraCount,
      csrDonations: csrCount,
      pendingDocuments,
      eightyGStatus: kpis.receiptsPending > 0 ? 'warning' : generated > 0 ? 'compliant' : 'unknown',
      fcraStatus: fcraCount > 0 ? 'compliant' : 'unknown',
      csrStatus: csrCount > 0 ? 'compliant' : 'unknown',
    },
    alerts,
    activity,
    reconciliationHistory,
    analytics: {
      averageDonation: kpis.averageDonation,
      repeatDonorRate: kpis.repeatDonorRate,
    },
  }
}

export function filterDonations(records: DonationOpsRecord[], filters: DonationTableFilters): DonationOpsRecord[] {
  return records.filter((d) => {
    if (filters.status !== 'all' && d.status !== filters.status) return false
    if (filters.gateway !== 'all' && d.gateway !== filters.gateway) return false
    if (filters.receipt !== 'all' && d.receiptState !== filters.receipt) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        d.donorLabel.toLowerCase().includes(q) ||
        d.campaignTitle.toLowerCase().includes(q) ||
        (d.donorEmail?.toLowerCase().includes(q) ?? false) ||
        (d.receiptNumber?.toLowerCase().includes(q) ?? false) ||
        d.transactionId.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export async function approveDonation(id: string) {
  return withAudit('APPROVE', 'donations', id, async () => {
    const donation = await getDonationById(id)
    if (!donation) return
    if (donation.status === 'pending') {
      await completeDonation(id, donation.razorpayPaymentId, { asAdmin: true })
    } else {
      await updateDonation(id, { status: 'completed' })
    }
    await upsertOpsMeta(id, { verifiedAt: new Date().toISOString(), pendingDocuments: [] })
  }, { amount: (await getDonationById(id))?.amount })
}

export async function rejectDonation(id: string) {
  return withAudit('REJECT', 'donations', id, async () => {
    await updateDonation(id, { status: 'failed' })
  })
}

export async function requestDonationInfo(id: string) {
  await upsertOpsMeta(id, {
    requestedInfoAt: new Date().toISOString(),
    pendingDocuments: ['Donor confirmation', 'Payment proof'],
  })
}

export async function markReceiptSent(id: string) {
  return withAudit('SEND_RECEIPT', 'donations', id, async () => {
    const updated = await ensureDonationReceipt(id)
    if (!updated?.receiptNumber) return

    await recordReceiptEvent(id, updated.receiptNumber, 'generated')
    await upsertOpsMeta(id, { receiptSentAt: new Date().toISOString() })

    if (updated.donorEmail && !updated.isAnonymous) {
      const { getReceipt80GForDonationId, emailReceipt80G } = await import('./receipt80G/receipt80GService')
      const receipt = await getReceipt80GForDonationId(id)
      if (receipt) {
        await emailReceipt80G(receipt)
      } else {
        await sendTransactionalEmail(
          updated.donorEmail,
          `Your Sanveda Donation Receipt — ${updated.receiptNumber}`,
          donationReceiptEmailHtml({
            donorName: updated.donorName ?? 'Donor',
            amount: updated.amount,
            campaignTitle: updated.campaignTitle,
            receiptNumber: updated.receiptNumber,
          }),
          'donation_receipt',
        )
      }
      await recordReceiptEvent(id, updated.receiptNumber, 'emailed')
    }
  })
}

export async function markReceiptReissued(id: string) {
  return withAudit('REISSUE_RECEIPT', 'donations', id, async () => {
    const { regenerateReceipt80G } = await import('./receipt80G/receipt80GService')
    const receipt = await regenerateReceipt80G(id)
    if (!receipt) return
    await upsertOpsMeta(id, { receiptReissuedAt: new Date().toISOString() })
    await recordReceiptEvent(id, receipt.receiptNumber, 'reissued')
  })
}

export async function markReceiptDownloaded(id: string) {
  return withAudit('DOWNLOAD_RECEIPT', 'donations', id, async () => {
    const updated = await ensureDonationReceipt(id)
    if (updated?.receiptNumber) {
      await recordReceiptEvent(id, updated.receiptNumber, 'downloaded')
    }
    await upsertOpsMeta(id, { receiptDownloadedAt: new Date().toISOString() })
  })
}

export async function updateDonationNotes(id: string, notes: string) {
  return withAudit('UPDATE', 'donations', id, async () => {
    await upsertOpsMeta(id, { notes })
  }, { notesLength: notes.length })
}

export async function requestRefund(id: string, reason: string) {
  return withAudit('REFUND_REQUEST', 'donations', id, async () => {
    const donation = await getDonationById(id)
    if (!donation) return
    await createRefundRequest(id, reason, donation.amount)
  }, { reason })
}

export async function approveRefund(refundId: string, donationId: string) {
  return withAudit('REFUND_APPROVE', 'donations', donationId, async () => {
    await updateRefundStatus(refundId, 'approved', donationId)
    await updateDonation(donationId, { status: 'refunded' })
  })
}

export async function rejectRefund(refundId: string, donationId: string) {
  return withAudit('REFUND_REJECT', 'donations', donationId, async () => {
    await updateRefundStatus(refundId, 'rejected', donationId)
  })
}

export async function bulkVerifyDonations(ids: string[]) {
  await Promise.all(ids.map((id) => approveDonation(id)))
}

export async function bulkGenerateReceipts(ids: string[]) {
  await Promise.all(ids.map(async (id) => {
    const updated = await ensureDonationReceipt(id)
    if (updated?.receiptNumber) await recordReceiptEvent(id, updated.receiptNumber, 'generated')
  }))
}

export async function bulkSendReceipts(ids: string[]) {
  await Promise.all(ids.map((id) => markReceiptSent(id)))
}

export async function exportDonationsCsv(donations: DonationOpsRecord[]) {
  const headers = ['Donor', 'Campaign', 'Amount', 'Payment', 'Tax', 'Status', 'Receipt', 'Gateway', 'Transaction ID', 'Date']
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
    new Date(donation.createdAt).toLocaleDateString('en-IN'),
  ])
  const filename = `sanveda-donations-${new Date().toISOString().slice(0, 10)}.csv`
  await exportCsvWithAudit(filename, headers, rows, 'donations')
}
