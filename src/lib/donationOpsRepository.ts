import { isSupabaseConfigured, requireSupabase } from './supabase'
import { allowLocalStoragePersistence, readPersistedMetaMap, writePersistedMetaMap } from './persistMeta'

const META_KEY = 'sanveda_donation_admin_meta'

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

function metaToLocalRecord(meta: DonationOpsMetaRow): Record<string, unknown> {
  return {
    source: meta.source,
    gateway: meta.gateway,
    paymentMethod: meta.paymentMethod,
    taxExemption: meta.taxExemption,
    complianceType: meta.complianceType,
    notes: meta.notes,
    verifiedAt: meta.verifiedAt,
    requestedInfoAt: meta.requestedInfoAt,
    receiptSentAt: meta.receiptSentAt,
    receiptDownloadedAt: meta.receiptDownloadedAt,
    receiptReissuedAt: meta.receiptReissuedAt,
    refundStatus: meta.refundStatus,
    refundReason: meta.refundReason,
    pendingDocuments: meta.pendingDocuments,
  }
}

function readLocalMetaMap(): Record<string, DonationOpsMetaRow> {
  const raw = readPersistedMetaMap<Record<string, unknown>>(META_KEY)
  const out: Record<string, DonationOpsMetaRow> = {}
  for (const [id, value] of Object.entries(raw)) {
    out[id] = { donationId: id, ...value } as DonationOpsMetaRow
  }
  return out
}

export async function fetchAllOpsMeta(): Promise<Record<string, DonationOpsMetaRow>> {
  if (!isSupabaseConfigured) {
    return allowLocalStoragePersistence() ? readLocalMetaMap() : {}
  }

  const { data, error } = await requireSupabase().from('donation_ops_meta').select('*')
  if (error) {
    if (error.code === '42P01') return allowLocalStoragePersistence() ? readLocalMetaMap() : {}
    throw new Error(error.message)
  }

  const map: Record<string, DonationOpsMetaRow> = {}
  for (const row of data ?? []) {
    const meta = rowToMeta(row as Record<string, unknown>)
    map[meta.donationId] = meta
  }
  return map
}

export async function upsertOpsMeta(donationId: string, patch: Partial<DonationOpsMetaRow>): Promise<void> {
  if (!isSupabaseConfigured) {
    if (!allowLocalStoragePersistence()) return
    const map = readPersistedMetaMap<Record<string, unknown>>(META_KEY)
    map[donationId] = { ...(map[donationId] ?? {}), ...metaToLocalRecord({ donationId, ...patch }) }
    writePersistedMetaMap(META_KEY, map)
    return
  }

  const row = {
    donation_id: donationId,
    source: patch.source ?? null,
    gateway: patch.gateway ?? null,
    payment_method: patch.paymentMethod ?? null,
    tax_exemption: patch.taxExemption ?? null,
    compliance_type: patch.complianceType ?? null,
    notes: patch.notes ?? null,
    verified_at: patch.verifiedAt ?? null,
    requested_info_at: patch.requestedInfoAt ?? null,
    receipt_sent_at: patch.receiptSentAt ?? null,
    receipt_downloaded_at: patch.receiptDownloadedAt ?? null,
    receipt_reissued_at: patch.receiptReissuedAt ?? null,
    refund_status: patch.refundStatus ?? null,
    refund_reason: patch.refundReason ?? null,
    pending_documents: patch.pendingDocuments ?? null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await requireSupabase()
    .from('donation_ops_meta')
    .upsert(row, { onConflict: 'donation_id' })

  if (error && error.code !== '42P01') throw new Error(error.message)
}

export async function fetchRefunds(): Promise<DonationRefundRow[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await requireSupabase()
    .from('donation_refunds')
    .select('*')
    .order('initiated_at', { ascending: false })

  if (error) {
    if (error.code === '42P01') return []
    throw new Error(error.message)
  }

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

  if (!isSupabaseConfigured) return null

  const { data: { user } } = await requireSupabase().auth.getUser()
  const { data, error } = await requireSupabase()
    .from('donation_refunds')
    .insert({
      donation_id: donationId,
      reason,
      amount,
      status: 'pending',
      initiated_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '42P01') return null
    throw new Error(error.message)
  }

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
  if (isSupabaseConfigured) {
    const patch: Record<string, unknown> = { status }
    if (status === 'completed') patch.completed_at = new Date().toISOString()

    const { error } = await requireSupabase()
      .from('donation_refunds')
      .update(patch)
      .eq('id', refundId)

    if (error && error.code !== '42P01') throw new Error(error.message)
  }

  await upsertOpsMeta(donationId, { refundStatus: status })
}

export async function recordReceiptEvent(
  donationId: string,
  receiptNumber: string,
  event: 'generated' | 'emailed' | 'downloaded' | 'reissued',
): Promise<void> {
  const now = new Date().toISOString()
  const metaPatch: Partial<DonationOpsMetaRow> =
    event === 'emailed' ? { receiptSentAt: now } :
    event === 'downloaded' ? { receiptDownloadedAt: now } :
    event === 'reissued' ? { receiptReissuedAt: now } : {}

  if (Object.keys(metaPatch).length) await upsertOpsMeta(donationId, metaPatch)

  if (!isSupabaseConfigured) return

  const fy = `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`

  if (event === 'generated') {
    await requireSupabase().from('donation_receipts').insert({
      donation_id: donationId,
      receipt_number: receiptNumber,
      financial_year: fy,
      receipt_type: '80G',
      generated_at: now,
    }).then(({ error }) => { if (error && error.code !== '42P01') console.error(error) })

    await requireSupabase().from('donations').update({
      receipt_generated: true,
      updated_at: now,
    }).eq('id', donationId)
    return
  }

  const receiptPatch =
    event === 'emailed' ? { emailed_at: now, receipt_sent: true } :
    { downloaded_at: now, receipt_downloaded: true }

  await requireSupabase()
    .from('donation_receipts')
    .update(receiptPatch)
    .eq('donation_id', donationId)
    .then(({ error }) => { if (error && error.code !== '42P01') console.error(error) })

  await requireSupabase().from('donations').update({
    ...receiptPatch,
    updated_at: now,
  }).eq('id', donationId)
}

export async function fetchReconciliation(): Promise<PaymentReconciliationRow[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await requireSupabase()
    .from('payment_reconciliation')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    if (error.code === '42P01') return []
    throw new Error(error.message)
  }

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
  if (!isSupabaseConfigured) return []

  const { data, error } = await requireSupabase()
    .from('audit_logs')
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
