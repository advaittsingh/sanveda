import { BRAND } from '../constants/brand'
import { dataApi } from './dataApiClient'
import {
  DOCUMENT_DESIGN_CSS,
  buildVerifyUrl,
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
import { membershipStatusEmailHtml, trySendTransactionalEmail } from './emailService'
import { downloadHtmlDocument } from './htmlDocumentDownload'
import { loadNgoReceiptProfile } from './receipt80G/ngoProfile'
import { ensureVerificationCode, registerVerification } from './verificationService'

export type MembershipStatus = 'pending' | 'approved' | 'active' | 'expired' | 'rejected'
export type MembershipTier = 'standard' | 'patron' | 'founding'

export interface Membership {
  id: string
  userId?: string
  memberId?: string
  fullName: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  country?: string
  occupation?: string
  motivation?: string
  tier: MembershipTier
  status: MembershipStatus
  renewalDate?: string
  certificateNumber?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  pipelineStage?: string
  paymentStatus?: string
  activityStatus?: string
}

export interface MembershipFormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  occupation: string
  motivation: string
  tier: MembershipTier
  userId?: string
}

function rowToMembership(row: Record<string, unknown>): Membership {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    memberId: row.member_id ? String(row.member_id) : undefined,
    fullName: String(row.full_name),
    email: String(row.email),
    phone: String(row.phone),
    address: row.address ? String(row.address) : undefined,
    city: row.city ? String(row.city) : undefined,
    state: row.state ? String(row.state) : undefined,
    country: row.country ? String(row.country) : undefined,
    occupation: row.occupation ? String(row.occupation) : undefined,
    motivation: row.motivation ? String(row.motivation) : undefined,
    tier: row.tier as MembershipTier,
    status: row.status as MembershipStatus,
    renewalDate: row.renewal_date ? String(row.renewal_date) : undefined,
    certificateNumber: row.certificate_number ? String(row.certificate_number) : undefined,
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    pipelineStage: row.pipeline_stage ? String(row.pipeline_stage) : undefined,
    paymentStatus: row.payment_status ? String(row.payment_status) : undefined,
    activityStatus: row.activity_status ? String(row.activity_status) : undefined,
  }
}

export interface MembershipSubmitResult {
  membership: Membership
  emailSent: boolean
}

export async function submitMembershipApplication(form: MembershipFormData): Promise<MembershipSubmitResult> {
  const { data, error } = await dataApi
      .table('memberships')
      .insert({
        user_id: form.userId ?? null,
        full_name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        occupation: form.occupation.trim(),
        motivation: form.motivation.trim(),
        tier: form.tier,
        status: 'pending',
      })
      .select()
      .single()

  if (error) throw new Error(error.message)
  const membership = rowToMembership(data)
  // DB write is source of truth — confirmation email must not block applicant success.
  const emailSent = await trySendTransactionalEmail(
    membership.email,
    'Sanveda Membership Application Received',
    membershipStatusEmailHtml(membership.fullName, 'pending'),
    'membership_received',
    { membershipId: membership.id },
  )
  return { membership, emailSent }
}

export async function getMemberships(): Promise<Membership[]> {
  const { data, error } = await dataApi
    .table('memberships')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToMembership)
}

export async function findMembershipByEmailAndId(email: string, id: string): Promise<Membership | undefined> {
  const normalized = email.trim().toLowerCase()

  const { data, error } = await dataApi.call('lookup_membership_status', {
    p_id: id,
    p_email: normalized,
  })
  if (error) throw new Error(error.message)
  return data ? rowToMembership(data as Record<string, unknown>) : undefined
}

export async function updateMembership(
  id: string,
  patch: Partial<Membership>,
): Promise<Membership | undefined> {
  const existing = (await getMemberships()).find((m) => m.id === id)
  if (!existing) return undefined

  const updated: Membership = { ...existing, ...patch, updatedAt: new Date().toISOString() }

  if ((patch.status === 'approved' || patch.status === 'active') && !updated.memberId) {
    const renewal = new Date()
    renewal.setFullYear(renewal.getFullYear() + 1)
    updated.renewalDate = renewal.toISOString().slice(0, 10)
  }

  const { data: memberId } = patch.status === 'approved' || patch.status === 'active'
      ? await dataApi.call('generate_member_id')
      : { data: updated.memberId }

  const { data: certNumber } = patch.status === 'approved' || patch.status === 'active'
      ? await dataApi.call('generate_certificate_number')
      : { data: updated.certificateNumber }

  const { data, error } = await dataApi
      .table('memberships')
      .update({
        member_id: memberId ?? updated.memberId,
        certificate_number: certNumber ?? updated.certificateNumber,
        status: updated.status,
        tier: updated.tier,
        renewal_date: updated.renewalDate,
        admin_notes: updated.adminNotes,
        updated_at: updated.updatedAt,
      })
      .eq('id', id)
      .select()
      .single()

  if (error) throw new Error(error.message)
  const result = rowToMembership(data)

  if (patch.status === 'approved' || patch.status === 'active') {
      // Status update already persisted — do not fail the admin action on email delivery.
      await trySendTransactionalEmail(
        result.email,
        'Sanveda Membership Approved',
        membershipStatusEmailHtml(result.fullName, result.status, result.memberId),
        'membership_approved',
      )

      if (result.certificateNumber) {
        await registerVerification({
          type: 'membership_certificate',
          holderName: result.fullName,
          referenceId: result.certificateNumber,
          metadata: { memberId: result.memberId, tier: result.tier },
          validUntil: result.renewalDate,
        }).catch(() => {})
      }
  }
  return result
}

function formatDocDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function membershipStatusPill(status: MembershipStatus): string {
  if (status === 'active' || status === 'approved') return '✓ ACTIVE'
  return `✓ ${status.replace(/_/g, ' ').toUpperCase()}`
}

function resolveLogoUrl(logo: string): string {
  if (logo.startsWith('http')) return logo
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${logo}`
}

export async function generateMembershipCertificateHtml(membership: Membership): Promise<string> {
  const ngo = await loadNgoReceiptProfile().catch(() => null)
  const orgName = ngo?.legalName || BRAND.name
  const tagline = ngo?.tagline || BRAND.tagline
  const logoUrl = resolveLogoUrl(ngo?.logo || BRAND.logo)
  const website = (ngo?.website || '').replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'sanveda.vercel.app'
  const certNo = membership.certificateNumber || membership.memberId || membership.id
  const joinDate = formatDocDate(membership.createdAt)
  const issueDate = formatDocDate(new Date().toISOString())
  const membershipYear = membership.createdAt
    ? String(new Date(membership.createdAt).getFullYear())
    : String(new Date().getFullYear())
  const tierLabel = humanizeLabel(membership.tier)
  const tierHeadline = `${membership.tier.toUpperCase()} MEMBER`
  const verifyCode = await ensureVerificationCode({
    type: 'membership_certificate',
    holderName: membership.fullName,
    referenceId: certNo,
    metadata: { memberId: membership.memberId, tier: membership.tier },
    validUntil: membership.renewalDate,
  }).catch(() => certNo)
  const verifyUrl = buildVerifyUrl(verifyCode)
  const qrDataUrl = await makeQrDataUrl(verifyUrl)
  const statusPill = membershipStatusPill(membership.status)
  const heroCaption = `Recognized ${tierLabel} member of ${orgName}.`
  const complianceParas = [
    `This certificate confirms that ${membership.fullName} holds genuine ${tierLabel} membership with ${orgName} as recorded in the organization's official membership register.`,
    "Membership privileges and validity are subject to the organization's constitution, bylaws, and applicable renewal requirements.",
  ]
  const verifyText = `this membership certificate is authentic and digitally issued by ${orgName}.`
  const legalLine = `${orgName} · ${ngo?.address || BRAND.address} · ${website} · ${ngo?.supportEmail || BRAND.email} · ${ngo?.phone || BRAND.phone}`

  const header = renderHeaderBand({
    logoUrl,
    orgName,
    tagline,
    documentTitle: 'MEMBERSHIP CERTIFICATE',
    subtitle: 'Official Membership · Sanveda Global Humanitarian Foundation',
    statusPill,
  })
  const meta = renderMetaStrip([
    { label: 'Certificate Number', value: certNo },
    { label: 'Member ID', value: membership.memberId ?? '—' },
    { label: 'Issue Date', value: issueDate },
    { label: 'Membership Year', value: membershipYear },
  ])
  const hero = renderHeroBox({
    label: 'Membership Tier',
    headline: tierHeadline,
    caption: heroCaption,
    secondaryLabel: 'Member Name',
    secondaryValue: membership.fullName,
  })
  const memberCard = renderDetailCard({
    title: 'Member Details',
    rows: [
      { label: 'Full Name', value: membership.fullName },
      { label: 'Member ID', value: membership.memberId ?? '—' },
      { label: 'Tier', value: tierLabel },
      { label: 'Join Date', value: joinDate },
      { label: 'Status', value: humanizeLabel(membership.status) },
      { label: 'Valid Until', value: formatDocDate(membership.renewalDate) },
    ],
  })
  const orgCard = renderDetailCard({
    title: 'Organization Details',
    rows: [
      { label: 'Registered Name', value: orgName },
      { label: 'Registration Number', value: ngo?.registrationNumber || '—' },
      { label: '12A Registration', value: ngo?.twelveANumber || '—' },
      { label: '80G Registration', value: ngo?.eightyGNumber || '—' },
      { label: 'Registered Office', value: ngo?.address || BRAND.address },
      { label: 'Website', value: website },
      { label: 'Contact', value: ngo?.phone || BRAND.phone },
    ],
  })
  const compliance = renderComplianceNote(complianceParas)
  const closing = renderClosingBanner({
    headline: 'Thank You For Being Part Of Our Mission',
    body: 'Your membership strengthens our work across education, healthcare, environmental sustainability, and community development.',
  })
  const footer = renderDocumentFooter({
    qrDataUrl,
    verifyText,
    documentTypeLabel: 'Certificate',
    legalLine,
  })

  const body = `<article class="doc-page" id="membership-certificate">
  ${header}
  ${meta}
  ${hero}
  <div class="doc-panels">
    ${memberCard}
    ${orgCard}
  </div>
  ${compliance}
  ${closing}
  ${footer}
</article>`

  return wrapDocumentHtml({
    title: `Membership Certificate — ${membership.fullName}`,
    css: DOCUMENT_DESIGN_CSS,
    body,
  })
}

export async function downloadMembershipCertificate(membership: Membership): Promise<void> {
  const html = await generateMembershipCertificateHtml(membership)
  downloadHtmlDocument(html, `${membership.memberId ?? membership.id}-certificate.html`)
}
