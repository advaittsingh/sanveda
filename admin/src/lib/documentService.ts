import { BRAND } from '../constants/brand'
import { VOLUNTEER_ROLE_OPTIONS } from '../constants/volunteerContent'
import type { VolunteerApplication, VolunteerRole } from '../types/volunteer'
import {
  DOCUMENT_CARD_CSS,
  DOCUMENT_DESIGN_CSS,
  buildVerifyUrl,
  escapeHtml,
  humanizeLabel,
  makeQrDataUrl,
  renderClosingBanner,
  renderComplianceNote,
  renderDetailCard,
  renderDocumentFooter,
  renderHeaderBand,
  renderHeroBox,
  renderMetaStrip,
  wrapDocumentHtml,
} from './documents/documentDesign'
import {
  downloadHtmlDocument,
  downloadHtmlDocumentsSequential,
  openHtmlDocument,
  printHtmlDocument,
} from './htmlDocumentDownload'
import { loadNgoReceiptProfile } from './receipt80G/ngoProfile'
import type { Membership } from './membershipService'
import { ensureVerificationCode } from './verificationService'

export {
  downloadHtmlDocument,
  downloadHtmlDocumentsSequential,
  openHtmlDocument,
  printHtmlDocument,
}

function formatCardDate(value?: string | Date): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function volunteerRoleLabel(role: VolunteerRole | string): string {
  const known = VOLUNTEER_ROLE_OPTIONS.find((option) => option.value === role)
  return known?.label ?? humanizeLabel(role)
}

function statusPill(status: string): string {
  const normalized = status.replace(/_/g, ' ').toUpperCase()
  if (status === 'active' || status === 'approved') return '✓ ACTIVE'
  return `✓ ${normalized}`
}

function wrapCardHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${escapeHtml(title)}</title><style>${DOCUMENT_CARD_CSS}</style></head><body>${body}</body></html>`
}

function cardShell(options: {
  subtitle: string
  status: string
  photoHtml: string
  name: string
  roleLine: string
  heroLabel: string
  heroValue: string
  rows: Array<{ label: string; value: string }>
  qrDataUrl: string
  footerNote: string
}): string {
  const rows = options.rows
    .map(
      (row) =>
        `<div class="doc-card-row"><span>${escapeHtml(row.label)}</span><span>${escapeHtml(row.value)}</span></div>`,
    )
    .join('')
  return `<div class="doc-card" data-component="HeaderBand">
  <div class="doc-card-header">
    <div>
      <h1>${escapeHtml(BRAND.shortName)}</h1>
      <p>${escapeHtml(options.subtitle)}</p>
    </div>
    <span class="doc-card-pill">${escapeHtml(options.status)}</span>
  </div>
  <div class="doc-card-body">
    <div class="doc-card-photo">${options.photoHtml}</div>
    <p class="doc-card-name">${escapeHtml(options.name)}</p>
    <p class="doc-card-role">${escapeHtml(options.roleLine)}</p>
    <div class="doc-card-hero" data-component="HeroBox">
      <span class="label">${escapeHtml(options.heroLabel)}</span>
      <p class="value">${escapeHtml(options.heroValue)}</p>
    </div>
    <div data-component="DetailCard">${rows}</div>
    <img class="doc-card-qr" src="${escapeHtml(options.qrDataUrl)}" alt="Verification QR code" />
  </div>
  <div class="doc-card-footer" data-component="DocumentFooter">
    ${escapeHtml(options.footerNote)}
  </div>
</div>`
}

export async function generateVolunteerIdCardHtml(volunteer: VolunteerApplication): Promise<string> {
  const roles = (volunteer.preferredRoles ?? []).map(volunteerRoleLabel).join(', ') || 'Volunteer'
  const initial = escapeHtml((volunteer.fullName || '?').charAt(0).toUpperCase())
  const photoHtml = volunteer.photoDataUrl
    ? `<img src="${escapeHtml(volunteer.photoDataUrl)}" alt="${escapeHtml(volunteer.fullName)}" />`
    : initial
  const issueDate = formatCardDate(volunteer.createdAt || new Date())
  const validUntilDate = new Date(new Date().getFullYear() + 1, 11, 31)
  const validUntil = formatCardDate(validUntilDate)
  const referenceId = volunteer.volunteerId || volunteer.id
  const verifyCode = await ensureVerificationCode({
    type: 'volunteer_id',
    holderName: volunteer.fullName,
    referenceId,
    metadata: { applicationId: volunteer.id },
    validUntil: validUntilDate.toISOString().slice(0, 10),
  }).catch(() => referenceId)
  const qrDataUrl = await makeQrDataUrl(buildVerifyUrl(verifyCode))

  const body = cardShell({
    subtitle: 'Volunteer ID Card',
    status: statusPill(volunteer.status),
    photoHtml,
    name: volunteer.fullName,
    roleLine: roles,
    heroLabel: 'Volunteer ID',
    heroValue: volunteer.volunteerId ?? '—',
    rows: [
      { label: 'ID Number', value: volunteer.volunteerId ?? '—' },
      { label: 'Role(s)', value: roles },
      { label: 'Issue Date', value: issueDate },
      { label: 'Valid Until', value: validUntil },
      { label: 'Status', value: humanizeLabel(volunteer.status) },
    ],
    qrDataUrl,
    footerNote: `${BRAND.name} · Digitally generated ID · No signature required`,
  })

  return wrapCardHtml('Volunteer ID', body)
}

export async function generateMemberIdCardHtml(member: Membership): Promise<string> {
  const initial = escapeHtml((member.fullName || '?').charAt(0).toUpperCase())
  const tierLabel = humanizeLabel(member.tier)
  const issueDate = formatCardDate(member.createdAt || new Date())
  const validUntil = formatCardDate(member.renewalDate) || formatCardDate(new Date(new Date().getFullYear() + 1, 11, 31))
  const referenceId = member.memberId || member.certificateNumber || member.id
  const verifyCode = await ensureVerificationCode({
    type: 'membership_certificate',
    holderName: member.fullName,
    referenceId,
    metadata: { memberId: member.memberId, certificateNumber: member.certificateNumber },
    validUntil: member.renewalDate,
  }).catch(() => referenceId)
  const qrDataUrl = await makeQrDataUrl(buildVerifyUrl(verifyCode))

  const body = cardShell({
    subtitle: 'Member ID Card',
    status: statusPill(member.status),
    photoHtml: initial,
    name: member.fullName,
    roleLine: `${tierLabel} Member`,
    heroLabel: 'Member ID',
    heroValue: member.memberId ?? '—',
    rows: [
      { label: 'ID Number', value: member.memberId ?? '—' },
      { label: 'Tier', value: tierLabel },
      { label: 'Issue Date', value: issueDate },
      { label: 'Valid Until', value: validUntil },
      { label: 'Status', value: humanizeLabel(member.status) },
    ],
    qrDataUrl,
    footerNote: `${BRAND.name} · Digitally generated ID · No signature required`,
  })

  return wrapCardHtml('Member ID', body)
}

function resolveLogoUrl(logo: string): string {
  if (logo.startsWith('http')) return logo
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${logo}`
}

function appointmentTypeLabel(type: 'volunteer' | 'staff' | 'intern'): string {
  if (type === 'intern') return 'Intern'
  if (type === 'staff') return 'Staff'
  return 'Volunteer'
}

function appointmentOffice(type: 'volunteer' | 'staff' | 'intern'): string {
  if (type === 'intern') return `${BRAND.name} · Internship Office`
  if (type === 'staff') return `${BRAND.name} · People Operations`
  return `${BRAND.name} · Volunteer Office`
}

export async function generateAppointmentLetterHtml(params: {
  recipientName: string
  role: string
  department: string
  startDate: string
  type: 'volunteer' | 'staff' | 'intern'
  referenceId: string
}): Promise<string> {
  const ngo = await loadNgoReceiptProfile().catch(() => null)
  const orgName = ngo?.legalName || BRAND.name
  const tagline = ngo?.tagline || BRAND.tagline
  const logoUrl = resolveLogoUrl(ngo?.logo || BRAND.logo)
  const website = (ngo?.website || '').replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'sanveda.vercel.app'
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const typeLabel = appointmentTypeLabel(params.type)
  const roleLabel = humanizeLabel(params.role || typeLabel)
  const department = humanizeLabel(params.department || 'Operations')
  const referenceNo = params.referenceId.trim() || `APPT-${Date.now()}`
  const office = appointmentOffice(params.type)
  const verifyCode = await ensureVerificationCode({
    type: 'appointment_letter',
    holderName: params.recipientName,
    referenceId: referenceNo,
    metadata: { appointmentType: params.type, role: params.role, department: params.department },
  }).catch(() => referenceNo)
  const verifyUrl = buildVerifyUrl(verifyCode)
  const qrDataUrl = await makeQrDataUrl(verifyUrl)
  const legalLine = `${orgName} · ${ngo?.address || BRAND.address} · ${website} · ${ngo?.supportEmail || BRAND.email} · ${ngo?.phone || BRAND.phone}`

  const header = renderHeaderBand({
    logoUrl,
    orgName,
    tagline,
    documentTitle: 'APPOINTMENT LETTER',
    subtitle: `${typeLabel} Appointment · Official Offer`,
    statusPill: '✓ APPOINTED',
  })
  const meta = renderMetaStrip([
    { label: 'Reference Number', value: referenceNo },
    { label: 'Issue Date', value: issueDate },
    { label: 'Effective Date', value: params.startDate || issueDate },
    { label: 'Appointment Type', value: typeLabel },
  ])
  const hero = renderHeroBox({
    label: 'Appointed As',
    headline: roleLabel,
    caption: `${department} · ${orgName}`,
    secondaryLabel: 'Reference',
    secondaryValue: referenceNo,
  })
  const details = renderDetailCard({
    title: 'Appointment Details',
    rows: [
      { label: 'Recipient', value: params.recipientName },
      { label: 'Role / Position', value: roleLabel },
      { label: 'Department', value: department },
      { label: 'Appointment Type', value: typeLabel },
      { label: 'Effective Date', value: params.startDate || issueDate },
      { label: 'Reference Number', value: referenceNo },
    ],
  })
  const compliance = renderComplianceNote([
    `This appointment letter is issued by ${office} based on official records maintained by ${orgName}.`,
    'Please retain this letter for your records. Verification is available via the QR code below.',
  ])
  const closing = renderClosingBanner({
    headline: 'Welcome to the Sanveda mission',
    body: 'We look forward to your dedicated contribution toward our humanitarian work.',
  })
  const footer = renderDocumentFooter({
    qrDataUrl,
    verifyText: `this appointment letter is authentic and digitally issued by ${orgName}.`,
    documentTypeLabel: 'Appointment',
    legalLine,
  })

  const body = `<article class="doc-page" id="appointment-letter">
  ${header}
  ${meta}
  ${hero}
  <div class="doc-letter-body">
    <p><strong>Dear ${escapeHtml(params.recipientName)},</strong></p>
    <p>We are pleased to appoint you as <strong>${escapeHtml(roleLabel)}</strong> in the
    <strong>${escapeHtml(department)}</strong> department of ${escapeHtml(orgName)},
    effective <strong>${escapeHtml(params.startDate || issueDate)}</strong>.</p>
    <p>This appointment is issued under reference <strong>${escapeHtml(referenceNo)}</strong>.
    Kindly carry this letter (or a digital copy) when reporting for orientation or duty.</p>
  </div>
  ${details}
  ${compliance}
  ${closing}
  <div class="doc-signatory">
    <strong>${escapeHtml(office)}</strong><br />
    ${escapeHtml(orgName)}<br />
    ${escapeHtml(ngo?.supportEmail || BRAND.email)}
  </div>
  ${footer}
</article>`

  return wrapDocumentHtml({
    title: `Appointment Letter — ${params.recipientName}`,
    css: DOCUMENT_DESIGN_CSS,
    body,
  })
}

export async function downloadVolunteerIdCard(volunteer: VolunteerApplication): Promise<void> {
  const html = await generateVolunteerIdCardHtml(volunteer)
  downloadHtmlDocument(html, `${volunteer.volunteerId ?? volunteer.id}-id-card.html`)
}

export async function printVolunteerIdCard(volunteer: VolunteerApplication): Promise<void> {
  await printHtmlDocument(await generateVolunteerIdCardHtml(volunteer))
}

export async function downloadMemberIdCard(member: Membership): Promise<void> {
  const html = await generateMemberIdCardHtml(member)
  downloadHtmlDocument(html, `${member.memberId ?? member.id}-id-card.html`)
}

export async function printMemberIdCard(member: Membership): Promise<void> {
  await printHtmlDocument(await generateMemberIdCardHtml(member))
}

export async function generateBeneficiaryIdCardHtml(beneficiary: {
  fullName: string
  beneficiaryId: string
  programLabel: string
  categoryLabel: string
  status: string
}): Promise<string> {
  const validTill = formatCardDate(new Date(new Date().getFullYear() + 1, 11, 31))
  const issueDate = formatCardDate(new Date())
  const initial = escapeHtml((beneficiary.fullName || '?').charAt(0).toUpperCase())
  const verifyCode = beneficiary.beneficiaryId || beneficiary.fullName
  const qrDataUrl = await makeQrDataUrl(buildVerifyUrl(verifyCode))
  const program = humanizeLabel(beneficiary.programLabel)
  const category = humanizeLabel(beneficiary.categoryLabel)

  const body = cardShell({
    subtitle: 'Beneficiary Card',
    status: statusPill(beneficiary.status),
    photoHtml: initial,
    name: beneficiary.fullName,
    roleLine: program,
    heroLabel: 'Beneficiary ID',
    heroValue: beneficiary.beneficiaryId || '—',
    rows: [
      { label: 'Beneficiary ID', value: beneficiary.beneficiaryId || '—' },
      { label: 'Program', value: program },
      { label: 'Category', value: category },
      { label: 'Status', value: humanizeLabel(beneficiary.status) },
      { label: 'Issue Date', value: issueDate },
      { label: 'Valid Till', value: validTill },
    ],
    qrDataUrl,
    footerNote: `${BRAND.name} · Digitally generated ID · No signature required`,
  })

  return wrapCardHtml('Beneficiary ID', body)
}

export async function downloadBeneficiaryIdCard(beneficiary: {
  fullName: string
  beneficiaryId: string
  programLabel: string
  categoryLabel: string
  status: string
  id: string
}): Promise<void> {
  const html = await generateBeneficiaryIdCardHtml(beneficiary)
  downloadHtmlDocument(html, `${beneficiary.beneficiaryId || beneficiary.id}-beneficiary-card.html`)
}

export async function printBeneficiaryIdCard(beneficiary: {
  fullName: string
  beneficiaryId: string
  programLabel: string
  categoryLabel: string
  status: string
}): Promise<void> {
  await printHtmlDocument(await generateBeneficiaryIdCardHtml(beneficiary))
}

export async function downloadAppointmentLetter(
  params: Parameters<typeof generateAppointmentLetterHtml>[0],
): Promise<void> {
  const html = await generateAppointmentLetterHtml(params)
  const safeRef = (params.referenceId || 'appointment').replace(/[^\w.-]+/g, '-')
  downloadHtmlDocument(html, `${safeRef}-appointment-letter.html`)
}

export function generateEventPassHtml(params: {
  eventTitle: string
  attendeeName: string
  registrationId: string
  seat?: string
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Event Pass</title><style>${DOCUMENT_CARD_CSS}
  .qr { width: 72px; height: 72px; margin: 12px auto 0; border: 2px dashed #1F8A5F; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #1F8A5F; text-align: center; }
  </style></head><body>
  <div class="doc-card">
    <div class="doc-card-header"><div><h1>SANVEDA</h1><p>Event Pass</p></div></div>
    <div class="doc-card-body">
      <p class="doc-card-role">${escapeHtml(params.eventTitle)}</p>
      <p class="doc-card-name">${escapeHtml(params.attendeeName)}</p>
      <div class="doc-card-row"><span>Registration ID</span><span>${escapeHtml(params.registrationId)}</span></div>
      <div class="doc-card-row"><span>Seat</span><span>${escapeHtml(params.seat ?? 'General')}</span></div>
      <div class="qr">QR<br/>CHECK-IN</div>
    </div>
    <div class="doc-card-footer">${escapeHtml(BRAND.name)}</div>
  </div></body></html>`
}

export function generateEventParticipationCertificateHtml(params: {
  attendeeName: string
  eventTitle: string
  year?: number
}): string {
  const year = params.year ?? new Date().getFullYear()
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Participation Certificate</title>
  <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:48px;border:4px double #041B4D;text-align:center}
  h1{color:#041B4D;font-size:18px;letter-spacing:0.1em}h2{font-size:28px;color:#041B4D;margin:24px 0}</style></head><body>
  <p style="font-size:13px;letter-spacing:0.1em">SANVEDA GLOBAL HUMANITARIAN FOUNDATION</p>
  <h1>CERTIFICATE OF PARTICIPATION</h1>
  <p>This certifies that</p>
  <h2>${escapeHtml(params.attendeeName)}</h2>
  <p>participated in the<br/><strong>${escapeHtml(params.eventTitle)}</strong><br/>organized by Sanveda Global Humanitarian Foundation</p>
  <p style="margin-top:32px;font-size:13px">${year}</p>
  </body></html>`
}

export function downloadEventPass(params: Parameters<typeof generateEventPassHtml>[0]): void {
  downloadHtmlDocument(generateEventPassHtml(params), `${params.registrationId}-event-pass.html`)
}

export function downloadEventParticipationCertificate(
  params: Parameters<typeof generateEventParticipationCertificateHtml>[0],
): void {
  downloadHtmlDocument(
    generateEventParticipationCertificateHtml(params),
    `${params.attendeeName.replace(/\s+/g, '-')}-participation-cert.html`,
  )
}
