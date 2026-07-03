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
  const duration = internship.durationWeeks
    ? internship.durationWeeks >= 20 ? '6-month' : internship.durationWeeks >= 10 ? '3-month' : `${internship.durationWeeks}-week`
    : 'internship'
  const start = internship.startDate
    ? new Date(internship.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '—'
  const end = internship.endDate
    ? new Date(internship.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  const verifyUrl = `https://sanveda.vercel.app/verify?id=${internship.certificateNumber ?? internship.applicationId}`

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:48px;border:4px double #041B4D;text-align:center;color:#1B1B1B}
  h1{color:#041B4D;font-size:18px;letter-spacing:0.12em;margin:0}h2{font-size:28px;margin:24px 0 8px;color:#041B4D}
  p{line-height:1.8;margin:12px 0}.dept{font-size:16px;color:#0E4FA8}.sig{margin-top:48px;font-size:13px}
  .qr{display:inline-block;margin-top:24px;padding:12px;border:2px dashed #0E4FA8;font-size:10px;color:#0E4FA8}
  .meta{font-size:12px;color:#666;margin-top:16px}</style></head><body>
  <p style="font-size:13px;letter-spacing:0.1em">SANVEDA GLOBAL HUMANITARIAN FOUNDATION</p>
  <h1>CERTIFICATE OF INTERNSHIP</h1>
  <p>This certifies that</p>
  <h2>${internship.fullName}</h2>
  <p>has successfully completed a<br/><strong>${duration} internship</strong> at<br/>
  Sanveda Global Humanitarian Foundation</p>
  ${internship.preferredDepartment ? `<p class="dept">Department: <strong>${internship.preferredDepartment}</strong></p>` : ''}
  <p>Duration: <strong>${start} – ${end}</strong></p>
  <p class="meta">Certificate No: ${internship.certificateNumber ?? '—'}</p>
  <div class="qr">QR VERIFICATION<br/>${verifyUrl}</div>
  <div class="sig"><p>Authorized Signatory<br/><strong>Sanveda Global Humanitarian Foundation</strong></p></div>
  </body></html>`
}

export function generateInternshipLorHtml(internship: Internship): string {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const dept = internship.preferredDepartment ?? 'General'
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:48px;color:#1B1B1B;line-height:1.8}
  h1{font-size:16px;color:#041B4D;margin-bottom:32px}.sig{margin-top:48px}</style></head><body>
  <p style="text-align:right">${date}</p>
  <h1>To Whomsoever It May Concern,</h1>
  <p>This is to certify that <strong>${internship.fullName}</strong> worked as a <strong>${dept} Intern</strong> at
  Sanveda Global Humanitarian Foundation from ${internship.startDate ?? 'the commencement date'} to ${internship.endDate ?? 'the completion date'}.</p>
  <p>During this period, ${internship.fullName.split(' ')[0]} demonstrated strong communication skills, initiative, and dedication
  to our humanitarian mission. ${internship.fullName.split(' ')[0]} contributed meaningfully to ${dept.toLowerCase()} projects
  and collaborated effectively with our team.</p>
  <p>We recommend ${internship.fullName} without reservation for future academic and professional opportunities.</p>
  <div class="sig">
    <p>Authorized Signatory<br/><strong>Sanveda Global Humanitarian Foundation</strong></p>
  </div>
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

export function downloadInternshipLor(internship: Internship): void {
  const html = generateInternshipLorHtml(internship)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${internship.applicationId}-lor.html`
  a.click()
  URL.revokeObjectURL(url)
}
