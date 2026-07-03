import { BRAND } from '../constants/brand'
import { isSupabaseConfigured, requireSupabase } from './supabase'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : ''

export type EmailTemplate =
  | 'donation_receipt'
  | 'volunteer_received'
  | 'volunteer_approved'
  | 'membership_received'
  | 'membership_approved'
  | 'enquiry_received'
  | 'custom'

export async function sendTransactionalEmail(
  to: string,
  subject: string,
  html: string,
  template: EmailTemplate = 'custom',
): Promise<boolean> {
  if (!isSupabaseConfigured || !FUNCTIONS_URL) {
    console.info('[email] Demo mode — would send:', { to, subject, template })
    return false
  }

  const { data: { session } } = await requireSupabase().auth.getSession()

  const res = await fetch(`${FUNCTIONS_URL}/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ to, subject, html, template }),
  })

  if (!res.ok) return false
  const body = await res.json()
  return Boolean(body.success)
}

export function donationReceiptEmailHtml(params: {
  donorName: string
  amount: number
  campaignTitle: string
  receiptNumber: string
}): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#041B4D">Thank you, ${params.donorName}!</h2>
      <p>Your donation of <strong>₹${params.amount.toLocaleString('en-IN')}</strong> to <em>${params.campaignTitle}</em> supports ${BRAND.shortName}'s humanitarian mission.</p>
      <p><strong>Receipt No:</strong> ${params.receiptNumber}</p>
      <p style="color:#4A4A49;font-size:13px">With gratitude,<br/>${BRAND.name}</p>
    </div>
  `
}

export function volunteerStatusEmailHtml(fullName: string, status: string, volunteerId?: string): string {
  const idLine = volunteerId ? `<p><strong>Volunteer ID:</strong> ${volunteerId}</p>` : ''
  return `
    <div style="font-family:sans-serif">
      <h2>Volunteer Application Update</h2>
      <p>Dear ${fullName},</p>
      <p>Your volunteer application status is now: <strong>${status}</strong>.</p>
      ${idLine}
      <p>Regards,<br/>${BRAND.shortName} Team</p>
    </div>
  `
}

export function membershipStatusEmailHtml(fullName: string, status: string, memberId?: string): string {
  const idLine = memberId ? `<p><strong>Member ID:</strong> ${memberId}</p>` : ''
  return `
    <div style="font-family:sans-serif">
      <h2>Membership Application Update</h2>
      <p>Dear ${fullName},</p>
      <p>Your membership status is now: <strong>${status}</strong>.</p>
      ${idLine}
      <p>Regards,<br/>${BRAND.shortName} Team</p>
    </div>
  `
}

export function enquiryReceivedEmailHtml(name: string): string {
  return `
    <div style="font-family:sans-serif">
      <p>Dear ${name},</p>
      <p>We have received your enquiry and will respond within 2–3 business days.</p>
      <p>Regards,<br/>${BRAND.shortName} Team</p>
    </div>
  `
}
