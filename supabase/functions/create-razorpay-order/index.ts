import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsonResponse, optionsResponse } from '../_shared/cors.ts'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? ''
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return jsonResponse({ error: 'Razorpay is not configured on the server' }, 500)
    }

    const body = await req.json()
    const donationId = body.donationId as string | undefined
    const currency = (body.currency as string | undefined) ?? 'INR'

    // Accept rupees (amount) or paise (amountPaise). Frontend sends rupees.
    let amountPaise: number
    if (body.amountPaise != null) {
      amountPaise = Math.round(Number(body.amountPaise))
    } else if (body.amount != null) {
      amountPaise = Math.round(Number(body.amount) * 100)
    } else {
      return jsonResponse({ error: 'donationId and amount are required' }, 400)
    }

    if (!donationId) {
      return jsonResponse({ error: 'donationId is required' }, 400)
    }

    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      return jsonResponse({ error: 'Minimum amount is 100 paise (₹1)' }, 400)
    }

    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency,
        receipt: `donation_${String(donationId).slice(0, 32)}`,
        notes: { donation_id: donationId },
      }),
    })

    const order = await orderRes.json()
    if (!orderRes.ok) {
      const status = orderRes.status === 401 ? 401 : 500
      return jsonResponse({
        error: order.error?.description ?? order.error?.reason ?? 'Failed to create order',
      }, status)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    await supabase
      .from('donations')
      .update({ razorpay_order_id: order.id, updated_at: new Date().toISOString() })
      .eq('id', donationId)

    // Include both camelCase (frontend) and snake_case (Razorpay / docs).
    return jsonResponse({
      orderId: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
