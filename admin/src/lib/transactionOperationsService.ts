import { withAudit } from './auditMiddleware'
import { downloadCsv } from './adminExport'
import { createRefundRequest } from './donationOpsRepository'
import { dataApi } from './dataApiClient'
import { formatIndianCompact } from './formatIndian'
import { refundRazorpayPayment } from './paymentService'
import { downloadReportPdf } from './reportPdfClient'

export type TransactionStatus = 'success' | 'pending' | 'failed' | 'refunded'
export type TransactionGateway = 'Razorpay' | 'UPI' | 'Bank'
export type TransactionMethod = 'UPI' | 'Card' | 'Netbanking' | 'Wallet' | 'Bank Transfer'
export type TransactionRange = 'all' | 'today' | '7d' | '30d' | 'custom'
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
  settlementOverview: Array<{
    gateway: TransactionGateway
    collected: number
    settled: number
    pending: number
  }>
  failedTransactions: TransactionRecord[]
  reconciliation: { gateway: number; bank: number; difference: number }
  refundRequests: TransactionRecord[]
  auditLog: TransactionAuditLog[]
}

const GATEWAYS: TransactionGateway[] = ['Razorpay', 'UPI', 'Bank']

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatFullDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function startForRange(filters: TransactionFilters) {
  const now = new Date()
  switch (filters.range) {
    case 'all':
      return new Date(0)
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case '7d':
      return new Date(now.getTime() - 7 * 86400000)
    case 'custom':
      return filters.customStart
        ? new Date(filters.customStart)
        : new Date(now.getTime() - 30 * 86400000)
    default:
      return new Date(now.getTime() - 30 * 86400000)
  }
}

function endForRange(filters: TransactionFilters) {
  if (filters.range === 'all') return new Date(8640000000000000)
  if (filters.range === 'custom' && filters.customEnd) {
    const end = new Date(filters.customEnd)
    return new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
  }
  return new Date(Date.now() + 86400000)
}

function gatewayFor(value: unknown): TransactionGateway {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized.includes('bank')) return 'Bank'
  if (normalized === 'upi') return 'UPI'
  return 'Razorpay'
}

function methodFor(payload: unknown, gateway: TransactionGateway): TransactionMethod {
  const method =
    payload && typeof payload === 'object'
      ? String((payload as Record<string, unknown>).method ?? '')
      : ''
  if (method === 'card') return 'Card'
  if (method === 'netbanking') return 'Netbanking'
  if (method === 'wallet') return 'Wallet'
  if (method === 'upi') return 'UPI'
  return gateway === 'Bank' ? 'Bank Transfer' : 'UPI'
}

async function fetchLedger(): Promise<TransactionRecord[]> {
  const [
    { data: donations, error },
    { data: transactions, error: transactionError },
    { data: refunds, error: refundError },
    { data: audits, error: auditError },
  ] = await Promise.all([
    dataApi.table('donations').select('*').order('created_at', { ascending: false }),
    dataApi.table('payment_transactions').select('*').order('occurred_at', { ascending: false }),
    dataApi.table('donation_refunds').select('*').order('initiated_at', { ascending: false }),
    dataApi
      .table('audit_logs')
      .select('*')
      .eq('entity_type', 'donations')
      .order('occurred_at', { ascending: false })
      .limit(500),
  ])
  if (error) throw new Error(error.message)
  if (transactionError) throw new Error(transactionError.message)
  if (refundError) throw new Error(refundError.message)
  if (auditError) throw new Error(auditError.message)

  return (donations ?? []).map((donation) => {
    const payment = (transactions ?? []).find((row) => row.donation_id === donation.id)
    const refund = (refunds ?? []).find((row) => row.donation_id === donation.id)
    const gateway = gatewayFor(payment?.gateway ?? donation.payment_gateway)
    const amount = Number(donation.amount)
    const status: TransactionStatus =
      donation.status === 'completed' ? 'success' : (donation.status as TransactionStatus)
    const refundStatus =
      refund?.status === 'completed' ? 'processed' : refund ? 'requested' : 'none'
    const settledAt = payment?.status === 'settled' ? String(payment.occurred_at) : undefined
    const gatewayPayload = payment?.gateway_payload
    const failureReason =
      gatewayPayload && typeof gatewayPayload === 'object'
        ? String((gatewayPayload as Record<string, unknown>).error_description ?? '')
        : undefined
    return {
      id: String(donation.id),
      donorName: donation.is_anonymous
        ? 'Anonymous'
        : String(donation.donor_name ?? donation.donor_email ?? 'Donor'),
      donorEmail: String(donation.donor_email ?? ''),
      campaign: String(donation.campaign_title),
      amount,
      method: methodFor(gatewayPayload, gateway),
      gateway,
      status,
      date: String(payment?.occurred_at ?? donation.created_at),
      settlementStatus: settledAt ? 'settled' : 'pending',
      settledAt,
      refundStatus,
      refundReason: refund?.reason ? String(refund.reason) : undefined,
      refundRequestedAt: refund?.initiated_at ? String(refund.initiated_at) : undefined,
      refundRisk: refund
        ? amount >= 5000
          ? 'high'
          : amount >= 2000
            ? 'medium'
            : 'low'
        : undefined,
      failureReason: failureReason || undefined,
      gatewayReference: String(
        payment?.gateway_payment_id ??
          payment?.gateway_order_id ??
          donation.razorpay_payment_id ??
          donation.razorpay_order_id ??
          '',
      ),
      auditLog: (audits ?? [])
        .filter((row) => row.entity_id === donation.id)
        .map((row) => ({
          id: String(row.id),
          title: String(row.action),
          detail: JSON.stringify(row.details ?? {}),
          at: String(row.occurred_at),
        })),
    }
  })
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

export async function getTransactionsDashboardData(
  filters: TransactionFilters,
): Promise<TransactionsDashboardData> {
  const allTransactions = await fetchLedger()
  const filteredTransactions = filterTransactions(allTransactions, filters)
  const todayStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  ).toISOString()

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
      .filter(
        (record) =>
          record.date >= bucket.start.toISOString() && record.date < bucket.end.toISOString(),
      )
      .reduce((sum, record) => sum + record.amount, 0),
  }))

  const paymentMethodDistribution = Array.from(
    filteredTransactions.reduce((acc, record) => {
      acc.set(record.method, (acc.get(record.method) ?? 0) + record.amount)
      return acc
    }, new Map<string, number>()),
  ).map(([label, value]) => ({ label, value }))

  const settlementOverview = GATEWAYS.map((gateway) => {
    const items = allTransactions.filter(
      (record) => record.gateway === gateway && record.status === 'success',
    )
    return {
      gateway,
      collected: items.reduce((sum, record) => sum + record.amount, 0),
      settled: items
        .filter((record) => record.settlementStatus === 'settled')
        .reduce((sum, record) => sum + record.amount, 0),
      pending: items
        .filter((record) => record.settlementStatus === 'pending')
        .reduce((sum, record) => sum + record.amount, 0),
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
  void id
  throw new Error(
    'Failed payments cannot be marked successful manually. The donor must complete a new gateway-verified checkout.',
  )
}

export async function markTransactionsSettled(ids: string[]) {
  if (!ids.length) return
  const { error } = await dataApi
    .table('payment_transactions')
    .update({
      status: 'settled',
      occurred_at: new Date().toISOString(),
    })
    .in('donation_id', ids)
  if (error) throw new Error(error.message)
}

export async function requestTransactionRefund(id: string, reason: string) {
  const { data, error } = await dataApi.table('donations').select('amount').eq('id', id).single()
  if (error) throw new Error(error.message)
  await createRefundRequest(id, reason, Number(data.amount))
}

export async function approveRefundRequest(id: string) {
  return withAudit('APPROVE', 'transactions', id, async () => {
    const { data, error } = await dataApi
      .table('donation_refunds')
      .select('id')
      .eq('donation_id', id)
      .eq('status', 'pending')
      .order('initiated_at', { ascending: false })
      .limit(1)
    if (error) throw new Error(error.message)
    const refundId = data?.[0]?.id
    if (!refundId) throw new Error('No pending refund request exists for this transaction')
    await refundRazorpayPayment(String(refundId))
  })
}

export async function rejectRefundRequest(id: string) {
  return withAudit('REJECT', 'transactions', id, async () => {
    const { error } = await dataApi
      .table('donation_refunds')
      .update({ status: 'rejected' })
      .eq('donation_id', id)
      .eq('status', 'pending')
    if (error) throw new Error(error.message)
  })
}

export async function contactDonor(id: string) {
  const { error } = await dataApi.table('audit_logs').insert({
    action: 'DONOR_CONTACT_RECORDED',
    entity_type: 'donations',
    entity_id: id,
    details: {},
  })
  if (error) throw new Error(error.message)
}

/**
 * Export transactions to CSV. Always exports the full provided list (not a table page).
 * Callers must pass every record matching current filters — never a paginated slice.
 */
export function exportTransactionsCsv(records: TransactionRecord[]) {
  const list = Array.isArray(records) ? records : []
  downloadCsv(
    'transactions.csv',
    ['ID', 'Donor', 'Campaign', 'Amount', 'Method', 'Gateway', 'Status', 'Date'],
    list.map((record) => [
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

export async function exportTransactionsPdf(data: TransactionsDashboardData): Promise<void> {
  await downloadReportPdf({
    filename: `transactions-${new Date().toISOString().slice(0, 10)}.pdf`,
    title: 'Transactions',
    subtitle: 'Payment operations, settlement, and reconciliation snapshot.',
    metrics: [
      { label: 'Total Transactions', value: String(data.kpis.totalTransactions) },
      { label: 'Successful', value: String(data.kpis.successful) },
      { label: 'Settlement Pending', value: formatIndianCompact(data.kpis.settlementPending) },
      { label: 'Today Volume', value: formatIndianCompact(data.kpis.todayVolume) },
    ],
    tables: [
      {
        title: 'Settlement Overview',
        headers: ['Gateway', 'Collected', 'Settled', 'Pending'],
        rows: data.settlementOverview.map((item) => [
          item.gateway,
          formatIndianCompact(item.collected),
          formatIndianCompact(item.settled),
          formatIndianCompact(item.pending),
        ]),
      },
      {
        title: 'Recent Transactions',
        headers: ['ID', 'Donor', 'Amount', 'Gateway', 'Status', 'Date'],
        rows: data.filteredTransactions
          .slice(0, 50)
          .map((record) => [
            record.id,
            record.donorName,
            formatIndianCompact(record.amount),
            record.gateway,
            record.status,
            formatDate(record.date),
          ]),
      },
    ],
  })
}
