import { isSupabaseConfigured, requireSupabase } from './supabase'
import { logAudit } from './auditService'
import { registerVerification } from './verificationService'
import { sendTransactionalEmail } from './emailService'

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

const STORAGE_KEY = 'sanveda_internships'

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
  }
}

function readLocal(): Internship[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeLocal(items: Internship[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function newAppId(): string {
  return `SVD-INT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function submitInternshipApplication(form: InternshipFormData): Promise<Internship> {
  const now = new Date().toISOString()
  const applicationId = newAppId()

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('internships')
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
    await sendTransactionalEmail(internship.email, 'Internship Application Received', `<p>Dear ${internship.fullName}, we received your internship application (${applicationId}).</p>`, 'custom')
    return internship
  }

  const internship: Internship = {
    id: crypto.randomUUID(),
    applicationId,
    ...form,
    email: form.email.trim().toLowerCase(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  const all = readLocal()
  all.unshift(internship)
  writeLocal(all)
  return internship
}

export async function getInternships(): Promise<Internship[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase().from('internships').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToInternship)
  }
  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function findInternshipByEmailAndId(email: string, applicationId: string): Promise<Internship | undefined> {
  const normalized = email.trim().toLowerCase()
  if (isSupabaseConfigured) {
    const { data } = await requireSupabase()
      .from('internships')
      .select('*')
      .eq('application_id', applicationId)
      .eq('email', normalized)
      .maybeSingle()
    return data ? rowToInternship(data) : undefined
  }
  return readLocal().find((i) => i.applicationId === applicationId && i.email === normalized)
}

export async function updateInternship(id: string, patch: Partial<Internship>): Promise<Internship | undefined> {
  const all = await getInternships()
  const existing = all.find((i) => i.id === id)
  if (!existing) return undefined

  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() }

  if (patch.status === 'completed' && !updated.certificateNumber) {
    const year = new Date().getFullYear()
    const count = all.filter((i) => i.certificateNumber).length + 1
    updated.certificateNumber = `SVD-INT-CERT-${year}-${String(count).padStart(4, '0')}`
    await registerVerification({
      type: 'internship_certificate',
      holderName: updated.fullName,
      referenceId: updated.certificateNumber,
      metadata: { department: updated.preferredDepartment },
    })
  }

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('internships')
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

  const local = readLocal()
  const idx = local.findIndex((i) => i.id === id)
  local[idx] = updated
  writeLocal(local)
  return updated
}

export function generateInternshipCertificateHtml(internship: Internship): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:40px;border:3px solid #041B4D;text-align:center}
  h1{color:#041B4D}p{line-height:1.7}</style></head><body>
  <h1>Internship Completion Certificate</h1>
  <p>This certifies that</p>
  <h2>${internship.fullName}</h2>
  <p>successfully completed an internship with Sanveda Global Humanitarian Foundation
  ${internship.preferredDepartment ? ` in <strong>${internship.preferredDepartment}</strong>` : ''}.</p>
  <p><strong>Certificate No:</strong> ${internship.certificateNumber ?? '—'}</p>
  </body></html>`
}

export function downloadInternshipCertificate(internship: Internship): void {
  const html = generateInternshipCertificateHtml(internship)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${internship.certificateNumber ?? internship.id}-certificate.html`
  a.click()
  URL.revokeObjectURL(url)
}
