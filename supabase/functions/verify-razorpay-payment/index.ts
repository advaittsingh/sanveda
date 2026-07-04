import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsonResponse, optionsResponse } from '../_shared/cors.ts'

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? ''
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'Sanveda <onboarding@resend.dev>'

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

async function sendDonationEmail(
  supabase: ReturnType<typeof createClient>,
  donation: Record<string, unknown>,
) {
  const email = donation.donor_email as string | undefined
  if (!email) return

  const subject = `Thank you for your donation — ${donation.receipt_number}`
  const html = `
    <h2>Thank you for supporting Sanveda!</h2>
    <p>Your donation of <strong>₹${Number(donation.amount).toLocaleString('en-IN')}</strong> for <em>${donation.campaign_title}</em> has been received.</p>
    <p><strong>Receipt No:</strong> ${donation.receipt_number}</p>
    <p>With gratitude,<br/>Sanveda Global Humanitarian Foundation</p>
  `

  if (RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject, html }),
    })

    await supabase.from('email_logs').insert({
      recipient: email,
      subject,
      template: 'donation_receipt',
      status: res.ok ? 'sent' : 'failed',
      error_message: res.ok ? null : await res.text(),
      metadata: { donation_id: donation.id },
    })
  } else {
    await supabase.from('email_logs').insert({
      recipient: email,
      subject,
      template: 'donation_receipt',
      status: 'queued',
      metadata: { donation_id: donation.id, note: 'RESEND_API_KEY not configured' },
    })
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  try {
    const { donationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!donationId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return jsonResponse({ error: 'Missing payment verification fields' }, 400)
    }

    if (!RAZORPAY_KEY_SECRET) {
      return jsonResponse({ error: 'Razorpay secret not configured' }, 500)
    }

    const expected = await hmacSha256(RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`)
    if (expected !== razorpay_signature) {
      return jsonResponse({ error: 'Invalid payment signature' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: receiptNumber } = await supabase.rpc('generate_receipt_number')

    const { data: donation, error } = await supabase.rpc('complete_donation_and_update_campaign', {
      p_donation_id: donationId,
      p_payment_id: razorpay_payment_id,
      p_receipt_number: receiptNumber,
    })

    if (error) {
      return jsonResponse({ error: error.message }, 500)
    }

    await sendDonationEmail(supabase, donation as Record<string, unknown>)

    return jsonResponse({ success: true, donation })
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
