import { BRAND } from '../constants/brand'

function escapeHtml(value: unknown): string {
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

export type EmailTemplate =
  | 'donation_receipt'
  | 'volunteer_received'
  | 'volunteer_approved'
  | 'membership_received'
  | 'membership_approved'
  | 'enquiry_received'
  | 'internship_received'
  | 'custom'

export interface EmailMeta {
  enquiryId?: string
  volunteerId?: string
  membershipId?: string
  internshipId?: string
}

/** Applicant-facing copy when the DB write succeeded but confirmation email did not. */
export const APPLICATION_EMAIL_DEGRADED_MESSAGE =
  'Your application was saved successfully. Email confirmation is temporarily unavailable, but our team can still see it in the admin panel.'

const EMAIL_UNAVAILABLE_MESSAGE =
  'Email delivery is temporarily unavailable. Please try again later.'

function emailErrorFromResponse(status: number, detail: unknown): Error {
  const raw = String(detail ?? '')
  if (
    status === 503 ||
    /not configured|email_unavailable|email_delivery_failed|RESEND|FROM_EMAIL|Resend/i.test(raw)
  ) {
    return new Error(EMAIL_UNAVAILABLE_MESSAGE)
  }
  if (status === 401 || status === 403) {
    return new Error('Your admin session expired. Sign in again, then resend the receipt.')
  }
  // Never forward provider/config details to the UI.
  return new Error(EMAIL_UNAVAILABLE_MESSAGE)
}

export async function sendTransactionalEmail(
  to: string,
  subject: string,
  html: string,
  template: EmailTemplate = 'custom',
  meta?: EmailMeta,
): Promise<boolean> {
  const res = await fetch('/api/email/send', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html, template, ...meta }),
  })

  const body = (await res.json().catch(() => ({}))) as {
    success?: boolean
    error?: string
    message?: string
  }

  if (!res.ok || !body.success) {
    throw emailErrorFromResponse(res.status, body.message || body.error)
  }
  return true
}

/**
 * Best-effort send for post-save confirmations. Never throws — callers treat DB write as success.
 */
export async function trySendTransactionalEmail(
  to: string,
  subject: string,
  html: string,
  template: EmailTemplate = 'custom',
  meta?: EmailMeta,
): Promise<boolean> {
  try {
    return await sendTransactionalEmail(to, subject, html, template, meta)
  } catch {
    return false
  }
}

export function donationReceiptEmailHtml(params: {
  donorName: string
  amount: number
  campaignTitle: string
  receiptNumber: string
  verificationUrl?: string
}): string {
  const verifyLine = params.verificationUrl
    ? `<p><a href="${escapeHtml(params.verificationUrl)}">Verify this receipt online</a></p>`
    : ''
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#041B4D">Thank you, ${escapeHtml(params.donorName)}!</h2>
      <p>Your donation of <strong>₹${escapeHtml(params.amount.toLocaleString('en-IN'))}</strong> to <em>${escapeHtml(params.campaignTitle)}</em> supports ${escapeHtml(BRAND.shortName)}'s humanitarian mission.</p>
      <p><strong>Receipt No:</strong> ${escapeHtml(params.receiptNumber)}</p>
      ${verifyLine}
      <p style="color:#4A4A49;font-size:13px">With gratitude,<br/>${escapeHtml(BRAND.name)}</p>
    </div>
  `
}

export function volunteerStatusEmailHtml(fullName: string, status: string, volunteerId?: string): string {
  const idLine = volunteerId
    ? `<p><strong>Volunteer ID:</strong> ${escapeHtml(volunteerId)}</p>`
    : ''
  return `
    <div style="font-family:sans-serif">
      <h2>Volunteer Application Update</h2>
      <p>Dear ${escapeHtml(fullName)},</p>
      <p>Your volunteer application status is now: <strong>${escapeHtml(status)}</strong>.</p>
      ${idLine}
      <p>Regards,<br/>${escapeHtml(BRAND.shortName)} Team</p>
    </div>
  `
}

export function membershipStatusEmailHtml(fullName: string, status: string, memberId?: string): string {
  const idLine = memberId ? `<p><strong>Member ID:</strong> ${escapeHtml(memberId)}</p>` : ''
  return `
    <div style="font-family:sans-serif">
      <h2>Membership Application Update</h2>
      <p>Dear ${escapeHtml(fullName)},</p>
      <p>Your membership status is now: <strong>${escapeHtml(status)}</strong>.</p>
      ${idLine}
      <p>Regards,<br/>${escapeHtml(BRAND.shortName)} Team</p>
    </div>
  `
}

export function enquiryReceivedEmailHtml(name: string): string {
  return `
    <div style="font-family:sans-serif">
      <p>Dear ${escapeHtml(name)},</p>
      <p>We have received your enquiry and will respond within 2–3 business days.</p>
      <p>Regards,<br/>${escapeHtml(BRAND.shortName)} Team</p>
    </div>
  `
}
