import { z } from 'zod'
import { query } from '../_lib/db.js'
import { deliverDonationReceiptEmail } from '../_lib/email.js'
import { serverEnv } from '../_lib/env.js'
import { apiHandler, HttpError, method } from '../_lib/http.js'
import { callBusinessFunction, hmacSha256, sha256, timingSafeEqualHex } from '../_lib/payment.js'
import type { VercelRequest } from '../_lib/vercel.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const entitySchema = z
  .object({
    id: z.string().optional(),
    order_id: z.string().optional(),
    payment_id: z.string().optional(),
    amount: z.number().int().nonnegative().optional(),
    currency: z.string().optional(),
    status: z.string().optional(),
    subscription_id: z.string().optional(),
    notes: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough()

const payloadSchema = z
  .object({
    event: z.string().min(1).max(128),
    payload: z
      .object({
        payment: z.object({ entity: entitySchema }).optional(),
        refund: z.object({ entity: entitySchema }).optional(),
        subscription: z.object({ entity: entitySchema }).optional(),
      })
      .optional(),
  })
  .passthrough()

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const declaredLength = Number(req.headers['content-length'] ?? 0)
  if (declaredLength > 1_000_000) {
    throw new HttpError(413, 'Webhook payload is too large', 'payload_too_large')
  }
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += bytes.length
    if (size > 1_000_000) {
      throw new HttpError(413, 'Webhook payload is too large', 'payload_too_large')
    }
    chunks.push(bytes)
  }
  return Buffer.concat(chunks)
}

async function finishEvent(eventId: string, status: string, error: string | null): Promise<void> {
  await query('select public.finish_payment_webhook_event($1, $2, $3)', [eventId, status, error])
}

const SUBSCRIPTION_STATUS_EVENTS = new Set([
  'subscription.authenticated',
  'subscription.activated',
  'subscription.pending',
  'subscription.halted',
  'subscription.cancelled',
  'subscription.completed',
  'subscription.paused',
  'subscription.resumed',
])

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const secret = serverEnv().RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    throw new HttpError(503, 'Webhook secret is not configured', 'webhook_unavailable')
  }

  const rawBody = await readRawBody(req)
  const signatureHeader = req.headers['x-razorpay-signature']
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : (signatureHeader ?? '')
  const expected = hmacSha256(secret, rawBody)
  if (!timingSafeEqualHex(expected, signature)) {
    throw new HttpError(401, 'Invalid webhook signature', 'invalid_webhook_signature')
  }

  let decoded: unknown
  try {
    decoded = JSON.parse(rawBody.toString('utf8'))
  } catch {
    throw new HttpError(400, 'Webhook payload is not valid JSON', 'invalid_request')
  }
  const payload = payloadSchema.parse(decoded)
  const eventHeader = req.headers['x-razorpay-event-id']
  const suppliedEventId = Array.isArray(eventHeader) ? eventHeader[0] : eventHeader
  const payloadHash = sha256(rawBody)
  const eventId = suppliedEventId?.trim() || payloadHash
  if (eventId.length > 255) {
    throw new HttpError(400, 'Webhook event ID is invalid', 'invalid_request')
  }

  const accepted = await callBusinessFunction<boolean>('register_payment_webhook_event', [
    eventId,
    payload.event,
    payloadHash,
  ])
  if (!accepted) {
    const [existing] = await query<{ payload_sha256: string }>(
      `select payload_sha256 from payment_webhook_events
        where gateway = 'razorpay' and gateway_event_id = $1`,
      [eventId],
    )
    if (existing && existing.payload_sha256 !== payloadHash) {
      throw new HttpError(
        409,
        'Webhook event ID was reused with different content',
        'event_conflict',
      )
    }
    res.status(200).json({ received: true, duplicate: true })
    return
  }

  try {
    const payment = payload.payload?.payment?.entity
    const refund = payload.payload?.refund?.entity
    const subscription = payload.payload?.subscription?.entity
    let handled = false

    if (
      payload.event === 'payment.captured' &&
      payment?.id &&
      payment.order_id &&
      payment.amount &&
      payment.currency
    ) {
      const settled = await callBusinessFunction<{ donation?: { id?: string } }>(
        'settle_razorpay_payment',
        [payment.order_id, payment.id, payment.amount, payment.currency, eventId, payload],
      )
      if (settled.donation?.id) {
        await deliverDonationReceiptEmail(settled.donation.id)
      }
      handled = true
    } else if (
      payload.event === 'subscription.charged' &&
      subscription?.id &&
      payment?.id &&
      payment.amount &&
      payment.currency
    ) {
      // First charge settles the seed donation; later charges create renewals.
      const [seed] = await query<{ status: string }>(
        `select status from donations
          where razorpay_subscription_id = $1
          order by created_at asc
          limit 1`,
        [subscription.id],
      )
      const settled =
        seed?.status === 'pending'
          ? await callBusinessFunction<{ donation?: { id?: string } }>(
              'settle_razorpay_subscription_payment',
              [
                subscription.id,
                payment.id,
                payment.amount,
                payment.currency,
                eventId,
                payload,
              ],
            )
          : await callBusinessFunction<{ donation?: { id?: string } }>(
              'record_subscription_renewal',
              [
                subscription.id,
                payment.id,
                payment.amount,
                payment.currency,
                eventId,
                payload,
              ],
            )
      if (settled.donation?.id) {
        await deliverDonationReceiptEmail(settled.donation.id)
      }
      handled = true
    } else if (payload.event === 'payment.failed' && payment?.order_id) {
      await query(
        `update donations set status = 'failed', updated_at = now()
          where razorpay_order_id = $1 and status = 'pending'`,
        [payment.order_id],
      )
      handled = true
    } else if (
      payload.event === 'payment.failed' &&
      (payment?.subscription_id || subscription?.id)
    ) {
      const subId = payment?.subscription_id || subscription?.id
      await query(
        `update donations set status = 'failed', updated_at = now()
          where razorpay_subscription_id = $1 and status = 'pending'`,
        [subId],
      )
      await callBusinessFunction('update_subscription_status', [subId, 'failed'])
      handled = true
    } else if (
      payload.event === 'refund.processed' &&
      refund?.id &&
      refund.payment_id &&
      refund.status === 'processed' &&
      refund.amount
    ) {
      const [row] = await query<{ id: string }>(
        `select r.id
           from donation_refunds r
           join donations d on d.id = r.donation_id
          where d.razorpay_payment_id = $1
            and r.amount = $2::numeric / 100
            and r.status in ('pending', 'approved', 'processing')
          order by r.initiated_at asc
          limit 1`,
        [refund.payment_id, refund.amount],
      )
      if (row) {
        await query('select public.complete_razorpay_refund($1, $2, $3, $4)', [
          row.id,
          refund.id,
          refund.status,
          payload,
        ])
      }
      handled = true
    } else if (SUBSCRIPTION_STATUS_EVENTS.has(payload.event) && subscription?.id) {
      const status =
        payload.event === 'subscription.cancelled'
          ? 'cancelled'
          : payload.event === 'subscription.completed'
            ? 'completed'
            : payload.event === 'subscription.halted' || payload.event === 'subscription.paused'
              ? 'paused'
              : payload.event === 'subscription.pending'
                ? 'pending'
                : 'active'
      await callBusinessFunction('update_subscription_status', [subscription.id, status])
      handled = true
    }

    await finishEvent(eventId, handled ? 'processed' : 'ignored', null)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed'
    await finishEvent(eventId, 'failed', message.slice(0, 2000)).catch(() => undefined)
    throw error
  }

  res.status(200).json({ received: true, event: payload.event })
})
