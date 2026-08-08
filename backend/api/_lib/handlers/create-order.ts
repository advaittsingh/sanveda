import { z } from 'zod'
import { transaction } from '../db.js'
import { apiHandler, HttpError, method, parseBody } from '../http.js'
import { callBusinessFunction, razorpayOrderSchema, razorpayRequest } from '../payment.js'

const requestSchema = z
  .object({
    donationId: z.string().uuid(),
    checkoutToken: z.string().min(32).max(256),
  })
  .strict()

type PreparedOrder = {
  id: string
  status: string
  amountPaise: number
  currency: string
  orderId: string | null
  receipt: string
  donationType?: string
}

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const input = parseBody(req, requestSchema)

  const order = await transaction(async (client) => {
    await client.query('select pg_advisory_xact_lock(hashtextextended($1, 0))', [input.donationId])
    const prepared = await callBusinessFunction<PreparedOrder>(
      'prepare_razorpay_order',
      [input.donationId, input.checkoutToken],
      client,
    )
    if (prepared.donationType === 'recurring') {
      throw new HttpError(
        409,
        'Monthly donations require an autopay mandate. Use create-subscription instead.',
        'subscription_required',
      )
    }
    const amount = Number(prepared.amountPaise)
    if (!Number.isSafeInteger(amount) || amount < 100 || prepared.currency !== 'INR') {
      throw new HttpError(409, 'Donation amount is not payable', 'payment_conflict')
    }
    if (prepared.orderId) {
      return { id: prepared.orderId, amount, currency: prepared.currency }
    }

    const created = await razorpayRequest(
      '/orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: prepared.currency,
          receipt: prepared.receipt,
          notes: { donation_id: input.donationId },
        }),
      },
      razorpayOrderSchema,
    )
    const boundOrderId = await callBusinessFunction<string>(
      'bind_razorpay_order',
      [input.donationId, input.checkoutToken, created.id, created.amount, created.currency],
      client,
    )
    if (boundOrderId !== created.id) {
      throw new HttpError(409, 'Could not bind payment order', 'payment_conflict')
    }
    return created
  })

  res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency })
})
