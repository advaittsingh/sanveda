import { isSupabaseConfigured, requireSupabase } from './supabase'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : ''

export interface RazorpayOrder {
  orderId: string
  amount: number
  currency: string
}

export async function createRazorpayOrder(
  donationId: string,
  amount: number,
  currency = 'INR',
): Promise<RazorpayOrder | null> {
  if (!isSupabaseConfigured || !FUNCTIONS_URL) return null

  const { data: { session } } = await requireSupabase().auth.getSession()

  const res = await fetch(`${FUNCTIONS_URL}/create-razorpay-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ donationId, amount, currency }),
  })

  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Could not create payment order')
  return body as RazorpayOrder
}

export async function verifyRazorpayPayment(payload: {
  donationId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}): Promise<Record<string, unknown>> {
  if (!isSupabaseConfigured || !FUNCTIONS_URL) {
    throw new Error('Payment verification requires Supabase edge functions')
  }

  const { data: { session } } = await requireSupabase().auth.getSession()

  const res = await fetch(`${FUNCTIONS_URL}/verify-razorpay-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Payment verification failed')
  return body.donation as Record<string, unknown>
}

export function isServerPaymentAvailable(): boolean {
  return isSupabaseConfigured && Boolean(FUNCTIONS_URL)
}
