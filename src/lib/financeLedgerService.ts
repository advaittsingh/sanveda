import { getAllDonations } from './donationService'
import { isSupabaseConfigured, requireSupabase } from './supabase'
import { auditAction } from './auditMiddleware'
import { allowLocalStoragePersistence, readDevStorageList, writeDevStorageList } from './persistMeta'

export interface ReconciliationResult {
  matched: number
  orphanedDonations: string[]
  orphanedTransactions: string[]
  amountMismatch: { id: string; donation: number; ledger: number }[]
  reconciledAt: string
}

export interface LedgerEntry {
  id: string
  type: 'income' | 'expense'
  sourceId: string
  amount: number
  locked: boolean
  createdAt: string
}

const LOCKED_RECEIPTS_KEY = 'sanveda_locked_receipts'
const RECEIPT_LOCK_TYPE = 'tax_receipt'

export async function isReceiptLocked(receiptNumber: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('finance_ledger_locks')
      .select('id')
      .eq('source_type', RECEIPT_LOCK_TYPE)
      .eq('source_id', receiptNumber)
      .maybeSingle()
    if (error) return false
    return Boolean(data)
  }
  return readDevStorageList<string>(LOCKED_RECEIPTS_KEY).includes(receiptNumber)
}

export async function lockReceipt(receiptNumber: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { data: { user } } = await requireSupabase().auth.getUser()
    const { error } = await requireSupabase()
      .from('finance_ledger_locks')
      .upsert({
        source_type: RECEIPT_LOCK_TYPE,
        source_id: receiptNumber,
        locked_by: user?.id ?? null,
        locked_at: new Date().toISOString(),
      }, { onConflict: 'source_type,source_id' })
    if (error) throw new Error(error.message)
    return
  }
  if (!allowLocalStoragePersistence()) return
  const set = new Set(readDevStorageList<string>(LOCKED_RECEIPTS_KEY))
  set.add(receiptNumber)
  writeDevStorageList(LOCKED_RECEIPTS_KEY, [...set])
}

export async function reconcileDonationsWithLedger(): Promise<ReconciliationResult> {
  const donations = await getAllDonations()
  const orphanedDonations: string[] = []
  const orphanedTransactions: string[] = []
  const amountMismatch: ReconciliationResult['amountMismatch'] = []

  if (isSupabaseConfigured) {
    const { data: incomeRows, error } = await requireSupabase()
      .from('income_records')
      .select('id, amount, reference_id, source')
      .eq('source', 'donation')

    if (error) throw new Error(error.message)

    const incomeBySource = new Map(
      (incomeRows ?? []).map((r) => [String(r.reference_id), Number(r.amount)]),
    )

    for (const d of donations) {
      if (d.status !== 'completed') continue
      const ledgerAmount = incomeBySource.get(d.id)
      if (ledgerAmount === undefined) {
        orphanedDonations.push(d.id)
      } else if (Math.abs(ledgerAmount - d.amount) > 0.01) {
        amountMismatch.push({ id: d.id, donation: d.amount, ledger: ledgerAmount })
      }
    }

    for (const [sourceId] of incomeBySource) {
      if (!donations.some((d) => d.id === sourceId)) {
        orphanedTransactions.push(sourceId)
      }
    }
  }

  const result: ReconciliationResult = {
    matched: donations.filter((d) => d.status === 'completed').length - orphanedDonations.length - amountMismatch.length,
    orphanedDonations,
    orphanedTransactions,
    amountMismatch,
    reconciledAt: new Date().toISOString(),
  }

  await auditAction('RECONCILE', 'finance', undefined, {
    matched: result.matched,
    orphans: orphanedDonations.length + orphanedTransactions.length,
    mismatches: amountMismatch.length,
  })

  return result
}

export async function assertReceiptMutable(receiptNumber: string): Promise<void> {
  if (await isReceiptLocked(receiptNumber)) {
    throw new Error(`Tax receipt ${receiptNumber} is locked and cannot be modified.`)
  }
}

export async function finalizeReceipt(receiptNumber: string): Promise<void> {
  await lockReceipt(receiptNumber)
}
