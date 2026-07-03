import { BRAND } from '../constants/brand'
import type { Membership } from './membershipService'
import type { VolunteerApplication } from '../types/volunteer'

export function downloadHtmlDocument(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const cardStyle = `
  body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 24px; background: #f5f7fa; }
  .card { width: 340px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(4,27,77,0.15); margin: 0 auto; }
  .header { background: linear-gradient(135deg, #041B4D, #0E4FA8); color: #fff; padding: 20px; text-align: center; }
  .header h1 { margin: 0; font-size: 14px; letter-spacing: 0.08em; }
  .header h2 { margin: 8px 0 0; font-size: 11px; font-weight: 400; opacity: 0.9; }
  .body { background: #fff; padding: 20px; }
  .photo { width: 80px; height: 80px; border-radius: 50%; background: #e8eef5; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #0E4FA8; }
  .name { text-align: center; font-size: 18px; font-weight: 800; color: #041B4D; margin: 0 0 4px; }
  .role { text-align: center; font-size: 12px; color: #4A4A49; margin: 0 0 16px; }
  .row { display: flex; justify-content: space-between; font-size: 11px; padding: 6px 0; border-bottom: 1px solid #eee; }
  .row span:first-child { color: #4A4A49; }
  .row span:last-child { font-weight: 700; color: #041B4D; }
  .footer { background: #041B4D; color: #fff; padding: 10px; text-align: center; font-size: 9px; }
`

export function generateVolunteerIdCardHtml(volunteer: VolunteerApplication): string {
  const roles = volunteer.preferredRoles.join(', ')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${cardStyle}</style></head><body>
  <div class="card">
    <div class="header"><h1>SANVEDA</h1><h2>Official Volunteer ID</h2></div>
    <div class="body">
      <div class="photo">${volunteer.fullName.charAt(0)}</div>
      <p class="name">${volunteer.fullName}</p>
      <p class="role">${roles || 'Volunteer'}</p>
      <div class="row"><span>Volunteer ID</span><span>${volunteer.volunteerId ?? '—'}</span></div>
      <div class="row"><span>Status</span><span>${volunteer.status}</span></div>
      <div class="row"><span>Valid From</span><span>${new Date().getFullYear()}</span></div>
    </div>
    <div class="footer">${BRAND.name}</div>
  </div></body></html>`
}

export function generateMemberIdCardHtml(member: Membership): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${cardStyle}</style></head><body>
  <div class="card">
    <div class="header"><h1>SANVEDA</h1><h2>Official Member ID</h2></div>
    <div class="body">
      <div class="photo">${member.fullName.charAt(0)}</div>
      <p class="name">${member.fullName}</p>
      <p class="role">${member.tier} Member</p>
      <div class="row"><span>Member ID</span><span>${member.memberId ?? '—'}</span></div>
      <div class="row"><span>Valid Until</span><span>${member.renewalDate ?? '—'}</span></div>
    </div>
    <div class="footer">${BRAND.name}</div>
  </div></body></html>`
}

export function generateAppointmentLetterHtml(params: {
  recipientName: string
  role: string
  department: string
  startDate: string
  type: 'volunteer' | 'staff' | 'intern'
  referenceId: string
}): string {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:40px;color:#1B1B1B;line-height:1.7}
  h1{color:#041B4D;font-size:22px} .sig{margin-top:48px}</style></head><body>
  <p style="text-align:right">${date}</p>
  <p><strong>${params.recipientName}</strong></p>
  <h1>Appointment Letter</h1>
  <p>Dear ${params.recipientName},</p>
  <p>We are pleased to appoint you as <strong>${params.role}</strong> in the <strong>${params.department}</strong> department of ${BRAND.name}, effective <strong>${params.startDate}</strong>.</p>
  <p>This appointment is issued under reference <strong>${params.referenceId}</strong>. We look forward to your dedicated contribution toward our humanitarian mission.</p>
  <div class="sig">
    <p>Authorized Signatory<br/><strong>${BRAND.name}</strong><br/>${BRAND.email}</p>
  </div>
  </body></html>`
}

export function downloadVolunteerIdCard(volunteer: VolunteerApplication): void {
  downloadHtmlDocument(generateVolunteerIdCardHtml(volunteer), `${volunteer.volunteerId ?? volunteer.id}-id-card.html`)
}

export function downloadMemberIdCard(member: Membership): void {
  downloadHtmlDocument(generateMemberIdCardHtml(member), `${member.memberId ?? member.id}-id-card.html`)
}

export function generateBeneficiaryIdCardHtml(beneficiary: {
  fullName: string
  beneficiaryId: string
  programLabel: string
  categoryLabel: string
  status: string
}): string {
  const validTill = new Date(new Date().getFullYear() + 1, 11, 31).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  })
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${cardStyle}
  .qr { width: 64px; height: 64px; margin: 12px auto 0; border: 2px dashed #0E4FA8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #0E4FA8; text-align: center; }
  </style></head><body>
  <div class="card">
    <div class="header"><h1>SANVEDA</h1><h2>Beneficiary Card</h2></div>
    <div class="body">
      <div class="photo">${beneficiary.fullName.charAt(0)}</div>
      <p class="name">${beneficiary.fullName}</p>
      <p class="role">${beneficiary.programLabel}</p>
      <div class="row"><span>Beneficiary ID</span><span>${beneficiary.beneficiaryId}</span></div>
      <div class="row"><span>Program</span><span>${beneficiary.categoryLabel}</span></div>
      <div class="row"><span>Status</span><span>${beneficiary.status}</span></div>
      <div class="row"><span>Valid Till</span><span>${validTill}</span></div>
      <div class="qr">QR<br/>VERIFY</div>
    </div>
    <div class="footer">${BRAND.name}</div>
  </div></body></html>`
}

export function downloadBeneficiaryIdCard(beneficiary: {
  fullName: string
  beneficiaryId: string
  programLabel: string
  categoryLabel: string
  status: string
  id: string
}): void {
  downloadHtmlDocument(
    generateBeneficiaryIdCardHtml(beneficiary),
    `${beneficiary.beneficiaryId}-beneficiary-card.html`,
  )
}

export function downloadAppointmentLetter(params: Parameters<typeof generateAppointmentLetterHtml>[0]): void {
  downloadHtmlDocument(generateAppointmentLetterHtml(params), `${params.referenceId}-appointment-letter.html`)
}

export function generateEventPassHtml(params: {
  eventTitle: string
  attendeeName: string
  registrationId: string
  seat?: string
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${cardStyle}
  .qr { width: 72px; height: 72px; margin: 12px auto 0; border: 2px dashed #0E4FA8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #0E4FA8; text-align: center; }
  </style></head><body>
  <div class="card">
    <div class="header"><h1>SANVEDA</h1><h2>Event Pass</h2></div>
    <div class="body">
      <p class="role">${params.eventTitle}</p>
      <p class="name">${params.attendeeName}</p>
      <div class="row"><span>Registration ID</span><span>${params.registrationId}</span></div>
      <div class="row"><span>Seat</span><span>${params.seat ?? 'General'}</span></div>
      <div class="qr">QR<br/>CHECK-IN</div>
    </div>
    <div class="footer">${BRAND.name}</div>
  </div></body></html>`
}

export function generateEventParticipationCertificateHtml(params: {
  attendeeName: string
  eventTitle: string
  year?: number
}): string {
  const year = params.year ?? new Date().getFullYear()
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:48px;border:4px double #041B4D;text-align:center}
  h1{color:#041B4D;font-size:18px;letter-spacing:0.1em}h2{font-size:28px;color:#041B4D;margin:24px 0}</style></head><body>
  <p style="font-size:13px;letter-spacing:0.1em">SANVEDA GLOBAL HUMANITARIAN FOUNDATION</p>
  <h1>CERTIFICATE OF PARTICIPATION</h1>
  <p>This certifies that</p>
  <h2>${params.attendeeName}</h2>
  <p>participated in the<br/><strong>${params.eventTitle}</strong><br/>organized by Sanveda Global Humanitarian Foundation</p>
  <p style="margin-top:32px;font-size:13px">${year}</p>
  </body></html>`
}

export function downloadEventPass(params: Parameters<typeof generateEventPassHtml>[0]): void {
  downloadHtmlDocument(generateEventPassHtml(params), `${params.registrationId}-event-pass.html`)
}

export function downloadEventParticipationCertificate(params: Parameters<typeof generateEventParticipationCertificateHtml>[0]): void {
  downloadHtmlDocument(
    generateEventParticipationCertificateHtml(params),
    `${params.attendeeName.replace(/\s+/g, '-')}-participation-cert.html`,
  )
}
