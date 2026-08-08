import { z } from 'zod'
import { query, transaction } from '../db.js'
import { apiHandler, HttpError, method, parseBody } from '../http.js'
import { razorpayRefundSchema, razorpayRequest } from '../payment.js'
import { requireAdmin } from '../session.js'

const requestSchema = z
  .object({
    refundId: z.string().uuid(),
  })
  .strict()

type RefundClaim = {
  refundId: string
  donationId: string
  paymentId: string
  amountPaise: number
  originalStatus: string
  gatewayRefundId: string | null
  gatewayStatus: string | null
}

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const session = await requireAdmin(req)
  const input = parseBody(req, requestSchema)

  const claim = await transaction(async (client): Promise<RefundClaim> => {
    await client.query(`select set_config('app.user_id', $1, true)`, [session.user.id])
    const permission = await client.query<{ allowed: boolean }>(
      `select public.admin_has_permission('payments', 'view') as allowed`,
    )
    if (!permission.rows[0]?.allowed) {
      throw new HttpError(403, 'Payment refund permission required', 'forbidden')
    }
    const result = await client.query<{
      refund_id: string
      donation_id: string
      payment_id: string | null
      amount_paise: string
      status: string
      gateway_refund_id: string | null
      gateway_status: string | null
      donation_status: string
    }>(
      `select r.id as refund_id, r.donation_id, d.razorpay_payment_id as payment_id,
              (r.amount * 100)::bigint as amount_paise, r.status,
              r.gateway_refund_id, pt.status as gateway_status, d.status as donation_status
         from donation_refunds r
         join donations d on d.id = r.donation_id
         left join payment_transactions pt
           on pt.idempotency_key = 'razorpay:refund:' || r.gateway_refund_id
        where r.id = $1
        for update of r`,
      [input.refundId],
    )
    const row = result.rows[0]
    if (!row?.payment_id) {
      throw new HttpError(409, 'Refund is not eligible for processing', 'refund_conflict')
    }
    if (row.status === 'completed' && row.gateway_refund_id) {
      return {
        refundId: row.refund_id,
        donationId: row.donation_id,
        paymentId: row.payment_id,
        amountPaise: Number(row.amount_paise),
        originalStatus: row.status,
        gatewayRefundId: row.gateway_refund_id,
        gatewayStatus: 'processed',
      }
    }
    if (
      !['pending', 'approved', 'processing'].includes(row.status) ||
      row.donation_status !== 'completed'
    ) {
      throw new HttpError(409, 'Refund is not eligible for processing', 'refund_conflict')
    }
    await client.query(`update donation_refunds set status = 'processing' where id = $1`, [
      row.refund_id,
    ])
    return {
      refundId: row.refund_id,
      donationId: row.donation_id,
      paymentId: row.payment_id,
      amountPaise: Number(row.amount_paise),
      originalStatus: row.status,
      gatewayRefundId: row.gateway_refund_id,
      gatewayStatus: row.gateway_status,
    }
  })

  if (claim.originalStatus === 'completed' && claim.gatewayRefundId) {
    res.status(200).json({
      success: true,
      refundId: claim.gatewayRefundId,
      status: 'processed',
    })
    return
  }

  try {
    const gatewayRefund = await razorpayRequest(
      `/payments/${encodeURIComponent(claim.paymentId)}/refund`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Razorpay-Idempotency-Key': `sanveda-refund-${claim.refundId}`,
        },
        body: JSON.stringify({
          amount: claim.amountPaise,
          speed: 'normal',
          notes: {
            donation_id: claim.donationId,
            refund_request_id: claim.refundId,
          },
          receipt: `r_${claim.refundId.replaceAll('-', '').slice(0, 32)}`,
        }),
      },
      razorpayRefundSchema,
    )
    if (
      gatewayRefund.payment_id !== claim.paymentId ||
      gatewayRefund.amount !== claim.amountPaise
    ) {
      throw new HttpError(
        502,
        'Razorpay refund did not match the request',
        'invalid_gateway_response',
      )
    }
    await query('select public.complete_razorpay_refund($1, $2, $3, $4)', [
      claim.refundId,
      gatewayRefund.id,
      gatewayRefund.status,
      gatewayRefund,
    ])
    res.status(200).json({
      success: true,
      refundId: gatewayRefund.id,
      status: gatewayRefund.status,
    })
  } catch (error) {
    await query(
      `update donation_refunds
          set status = $2
        where id = $1 and status = 'processing' and gateway_refund_id is null`,
      [claim.refundId, claim.originalStatus === 'processing' ? 'approved' : claim.originalStatus],
    ).catch(() => undefined)
    throw error
  }
})
