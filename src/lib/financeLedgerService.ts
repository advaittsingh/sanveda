import { readDevStorageList, writeDevStorageList } from './persistMeta'
import { getAllDonations } from './donationService'
import { isSupabaseConfigured, requireSupabase } from './supabase'
import { auditAction } from './auditMiddleware'

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

/** Demo/dev lock set for tax receipts (immutable once issued). */
export function isReceiptLocked(receiptNumber: string): boolean {
  const set = readDevStorageList<string>(LOCKED_RECEIPTS_KEY)
  return set.includes(receiptNumber)
}

export function lockReceipt(receiptNumber: string): void {
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
    const { data: incomeRows } = await requireSupabase()
      .from('income_records')
      .select('id, amount, source_id, source_type')
      .eq('source_type', 'donation')

    const incomeBySource = new Map(
      (incomeRows ?? []).map((r) => [String(r.source_id), Number(r.amount)]),
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
  if (isReceiptLocked(receiptNumber)) {
    throw new Error(`Tax receipt ${receiptNumber} is locked and cannot be modified.`)
  }
}

export function finalizeReceipt(receiptNumber: string): void {
  lockReceipt(receiptNumber)
}
