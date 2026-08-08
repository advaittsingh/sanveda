import type { Donation } from '../donationService'
import { ensureDonationReceipt, getDonationById, getDonationReceiptSnapshot } from '../donationService'
import type { DonationOpsRecord } from '../donationOperationsService'
import { donationReceiptEmailHtml, sendTransactionalEmail } from '../emailService'
import { withAudit } from '../auditMiddleware'
import { buildReceipt80GData, presentString } from './buildReceiptData'
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

/** Print via a hidden iframe so browsers do not treat this as a blocked pop-up. */
async function printHtmlDocument(html: string): Promise<void> {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.title = 'receipt-print'
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    iframe.remove()
    throw new Error('Could not open the print dialog for this receipt.')
  }

  doc.open()
  doc.write(html)
  doc.close()

  const images = Array.from(doc.images)
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  )
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  try {
    win.focus()
    win.print()
  } finally {
    window.setTimeout(() => iframe.remove(), 1500)
  }
}

export async function getReceipt80GForDonationId(
  donationId: string,
  options?: { isReissued?: boolean },
): Promise<Receipt80GData | null> {
  const donation = await getDonationById(donationId)
  if (!donation) return null
  if (donation.status !== 'completed' && !donation.receiptNumber) return null

  const withReceipt = donation.receiptNumber ? donation : (await ensureDonationReceipt(donationId)) ?? donation
  if (withReceipt.status !== 'completed' && !withReceipt.receiptNumber) return null

  let snapshot: Record<string, unknown> = {}
  try {
    snapshot = (await getDonationReceiptSnapshot(donationId)) ?? {}
  } catch {
    // Snapshot is enrichment only — still build a usable receipt from the donation row.
  }

  const snapDonor = presentString(snapshot.donorName) ?? presentString(snapshot.donor)
  const snapCampaign = presentString(snapshot.campaignTitle) ?? presentString(snapshot.campaign)
  const snapPaidAt =
    presentString(snapshot.paidAt) ??
    presentString(snapshot.createdAt) ??
    presentString(snapshot.donationDate)
  const snapReceiptNumber = presentString(snapshot.receiptNumber)
  const snapPaymentId = presentString(snapshot.paymentId)

  return buildReceipt80GData({
    ...withReceipt,
    receiptNumber: snapReceiptNumber ?? withReceipt.receiptNumber,
    donorName: snapDonor ?? withReceipt.donorName,
    donorEmail: presentString(snapshot.donorEmail) ?? withReceipt.donorEmail,
    donorPhone: presentString(snapshot.donorPhone) ?? withReceipt.donorPhone,
    isAnonymous:
      snapshot.isAnonymous != null ? Boolean(snapshot.isAnonymous) : withReceipt.isAnonymous,
    panNumber: presentString(snapshot.pan) ?? withReceipt.panNumber,
    amount: Number(snapshot.amount ?? withReceipt.amount),
    currency: presentString(snapshot.currency) ?? withReceipt.currency ?? 'INR',
    campaignTitle: snapCampaign ?? withReceipt.campaignTitle,
    razorpayPaymentId: snapPaymentId ?? withReceipt.razorpayPaymentId,
    createdAt: snapPaidAt ?? withReceipt.createdAt,
  }, options)
}

export async function printReceipt80G(data: Receipt80GData): Promise<void> {
  // Omit the inline window.print() script — we trigger print after images settle.
  await printHtmlDocument(generateReceipt80GHtml(data))
}

export async function downloadReceipt80G(data: Receipt80GData): Promise<void> {
  const blob = await generateReceipt80GPdf(data)
  downloadReceipt80GPdfBlob(blob, data.receiptNumber)
}

/** Opens the receipt HTML in a new tab (fallback when no in-app viewer is wired). */
export function viewReceipt80GHtml(data: Receipt80GData): void {
  const html = generateReceipt80GHtml(data)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    URL.revokeObjectURL(url)
    throw new Error('Pop-up blocked. Use the in-app receipt preview, or allow pop-ups for this site.')
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Download the 80G PDF for a donation id (shared by Donations + Transactions admin). */
export async function downloadReceiptForDonationId(donationId: string): Promise<void> {
  const data = await getReceipt80GForDonationId(donationId)
  if (data) {
    await downloadReceipt80G(data)
    return
  }
  const donation = await getDonationById(donationId)
  if (!donation || donation.status !== 'completed') {
    throw new Error('No completed donation receipt is available for download.')
  }
  await downloadReceiptForDonation(donation)
}

export async function emailReceipt80G(data: Receipt80GData): Promise<boolean> {
  if (!data.email || data.email === '—') {
    throw new Error('This donation has no donor email address for receipt delivery.')
  }
  await sendTransactionalEmail(
    data.email,
    `Your ${data.ngo.ngoName} Donation Receipt — ${data.receiptNumber}`,
    donationReceiptEmailHtml({
      donorName: data.donorName,
      amount: data.amount,
      campaignTitle: data.campaign,
      receiptNumber: data.receiptNumber,
      verificationUrl: data.verificationUrl || undefined,
    }),
    'donation_receipt',
  )
  return true
}

export function copyReceiptVerificationLink(data: Receipt80GData): Promise<void> {
  return navigator.clipboard.writeText(data.verificationUrl)
}

export async function regenerateReceipt80G(donationId: string): Promise<Receipt80GData | null> {
  return withAudit('REGENERATE_RECEIPT', 'donations', donationId, async () => {
    const updated = await ensureDonationReceipt(donationId)
    if (!updated) return null
    return getReceipt80GForDonationId(donationId, { isReissued: true })
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
