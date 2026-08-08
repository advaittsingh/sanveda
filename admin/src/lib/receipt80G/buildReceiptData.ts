import QRCode from 'qrcode'
import type { Donation } from '../donationService'
import type { DonationOpsRecord } from '../donationOperationsService'
import { ensureVerificationCode } from '../verificationService'
import { amountInWordsINR } from './amountInWords'
import { financialYearFromDate, loadNgoReceiptProfile } from './ngoProfile'
import type { Receipt80GData } from './types'

function verifyOrigin(fallback: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return fallback.replace(/\/$/, '')
}

type DonationInput = Donation | DonationOpsRecord

/** Reject nullish values and the literal strings "undefined" / "null" from bad coercions. */
export function presentString(value: unknown): string | undefined {
  if (value == null) return undefined
  const text = String(value).trim()
  if (!text || text === 'undefined' || text === 'null' || text === 'Invalid Date') return undefined
  return text
}

function resolveCreatedAt(donation: DonationInput): string {
  const raw =
    presentString(donation.createdAt) ??
    presentString((donation as { date?: unknown }).date) ??
    presentString((donation as { paidAt?: unknown }).paidAt)
  if (raw) {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }
  return new Date().toISOString()
}

function resolveCampaign(donation: DonationInput): string {
  return (
    presentString(donation.campaignTitle) ??
    presentString((donation as { campaign?: unknown }).campaign) ??
    'General Donation'
  )
}

function resolveTransactionId(donation: DonationInput): string {
  return (
    presentString(donation.razorpayPaymentId) ??
    presentString(donation.razorpayOrderId) ??
    presentString((donation as { gatewayReference?: unknown }).gatewayReference) ??
    presentString((donation as { transactionId?: unknown }).transactionId) ??
    donation.id
  )
}

function inferPaymentMethod(d: DonationInput): string {
  if ('paymentMethod' in d && presentString(d.paymentMethod)) return String(d.paymentMethod)
  if (presentString(d.razorpayPaymentId)) return 'UPI / Card / Netbanking'
  return 'Online'
}

function inferGateway(d: DonationInput): string {
  if ('gateway' in d && presentString(d.gateway)) return String(d.gateway)
  if (presentString(d.razorpayPaymentId)) return 'Razorpay'
  return 'Manual'
}

export async function buildReceipt80GData(
  donation: DonationInput,
  options?: { isReissued?: boolean },
): Promise<Receipt80GData> {
  const ngo = await loadNgoReceiptProfile()
  const createdAt = resolveCreatedAt(donation)
  const donationDate = new Date(createdAt)
  const receiptNumber =
    presentString(donation.receiptNumber) ||
    `${ngo.receiptPrefix}-${donationDate.getFullYear()}-PENDING`
  const campaign = resolveCampaign(donation)
  const transactionId = resolveTransactionId(donation)
  const isAnonymous = donation.isAnonymous
  const donorName = isAnonymous
    ? 'Anonymous Donor'
    : (presentString(donation.donorName) ?? 'Donor')

  const origin = verifyOrigin(ngo.verificationBaseUrl)
  let verificationToken = presentString(donation.checkoutToken)
  if (!verificationToken && !receiptNumber.endsWith('-PENDING')) {
    verificationToken = await ensureVerificationCode({
      type: 'donation_receipt',
      holderName: donorName,
      referenceId: receiptNumber,
      metadata: { donationId: donation.id, transactionId },
    }).catch(() => receiptNumber)
  }
  const verificationUrl = verificationToken
    ? `${origin}/verify/${encodeURIComponent(verificationToken)}`
    : `${origin}/verify`

  // Encode a plain URL so phone cameras open the verify page directly.
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 160,
    color: { dark: ngo.primaryColor, light: '#FFFFFF' },
  })

  return {
    receiptNumber,
    donationId: donation.id,
    donorName,
    email: isAnonymous ? '—' : (presentString(donation.donorEmail) ?? '—'),
    phone: isAnonymous ? '—' : (presentString(donation.donorPhone) ?? '—'),
    address: '—',
    city: '—',
    state: '—',
    country: 'India',
    pan: presentString(donation.panNumber) ?? '—',
    amount: donation.amount,
    amountInWords: amountInWordsINR(donation.amount),
    paymentMethod: inferPaymentMethod(donation),
    transactionId,
    gateway: inferGateway(donation),
    campaign,
    purpose: campaign,
    donationDate: donationDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    financialYear: ngo.financialYear || financialYearFromDate(donationDate),
    eightyGNumber: presentString(ngo.eightyGNumber) || '—',
    twelveANumber: presentString(ngo.twelveANumber) || '—',
    ngoPan: presentString(ngo.pan) || '—',
    verificationUrl,
    qrCodeDataUrl,
    ngo,
    isReissued: options?.isReissued,
    status: options?.isReissued ? 'REISSUED' : 'PAID',
  }
}
