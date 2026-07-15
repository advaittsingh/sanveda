import { isSupabaseConfigured, requireSupabase } from './supabase'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : ''

export interface RazorpayOrder {
  orderId: string
  amount: number
  currency: string
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await requireSupabase().auth.getSession()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  }
}

/**
 * Creates a Razorpay order via Supabase Edge Function `create-razorpay-order`.
 * Amount is in rupees; the edge function converts to paise and enforces min ₹1.
 */
export async function createRazorpayOrder(
  donationId: string,
  amount: number,
  currency = 'INR',
): Promise<RazorpayOrder> {
  if (!isSupabaseConfigured || !FUNCTIONS_URL) {
    throw new Error('Payment order creation requires Supabase edge functions')
  }

  if (!Number.isFinite(amount) || amount < 1) {
    throw new Error('Minimum donation amount is ₹1')
  }

  const res = await fetch(`${FUNCTIONS_URL}/create-razorpay-order`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ donationId, amount, currency }),
  })

  const body = await res.json()
  if (!res.ok) {
    throw new Error(body.error ?? 'Could not create payment order')
  }

  const orderId = (body.orderId ?? body.order_id) as string | undefined
  if (!orderId) {
    throw new Error('Order creation response missing order_id')
  }

  return {
    orderId,
    amount: Number(body.amount),
    currency: String(body.currency ?? currency),
  }
}

/**
 * Verifies Razorpay payment signature via Edge Function `verify-razorpay-payment`.
 * HMAC-SHA256(order_id|payment_id, KEY_SECRET) must match razorpay_signature.
 */
export async function verifyRazorpayPayment(payload: {
  donationId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}): Promise<Record<string, unknown>> {
  if (!isSupabaseConfigured || !FUNCTIONS_URL) {
    throw new Error('Payment verification requires Supabase edge functions')
  }

  const res = await fetch(`${FUNCTIONS_URL}/verify-razorpay-payment`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  })

  const body = await res.json()
  if (!res.ok || !body.success) {
    throw new Error(body.error ?? 'Payment verification failed')
  }
  return (body.donation ?? body) as Record<string, unknown>
}

export function isServerPaymentAvailable(): boolean {
  return isSupabaseConfigured && Boolean(FUNCTIONS_URL)
}
