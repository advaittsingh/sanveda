import { BRAND } from '../constants/brand'
import {
  createRazorpayOrder,
  isServerPaymentAvailable,
  verifyRazorpayPayment,
} from './paymentService'
import { registerVerification } from './verificationService'
import { isSupabaseConfigured, RAZORPAY_KEY_ID, requireSupabase } from './supabase'

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
  status: DonationStatus
  razorpayOrderId?: string
  razorpayPaymentId?: string
  receiptNumber?: string
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
}

const STORAGE_KEY = 'sanveda_donations'

function rowToDonation(row: Record<string, unknown>): Donation {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    campaignId: row.campaign_id ? Number(row.campaign_id) : undefined,
    campaignSlug: row.campaign_slug ? String(row.campaign_slug) : undefined,
    campaignTitle: String(row.campaign_title),
    amount: Number(row.amount),
    currency: String(row.currency ?? 'INR'),
    isAnonymous: Boolean(row.is_anonymous),
    donorName: row.donor_name ? String(row.donor_name) : undefined,
    donorEmail: row.donor_email ? String(row.donor_email) : undefined,
    donorPhone: row.donor_phone ? String(row.donor_phone) : undefined,
    status: row.status as DonationStatus,
    razorpayOrderId: row.razorpay_order_id ? String(row.razorpay_order_id) : undefined,
    razorpayPaymentId: row.razorpay_payment_id ? String(row.razorpay_payment_id) : undefined,
    receiptNumber: row.receipt_number ? String(row.receipt_number) : undefined,
    createdAt: String(row.created_at),
  }
}

function readLocal(): Donation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Donation[]
  } catch {
    return []
  }
}

function writeLocal(items: Donation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function localReceiptNumber(): string {
  const year = new Date().getFullYear()
  const count = readLocal().filter((d) => d.receiptNumber).length + 1
  return `SVD-80G-${year}-${String(count).padStart(5, '0')}`
}

export async function createDonation(input: CreateDonationInput): Promise<Donation> {
  const now = new Date().toISOString()

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('donations')
      .insert({
        user_id: input.userId ?? null,
        campaign_id: input.campaignId ?? null,
        campaign_slug: input.campaignSlug ?? null,
        campaign_title: input.campaignTitle,
        amount: input.amount,
        currency: input.currency ?? 'INR',
        is_anonymous: input.isAnonymous ?? false,
        donor_name: input.donorName ?? null,
        donor_email: input.donorEmail ?? null,
        donor_phone: input.donorPhone ?? null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return rowToDonation(data)
  }

  const donation: Donation = {
    id: crypto.randomUUID(),
    userId: input.userId,
    campaignId: input.campaignId,
    campaignSlug: input.campaignSlug,
    campaignTitle: input.campaignTitle,
    amount: input.amount,
    currency: input.currency ?? 'INR',
    isAnonymous: input.isAnonymous ?? false,
    donorName: input.donorName,
    donorEmail: input.donorEmail,
    donorPhone: input.donorPhone,
    status: 'pending',
    createdAt: now,
  }
  const all = readLocal()
  all.unshift(donation)
  writeLocal(all)
  return donation
}

export async function completeDonation(
  id: string,
  paymentId?: string,
  options?: { asAdmin?: boolean },
): Promise<Donation | undefined> {
  if (isSupabaseConfigured) {
    const rpc = options?.asAdmin ? 'complete_donation_admin' : 'complete_donation_public'
    if (!options?.asAdmin && paymentId && !paymentId.startsWith('demo_')) {
      throw new Error('Payment must be verified server-side before completing the donation')
    }

    const { data, error } = await requireSupabase().rpc(rpc, {
      p_donation_id: id,
      p_payment_id: paymentId ?? null,
    })

    if (error) throw new Error(error.message)
    if (!data) return undefined

    const donation = rowToDonation(data as Record<string, unknown>)

    if (donation.receiptNumber && !donation.isAnonymous) {
      await registerVerification({
        type: 'donation_receipt',
        holderName: donation.donorName ?? 'Donor',
        referenceId: donation.receiptNumber,
        metadata: { donationId: donation.id, amount: donation.amount, campaignTitle: donation.campaignTitle },
      }).catch(() => {})
    }

    return donation
  }

  const receiptNumber = localReceiptNumber()
  const all = readLocal()
  const index = all.findIndex((d) => d.id === id)
  if (index < 0) return undefined

  all[index] = {
    ...all[index],
    status: 'completed',
    razorpayPaymentId: paymentId,
    receiptNumber,
  }
  writeLocal(all)
  const donation = all[index]

  if (donation.receiptNumber && !donation.isAnonymous) {
    await registerVerification({
      type: 'donation_receipt',
      holderName: donation.donorName ?? 'Donor',
      referenceId: donation.receiptNumber,
      metadata: { donationId: donation.id, amount: donation.amount, campaignTitle: donation.campaignTitle },
    }).catch(() => {})
  }

  return donation
}

export async function getAllDonations(): Promise<Donation[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToDonation)
  }

  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getDonationsByCampaign(campaignSlug?: string, campaignId?: number): Promise<Donation[]> {
  const completed = (await getAllDonations()).filter((d) => d.status === 'completed')

  if (campaignSlug) {
    return completed.filter((d) => d.campaignSlug === campaignSlug)
  }
  if (campaignId != null) {
    return completed.filter((d) => d.campaignId === campaignId)
  }
  return completed
}

export async function getDonationsByUser(userId: string): Promise<Donation[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('donations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToDonation)
  }

  return readLocal()
    .filter((d) => d.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getDonationById(id: string): Promise<Donation | undefined> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('donations')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? rowToDonation(data) : undefined
  }

  return readLocal().find((d) => d.id === id)
}

export async function updateDonation(
  id: string,
  patch: Partial<Pick<Donation, 'status' | 'donorName' | 'donorEmail' | 'donorPhone' | 'receiptNumber' | 'razorpayPaymentId'>>,
): Promise<Donation | undefined> {
  if (isSupabaseConfigured) {
    const row: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (patch.status !== undefined) row.status = patch.status
    if (patch.donorName !== undefined) row.donor_name = patch.donorName
    if (patch.donorEmail !== undefined) row.donor_email = patch.donorEmail
    if (patch.donorPhone !== undefined) row.donor_phone = patch.donorPhone
    if (patch.receiptNumber !== undefined) row.receipt_number = patch.receiptNumber
    if (patch.razorpayPaymentId !== undefined) row.razorpay_payment_id = patch.razorpayPaymentId

    const { data, error } = await requireSupabase()
      .from('donations')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? rowToDonation(data) : undefined
  }

  const all = readLocal()
  const index = all.findIndex((d) => d.id === id)
  if (index < 0) return undefined
  all[index] = { ...all[index], ...patch }
  writeLocal(all)
  return all[index]
}

export async function ensureDonationReceipt(id: string): Promise<Donation | undefined> {
  const existing = await getDonationById(id)
  if (!existing) return undefined
  if (existing.receiptNumber) return existing
  if (existing.status !== 'completed') return undefined

  if (isSupabaseConfigured) {
    const { data: receiptData } = await requireSupabase().rpc('generate_receipt_number')
    return updateDonation(id, { receiptNumber: String(receiptData ?? localReceiptNumber()) })
  }

  return updateDonation(id, { receiptNumber: localReceiptNumber() })
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
      'Secure checkout requires Supabase edge functions. Deploy create-razorpay-order and verify-razorpay-payment, then set Razorpay secrets.',
    )
    return
  }

  if (!Number.isFinite(donation.amount) || donation.amount < 1) {
    onFailure('Minimum donation amount is ₹1')
    return
  }

  try {
    await loadRazorpayScript()
  } catch {
    onFailure('Could not load Razorpay checkout. Check your network and try again.')
    return
  }

  let orderId: string
  try {
    const order = await createRazorpayOrder(donation.id, donation.amount, donation.currency)
    orderId = order.orderId
  } catch (err) {
    onFailure(err instanceof Error ? err.message : 'Could not create payment order')
    return
  }

  const options: Record<string, unknown> = {
    key: RAZORPAY_KEY_ID,
    order_id: orderId,
    currency: donation.currency,
    name: BRAND.shortName,
    description: donation.campaignTitle,
    prefill: {
      name: donation.donorName ?? '',
      email: donation.donorEmail ?? '',
      contact: donation.donorPhone ?? '',
    },
    theme: { color: '#041B4D' },
    handler: async (response: {
      razorpay_payment_id: string
      razorpay_order_id: string
      razorpay_signature: string
    }) => {
      if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
        onFailure('Payment response incomplete. Please contact support if amount was charged.')
        return
      }
      try {
        await verifyRazorpayPayment({
          donationId: donation.id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
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
