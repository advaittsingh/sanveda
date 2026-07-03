import { isSupabaseConfigured, requireSupabase } from './supabase'
import { membershipStatusEmailHtml, sendTransactionalEmail } from './emailService'
import { registerVerification } from './verificationService'

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

const STORAGE_KEY = 'sanveda_memberships'

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
  }
}

function readLocal(): Membership[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Membership[]
  } catch {
    return []
  }
}

function writeLocal(items: Membership[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function localMemberId(): string {
  const year = new Date().getFullYear()
  const count = readLocal().filter((m) => m.memberId).length + 1
  return `SVD-MEM-${year}-${String(count).padStart(4, '0')}`
}

function localCertNumber(): string {
  const year = new Date().getFullYear()
  const count = readLocal().filter((m) => m.certificateNumber).length + 1
  return `SVD-CERT-${year}-${String(count).padStart(4, '0')}`
}

export async function submitMembershipApplication(form: MembershipFormData): Promise<Membership> {
  const now = new Date().toISOString()

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('memberships')
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

    await sendTransactionalEmail(
      membership.email,
      'Sanveda Membership Application Received',
      membershipStatusEmailHtml(membership.fullName, 'pending'),
      'membership_received',
    )

    return membership
  }

  const membership: Membership = {
    id: crypto.randomUUID(),
    userId: form.userId,
    fullName: form.fullName.trim(),
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
    createdAt: now,
    updatedAt: now,
  }
  const all = readLocal()
  all.unshift(membership)
  writeLocal(all)
  return membership
}

export async function getMemberships(): Promise<Membership[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToMembership)
  }

  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function findMembershipByEmailAndId(email: string, id: string): Promise<Membership | undefined> {
  const normalized = email.trim().toLowerCase()

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('memberships')
      .select('*')
      .eq('id', id)
      .eq('email', normalized)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? rowToMembership(data) : undefined
  }

  return readLocal().find((m) => m.id === id && m.email === normalized)
}

export async function updateMembership(
  id: string,
  patch: Partial<Membership>,
): Promise<Membership | undefined> {
  const existing = (await getMemberships()).find((m) => m.id === id)
  if (!existing) return undefined

  const updated: Membership = { ...existing, ...patch, updatedAt: new Date().toISOString() }

  if ((patch.status === 'approved' || patch.status === 'active') && !updated.memberId) {
    updated.memberId = localMemberId()
    updated.certificateNumber = localCertNumber()
    const renewal = new Date()
    renewal.setFullYear(renewal.getFullYear() + 1)
    updated.renewalDate = renewal.toISOString().slice(0, 10)
  }

  if (isSupabaseConfigured) {
    const { data: memberId } = patch.status === 'approved' || patch.status === 'active'
      ? await requireSupabase().rpc('generate_member_id')
      : { data: updated.memberId }

    const { data: certNumber } = patch.status === 'approved' || patch.status === 'active'
      ? await requireSupabase().rpc('generate_certificate_number')
      : { data: updated.certificateNumber }

    const { data, error } = await requireSupabase()
      .from('memberships')
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
      await sendTransactionalEmail(
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

  const all = readLocal()
  const index = all.findIndex((m) => m.id === id)
  all[index] = updated
  writeLocal(all)

  if ((patch.status === 'approved' || patch.status === 'active') && updated.certificateNumber) {
    await registerVerification({
      type: 'membership_certificate',
      holderName: updated.fullName,
      referenceId: updated.certificateNumber,
      metadata: { memberId: updated.memberId, tier: updated.tier },
      validUntil: updated.renewalDate,
    }).catch(() => {})
  }

  return updated
}

export function generateMembershipCertificateHtml(membership: Membership): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Membership Certificate</title>
<style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:40px;border:3px solid #041B4D;text-align:center}
h1{color:#041B4D}p{line-height:1.7}</style></head><body>
<h1>Certificate of Membership</h1>
<p>This certifies that</p>
<h2>${membership.fullName}</h2>
<p>is a valued <strong>${membership.tier}</strong> member of Sanveda Global Humanitarian Foundation.</p>
<p><strong>Member ID:</strong> ${membership.memberId ?? '—'}<br/>
<strong>Certificate No:</strong> ${membership.certificateNumber ?? '—'}<br/>
<strong>Valid until:</strong> ${membership.renewalDate ?? '—'}</p>
</body></html>`
}

export function downloadMembershipCertificate(membership: Membership): void {
  const html = generateMembershipCertificateHtml(membership)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${membership.memberId ?? membership.id}-certificate.html`
  a.click()
  URL.revokeObjectURL(url)
}
