import QRCode from 'qrcode'
import type { Donation } from '../donationService'
import type { DonationOpsRecord } from '../donationOperationsService'
import { amountInWordsINR } from './amountInWords'
import { financialYearFromDate, loadNgoReceiptProfile } from './ngoProfile'
import type { Receipt80GData } from './types'

type DonationInput = Donation | DonationOpsRecord

function inferPaymentMethod(d: DonationInput): string {
  if ('paymentMethod' in d && d.paymentMethod) return d.paymentMethod
  if (d.razorpayPaymentId) return 'UPI / Card / Netbanking'
  return 'Online'
}

function inferGateway(d: DonationInput): string {
  if ('gateway' in d && d.gateway) return String(d.gateway)
  if (d.razorpayPaymentId) return 'Razorpay'
  return 'Manual'
}

export async function buildReceipt80GData(
  donation: DonationInput,
  options?: { isReissued?: boolean },
): Promise<Receipt80GData> {
  const ngo = await loadNgoReceiptProfile()
  const donationDate = new Date(donation.createdAt)
  const receiptNumber = donation.receiptNumber ?? `${ngo.receiptPrefix}-${donationDate.getFullYear()}-PENDING`
  const verificationUrl = `${ngo.verificationBaseUrl}/verify/${encodeURIComponent(receiptNumber)}`

  const qrPayload = JSON.stringify({
    receiptNumber,
    transactionId: donation.razorpayPaymentId ?? donation.razorpayOrderId ?? donation.id,
    verify: verificationUrl,
  })

  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
    margin: 1,
    width: 160,
    color: { dark: ngo.primaryColor, light: '#FFFFFF' },
  })

  const isAnonymous = donation.isAnonymous
  const donorName = isAnonymous ? 'Anonymous Donor' : (donation.donorName ?? 'Donor')

  return {
    receiptNumber,
    donationId: donation.id,
    donorName,
    email: isAnonymous ? '—' : (donation.donorEmail ?? '—'),
    phone: isAnonymous ? '—' : (donation.donorPhone ?? '—'),
    address: '—',
    city: '—',
    state: '—',
    country: 'India',
    pan: '—',
    amount: donation.amount,
    amountInWords: amountInWordsINR(donation.amount),
    paymentMethod: inferPaymentMethod(donation),
    transactionId: donation.razorpayPaymentId ?? donation.razorpayOrderId ?? donation.id,
    gateway: inferGateway(donation),
    campaign: donation.campaignTitle,
    purpose: donation.campaignTitle,
    donationDate: donationDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    financialYear: ngo.financialYear || financialYearFromDate(donationDate),
    eightyGNumber: ngo.eightyGNumber || '—',
    twelveANumber: ngo.twelveANumber || '—',
    ngoPan: ngo.pan || '—',
    verificationUrl,
    qrCodeDataUrl,
    ngo,
    isReissued: options?.isReissued,
    status: options?.isReissued ? 'REISSUED' : 'PAID',
  }
}
