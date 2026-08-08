import { dataApi } from './dataApiClient'
import type { VolunteerApplication, VolunteerRole, VolunteerStatus, VolunteerType } from '../types/volunteer'
import type { Internship, InternshipStatus } from './internshipService'

export type PostLoginDestination = 'admin' | 'portal' | 'donor'

export interface ServiceAssignment {
  id: string
  projectId?: string | null
  projectTitle?: string | null
  projectStatus?: string | null
  projectSlug?: string | null
  role: string
  startsAt?: string | null
  endsAt?: string | null
  status: string
}

export interface ServiceTask {
  id: string
  title: string
  dueDate?: string | null
  status: string
  score?: number | null
  projectId?: string | null
  source: 'volunteer' | 'intern' | 'project'
  proofUrl?: string | null
  proofName?: string | null
  proofContentType?: string | null
  proofUploadedAt?: string | null
  approvalStatus?: 'unreviewed' | 'approved' | 'rejected' | 'changes_requested' | null
  approvalNotes?: string | null
  approvedAt?: string | null
}

export type ServiceTaskStatus = 'pending' | 'in_progress' | 'completed'

export interface ServicePortalVolunteer {
  id: string
  volunteerId?: string | null
  status: VolunteerStatus
  fullName: string
  email: string
  phone?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  preferredRoles: VolunteerRole[]
  volunteerType?: VolunteerType | string | null
  hoursPerWeek?: string | null
  skills?: string | null
  assignedTeam?: string | null
  department?: string | null
  interviewDate?: string | null
  createdAt: string
  updatedAt: string
  photoDataUrl?: string | null
}

export interface ServicePortalInternship {
  id: string
  applicationId: string
  internCode?: string | null
  status: InternshipStatus
  fullName: string
  email: string
  phone?: string | null
  university?: string | null
  course?: string | null
  preferredDepartment?: string | null
  durationWeeks?: number | null
  mentorName?: string | null
  mode?: string | null
  programName?: string | null
  certificateNumber?: string | null
  startDate?: string | null
  endDate?: string | null
  createdAt: string
  updatedAt: string
  pipelineStage?: string | null
}

export interface ServicePortalData {
  volunteer: ServicePortalVolunteer | null
  internship: ServicePortalInternship | null
  volunteerAssignments: ServiceAssignment[]
  internshipAssignments: ServiceAssignment[]
  volunteerTasks: ServiceTask[]
  internTasks: ServiceTask[]
  projectTasks: ServiceTask[]
}

export async function resolvePostLoginDestination(): Promise<PostLoginDestination> {
  const { data, error } = await dataApi.call('resolve_post_login_destination', {})
  if (error) throw new Error(error.message)
  const destination = (data as { destination?: string } | null)?.destination
  if (destination === 'admin' || destination === 'portal' || destination === 'donor') return destination
  return 'donor'
}

export async function getServicePortalData(): Promise<ServicePortalData> {
  const { data, error } = await dataApi.call('my_service_portal', {})
  if (error) throw new Error(error.message)
  const payload = (data ?? {}) as Partial<ServicePortalData>
  return {
    volunteer: payload.volunteer ?? null,
    internship: payload.internship ?? null,
    volunteerAssignments: payload.volunteerAssignments ?? [],
    internshipAssignments: payload.internshipAssignments ?? [],
    volunteerTasks: ((payload as { volunteerTasks?: ServiceTask[] }).volunteerTasks ?? []).map(
      (task) => ({ ...task, source: 'volunteer' as const }),
    ),
    internTasks: (payload.internTasks ?? []).map((task) => ({ ...task, source: 'intern' as const })),
    projectTasks: (payload.projectTasks ?? []).map((task) => ({ ...task, source: 'project' as const })),
  }
}

export async function updateMyTask(params: {
  kind: 'volunteer' | 'intern'
  taskId: string
  status?: ServiceTaskStatus
  proofUrl?: string
  proofName?: string
  proofContentType?: string
}): Promise<ServiceTask> {
  const { data, error } = await dataApi.call('update_my_task', {
    p_kind: params.kind,
    p_task_id: params.taskId,
    ...(params.status ? { p_status: params.status } : {}),
    ...(params.proofUrl
      ? {
          p_proof_url: params.proofUrl,
          p_proof_name: params.proofName,
          p_proof_content_type: params.proofContentType,
        }
      : {}),
  })
  if (error) throw new Error(error.message)
  const row = (data ?? {}) as ServiceTask
  return {
    ...row,
    source: params.kind,
  }
}

/** Map portal volunteer row into the shape document generators expect. */
export function toVolunteerApplication(v: ServicePortalVolunteer): VolunteerApplication {
  return {
    id: v.id,
    volunteerId: v.volunteerId ?? undefined,
    status: v.status,
    fullName: v.fullName,
    dateOfBirth: '',
    gender: '',
    email: v.email,
    phone: v.phone ?? '',
    address: '',
    city: v.city ?? '',
    state: v.state ?? '',
    country: v.country ?? '',
    occupation: '',
    organization: '',
    linkedin: '',
    education: '',
    preferredRoles: v.preferredRoles ?? [],
    volunteerType: (v.volunteerType as VolunteerType) || 'part-time',
    hoursPerWeek: v.hoursPerWeek ?? '',
    skills: v.skills ?? '',
    experience: '',
    languages: '',
    certifications: '',
    motivation: '',
    aboutYourself: '',
    previousExperience: '',
    photoDataUrl: v.photoDataUrl ?? undefined,
    agreedPolicies: true,
    agreedBackgroundCheck: true,
    agreedDataProcessing: true,
    assignedTeam: v.assignedTeam ?? undefined,
    department: v.department ?? undefined,
    interviewDate: v.interviewDate ?? undefined,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  }
}

export function toInternship(i: ServicePortalInternship): Internship {
  return {
    id: i.id,
    applicationId: i.applicationId,
    internCode: i.internCode ?? undefined,
    status: i.status,
    fullName: i.fullName,
    email: i.email,
    phone: i.phone ?? '',
    university: i.university ?? undefined,
    course: i.course ?? undefined,
    preferredDepartment: i.preferredDepartment ?? undefined,
    durationWeeks: i.durationWeeks ?? undefined,
    mentorName: i.mentorName ?? undefined,
    mode: i.mode ?? undefined,
    programName: i.programName ?? undefined,
    certificateNumber: i.certificateNumber ?? undefined,
    startDate: i.startDate ?? undefined,
    endDate: i.endDate ?? undefined,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    pipelineStage: i.pipelineStage ?? undefined,
  }
}

export function hasServiceAccess(data: ServicePortalData): boolean {
  return Boolean(data.volunteer || data.internship)
}
