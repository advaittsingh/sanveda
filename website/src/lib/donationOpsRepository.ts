import { dataApi } from './dataApiClient'

export type RefundWorkflowStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'

export interface DonationOpsMetaRow {
  donationId: string
  source?: string
  gateway?: string
  paymentMethod?: string
  taxExemption?: string
  complianceType?: string
  notes?: string
  verifiedAt?: string
  requestedInfoAt?: string
  receiptSentAt?: string
  receiptDownloadedAt?: string
  receiptReissuedAt?: string
  refundStatus?: string
  refundReason?: string
  pendingDocuments?: string[]
}

export interface DonationRefundRow {
  id: string
  donationId: string
  reason: string
  amount: number
  status: RefundWorkflowStatus
  notes?: string
  initiatedAt: string
  completedAt?: string
}

export interface PaymentReconciliationRow {
  id: string
  periodStart?: string
  periodEnd?: string
  gatewayAmount: number
  bankAmount: number
  variance: number
  status: 'pending' | 'matched' | 'variance' | 'review'
  reconciledAt?: string
}

function rowToMeta(row: Record<string, unknown>): DonationOpsMetaRow {
  return {
    donationId: String(row.donation_id),
    source: row.source ? String(row.source) : undefined,
    gateway: row.gateway ? String(row.gateway) : undefined,
    paymentMethod: row.payment_method ? String(row.payment_method) : undefined,
    taxExemption: row.tax_exemption ? String(row.tax_exemption) : undefined,
    complianceType: row.compliance_type ? String(row.compliance_type) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    verifiedAt: row.verified_at ? String(row.verified_at) : undefined,
    requestedInfoAt: row.requested_info_at ? String(row.requested_info_at) : undefined,
    receiptSentAt: row.receipt_sent_at ? String(row.receipt_sent_at) : undefined,
    receiptDownloadedAt: row.receipt_downloaded_at ? String(row.receipt_downloaded_at) : undefined,
    receiptReissuedAt: row.receipt_reissued_at ? String(row.receipt_reissued_at) : undefined,
    refundStatus: row.refund_status ? String(row.refund_status) : undefined,
    refundReason: row.refund_reason ? String(row.refund_reason) : undefined,
    pendingDocuments: Array.isArray(row.pending_documents)
      ? (row.pending_documents as string[])
      : undefined,
  }
}

export async function fetchAllOpsMeta(): Promise<Record<string, DonationOpsMetaRow>> {
  const { data, error } = await dataApi.table('donation_ops_meta').select('*')
  if (error) throw new Error(error.message)

  const map: Record<string, DonationOpsMetaRow> = {}
  for (const row of data ?? []) {
    const meta = rowToMeta(row as Record<string, unknown>)
    map[meta.donationId] = meta
  }
  return map
}

/** Partial upsert — only writes fields present on the patch (never nulls unrelated columns). */
export async function upsertOpsMeta(donationId: string, patch: Partial<DonationOpsMetaRow>): Promise<void> {
  const row: Record<string, unknown> = {
    donation_id: donationId,
    updated_at: new Date().toISOString(),
  }

  if (patch.source !== undefined) row.source = patch.source
  if (patch.gateway !== undefined) row.gateway = patch.gateway
  if (patch.paymentMethod !== undefined) row.payment_method = patch.paymentMethod
  if (patch.taxExemption !== undefined) row.tax_exemption = patch.taxExemption
  if (patch.complianceType !== undefined) row.compliance_type = patch.complianceType
  if (patch.notes !== undefined) row.notes = patch.notes
  if (patch.verifiedAt !== undefined) row.verified_at = patch.verifiedAt
  if (patch.requestedInfoAt !== undefined) row.requested_info_at = patch.requestedInfoAt
  if (patch.receiptSentAt !== undefined) row.receipt_sent_at = patch.receiptSentAt
  if (patch.receiptDownloadedAt !== undefined) row.receipt_downloaded_at = patch.receiptDownloadedAt
  if (patch.receiptReissuedAt !== undefined) row.receipt_reissued_at = patch.receiptReissuedAt
  if (patch.refundStatus !== undefined) row.refund_status = patch.refundStatus
  if (patch.refundReason !== undefined) row.refund_reason = patch.refundReason
  if (patch.pendingDocuments !== undefined) row.pending_documents = patch.pendingDocuments

  const { error } = await dataApi
    .table('donation_ops_meta')
    .upsert(row, { onConflict: 'donation_id' })

  if (error) throw new Error(error.message)
}

export async function fetchRefunds(): Promise<DonationRefundRow[]> {
  const { data, error } = await dataApi
    .table('donation_refunds')
    .select('*')
    .order('initiated_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: String(row.id),
    donationId: String(row.donation_id),
    reason: String(row.reason),
    amount: Number(row.amount),
    status: row.status as RefundWorkflowStatus,
    notes: row.notes ? String(row.notes) : undefined,
    initiatedAt: String(row.initiated_at),
    completedAt: row.completed_at ? String(row.completed_at) : undefined,
  }))
}

export async function createRefundRequest(
  donationId: string,
  reason: string,
  amount: number,
): Promise<DonationRefundRow | null> {
  await upsertOpsMeta(donationId, { refundStatus: 'requested', refundReason: reason })

  const { data, error } = await dataApi
    .table('donation_refunds')
    .insert({
      donation_id: donationId,
      reason,
      amount,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return {
    id: String(data.id),
    donationId,
    reason,
    amount,
    status: 'pending',
    initiatedAt: String(data.initiated_at),
  }
}

export async function updateRefundStatus(
  refundId: string,
  status: RefundWorkflowStatus,
  donationId: string,
): Promise<void> {
  const patch: Record<string, unknown> = { status }
  if (status === 'completed') patch.completed_at = new Date().toISOString()

  const { error } = await dataApi
    .table('donation_refunds')
    .update(patch)
    .eq('id', refundId)

  if (error) throw new Error(error.message)

  await upsertOpsMeta(donationId, { refundStatus: status })
}

export async function recordReceiptEvent(
  donationId: string,
  _receiptNumber: string,
  event: 'generated' | 'emailed' | 'downloaded' | 'reissued',
): Promise<void> {
  const now = new Date().toISOString()
  const metaPatch: Partial<DonationOpsMetaRow> =
    event === 'emailed' ? { receiptSentAt: now } :
    event === 'downloaded' ? { receiptDownloadedAt: now } :
    event === 'reissued' ? { receiptReissuedAt: now } : {}

  if (Object.keys(metaPatch).length) await upsertOpsMeta(donationId, metaPatch)

  if (event === 'generated') {
    const { error } = await dataApi.table('donations').update({
      receipt_generated: true,
      updated_at: now,
    }).eq('id', donationId)
    if (error) throw new Error(error.message)
    return
  }

  if (event === 'reissued') {
    return
  }

  const receiptPatch = event === 'emailed' ? { emailed_at: now } : { downloaded_at: now }
  const donationPatch = event === 'emailed' ? { receipt_sent: true } : { receipt_downloaded: true }

  const { error: receiptError } = await dataApi
    .table('donation_receipts')
    .update(receiptPatch)
    .eq('donation_id', donationId)
  // Receipt row may be missing for legacy donations; ops meta + donations flags still matter.
  if (receiptError && receiptError.code !== '42P01') {
    console.warn('[receipt] donation_receipts update skipped:', receiptError.message)
  }

  const { error: donationError } = await dataApi.table('donations').update({
    ...donationPatch,
    updated_at: now,
  }).eq('id', donationId)
  if (donationError) throw new Error(donationError.message)
}

export async function fetchReconciliation(): Promise<PaymentReconciliationRow[]> {
  const { data, error } = await dataApi
    .table('payment_reconciliation')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: String(row.id),
    periodStart: row.period_start ? String(row.period_start) : undefined,
    periodEnd: row.period_end ? String(row.period_end) : undefined,
    gatewayAmount: Number(row.gateway_amount ?? 0),
    bankAmount: Number(row.bank_amount ?? 0),
    variance: Number(row.variance ?? 0),
    status: row.status as PaymentReconciliationRow['status'],
    reconciledAt: row.reconciled_at ? String(row.reconciled_at) : undefined,
  }))
}

export async function getAuditLogsForDonation(donationId: string, limit = 20) {
  const { data, error } = await dataApi
    .table('audit_logs')
    .select('*')
    .eq('entity_type', 'donations')
    .eq('entity_id', donationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []

  return (data ?? []).map((row) => ({
    id: String(row.id),
    action: String(row.action),
    detail: JSON.stringify(row.details ?? {}),
    at: String(row.created_at),
  }))
}
