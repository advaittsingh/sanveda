import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? ''

async function hmacSha256(key: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature') ?? ''

    if (RAZORPAY_WEBHOOK_SECRET) {
      const expected = await hmacSha256(RAZORPAY_WEBHOOK_SECRET, rawBody)
      if (expected !== signature) {
        return jsonResponse({ error: 'Invalid webhook signature' }, 401)
      }
    }

    const payload = JSON.parse(rawBody) as {
      event: string
      payload?: {
        payment?: { entity?: { id?: string; order_id?: string; amount?: number; status?: string } }
        order?: { entity?: { id?: string; receipt?: string } }
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const event = payload.event
    const payment = payload.payload?.payment?.entity

    if (event === 'payment.captured' && payment?.id && payment.order_id) {
      const { data: donationRow } = await supabase
        .from('donations')
        .select('id, status')
        .eq('razorpay_order_id', payment.order_id)
        .maybeSingle()

      if (donationRow && donationRow.status === 'pending') {
        const { data: receiptNumber } = await supabase.rpc('generate_receipt_number')
        await supabase.rpc('complete_donation_and_update_campaign', {
          p_donation_id: donationRow.id,
          p_payment_id: payment.id,
          p_receipt_number: receiptNumber,
        })
      }
    }

    if (event === 'payment.failed' && payment?.order_id) {
      await supabase
        .from('donations')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('razorpay_order_id', payment.order_id)
        .eq('status', 'pending')
    }

    if (event === 'refund.created' && payment?.id) {
      await supabase
        .from('donations')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('razorpay_payment_id', payment.id)
    }

    await supabase.from('audit_logs').insert({
      action: 'WEBHOOK',
      entity_type: 'razorpay',
      entity_id: event,
      details: { payment_id: payment?.id, order_id: payment?.order_id, status: payment?.status },
      severity: 'info',
    })

    return jsonResponse({ received: true, event })
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
