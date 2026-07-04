import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsonResponse, optionsResponse } from '../_shared/cors.ts'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? ''
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  try {
    const { donationId, amount, currency = 'INR' } = await req.json()

    if (!donationId || !amount) {
      return jsonResponse({ error: 'donationId and amount are required' }, 400)
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return jsonResponse({ error: 'Razorpay is not configured on the server' }, 500)
    }

    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        currency,
        receipt: `donation_${donationId}`,
        notes: { donation_id: donationId },
      }),
    })

    const order = await orderRes.json()
    if (!orderRes.ok) {
      return jsonResponse({ error: order.error?.description ?? 'Failed to create order' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    await supabase
      .from('donations')
      .update({ razorpay_order_id: order.id, updated_at: new Date().toISOString() })
      .eq('id', donationId)

    return jsonResponse({ orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
