import { z } from 'zod'
import { escapeHtml, sendEmail } from '../_lib/email.js'
import { query } from '../_lib/db.js'
import { apiHandler, HttpError, method, parseBody } from '../_lib/http.js'
import { requireAdmin } from '../_lib/session.js'

const templateSchema = z.enum([
  'donation_receipt',
  'volunteer_received',
  'volunteer_approved',
  'membership_received',
  'membership_approved',
  'enquiry_received',
  'internship_received',
  'custom',
])

const requestSchema = z
  .object({
    to: z.email().max(320),
    subject: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .refine((value) => !/[\r\n]/.test(value)),
    html: z.string().min(1).max(100_000),
    template: templateSchema.default('custom'),
    enquiryId: z.string().max(128).optional(),
    volunteerId: z.string().max(128).optional(),
    membershipId: z.string().max(128).optional(),
    internshipId: z.string().max(128).optional(),
  })
  .strict()

const publicTemplates = {
  enquiry_received: {
    table: 'enquiries',
    reference: 'enquiryId',
    nameColumn: 'name',
    subject: 'We received your enquiry — Sanveda',
    message: 'We have received your enquiry and will respond within 2–3 business days.',
  },
  volunteer_received: {
    table: 'volunteer_applications',
    reference: 'volunteerId',
    nameColumn: 'full_name',
    subject: 'Sanveda Volunteer Application Received',
    message: 'We have received your volunteer application.',
  },
  membership_received: {
    table: 'memberships',
    reference: 'membershipId',
    nameColumn: 'full_name',
    subject: 'Sanveda Membership Application Received',
    message: 'We have received your membership application.',
  },
  internship_received: {
    table: 'internships',
    reference: 'internshipId',
    nameColumn: 'full_name',
    subject: 'Internship Application Received',
    message: 'We have received your internship application.',
  },
} as const

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const input = parseBody(req, requestSchema)
  let subject = input.subject
  let html = input.html
  let eventKey: string | null = null

  const publicConfig = publicTemplates[input.template as keyof typeof publicTemplates]
  if (publicConfig) {
    const reference = input[publicConfig.reference]
    if (!reference) {
      throw new HttpError(400, `${publicConfig.reference} is required`, 'invalid_request')
    }
    const rows = await query<{ email: string; name: string }>(
      `select email, ${publicConfig.nameColumn} as name
         from ${publicConfig.table}
        where id = $1
        limit 1`,
      [reference],
    )
    const record = rows[0]
    if (!record || record.email.toLowerCase() !== input.to.toLowerCase()) {
      throw new HttpError(403, 'Invalid application reference', 'forbidden')
    }
    subject = publicConfig.subject
    eventKey = `${input.template}:${reference}`
    html = [
      `<p>Dear ${escapeHtml(record.name)},</p>`,
      `<p>${escapeHtml(publicConfig.message)}</p>`,
      '<p>Regards,<br>Sanveda Team</p>',
    ].join('')
  } else {
    await requireAdmin(req)
  }

  try {
    await sendEmail({
      to: input.to,
      subject,
      html,
      idempotencyKey: eventKey ?? undefined,
    })
    await query(
      `insert into email_logs (recipient, subject, template, status, event_key)
       values ($1, $2, $3, 'sent', $4)
       on conflict (event_key) where event_key is not null do update
       set status = 'sent', error_message = null`,
      [input.to.toLowerCase(), subject, input.template, eventKey],
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message.slice(0, 2000) : 'Email delivery failed'
    await query(
      `insert into email_logs (recipient, subject, template, status, error_message, event_key)
       values ($1, $2, $3, 'failed', $4, $5)
       on conflict (event_key) where event_key is not null do update
       set status = 'failed', error_message = excluded.error_message`,
      [input.to.toLowerCase(), subject, input.template, errorMessage, eventKey],
    ).catch(() => undefined)

    // Public application confirmations are best-effort; do not surface provider/config failures
    // as hard API errors (DB record already exists when the client calls this endpoint).
    if (publicConfig) {
      res.status(200).json({ success: false, status: 'failed' })
      return
    }
    throw error
  }
  res.status(200).json({ success: true, status: 'sent' })
})
