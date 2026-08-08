import { query } from './db.js'
import { serverEnv } from './env.js'
import { HttpError } from './http.js'

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  )
}

export function sanitizeEmailHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|form|input|button)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|style|iframe|object|embed|form|input|button)\b[^>]*\/?>/gi, '')
    .replace(/\s(on\w+|srcdoc)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(["'])\s*(?:javascript|data):[\s\S]*?\2/gi, '')
}

export async function sendEmail(input: {
  to: string
  subject: string
  html: string
  idempotencyKey?: string
}): Promise<string> {
  const env = serverEnv()
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL) {
    throw new HttpError(503, 'Email delivery is not configured', 'email_unavailable')
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(input.idempotencyKey ? { 'Idempotency-Key': input.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [input.to],
      subject: input.subject,
      html: sanitizeEmailHtml(input.html),
    }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    console.error('Email provider rejected request', {
      status: response.status,
      response: (await response.text()).slice(0, 500),
    })
    throw new HttpError(502, 'Email could not be sent', 'email_delivery_failed')
  }
  const result = (await response.json().catch(() => ({}))) as { id?: string }
  return result.id ?? ''
}

type ReceiptEmailEvent = {
  id: string
  recipient: string
  subject: string
  donation: {
    amount?: unknown
    campaign_title?: unknown
    receipt_number?: unknown
  }
}

export async function deliverDonationReceiptEmail(donationId: string): Promise<void> {
  const [row] = await query<{ result: ReceiptEmailEvent | null }>(
    'select public.claim_donation_receipt_email($1) as result',
    [donationId],
  )
  const event = row?.result
  if (!event) return

  const donation = event.donation ?? {}
  const html = [
    '<h2>Thank you for supporting Sanveda.</h2>',
    `<p>We received your donation of <strong>₹${escapeHtml(donation.amount)}</strong>`,
    ` for ${escapeHtml(donation.campaign_title)}.</p>`,
    `<p><strong>Receipt:</strong> ${escapeHtml(donation.receipt_number)}</p>`,
  ].join('')
  try {
    await sendEmail({
      to: event.recipient,
      subject: event.subject,
      html,
      idempotencyKey: `donation-receipt-${donationId}`,
    })
    await query(
      `update email_logs set status = 'sent', error_message = null
        where id = $1 and status = 'processing'`,
      [event.id],
    )
  } catch (error) {
    await query(
      `update email_logs set status = 'failed', error_message = $2
        where id = $1 and status = 'processing'`,
      [event.id, error instanceof Error ? error.message.slice(0, 2000) : 'Email delivery failed'],
    )
  }
}
