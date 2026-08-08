import type { VolunteerApplication, VolunteerFormData, VolunteerStatus } from '../types/volunteer'
import { dataApi } from './dataApiClient'
import { deliveryUrl, storagePath, uploadPrivateFile, type StorageUploadCategory } from './privateStorageClient'

function withDocumentDeliveryUrls(application: VolunteerApplication): VolunteerApplication {
  return {
    ...application,
    resumeDataUrl: deliveryUrl(application.resumeDataUrl),
    idProofDataUrl: deliveryUrl(application.idProofDataUrl),
    photoDataUrl: deliveryUrl(application.photoDataUrl),
  }
}

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
    department: row.department ? String(row.department) : undefined,
    emergencyContact: row.emergency_contact ? String(row.emergency_contact) : undefined,
    isTeamLeader: row.is_team_leader == null ? undefined : Boolean(row.is_team_leader),
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
    resume_url: storagePath(app.resumeDataUrl) ?? null,
    resume_name: app.resumeName ?? null,
    id_proof_url: storagePath(app.idProofDataUrl) ?? null,
    id_proof_name: app.idProofName ?? null,
    photo_url: storagePath(app.photoDataUrl) ?? null,
    photo_name: app.photoName ?? null,
    agreed_policies: app.agreedPolicies,
    agreed_background_check: app.agreedBackgroundCheck,
    agreed_data_processing: app.agreedDataProcessing,
    assigned_team: app.assignedTeam ?? null,
    admin_notes: app.adminNotes ?? null,
    interview_date: app.interviewDate ?? null,
    department: app.department ?? null,
    emergency_contact: app.emergencyContact ?? null,
    is_team_leader: app.isTeamLeader ?? null,
    updated_at: new Date().toISOString(),
  }
}

function generateApplicationId(): string {
  const year = new Date().getFullYear()
  return `SVD-APP-${year}-${crypto.randomUUID().replace(/-/g, '').toUpperCase()}`
}

function generateVolunteerId(): string {
  const year = new Date().getFullYear()
  return `SVG-${year}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

async function uploadFile(
  applicationId: string,
  kind: StorageUploadCategory,
  file: File | null,
): Promise<{ url?: string; name?: string }> {
  if (!file) return {}
  const stored = await uploadPrivateFile(kind, applicationId, file)
  return { url: stored.path, name: stored.originalName }
}

export async function submitVolunteerApplication(form: VolunteerFormData): Promise<VolunteerApplication> {
  const { validateAllSteps } = await import('./volunteerValidation')
  const validationErrors = validateAllSteps(form)
  if (Object.keys(validationErrors).length) {
    throw new Error(Object.values(validationErrors)[0] || 'Please fix the highlighted fields and try again.')
  }

  const id = generateApplicationId()
  const now = new Date().toISOString()

  const [resume, idProof, photo] = await Promise.all([
    uploadFile(id, 'volunteer-resume', form.resumeFile),
    uploadFile(id, 'volunteer-id-proof', form.idProofFile),
    uploadFile(id, 'volunteer-photo', form.photoFile),
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

  const { error } = await dataApi
    .table('volunteer_applications')
    .insert(applicationToRow(application))
  if (error) throw new Error(error.message)
  return application
}

export async function getVolunteerApplications(): Promise<VolunteerApplication[]> {
  const { data, error } = await dataApi
    .table('volunteer_applications')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => withDocumentDeliveryUrls(rowToApplication(row)))
}

export async function getVolunteerApplication(id: string): Promise<VolunteerApplication | undefined> {
  const { data, error } = await dataApi
    .table('volunteer_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? withDocumentDeliveryUrls(rowToApplication(data)) : undefined
}

export async function findApplicationByEmailAndId(
  email: string,
  id: string,
): Promise<VolunteerApplication | undefined> {
  const normalized = email.trim().toLowerCase()

  const { data, error } = await dataApi.call('lookup_volunteer_application', {
    p_id: id,
    p_email: normalized,
  })
  if (error) throw new Error(error.message)
  return data ? rowToApplication(data as Record<string, unknown>) : undefined
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
    updated.volunteerId = generateVolunteerId()
  }

  const { data, error } = await dataApi
    .table('volunteer_applications')
    .update(applicationToRow(updated))
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return rowToApplication(data)
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
