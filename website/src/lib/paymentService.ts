import { dataApi } from './dataApiClient'

export interface RazorpayOrder {
  orderId: string
  amount: number
  currency: string
}

export interface RazorpaySubscription {
  subscriptionId: string
  amount: number
  currency: string
}

function responseError(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const value = body as { message?: unknown; error?: unknown }
  return typeof value.message === 'string'
    ? value.message
    : typeof value.error === 'string' ? value.error : fallback
}

/**
 * Creates a Razorpay order through the same-origin server API.
 * The server reads the authoritative amount and currency from the donation.
 */
export async function createRazorpayOrder(
  donationId: string,
  checkoutToken: string,
): Promise<RazorpayOrder> {
  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ donationId, checkoutToken }),
  })

  const body = await res.json() as Record<string, unknown>
  if (!res.ok) {
    throw new Error(responseError(body, 'Could not create payment order'))
  }

  const orderId = (body.orderId ?? body.order_id) as string | undefined
  if (!orderId) {
    throw new Error('Order creation response missing order_id')
  }

  return {
    orderId,
    amount: Number(body.amount),
    currency: String(body.currency),
  }
}

/**
 * Creates a Razorpay subscription (autopay mandate) for a monthly donation.
 * Plans are scoped per cause × amount on the server.
 */
export async function createRazorpaySubscription(
  donationId: string,
  checkoutToken: string,
): Promise<RazorpaySubscription> {
  const res = await fetch('/api/payments/create-subscription', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ donationId, checkoutToken }),
  })

  const body = await res.json() as Record<string, unknown>
  if (!res.ok) {
    throw new Error(responseError(body, 'Could not start monthly autopay mandate'))
  }

  const subscriptionId = (body.subscriptionId ?? body.subscription_id) as string | undefined
  if (!subscriptionId) {
    throw new Error('Subscription creation response missing subscription_id')
  }

  return {
    subscriptionId,
    amount: Number(body.amount),
    currency: String(body.currency),
  }
}

/**
 * Verifies Razorpay payment signature through the same-origin server API.
 * HMAC-SHA256(order_id|payment_id, KEY_SECRET) must match razorpay_signature.
 */
export async function verifyRazorpayPayment(payload: {
  donationId: string
  checkoutToken: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}): Promise<Record<string, unknown>> {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await res.json() as Record<string, unknown>
  if (!res.ok || !body.success) {
    throw new Error(responseError(body, 'Payment verification failed'))
  }
  return (body.result ?? body) as Record<string, unknown>
}

/**
 * Verifies Razorpay subscription auth signature.
 * HMAC-SHA256(payment_id|subscription_id, KEY_SECRET) must match razorpay_signature.
 */
export async function verifyRazorpaySubscription(payload: {
  donationId: string
  checkoutToken: string
  razorpay_subscription_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}): Promise<Record<string, unknown>> {
  const res = await fetch('/api/payments/verify-subscription', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await res.json() as Record<string, unknown>
  if (!res.ok || !body.success) {
    throw new Error(responseError(body, 'Subscription verification failed'))
  }
  return (body.result ?? body) as Record<string, unknown>
}

export interface CheckoutResult {
  id: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount: number
  currency: string
  campaignTitle: string
  paymentId?: string
  receiptNumber?: string
  paidAt?: string
  receipt?: Record<string, unknown>
}

export async function getCheckoutResult(checkoutToken: string): Promise<CheckoutResult | null> {
  const { data, error } = await dataApi.call<CheckoutResult>('get_checkout_result', {
    p_checkout_token: checkoutToken,
  })
  if (error) throw new Error(error.message)
  if (!data) return null
  return data as CheckoutResult
}

export async function refundRazorpayPayment(refundId: string): Promise<{ refundId: string; status: string }> {
  const res = await fetch('/api/payments/refund', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refundId }),
  })
  const body = await res.json() as Record<string, unknown>
  if (!res.ok || !body.success) throw new Error(responseError(body, 'Refund processing failed'))
  return { refundId: String(body.refundId), status: String(body.status) }
}

export function isServerPaymentAvailable(): boolean {
  return true
}
