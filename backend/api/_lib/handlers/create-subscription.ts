import { z } from 'zod'
import { query, transaction } from '../db.js'
import { apiHandler, HttpError, method, parseBody } from '../http.js'
import {
  callBusinessFunction,
  razorpayPlanSchema,
  razorpayRequest,
  razorpaySubscriptionSchema,
} from '../payment.js'

const requestSchema = z
  .object({
    donationId: z.string().uuid(),
    checkoutToken: z.string().min(32).max(256),
  })
  .strict()

type PreparedSubscription = {
  id: string
  status: string
  amountPaise: number
  currency: string
  subscriptionId: string | null
  campaignId: number | null
  campaignTitle: string
  donorName: string | null
  donorEmail: string | null
  donorPhone: string | null
  userId: string | null
}

function planName(campaignTitle: string, amountPaise: number): string {
  const rupees = Math.round(amountPaise / 100)
  const title = campaignTitle.trim().slice(0, 80) || 'Monthly Donation'
  return `Sanveda · ${title} · ₹${rupees}/mo`.slice(0, 255)
}

async function resolveOrCreatePlan(input: {
  campaignId: number | null
  campaignTitle: string
  amountPaise: number
  currency: string
}): Promise<string> {
  const existing = await query<{ gateway_plan_id: string }>(
    `select gateway_plan_id
       from recurring_plans
      where gateway = 'razorpay'
        and coalesce(campaign_id, 0) = coalesce($1::int, 0)
        and amount_paise = $2
        and currency = $3
        and interval_unit = 'month'
        and interval_count = 1
      limit 1`,
    [input.campaignId, input.amountPaise, input.currency],
  )
  if (existing[0]?.gateway_plan_id) return existing[0].gateway_plan_id

  const name = planName(input.campaignTitle, input.amountPaise)
  const created = await razorpayRequest(
    '/plans',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: 'monthly',
        interval: 1,
        item: {
          name,
          amount: input.amountPaise,
          currency: input.currency,
          description: `Monthly autopay for ${input.campaignTitle}`.slice(0, 255),
        },
        notes: {
          campaign_id: input.campaignId != null ? String(input.campaignId) : '',
          amount_paise: String(input.amountPaise),
          cause: input.campaignTitle.slice(0, 255),
        },
      }),
    },
    razorpayPlanSchema,
  )

  await query(
    `insert into recurring_plans (
       gateway, campaign_id, amount_paise, currency, interval_unit, interval_count,
       gateway_plan_id, plan_name
     ) values ('razorpay', $1, $2, $3, 'month', 1, $4, $5)
     on conflict (gateway, gateway_plan_id) do nothing`,
    [input.campaignId, input.amountPaise, input.currency, created.id, name],
  )

  return created.id
}

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const input = parseBody(req, requestSchema)

  const subscription = await transaction(async (client) => {
    await client.query('select pg_advisory_xact_lock(hashtextextended($1, 0))', [input.donationId])
    const prepared = await callBusinessFunction<PreparedSubscription>(
      'prepare_razorpay_subscription',
      [input.donationId, input.checkoutToken],
      client,
    )
    const amount = Number(prepared.amountPaise)
    if (!Number.isSafeInteger(amount) || amount < 100 || prepared.currency !== 'INR') {
      throw new HttpError(409, 'Donation amount is not payable', 'payment_conflict')
    }
    if (prepared.subscriptionId) {
      return {
        id: prepared.subscriptionId,
        amount,
        currency: prepared.currency,
      }
    }

    // Plan lookup/create uses the shared pool (outside the advisory lock's client is fine
    // for the Razorpay round-trip; bind still runs inside this transaction).
    const planId = await resolveOrCreatePlan({
      campaignId: prepared.campaignId,
      campaignTitle: prepared.campaignTitle,
      amountPaise: amount,
      currency: prepared.currency,
    })

    const created = await razorpayRequest(
      '/subscriptions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          // Open-ended monthly giving for ~10 years; donor can cancel earlier.
          total_count: 120,
          quantity: 1,
          customer_notify: true,
          notes: {
            donation_id: input.donationId,
            campaign_id: prepared.campaignId != null ? String(prepared.campaignId) : '',
            campaign_title: prepared.campaignTitle.slice(0, 255),
            checkout: 'monthly',
          },
        }),
      },
      razorpaySubscriptionSchema,
    )

    const bound = await callBusinessFunction<string>(
      'bind_razorpay_subscription',
      [input.donationId, input.checkoutToken, created.id, planId, amount, prepared.currency],
      client,
    )
    if (bound !== created.id) {
      throw new HttpError(409, 'Could not bind payment subscription', 'payment_conflict')
    }
    return { id: created.id, amount, currency: prepared.currency }
  })

  res.status(200).json({
    subscriptionId: subscription.id,
    amount: subscription.amount,
    currency: subscription.currency,
  })
})
