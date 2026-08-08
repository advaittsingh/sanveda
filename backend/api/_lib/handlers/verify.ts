import { z } from 'zod'
import { deliverDonationReceiptEmail } from '../email.js'
import { apiHandler, HttpError, method, parseBody } from '../http.js'
import {
  callBusinessFunction,
  hmacSha256,
  paymentConfig,
  razorpayOrderSchema,
  razorpayPaymentSchema,
  razorpayRequest,
  timingSafeEqualHex,
  validateCapturedPayment,
} from '../payment.js'

const requestSchema = z
  .object({
    donationId: z.string().uuid(),
    checkoutToken: z.string().min(32).max(256),
    razorpay_order_id: z.string().min(1).max(128),
    razorpay_payment_id: z.string().min(1).max(128),
    razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
  })
  .strict()

type PreparedOrder = {
  amountPaise: number
  currency: string
  orderId: string | null
}

type Settlement = {
  donation?: { id?: string }
  alreadyCompleted?: boolean
}

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const input = parseBody(req, requestSchema)
  const { keySecret } = paymentConfig()
  const expected = hmacSha256(keySecret, `${input.razorpay_order_id}|${input.razorpay_payment_id}`)
  if (!timingSafeEqualHex(expected, input.razorpay_signature)) {
    throw new HttpError(400, 'Invalid payment signature', 'invalid_payment_signature')
  }

  const prepared = await callBusinessFunction<PreparedOrder>('prepare_razorpay_order', [
    input.donationId,
    input.checkoutToken,
  ])
  if (prepared.orderId !== input.razorpay_order_id) {
    throw new HttpError(400, 'Payment order is not bound to this donation', 'payment_mismatch')
  }

  const [order, payment] = await Promise.all([
    razorpayRequest(
      `/orders/${encodeURIComponent(input.razorpay_order_id)}`,
      { method: 'GET' },
      razorpayOrderSchema,
    ),
    razorpayRequest(
      `/payments/${encodeURIComponent(input.razorpay_payment_id)}`,
      { method: 'GET' },
      razorpayPaymentSchema,
    ),
  ])
  validateCapturedPayment(
    input.donationId,
    Number(prepared.amountPaise),
    prepared.currency,
    order,
    payment,
  )

  const settled = await callBusinessFunction<Settlement>('settle_razorpay_payment', [
    order.id,
    payment.id,
    payment.amount,
    payment.currency,
    null,
    { order, payment },
  ])
  await deliverDonationReceiptEmail(input.donationId)
  res.status(200).json({ success: true, result: settled })
})
