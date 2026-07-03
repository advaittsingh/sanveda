import type { VolunteerApplication, VolunteerFormData, VolunteerStatus } from '../types/volunteer'
import { isSupabaseConfigured, requireSupabase } from './supabase'

const STORAGE_KEY = 'sanveda_volunteer_applications'

function rowToApplication(row: Record<string, unknown>): VolunteerApplication {
  return {
    id: String(row.id),
    volunteerId: row.volunteer_id ? String(row.volunteer_id) : undefined,
    status: row.status as VolunteerStatus,
    fullName: String(row.full_name),
    dateOfBirth: row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : '',
    gender: String(row.gender ?? ''),
    email: String(row.email),
    phone: String(row.phone),
    address: String(row.address ?? ''),
    city: String(row.city ?? ''),
    state: String(row.state ?? ''),
    country: String(row.country ?? 'India'),
    occupation: String(row.occupation ?? ''),
    organization: String(row.organization ?? ''),
    linkedin: String(row.linkedin ?? ''),
    education: String(row.education ?? ''),
    preferredRoles: Array.isArray(row.preferred_roles) ? row.preferred_roles : [],
    volunteerType: row.volunteer_type as VolunteerApplication['volunteerType'],
    hoursPerWeek: String(row.hours_per_week ?? ''),
    skills: String(row.skills ?? ''),
    experience: String(row.experience ?? ''),
    languages: String(row.languages ?? ''),
    certifications: String(row.certifications ?? ''),
    motivation: String(row.motivation ?? ''),
    aboutYourself: String(row.about_yourself ?? ''),
    previousExperience: String(row.previous_experience ?? ''),
    resumeDataUrl: row.resume_url ? String(row.resume_url) : undefined,
    resumeName: row.resume_name ? String(row.resume_name) : undefined,
    idProofDataUrl: row.id_proof_url ? String(row.id_proof_url) : undefined,
    idProofName: row.id_proof_name ? String(row.id_proof_name) : undefined,
    photoDataUrl: row.photo_url ? String(row.photo_url) : undefined,
    photoName: row.photo_name ? String(row.photo_name) : undefined,
    agreedPolicies: Boolean(row.agreed_policies),
    agreedBackgroundCheck: Boolean(row.agreed_background_check),
    agreedDataProcessing: Boolean(row.agreed_data_processing),
    assignedTeam: row.assigned_team ? String(row.assigned_team) : undefined,
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
    interviewDate: row.interview_date ? String(row.interview_date) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

function applicationToRow(app: Partial<VolunteerApplication> & { id: string }) {
  return {
    id: app.id,
    volunteer_id: app.volunteerId ?? null,
    status: app.status,
    full_name: app.fullName,
    date_of_birth: app.dateOfBirth || null,
    gender: app.gender,
    email: app.email,
    phone: app.phone,
    address: app.address,
    city: app.city,
    state: app.state,
    country: app.country,
    occupation: app.occupation,
    organization: app.organization,
    linkedin: app.linkedin,
    education: app.education,
    preferred_roles: app.preferredRoles,
    volunteer_type: app.volunteerType,
    hours_per_week: app.hoursPerWeek,
    skills: app.skills,
    experience: app.experience,
    languages: app.languages,
    certifications: app.certifications,
    motivation: app.motivation,
    about_yourself: app.aboutYourself,
    previous_experience: app.previousExperience,
    resume_url: app.resumeDataUrl ?? null,
    resume_name: app.resumeName ?? null,
    id_proof_url: app.idProofDataUrl ?? null,
    id_proof_name: app.idProofName ?? null,
    photo_url: app.photoDataUrl ?? null,
    photo_name: app.photoName ?? null,
    agreed_policies: app.agreedPolicies,
    agreed_background_check: app.agreedBackgroundCheck,
    agreed_data_processing: app.agreedDataProcessing,
    assigned_team: app.assignedTeam ?? null,
    admin_notes: app.adminNotes ?? null,
    interview_date: app.interviewDate ?? null,
    updated_at: new Date().toISOString(),
  }
}

function readAllLocal(): VolunteerApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as VolunteerApplication[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAllLocal(applications: VolunteerApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
}

function generateApplicationId(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `SVD-APP-${year}-${random}`
}

function generateVolunteerId(count: number): string {
  const year = new Date().getFullYear()
  return `SVG-${year}-${String(count).padStart(4, '0')}`
}

async function uploadFile(
  applicationId: string,
  kind: string,
  file: File | null,
): Promise<{ url?: string; name?: string }> {
  if (!file) return {}
  if (file.size > 2_500_000) {
    throw new Error(`${file.name} is too large. Please upload files under 2.5 MB.`)
  }

  if (isSupabaseConfigured) {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${applicationId}/${kind}.${ext}`
    const { error } = await requireSupabase().storage
      .from('volunteer-documents')
      .upload(path, file, { upsert: true })

    if (error) throw new Error(error.message)

    const { data } = requireSupabase().storage.from('volunteer-documents').getPublicUrl(path)
    return { url: data.publicUrl, name: file.name }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ url: String(reader.result), name: file.name })
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export async function submitVolunteerApplication(form: VolunteerFormData): Promise<VolunteerApplication> {
  const id = generateApplicationId()
  const now = new Date().toISOString()

  const [resume, idProof, photo] = await Promise.all([
    uploadFile(id, 'resume', form.resumeFile),
    uploadFile(id, 'id-proof', form.idProofFile),
    uploadFile(id, 'photo', form.photoFile),
  ])

  const application: VolunteerApplication = {
    id,
    status: 'pending',
    fullName: form.fullName.trim(),
    dateOfBirth: form.dateOfBirth,
    gender: form.gender,
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim(),
    occupation: form.occupation.trim(),
    organization: form.organization.trim(),
    linkedin: form.linkedin.trim(),
    education: form.education.trim(),
    preferredRoles: form.preferredRoles,
    volunteerType: form.volunteerType,
    hoursPerWeek: form.hoursPerWeek.trim(),
    skills: form.skills.trim(),
    experience: form.experience.trim(),
    languages: form.languages.trim(),
    certifications: form.certifications.trim(),
    motivation: form.motivation.trim(),
    aboutYourself: form.aboutYourself.trim(),
    previousExperience: form.previousExperience.trim(),
    resumeDataUrl: resume.url,
    resumeName: resume.name,
    idProofDataUrl: idProof.url,
    idProofName: idProof.name,
    photoDataUrl: photo.url,
    photoName: photo.name,
    agreedPolicies: form.agreedPolicies,
    agreedBackgroundCheck: form.agreedBackgroundCheck,
    agreedDataProcessing: form.agreedDataProcessing,
    createdAt: now,
    updatedAt: now,
  }

  if (isSupabaseConfigured) {
    const { error } = await requireSupabase()
      .from('volunteer_applications')
      .insert(applicationToRow(application))

    if (error) throw new Error(error.message)
    return application
  }

  const all = readAllLocal()
  all.unshift(application)
  writeAllLocal(all)
  return application
}

export async function getVolunteerApplications(): Promise<VolunteerApplication[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('volunteer_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToApplication)
  }

  return readAllLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getVolunteerApplication(id: string): Promise<VolunteerApplication | undefined> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('volunteer_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? rowToApplication(data) : undefined
  }

  return readAllLocal().find((a) => a.id === id)
}

export async function findApplicationByEmailAndId(
  email: string,
  id: string,
): Promise<VolunteerApplication | undefined> {
  const normalized = email.trim().toLowerCase()

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('volunteer_applications')
      .select('*')
      .eq('id', id)
      .eq('email', normalized)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? rowToApplication(data) : undefined
  }

  return readAllLocal().find((a) => a.id === id && a.email === normalized)
}

export async function updateVolunteerApplication(
  id: string,
  patch: Partial<VolunteerApplication>,
): Promise<VolunteerApplication | undefined> {
  const existing = await getVolunteerApplication(id)
  if (!existing) return undefined

  const updated: VolunteerApplication = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  }

  if (patch.status === 'approved' && !updated.volunteerId) {
    const all = await getVolunteerApplications()
    updated.volunteerId = generateVolunteerId(all.filter((a) => a.volunteerId).length + 1)
  }

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('volunteer_applications')
      .update(applicationToRow(updated))
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return rowToApplication(data)
  }

  const all = readAllLocal()
  const index = all.findIndex((a) => a.id === id)
  all[index] = updated
  writeAllLocal(all)
  return updated
}

export async function getVolunteerDashboardStats() {
  const all = await getVolunteerApplications()
  return {
    total: all.length,
    pending: all.filter((a) => a.status === 'pending').length,
    approved: all.filter((a) => a.status === 'approved' || a.status === 'active').length,
    rejected: all.filter((a) => a.status === 'rejected').length,
    active: all.filter((a) => a.status === 'active').length,
    interview: all.filter((a) => a.status === 'interview' || a.status === 'orientation').length,
  }
}

export async function setVolunteerStatus(
  id: string,
  status: VolunteerStatus,
): Promise<VolunteerApplication | undefined> {
  return updateVolunteerApplication(id, { status })
}

export function notifyVolunteerByEmail(application: VolunteerApplication, subject: string, body: string) {
  const mailto = `mailto:${application.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(mailto, '_blank', 'noopener,noreferrer')
}
