import { BRAND } from '../constants/brand'
import {
  createRazorpayOrder,
  createRazorpaySubscription,
  isServerPaymentAvailable,
  verifyRazorpayPayment,
  verifyRazorpaySubscription,
} from './paymentService'
import { dataApi } from './dataApiClient'

const RAZORPAY_KEY_ID = (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) ?? ''

export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Donation {
  id: string
  userId?: string
  campaignId?: number
  campaignSlug?: string
  campaignTitle: string
  amount: number
  currency: string
  isAnonymous: boolean
  donorName?: string
  donorEmail?: string
  donorPhone?: string
  panNumber?: string
  status: DonationStatus
  donationType?: 'one_time' | 'recurring' | 'offline'
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySubscriptionId?: string
  receiptNumber?: string
  checkoutToken?: string
  createdAt: string
}

export interface CreateDonationInput {
  campaignSlug?: string
  campaignTitle: string
  campaignId?: number
  amount: number
  currency?: string
  isAnonymous?: boolean
  donorName?: string
  donorEmail?: string
  donorPhone?: string
  userId?: string
  /** True when checkout originated from the monthly donation flow. */
  isMonthly?: boolean
}

function optionalString(value: unknown): string | undefined {
  if (value == null) return undefined
  const text = String(value).trim()
  if (!text || text === 'undefined' || text === 'null') return undefined
  return text
}

function rowToDonation(row: Record<string, unknown>): Donation {
  const campaignTitle =
    optionalString(row.campaign_title) ??
    optionalString(row.campaignTitle) ??
    'General Donation'
  const createdAt =
    optionalString(row.created_at) ??
    optionalString(row.createdAt) ??
    optionalString(row.paid_at) ??
    optionalString(row.paidAt) ??
    new Date().toISOString()

  return {
    id: String(row.id),
    userId: optionalString(row.user_id),
    campaignId: row.campaign_id != null ? Number(row.campaign_id) : undefined,
    campaignSlug: optionalString(row.campaign_slug) ?? optionalString(row.campaignSlug),
    campaignTitle,
    amount: Number(row.amount),
    currency: optionalString(row.currency) ?? 'INR',
    isAnonymous: Boolean(row.is_anonymous ?? row.isAnonymous),
    donorName: optionalString(row.donor_name) ?? optionalString(row.donorName),
    donorEmail: optionalString(row.donor_email) ?? optionalString(row.donorEmail),
    donorPhone: optionalString(row.donor_phone) ?? optionalString(row.donorPhone),
    panNumber: optionalString(row.pan_number) ?? optionalString(row.panNumber),
    status: row.status as DonationStatus,
    donationType:
      optionalString(row.donation_type) === 'recurring' ||
      optionalString(row.donationType) === 'recurring'
        ? 'recurring'
        : optionalString(row.donation_type) === 'offline' ||
            optionalString(row.donationType) === 'offline'
          ? 'offline'
          : 'one_time',
    razorpayOrderId:
      optionalString(row.razorpay_order_id) ?? optionalString(row.razorpayOrderId),
    razorpayPaymentId:
      optionalString(row.razorpay_payment_id) ?? optionalString(row.razorpayPaymentId),
    razorpaySubscriptionId:
      optionalString(row.razorpay_subscription_id) ??
      optionalString(row.razorpaySubscriptionId),
    receiptNumber: optionalString(row.receipt_number) ?? optionalString(row.receiptNumber),
    createdAt,
  }
}

export async function createDonation(input: CreateDonationInput): Promise<Donation> {
  const { data, error } = await dataApi.call<{ donation: Record<string, unknown>; checkoutToken: string }>('create_pending_donation_checkout', {
    p_campaign_title: input.campaignTitle,
    p_amount: input.amount,
    p_currency: input.currency ?? 'INR',
    p_campaign_id: input.campaignId ?? null,
    p_campaign_slug: input.campaignSlug ?? null,
    p_is_anonymous: input.isAnonymous ?? false,
    p_donor_name: input.donorName ?? null,
    p_donor_email: input.donorEmail ?? null,
    p_donor_phone: input.donorPhone ?? null,
    p_is_monthly: Boolean(input.isMonthly),
  })

  if (error) throw new Error(error.message)
  if (!data?.donation || !data.checkoutToken) throw new Error('Could not create secure donation checkout')
  const donation = rowToDonation(data.donation)
  return {
    ...donation,
    donationType: input.isMonthly ? 'recurring' : donation.donationType,
    checkoutToken: String(data.checkoutToken),
  }
}

export async function getAllDonations(): Promise<Donation[]> {
  const { data, error } = await dataApi
    .table('donations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToDonation)
}

export async function getDonationsByCampaign(campaignSlug?: string, campaignId?: number): Promise<Donation[]> {
  let request = dataApi.publicTable('donations').select('*').order('created_at', { ascending: false }).limit(200)
  if (campaignSlug) request = request.eq('campaign_slug', campaignSlug)
  else if (campaignId != null) request = request.eq('campaign_id', campaignId)
  const { data, error } = await request
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToDonation)
}

export async function getDonationsByUser(userId: string): Promise<Donation[]> {
  const { data, error } = await dataApi
    .table('donations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToDonation)
}

export async function getDonationById(id: string): Promise<Donation | undefined> {
  const { data, error } = await dataApi
    .table('donations')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? rowToDonation(data) : undefined
}

export async function getDonationReceiptSnapshot(
  donationId: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await dataApi
    .table('donation_receipts')
    .select('receipt_snapshot')
    .eq('donation_id', donationId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data?.receipt_snapshot as Record<string, unknown> | undefined) ?? null
}

export async function updateDonation(
  id: string,
  patch: Partial<Pick<Donation, 'status' | 'donorName' | 'donorEmail' | 'donorPhone' | 'receiptNumber' | 'razorpayPaymentId'>>,
): Promise<Donation | undefined> {
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

    if (patch.status !== undefined) row.status = patch.status
    if (patch.donorName !== undefined) row.donor_name = patch.donorName
    if (patch.donorEmail !== undefined) row.donor_email = patch.donorEmail
    if (patch.donorPhone !== undefined) row.donor_phone = patch.donorPhone
    if (patch.receiptNumber !== undefined) row.receipt_number = patch.receiptNumber
    if (patch.razorpayPaymentId !== undefined) row.razorpay_payment_id = patch.razorpayPaymentId

  const { data, error } = await dataApi
      .table('donations')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? rowToDonation(data) : undefined
}

/**
 * Returns a completed donation ready for receipt actions.
 * Receipt PDFs can be built even when `receiptNumber` is still pending;
 * callers that need a persisted number should check `receiptNumber` themselves.
 */
export async function ensureDonationReceipt(id: string): Promise<Donation | undefined> {
  const existing = await getDonationById(id)
  if (!existing || existing.status !== 'completed') return undefined
  return existing
}

export function isRazorpayConfigured(): boolean {
  return Boolean(RAZORPAY_KEY_ID.trim())
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void
      on: (
        event: string,
        handler: (response: { error?: { description?: string; reason?: string } }) => void,
      ) => void
    }
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Razorpay'))
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout(
  donation: Donation,
  onSuccess: (paymentId: string) => void,
  onFailure: (message: string) => void,
): Promise<void> {
  if (!isRazorpayConfigured()) {
    onFailure('Payment gateway is not configured. Set VITE_RAZORPAY_KEY_ID in your .env file.')
    return
  }

  if (!isServerPaymentAvailable()) {
    onFailure(
      'Secure checkout is unavailable. Deploy the payment API and configure the Razorpay server secrets.',
    )
    return
  }

  if (!donation.checkoutToken) {
    onFailure('Secure checkout token is missing. Please restart checkout.')
    return
  }

  try {
    await loadRazorpayScript()
  } catch {
    onFailure('Could not load Razorpay checkout. Check your network and try again.')
    return
  }

  const isMonthly = donation.donationType === 'recurring'

  let orderId: string | undefined
  let subscriptionId: string | undefined
  try {
    if (isMonthly) {
      const subscription = await createRazorpaySubscription(donation.id, donation.checkoutToken)
      subscriptionId = subscription.subscriptionId
    } else {
      const order = await createRazorpayOrder(donation.id, donation.checkoutToken)
      orderId = order.orderId
    }
  } catch (err) {
    onFailure(
      err instanceof Error
        ? err.message
        : isMonthly
          ? 'Could not start monthly autopay mandate'
          : 'Could not create payment order',
    )
    return
  }

  const options: Record<string, unknown> = {
    key: RAZORPAY_KEY_ID,
    ...(subscriptionId ? { subscription_id: subscriptionId } : { order_id: orderId }),
    currency: donation.currency,
    name: BRAND.shortName,
    description: isMonthly
      ? `${donation.campaignTitle} — monthly autopay`
      : donation.campaignTitle,
    prefill: {
      name: donation.donorName ?? '',
      email: donation.donorEmail ?? '',
      contact: donation.donorPhone ?? '',
    },
    theme: { color: '#041B4D' },
    handler: async (response: {
      razorpay_payment_id: string
      razorpay_order_id?: string
      razorpay_subscription_id?: string
      razorpay_signature: string
    }) => {
      if (!response.razorpay_payment_id || !response.razorpay_signature) {
        onFailure('Payment response incomplete. Please contact support if amount was charged.')
        return
      }
      try {
        if (subscriptionId || response.razorpay_subscription_id) {
          const subId = response.razorpay_subscription_id ?? subscriptionId
          if (!subId) {
            onFailure('Subscription id missing from payment response.')
            return
          }
          await verifyRazorpaySubscription({
            donationId: donation.id,
            checkoutToken: donation.checkoutToken!,
            razorpay_subscription_id: subId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
        } else {
          if (!response.razorpay_order_id) {
            onFailure('Payment response incomplete. Please contact support if amount was charged.')
            return
          }
          await verifyRazorpayPayment({
            donationId: donation.id,
            checkoutToken: donation.checkoutToken!,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
        }
        onSuccess(response.razorpay_payment_id)
      } catch (err) {
        onFailure(err instanceof Error ? err.message : 'Payment verification failed')
      }
    },
    modal: {
      ondismiss: () => onFailure('Payment cancelled'),
    },
  }

  const rzp = new window.Razorpay!(options)
  rzp.on('payment.failed', (response) => {
    const message = response.error?.description || response.error?.reason || 'Payment failed'
    onFailure(message)
  })
  rzp.open()
}

/** @deprecated Import from `receipt80G/receipt80GService` for new code. */
export async function generateReceiptHtml(donation: Donation): Promise<string> {
  const { generateReceiptHtml: build } = await import('./receipt80G/receipt80GService')
  return build(donation)
}

/** Downloads a production 80G PDF receipt (dynamic import avoids circular deps). */
export async function downloadReceipt(donation: Donation): Promise<void> {
  const { downloadReceiptForDonation } = await import('./receipt80G/receipt80GService')
  return downloadReceiptForDonation(donation)
}
