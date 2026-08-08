import { BRAND } from '../constants/brand'
import { dataApi } from './dataApiClient'
import { logAudit } from './auditService'
import {
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
import { downloadHtmlDocument } from './htmlDocumentDownload'
import { loadNgoReceiptProfile } from './receipt80G/ngoProfile'
import { ensureVerificationCode, registerVerification } from './verificationService'
import { trySendTransactionalEmail } from './emailService'

export type InternshipStatus = 'pending' | 'review' | 'approved' | 'active' | 'completed' | 'rejected'

export interface Internship {
  id: string
  applicationId: string
  fullName: string
  email: string
  phone: string
  university?: string
  course?: string
  semester?: string
  preferredDepartment?: string
  durationWeeks?: number
  motivation?: string
  skills?: string
  status: InternshipStatus
  certificateNumber?: string
  adminNotes?: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
  internCode?: string
  pipelineStage?: string
  programName?: string
  mentorName?: string
  mode?: string
  stipendAmount?: number
}

export interface InternshipFormData {
  fullName: string
  email: string
  phone: string
  university: string
  course: string
  semester: string
  preferredDepartment: string
  durationWeeks: number
  motivation: string
  skills: string
}

function rowToInternship(row: Record<string, unknown>): Internship {
  return {
    id: String(row.id),
    applicationId: String(row.application_id ?? row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    phone: String(row.phone),
    university: row.university ? String(row.university) : undefined,
    course: row.course ? String(row.course) : undefined,
    semester: row.semester ? String(row.semester) : undefined,
    preferredDepartment: row.preferred_department ? String(row.preferred_department) : undefined,
    durationWeeks: row.duration_weeks ? Number(row.duration_weeks) : undefined,
    motivation: row.motivation ? String(row.motivation) : undefined,
    skills: row.skills ? String(row.skills) : undefined,
    status: row.status as InternshipStatus,
    certificateNumber: row.certificate_number ? String(row.certificate_number) : undefined,
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
    startDate: row.start_date ? String(row.start_date).slice(0, 10) : undefined,
    endDate: row.end_date ? String(row.end_date).slice(0, 10) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    internCode: row.intern_code ? String(row.intern_code) : undefined,
    pipelineStage: row.pipeline_stage ? String(row.pipeline_stage) : undefined,
    programName: row.program_name ? String(row.program_name) : undefined,
    mentorName: row.mentor_name ? String(row.mentor_name) : undefined,
    mode: row.mode ? String(row.mode) : undefined,
    stipendAmount: row.stipend_amount == null ? undefined : Number(row.stipend_amount),
  }
}

function newAppId(): string {
  return `SVD-INT-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, '').toUpperCase()}`
}

export interface InternshipSubmitResult {
  internship: Internship
  emailSent: boolean
}

export async function submitInternshipApplication(form: InternshipFormData): Promise<InternshipSubmitResult> {
  const applicationId = newAppId()
  const { data, error } = await dataApi
      .table('internships')
      .insert({
        application_id: applicationId,
        full_name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        university: form.university,
        course: form.course,
        semester: form.semester,
        preferred_department: form.preferredDepartment,
        duration_weeks: form.durationWeeks,
        motivation: form.motivation,
        skills: form.skills,
        status: 'pending',
      })
      .select()
      .single()

  if (error) throw new Error(error.message)
  const internship = rowToInternship(data)
  // DB write is source of truth — confirmation email must not block applicant success.
  const emailSent = await trySendTransactionalEmail(
    internship.email,
    'Internship Application Received',
    `<p>Dear ${internship.fullName}, we received your internship application (${applicationId}).</p>`,
    'internship_received',
    { internshipId: internship.id },
  )
  return { internship, emailSent }
}

export async function getInternships(): Promise<Internship[]> {
  const { data, error } = await dataApi.table('internships').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToInternship)
}

export async function findInternshipByEmailAndId(email: string, applicationId: string): Promise<Internship | undefined> {
  const normalized = email.trim().toLowerCase()
  const { data, error } = await dataApi.call('lookup_internship_status', {
    p_application_id: applicationId,
    p_email: normalized,
  })
  if (error) throw new Error(error.message)
  return data ? rowToInternship(data as Record<string, unknown>) : undefined
}

export async function updateInternship(id: string, patch: Partial<Internship>): Promise<Internship | undefined> {
  const all = await getInternships()
  const existing = all.find((i) => i.id === id)
  if (!existing) return undefined

  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() }

  if (patch.status === 'completed' && !updated.certificateNumber) {
    updated.certificateNumber = `SVD-INT-CERT-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    await registerVerification({
      type: 'internship_certificate',
      holderName: updated.fullName,
      referenceId: updated.certificateNumber,
      metadata: { department: updated.preferredDepartment },
    })
  }

  const { data, error } = await dataApi
      .table('internships')
      .update({
        status: updated.status,
        certificate_number: updated.certificateNumber,
        admin_notes: updated.adminNotes,
        start_date: updated.startDate,
        end_date: updated.endDate,
        updated_at: updated.updatedAt,
      })
      .eq('id', id)
      .select()
      .single()
  if (error) throw new Error(error.message)
  await logAudit('update', 'internship', id, { status: updated.status })
  return rowToInternship(data)
}

function formatInternshipDate(value?: string, fallback = '—'): string {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function internshipDurationLabel(internship: Internship): string {
  if (!internship.durationWeeks) return 'Internship'
  if (internship.durationWeeks >= 20) return '6-month'
  if (internship.durationWeeks >= 10) return '3-month'
  return `${internship.durationWeeks}-week`
}

function resolveLogoUrl(logo: string): string {
  if (logo.startsWith('http')) return logo
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${logo}`
}

const INTERNSHIP_SIGNATORY = `${BRAND.name} · Internship Office`

export async function generateInternshipCertificateHtml(internship: Internship): Promise<string> {
  const ngo = await loadNgoReceiptProfile().catch(() => null)
  const orgName = ngo?.legalName || BRAND.name
  const tagline = ngo?.tagline || BRAND.tagline
  const logoUrl = resolveLogoUrl(ngo?.logo || BRAND.logo)
  const website = (ngo?.website || '').replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'sanveda.vercel.app'
  const duration = internshipDurationLabel(internship)
  const start = formatInternshipDate(internship.startDate)
  const end = formatInternshipDate(internship.endDate, formatInternshipDate(new Date().toISOString()))
  const dept = humanizeLabel(internship.preferredDepartment || 'General')
  const certNo = internship.certificateNumber || internship.applicationId || internship.id
  const verifyCode = await ensureVerificationCode({
    type: 'internship_certificate',
    holderName: internship.fullName,
    referenceId: certNo,
    metadata: { applicationId: internship.applicationId, department: internship.preferredDepartment },
  }).catch(() => certNo)
  const verifyUrl = buildVerifyUrl(verifyCode)
  const qrDataUrl = await makeQrDataUrl(verifyUrl)
  const issueDate = formatInternshipDate(new Date().toISOString())
  const durationRange = `${start} – ${end}`
  const durationDetail = `${duration} (${start} – ${end})`
  const heroCaption = `Successfully completed a ${duration} internship at ${orgName}.`
  const complianceParas = [
    `This certificate confirms that ${internship.fullName} successfully completed the internship program with ${orgName} for the period shown above.`,
    `Issued by ${INTERNSHIP_SIGNATORY}.`,
  ]
  const verifyText = `this internship certificate is authentic and digitally issued by ${orgName}.`
  const legalLine = `${orgName} · ${ngo?.address || BRAND.address} · ${website} · ${ngo?.supportEmail || BRAND.email} · ${ngo?.phone || BRAND.phone}`

  const header = renderHeaderBand({
    logoUrl,
    orgName,
    tagline,
    documentTitle: 'INTERNSHIP CERTIFICATE',
    subtitle: 'Certificate of Completion · Internship Office',
    statusPill: '✓ ISSUED',
  })
  const meta = renderMetaStrip([
    { label: 'Certificate Number', value: certNo },
    { label: 'Issue Date', value: issueDate },
    { label: 'Duration', value: durationRange },
    { label: 'Department', value: dept },
  ])
  const hero = renderHeroBox({
    label: 'Intern',
    headline: internship.fullName,
    caption: heroCaption,
    secondaryLabel: 'Program',
    secondaryValue: internship.programName || dept,
  })
  const details = renderDetailCard({
    title: 'Internship Details',
    rows: [
      { label: 'Intern Name', value: internship.fullName },
      { label: 'Department', value: dept },
      { label: 'Duration', value: durationDetail },
      { label: 'Mentor', value: internship.mentorName || 'Internship Office' },
      { label: 'Application ID', value: internship.applicationId || '—' },
      { label: 'Certificate No', value: internship.certificateNumber || '—' },
    ],
  })
  const compliance = renderComplianceNote(complianceParas)
  const closing = renderClosingBanner({
    headline: 'Congratulations On Completing Your Internship',
    body: 'We wish you continued growth as you carry forward the values of compassion and service.',
  })
  const footer = renderDocumentFooter({
    qrDataUrl,
    verifyText,
    documentTypeLabel: 'Certificate',
    legalLine,
  })

  const body = `<article class="doc-page" id="internship-certificate">
  ${header}
  ${meta}
  ${hero}
  ${details}
  ${compliance}
  ${closing}
  <div class="doc-signatory">
    <strong>${escapeHtml(INTERNSHIP_SIGNATORY)}</strong><br />
    Digitally issued · No wet signature required
  </div>
  ${footer}
</article>`

  return wrapDocumentHtml({
    title: `Internship Certificate — ${internship.fullName}`,
    css: DOCUMENT_DESIGN_CSS,
    body,
  })
}

export async function generateInternshipLorHtml(internship: Internship): Promise<string> {
  const ngo = await loadNgoReceiptProfile().catch(() => null)
  const orgName = ngo?.legalName || BRAND.name
  const tagline = ngo?.tagline || BRAND.tagline
  const logoUrl = resolveLogoUrl(ngo?.logo || BRAND.logo)
  const website = (ngo?.website || '').replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'sanveda.vercel.app'
  const dept = humanizeLabel(internship.preferredDepartment || 'General')
  const start = formatInternshipDate(internship.startDate, 'the commencement date')
  const end = formatInternshipDate(internship.endDate, 'the completion date')
  const duration = internshipDurationLabel(internship)
  const referenceNo = `LOR-${internship.certificateNumber || internship.applicationId || internship.id}`
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const verifyCode = await ensureVerificationCode({
    type: 'letter_of_recommendation',
    holderName: internship.fullName,
    referenceId: referenceNo,
    metadata: { applicationId: internship.applicationId, certificateNumber: internship.certificateNumber },
  }).catch(() => referenceNo)
  const verifyUrl = buildVerifyUrl(verifyCode)
  const qrDataUrl = await makeQrDataUrl(verifyUrl)
  const durationDetail = `${duration} (${start} – ${end})`
  const complianceParas = [
    `This letter is issued by ${INTERNSHIP_SIGNATORY} based on official internship records maintained by ${orgName}.`,
  ]
  const verifyText = `this letter of recommendation is authentic and digitally issued by ${orgName}.`
  const legalLine = `${orgName} · ${ngo?.address || BRAND.address} · ${website} · ${ngo?.supportEmail || BRAND.email} · ${ngo?.phone || BRAND.phone}`

  const header = renderHeaderBand({
    logoUrl,
    orgName,
    tagline,
    documentTitle: 'LETTER OF RECOMMENDATION',
    subtitle: 'Internship Office · Official Recommendation',
    statusPill: '✓ ISSUED',
  })
  const meta = renderMetaStrip([
    { label: 'Reference Number', value: referenceNo },
    { label: 'Issue Date', value: issueDate },
    { label: 'Internship Duration', value: duration },
    { label: 'Department', value: dept },
  ])
  const details = renderDetailCard({
    title: 'Internship Details',
    rows: [
      { label: 'Intern Name', value: internship.fullName },
      { label: 'Department', value: dept },
      { label: 'Duration', value: durationDetail },
      { label: 'Supervisor / Mentor', value: internship.mentorName || INTERNSHIP_SIGNATORY },
      { label: 'Application ID', value: internship.applicationId || '—' },
    ],
  })
  const compliance = renderComplianceNote(complianceParas)
  const footer = renderDocumentFooter({
    qrDataUrl,
    verifyText,
    documentTypeLabel: 'Letter',
    legalLine,
  })

  const body = `<article class="doc-page" id="internship-lor">
  ${header}
  ${meta}
  <div class="doc-letter-body">
    <p><strong>To Whomsoever It May Concern,</strong></p>
    <p>This is to certify that <strong>${escapeHtml(internship.fullName)}</strong> worked as a <strong>${escapeHtml(dept)} Intern</strong> at
    ${escapeHtml(orgName)} from ${escapeHtml(start)} to ${escapeHtml(end)}.</p>
    <p>This letter verifies the internship record and dates shown above. It does not include an unverified performance assessment.</p>
  </div>
  ${details}
  ${compliance}
  <div class="doc-signatory">
    <strong>${escapeHtml(INTERNSHIP_SIGNATORY)}</strong><br />
    ${escapeHtml(orgName)}<br />
    ${escapeHtml(ngo?.supportEmail || BRAND.email)}
  </div>
  ${footer}
</article>`

  return wrapDocumentHtml({
    title: `Letter of Recommendation — ${internship.fullName}`,
    css: DOCUMENT_DESIGN_CSS,
    body,
  })
}

export async function downloadInternshipCertificate(internship: Internship): Promise<void> {
  const html = await generateInternshipCertificateHtml(internship)
  downloadHtmlDocument(html, `${internship.certificateNumber ?? internship.id}-certificate.html`)
}

export async function downloadInternshipLor(internship: Internship): Promise<void> {
  const html = await generateInternshipLorHtml(internship)
  downloadHtmlDocument(html, `${internship.applicationId || internship.id}-lor.html`)
}
