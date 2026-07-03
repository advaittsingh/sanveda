import { downloadCsv, printHtmlReport, renderMetricSection, renderTableSection } from './adminExport'
import { getAllCampaignsAdmin } from './campaignService'
import { getAllDonations } from './donationService'
import { formatIndianCompact } from './formatIndian'

const TRANSACTION_LEDGER_KEY = 'sanveda_transaction_ledger'

export type TransactionStatus = 'success' | 'pending' | 'failed' | 'refunded'
export type TransactionGateway = 'Razorpay' | 'UPI' | 'Bank'
export type TransactionMethod = 'UPI' | 'Card' | 'Netbanking' | 'Wallet' | 'Bank Transfer'
export type TransactionRange = 'today' | '7d' | '30d' | 'custom'
export type TransactionFilterStatus = 'all' | TransactionStatus
export type TransactionFilterGateway = 'all' | TransactionGateway

export interface TransactionAuditLog {
  id: string
  title: string
  detail: string
  at: string
}

export interface TransactionRecord {
  id: string
  donorName: string
  donorEmail: string
  campaign: string
  amount: number
  method: TransactionMethod
  gateway: TransactionGateway
  status: TransactionStatus
  date: string
  settlementStatus: 'settled' | 'pending'
  settledAt?: string
  refundStatus: 'none' | 'requested' | 'processed'
  refundReason?: string
  refundRequestedAt?: string
  refundRisk?: 'low' | 'medium' | 'high'
  failureReason?: string
  lastContactedAt?: string
  gatewayReference: string
  auditLog: TransactionAuditLog[]
}

export interface TransactionFilters {
  status: TransactionFilterStatus
  gateway: TransactionFilterGateway
  range: TransactionRange
  customStart?: string
  customEnd?: string
}

export interface TransactionsDashboardData {
  filters: TransactionFilters
  allTransactions: TransactionRecord[]
  filteredTransactions: TransactionRecord[]
  kpis: {
    totalTransactions: number
    successful: number
    pending: number
    failed: number
    todayVolume: number
    settlementPending: number
  }
  volumeTrend: { label: string; value: number }[]
  paymentMethodDistribution: { label: string; value: number }[]
  settlementOverview: Array<{ gateway: TransactionGateway; collected: number; settled: number; pending: number }>
  failedTransactions: TransactionRecord[]
  reconciliation: { gateway: number; bank: number; difference: number }
  refundRequests: TransactionRecord[]
  auditLog: TransactionAuditLog[]
}

const DONOR_FIRST_NAMES = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Rajesh', 'Ankit', 'Meera', 'Pooja', 'Nikhil', 'Ritika',
  'Sanjay', 'Kavya', 'Dev', 'Asha', 'Manish', 'Neha', 'Abhishek', 'Isha', 'Rohan', 'Tanvi',
]

const DONOR_LAST_NAMES = [
  'Sharma', 'Verma', 'Singh', 'Patel', 'Nair', 'Kumar', 'Agarwal', 'Joshi', 'Reddy', 'Menon',
]

const METHODS: TransactionMethod[] = ['UPI', 'Card', 'Netbanking', 'Wallet', 'Bank Transfer']
const GATEWAYS: TransactionGateway[] = ['Razorpay', 'UPI', 'Bank']
const FAILURE_REASONS = ['Bank timeout', 'Insufficient funds', 'Card declined', 'UPI mandate expired']

function readLedger(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(TRANSACTION_LEDGER_KEY)
    return raw ? (JSON.parse(raw) as TransactionRecord[]) : []
  } catch {
    return []
  }
}

function writeLedger(records: TransactionRecord[]) {
  localStorage.setItem(TRANSACTION_LEDGER_KEY, JSON.stringify(records))
}

function buildAudit(title: string, detail: string, at = new Date().toISOString()): TransactionAuditLog {
  return {
    id: crypto.randomUUID(),
    title,
    detail,
    at,
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatFullDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function startForRange(filters: TransactionFilters) {
  const now = new Date()
  switch (filters.range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case '7d':
      return new Date(now.getTime() - 7 * 86400000)
    case 'custom':
      return filters.customStart ? new Date(filters.customStart) : new Date(now.getTime() - 30 * 86400000)
    default:
      return new Date(now.getTime() - 30 * 86400000)
  }
}

function endForRange(filters: TransactionFilters) {
  if (filters.range === 'custom' && filters.customEnd) {
    const end = new Date(filters.customEnd)
    return new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
  }
  return new Date(Date.now() + 86400000)
}

function donorPool(realDonors: string[]) {
  const synthetic = DONOR_FIRST_NAMES.flatMap((first) => DONOR_LAST_NAMES.map((last) => `${first} ${last}`))
  return Array.from(new Set([...realDonors, ...synthetic]))
}

async function buildSeedLedger(): Promise<TransactionRecord[]> {
  const [donations, campaigns] = await Promise.all([getAllDonations(), getAllCampaignsAdmin()])
  const realDonors = donations
    .map((donation) => donation.donorName ?? donation.donorEmail)
    .filter((value): value is string => Boolean(value))
  const donors = donorPool(realDonors)
  const campaignTitles = campaigns.map((campaign) => campaign.title)
  const fallbackCampaigns = campaignTitles.length ? campaignTitles : ['Medical Fund', 'Children Education', 'General Relief']
  const seeded: TransactionRecord[] = []
  const total = Math.max(42, donations.length + 28)
  const now = new Date()

  for (let index = 0; index < total; index += 1) {
    const donation = donations[index]
    const donorName = donation?.donorName ?? donation?.donorEmail ?? donors[index % donors.length] ?? `Donor ${index + 1}`
    const donorKey = donorName.replace(/\s+/g, '.').toLowerCase()
    const campaign = donation?.campaignTitle ?? fallbackCampaigns[index % fallbackCampaigns.length]
    const method = METHODS[index % METHODS.length]
    const gateway = donation?.razorpayPaymentId ? 'Razorpay' : GATEWAYS[index % GATEWAYS.length]
    const date = donation?.createdAt ?? new Date(now.getTime() - (index * 36 + 8) * 3600000).toISOString()
    const amount = donation?.amount ?? [999, 1500, 2500, 5000, 10000, 2000, 7500][index % 7]

    const seededStatus: TransactionStatus =
      donation?.status === 'completed' ? 'success' :
      donation?.status === 'failed' ? 'failed' :
      donation?.status === 'refunded' ? 'refunded' :
      donation?.status === 'pending' ? 'pending' :
      index % 12 === 0 ? 'failed' :
      index % 7 === 0 ? 'pending' :
      index % 16 === 0 ? 'refunded' : 'success'

    const refundStatus =
      seededStatus === 'refunded' ? 'processed' :
      seededStatus === 'success' && index % 15 === 0 ? 'requested' : 'none'
    const refundRequestedAt = refundStatus === 'requested' ? new Date(now.getTime() - (index % 6 + 1) * 3600000).toISOString() : undefined
    const refundRisk: TransactionRecord['refundRisk'] =
      amount >= 5000 ? 'high' : amount >= 2000 ? 'medium' : 'low'

    const settledAt =
      seededStatus === 'success' && index % 5 !== 0
        ? new Date(new Date(date).getTime() + 2 * 86400000).toISOString()
        : undefined

    seeded.push({
      id: donation?.id ? `TXN-${String(index + 1001)}` : `TXN-${String(index + 2401)}`,
      donorName,
      donorEmail: donation?.donorEmail ?? `${donorKey}+${index + 1}@example.org`,
      campaign,
      amount,
      method,
      gateway,
      status: seededStatus,
      date,
      settlementStatus: settledAt ? 'settled' : 'pending',
      settledAt,
      refundStatus,
      refundReason: refundStatus === 'requested' ? 'Duplicate payment flagged by donor.' : undefined,
      refundRequestedAt,
      refundRisk: refundStatus === 'requested' ? refundRisk : undefined,
      failureReason: seededStatus === 'failed' ? FAILURE_REASONS[index % FAILURE_REASONS.length] : undefined,
      gatewayReference: donation?.razorpayPaymentId ?? donation?.razorpayOrderId ?? `rzp_${100000 + index}`,
      auditLog: [
        buildAudit('Payment received', `${formatIndianCompact(amount)} collected via ${method}.`, date),
        ...(settledAt ? [buildAudit('Settlement completed', `Bank settlement posted for ${gateway}.`, settledAt)] : []),
        ...(seededStatus === 'failed' ? [buildAudit('Payment failed', 'Payment authorization failed at the gateway.', date)] : []),
        ...(refundStatus === 'requested' ? [buildAudit('Refund requested', 'Donor raised refund request for review.', new Date().toISOString())] : []),
      ],
    })
  }

  return seeded.sort((a, b) => b.date.localeCompare(a.date))
}

async function ensureLedger(): Promise<TransactionRecord[]> {
  const existing = readLedger()
  if (existing.length) return existing
  const seeded = await buildSeedLedger()
  writeLedger(seeded)
  return seeded
}

function updateLedger(ids: string[], updater: (record: TransactionRecord) => TransactionRecord) {
  const idSet = new Set(ids)
  const next = readLedger().map((record) => (idSet.has(record.id) ? updater(record) : record))
  writeLedger(next)
}

function filterTransactions(records: TransactionRecord[], filters: TransactionFilters) {
  const start = startForRange(filters).toISOString()
  const end = endForRange(filters).toISOString()
  return records.filter((record) => {
    const matchesStatus = filters.status === 'all' || record.status === filters.status
    const matchesGateway = filters.gateway === 'all' || record.gateway === filters.gateway
    const matchesDate = record.date >= start && record.date < end
    return matchesStatus && matchesGateway && matchesDate
  })
}

function timeBuckets(filters: TransactionFilters) {
  const now = new Date()
  if (filters.range === 'today') {
    return Array.from({ length: 6 }, (_, index) => {
      const start = new Date(now.getTime() - (5 - index) * 3600000)
      return {
        label: start.toLocaleTimeString('en-IN', { hour: '2-digit' }),
        start,
        end: new Date(start.getTime() + 3600000),
      }
    })
  }

  if (filters.range === '7d') {
    return Array.from({ length: 7 }, (_, index) => {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index))
      return {
        label: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        start,
        end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
      }
    })
  }

  return Array.from({ length: 6 }, (_, index) => {
    const start = new Date(now.getTime() - (30 - (index + 1) * 5) * 86400000)
    return {
      label: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      start,
      end: new Date(start.getTime() + 5 * 86400000),
    }
  })
}

export async function getTransactionsDashboardData(filters: TransactionFilters): Promise<TransactionsDashboardData> {
  const allTransactions = await ensureLedger()
  const filteredTransactions = filterTransactions(allTransactions, filters)
  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString()

  const kpis = {
    totalTransactions: filteredTransactions.length,
    successful: filteredTransactions.filter((record) => record.status === 'success').length,
    pending: filteredTransactions.filter((record) => record.status === 'pending').length,
    failed: filteredTransactions.filter((record) => record.status === 'failed').length,
    todayVolume: allTransactions
      .filter((record) => record.status === 'success' && record.date >= todayStart)
      .reduce((sum, record) => sum + record.amount, 0),
    settlementPending: allTransactions
      .filter((record) => record.status === 'success' && record.settlementStatus === 'pending')
      .reduce((sum, record) => sum + record.amount, 0),
  }

  const volumeTrend = timeBuckets(filters).map((bucket) => ({
    label: bucket.label,
    value: filteredTransactions
      .filter((record) => record.date >= bucket.start.toISOString() && record.date < bucket.end.toISOString())
      .reduce((sum, record) => sum + record.amount, 0),
  }))

  const paymentMethodDistribution = Array.from(
    filteredTransactions.reduce((acc, record) => {
      acc.set(record.method, (acc.get(record.method) ?? 0) + record.amount)
      return acc
    }, new Map<string, number>()),
  ).map(([label, value]) => ({ label, value }))

  const settlementOverview = GATEWAYS.map((gateway) => {
    const items = allTransactions.filter((record) => record.gateway === gateway && record.status === 'success')
    return {
      gateway,
      collected: items.reduce((sum, record) => sum + record.amount, 0),
      settled: items.filter((record) => record.settlementStatus === 'settled').reduce((sum, record) => sum + record.amount, 0),
      pending: items.filter((record) => record.settlementStatus === 'pending').reduce((sum, record) => sum + record.amount, 0),
    }
  })

  const gatewayCollected = settlementOverview.reduce((sum, item) => sum + item.collected, 0)
  const bankSettled = settlementOverview.reduce((sum, item) => sum + item.settled, 0)

  return {
    filters,
    allTransactions,
    filteredTransactions,
    kpis,
    volumeTrend,
    paymentMethodDistribution,
    settlementOverview,
    failedTransactions: allTransactions
      .filter((record) => record.status === 'failed')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
    reconciliation: {
      gateway: gatewayCollected,
      bank: bankSettled,
      difference: gatewayCollected - bankSettled,
    },
    refundRequests: allTransactions
      .filter((record) => record.refundStatus === 'requested')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6),
    auditLog: allTransactions
      .flatMap((record) => record.auditLog)
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 10),
  }
}

export async function retryTransaction(id: string) {
  await ensureLedger()
  updateLedger([id], (record) => ({
    ...record,
    status: 'success',
    settlementStatus: 'pending',
    settledAt: undefined,
    auditLog: [...record.auditLog, buildAudit('Payment retried', 'Retry succeeded and transaction moved to settlement pending.')],
  }))
}

export async function markTransactionsSettled(ids: string[]) {
  await ensureLedger()
  const settledAt = new Date().toISOString()
  updateLedger(ids, (record) => ({
    ...record,
    settlementStatus: 'settled',
    settledAt,
    auditLog: [...record.auditLog, buildAudit('Settlement completed', 'Funds reconciled and marked as settled.', settledAt)],
  }))
}

export async function requestTransactionRefund(id: string, reason: string) {
  await ensureLedger()
  const requestedAt = new Date().toISOString()
  updateLedger([id], (record) => ({
    ...record,
    refundStatus: 'requested',
    refundReason: reason,
    refundRequestedAt: requestedAt,
    refundRisk: record.amount >= 5000 ? 'high' : record.amount >= 2000 ? 'medium' : 'low',
    auditLog: [...record.auditLog, buildAudit('Refund requested', reason, requestedAt)],
  }))
}

export async function approveRefundRequest(id: string) {
  await ensureLedger()
  updateLedger([id], (record) => ({
    ...record,
    status: 'refunded',
    refundStatus: 'processed',
    settlementStatus: 'pending',
    auditLog: [...record.auditLog, buildAudit('Refund processed', 'Refund approved and sent to the payment gateway.')],
  }))
}

export async function rejectRefundRequest(id: string) {
  await ensureLedger()
  updateLedger([id], (record) => ({
    ...record,
    refundStatus: 'none',
    refundReason: undefined,
    refundRequestedAt: undefined,
    refundRisk: undefined,
    auditLog: [...record.auditLog, buildAudit('Refund rejected', 'Refund request declined after review.')],
  }))
}

export async function contactDonor(id: string) {
  await ensureLedger()
  updateLedger([id], (record) => ({
    ...record,
    lastContactedAt: new Date().toISOString(),
    auditLog: [...record.auditLog, buildAudit('Donor contacted', 'Support team sent a follow-up to the donor.')],
  }))
}

export function exportTransactionsCsv(records: TransactionRecord[]) {
  downloadCsv(
    'transactions.csv',
    ['ID', 'Donor', 'Campaign', 'Amount', 'Method', 'Gateway', 'Status', 'Date'],
    records.map((record) => [
      record.id,
      record.donorName,
      record.campaign,
      record.amount,
      record.method,
      record.gateway,
      record.status,
      formatFullDate(record.date),
    ]),
  )
}

export function exportTransactionsPdf(data: TransactionsDashboardData) {
  printHtmlReport('Transactions', 'Payment operations, settlement, and reconciliation snapshot.', [
    renderMetricSection('KPIs', [
      { label: 'Total Transactions', value: String(data.kpis.totalTransactions) },
      { label: 'Successful', value: String(data.kpis.successful) },
      { label: 'Settlement Pending', value: formatIndianCompact(data.kpis.settlementPending) },
      { label: 'Today Volume', value: formatIndianCompact(data.kpis.todayVolume) },
    ]),
    renderTableSection(
      'Settlement Overview',
      ['Gateway', 'Collected', 'Settled', 'Pending'],
      data.settlementOverview.map((item) => [
        item.gateway,
        formatIndianCompact(item.collected),
        formatIndianCompact(item.settled),
        formatIndianCompact(item.pending),
      ]),
    ),
    renderTableSection(
      'Recent Transactions',
      ['ID', 'Donor', 'Amount', 'Gateway', 'Status', 'Date'],
      data.filteredTransactions.slice(0, 8).map((record) => [
        record.id,
        record.donorName,
        formatIndianCompact(record.amount),
        record.gateway,
        record.status,
        formatDate(record.date),
      ]),
    ),
  ])
}
