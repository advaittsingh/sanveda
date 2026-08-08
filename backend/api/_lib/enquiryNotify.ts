import { escapeHtml, sendEmail } from './email.js'
import { query } from './db.js'
import { serverEnv } from './env.js'
import { HttpError } from './http.js'

const DEFAULT_NOTIFY_EMAIL = 'Sanvedacharityfoundation@gmail.com'

/** Flatten subject/header text so CR/LF cannot inject extra email headers. */
export function sanitizeEmailSubject(value: string): string {
  return value.replace(/[\r\n\u0000]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
}

export function buildEnquiryUserConfirmHtml(name: string): string {
  return [
    `<p>Dear ${escapeHtml(name)},</p>`,
    '<p>We have received your enquiry and will respond within 2–3 business days.</p>',
    '<p>Regards,<br>Sanveda Team</p>',
  ].join('')
}

export function buildEnquiryOrgNotifyHtml(enquiry: {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
}): string {
  return [
    '<h2>New website enquiry</h2>',
    `<p><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(enquiry.phone)}</p>`,
    `<p><strong>Subject:</strong> ${escapeHtml(enquiry.subject)}</p>`,
    `<p><strong>Message:</strong></p><p>${escapeHtml(enquiry.message).replace(/\n/g, '<br>')}</p>`,
    `<p><strong>Enquiry ID:</strong> ${escapeHtml(enquiry.id)}</p>`,
    '<p>Review it in the admin Enquiries module.</p>',
  ].join('')
}

export function isEmailConfigured(): boolean {
  const env = serverEnv()
  return Boolean(env.RESEND_API_KEY?.trim() && env.FROM_EMAIL?.trim())
}

function notifyInbox(): string {
  const env = serverEnv()
  return (
    env.CONTACT_NOTIFY_EMAIL?.trim() ||
    process.env.ENQUIRY_NOTIFY_EMAIL?.trim() ||
    DEFAULT_NOTIFY_EMAIL
  )
}

async function logEmail(input: {
  recipient: string
  subject: string
  template: string
  status: 'sent' | 'failed'
  eventKey: string
  errorMessage?: string
}) {
  await query(
    `insert into email_logs (recipient, subject, template, status, error_message, event_key)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (event_key) where event_key is not null do update
     set status = excluded.status,
         error_message = excluded.error_message`,
    [
      input.recipient.toLowerCase(),
      input.subject,
      input.template,
      input.status,
      input.errorMessage ?? null,
      input.eventKey,
    ],
  ).catch(() => undefined)
}

async function trySend(input: {
  to: string
  subject: string
  html: string
  template: string
  eventKey: string
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    await logEmail({
      recipient: input.to,
      subject: input.subject,
      template: input.template,
      status: 'failed',
      eventKey: input.eventKey,
      errorMessage: 'Email delivery is not configured',
    })
    return false
  }

  try {
    await sendEmail({
      to: input.to,
      subject: input.subject,
      html: input.html,
      idempotencyKey: input.eventKey,
    })
    await logEmail({
      recipient: input.to,
      subject: input.subject,
      template: input.template,
      status: 'sent',
      eventKey: input.eventKey,
    })
    return true
  } catch (error) {
    const message =
      error instanceof HttpError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Email delivery failed'
    await logEmail({
      recipient: input.to,
      subject: input.subject,
      template: input.template,
      status: 'failed',
      eventKey: input.eventKey,
      errorMessage: message.slice(0, 2000),
    })
    return false
  }
}

/** Best-effort user confirmation + org inbox notification after an enquiry is saved. */
export async function notifyEnquiryCreated(enquiry: {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
}): Promise<{ userEmailSent: boolean; orgEmailSent: boolean }> {
  const userEmailSent = await trySend({
    to: enquiry.email,
    subject: 'We received your enquiry — Sanveda',
    template: 'enquiry_received',
    eventKey: `enquiry_received:${enquiry.id}`,
    html: buildEnquiryUserConfirmHtml(enquiry.name),
  })

  const orgEmailSent = await trySend({
    to: notifyInbox(),
    subject: sanitizeEmailSubject(`[Sanveda Contact] ${enquiry.subject}`),
    template: 'enquiry_org_notify',
    eventKey: `enquiry_org_notify:${enquiry.id}`,
    html: buildEnquiryOrgNotifyHtml(enquiry),
  })

  return { userEmailSent, orgEmailSent }
}
