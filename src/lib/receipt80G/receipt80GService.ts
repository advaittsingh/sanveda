import type { Donation } from '../donationService'
import { ensureDonationReceipt, getDonationById } from '../donationService'
import type { DonationOpsRecord } from '../donationOperationsService'
import { donationReceiptEmailHtml, sendTransactionalEmail } from '../emailService'
import { withAudit } from '../auditMiddleware'
import { registerVerification } from '../verificationService'
import { buildReceipt80GData } from './buildReceiptData'
import { generateReceipt80GHtml } from './generateReceiptHtml'
import { downloadReceipt80GPdfBlob, generateReceipt80GPdf } from './receipt80GPdf'
import type { Receipt80GData } from './types'

export type { Receipt80GData, NgoReceiptProfile } from './types'
export { amountInWordsINR } from './amountInWords'
export { loadNgoReceiptProfile } from './ngoProfile'

export async function prepareReceipt80G(
  donation: Donation | DonationOpsRecord,
  options?: { isReissued?: boolean },
): Promise<Receipt80GData> {
  return buildReceipt80GData(donation, options)
}

export async function getReceipt80GForDonationId(
  donationId: string,
  options?: { isReissued?: boolean },
): Promise<Receipt80GData | null> {
  const donation = await getDonationById(donationId)
  if (!donation?.receiptNumber && donation?.status !== 'completed') return null
  const withReceipt = donation.receiptNumber ? donation : await ensureDonationReceipt(donationId)
  if (!withReceipt) return null
  return buildReceipt80GData(withReceipt, options)
}

export function printReceipt80G(data: Receipt80GData): void {
  const html = generateReceipt80GHtml(data, { forPrint: true })
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100')
  if (!win) return
  win.document.write(html)
  win.document.close()
}

export async function downloadReceipt80G(data: Receipt80GData): Promise<void> {
  const blob = await generateReceipt80GPdf(data)
  downloadReceipt80GPdfBlob(blob, data.receiptNumber)
}

export function viewReceipt80GHtml(data: Receipt80GData): void {
  const html = generateReceipt80GHtml(data)
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100')
  if (!win) return
  win.document.write(html)
  win.document.close()
}

export async function emailReceipt80G(data: Receipt80GData): Promise<boolean> {
  if (!data.email || data.email === '—') return false
  return sendTransactionalEmail(
    data.email,
    `Your ${data.ngo.ngoName} Donation Receipt — ${data.receiptNumber}`,
    donationReceiptEmailHtml({
      donorName: data.donorName,
      amount: data.amount,
      campaignTitle: data.campaign,
      receiptNumber: data.receiptNumber,
    }),
    'donation_receipt',
  )
}

export function copyReceiptVerificationLink(data: Receipt80GData): Promise<void> {
  return navigator.clipboard.writeText(data.verificationUrl)
}

export async function regenerateReceipt80G(donationId: string): Promise<Receipt80GData | null> {
  return withAudit('REGENERATE_RECEIPT', 'donations', donationId, async () => {
    const updated = await ensureDonationReceipt(donationId)
    if (!updated?.receiptNumber) return null
    await registerVerification({
      type: 'donation_receipt',
      holderName: updated.isAnonymous ? 'Donor' : (updated.donorName ?? 'Donor'),
      referenceId: updated.receiptNumber,
      metadata: { donationId: updated.id, amount: updated.amount, campaignTitle: updated.campaignTitle },
    }).catch(() => {})
    return buildReceipt80GData(updated, { isReissued: true })
  })
}

/** Legacy bridge for donationService.downloadReceipt */
export async function downloadReceiptForDonation(donation: Donation): Promise<void> {
  const data = await buildReceipt80GData(donation)
  await downloadReceipt80G(data)
}

export function generateReceiptHtml(donation: Donation): Promise<string> {
  return buildReceipt80GData(donation).then((data) => generateReceipt80GHtml(data))
}
