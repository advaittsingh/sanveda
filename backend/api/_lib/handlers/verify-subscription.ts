import { z } from 'zod'
import { deliverDonationReceiptEmail } from '../email.js'
import { apiHandler, HttpError, method, parseBody } from '../http.js'
import {
  callBusinessFunction,
  hmacSha256,
  paymentConfig,
  razorpayPaymentSchema,
  razorpayRequest,
  timingSafeEqualHex,
} from '../payment.js'

const requestSchema = z
  .object({
    donationId: z.string().uuid(),
    checkoutToken: z.string().min(32).max(256),
    razorpay_subscription_id: z.string().min(1).max(128),
    razorpay_payment_id: z.string().min(1).max(128),
    razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
  })
  .strict()

type PreparedSubscription = {
  amountPaise: number
  currency: string
  subscriptionId: string | null
}

type Settlement = {
  donation?: { id?: string }
  alreadyCompleted?: boolean
}

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const input = parseBody(req, requestSchema)
  const { keySecret } = paymentConfig()
  const expected = hmacSha256(
    keySecret,
    `${input.razorpay_payment_id}|${input.razorpay_subscription_id}`,
  )
  if (!timingSafeEqualHex(expected, input.razorpay_signature)) {
    throw new HttpError(400, 'Invalid payment signature', 'invalid_payment_signature')
  }

  const prepared = await callBusinessFunction<PreparedSubscription>('prepare_razorpay_subscription', [
    input.donationId,
    input.checkoutToken,
  ])
  if (prepared.subscriptionId !== input.razorpay_subscription_id) {
    throw new HttpError(400, 'Subscription is not bound to this donation', 'payment_mismatch')
  }

  const payment = await razorpayRequest(
    `/payments/${encodeURIComponent(input.razorpay_payment_id)}`,
    { method: 'GET' },
    razorpayPaymentSchema,
  )

  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    throw new HttpError(400, 'Subscription payment is not captured', 'payment_not_captured')
  }
  if (payment.amount !== Number(prepared.amountPaise)) {
    throw new HttpError(400, 'Payment amount mismatch', 'payment_mismatch')
  }
  if (payment.currency !== prepared.currency) {
    throw new HttpError(400, 'Payment currency mismatch', 'payment_mismatch')
  }

  const settled = await callBusinessFunction<Settlement>('settle_razorpay_subscription_payment', [
    input.razorpay_subscription_id,
    payment.id,
    payment.amount,
    payment.currency,
    null,
    { payment, subscription_id: input.razorpay_subscription_id },
  ])
  await deliverDonationReceiptEmail(input.donationId)
  res.status(200).json({ success: true, result: settled })
})
