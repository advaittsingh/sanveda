import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { PoolClient } from 'pg'
import { z } from 'zod'
import { query } from './db.js'
import { serverEnv } from './env.js'
import { HttpError } from './http.js'

export const razorpayOrderSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive(),
  amount_paid: z.number().int().nonnegative().optional(),
  currency: z.string().min(3).max(3),
  receipt: z.string().optional(),
  status: z.string().optional(),
  notes: z.record(z.string(), z.string()).optional(),
})

export const razorpayPaymentSchema = z.object({
  id: z.string().min(1),
  order_id: z.string().min(1).optional().nullable(),
  amount: z.number().int().positive(),
  currency: z.string().min(3).max(3),
  status: z.string(),
  captured: z.boolean().optional(),
})

export const razorpayPlanSchema = z.object({
  id: z.string().min(1),
  period: z.string().optional(),
  interval: z.number().int().positive().optional(),
  item: z
    .object({
      name: z.string().optional(),
      amount: z.number().int().positive().optional(),
      currency: z.string().optional(),
    })
    .optional(),
})

export const razorpaySubscriptionSchema = z.object({
  id: z.string().min(1),
  plan_id: z.string().min(1).optional(),
  status: z.string().optional(),
  total_count: z.number().int().positive().optional(),
  notes: z.record(z.string(), z.string()).optional(),
})

export const razorpayRefundSchema = z.object({
  id: z.string().min(1),
  payment_id: z.string().min(1),
  amount: z.number().int().positive(),
  status: z.enum(['pending', 'processed']),
})

export type RazorpayOrder = z.infer<typeof razorpayOrderSchema>
export type RazorpayPayment = z.infer<typeof razorpayPaymentSchema>
export type RazorpayPlan = z.infer<typeof razorpayPlanSchema>
export type RazorpaySubscription = z.infer<typeof razorpaySubscriptionSchema>

export function paymentConfig(): {
  keyId: string
  keySecret: string
  authorization: string
} {
  const env = serverEnv()
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new HttpError(503, 'Razorpay is not configured', 'payment_unavailable')
  }
  return {
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
    authorization: `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
  }
}

export function hmacSha256(secret: string, value: string | Buffer): string {
  return createHmac('sha256', secret).update(value).digest('hex')
}

export function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

export function timingSafeEqualHex(expected: string, provided: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(expected) || !/^[a-f0-9]{64}$/i.test(provided)) return false
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'))
}

export async function razorpayRequest<T>(
  path: string,
  init: RequestInit,
  schema: z.ZodType<T>,
): Promise<T> {
  const { authorization } = paymentConfig()
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: authorization,
      Accept: 'application/json',
      ...init.headers,
    },
    signal: AbortSignal.timeout(15_000),
  })
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const details =
      body && typeof body === 'object' && 'error' in body
        ? (body as { error?: { description?: string; reason?: string; code?: string } }).error
        : undefined
    const gatewayMessage = details?.description ?? details?.reason ?? 'Razorpay request failed'
    // Preserve auth failures as 503 (misconfigured keys), not 409 conflicts — callers and
    // QA otherwise misread "Authentication failed" as an idempotency/order-collision bug.
    if (response.status === 401 || response.status === 403) {
      console.error('[razorpay] authentication failed', {
        path,
        status: response.status,
        code: details?.code,
      })
      throw new HttpError(
        503,
        'Online payments are temporarily unavailable. Please try again later or contact support.',
        'payment_unavailable',
      )
    }
    throw new HttpError(
      response.status >= 400 && response.status < 500 ? 409 : 502,
      gatewayMessage,
      'razorpay_error',
    )
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new HttpError(502, 'Razorpay returned an invalid response', 'invalid_gateway_response')
  }
  return parsed.data
}

export function validateCapturedPayment(
  donationId: string,
  expectedAmount: number,
  expectedCurrency: string,
  order: RazorpayOrder,
  payment: RazorpayPayment,
): void {
  if (!payment.order_id || payment.order_id !== order.id) {
    throw new HttpError(400, 'Payment is not linked to the verified order', 'payment_mismatch')
  }
  if (payment.status !== 'captured' || payment.captured === false) {
    throw new HttpError(400, 'Payment is not captured', 'payment_not_captured')
  }
  if (order.status !== 'paid' && order.amount_paid !== order.amount) {
    throw new HttpError(400, 'Order is not paid', 'order_not_paid')
  }
  if (order.amount !== expectedAmount || payment.amount !== expectedAmount) {
    throw new HttpError(400, 'Payment amount mismatch', 'payment_mismatch')
  }
  if (order.currency !== expectedCurrency || payment.currency !== expectedCurrency) {
    throw new HttpError(400, 'Payment currency mismatch', 'payment_mismatch')
  }
  if (order.notes?.donation_id !== donationId) {
    throw new HttpError(400, 'Order donation binding mismatch', 'payment_mismatch')
  }
}

export async function callBusinessFunction<T>(
  name: string,
  values: readonly unknown[],
  client?: PoolClient,
): Promise<T> {
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ')
  const sql = `select public.${name}(${placeholders}) as result`
  const rows = client
    ? (await client.query<{ result: T }>(sql, [...values])).rows
    : await query<{ result: T }>(sql, values)
  if (rows[0]?.result == null) {
    throw new HttpError(409, 'The requested payment operation is not available', 'payment_conflict')
  }
  return rows[0].result
}
