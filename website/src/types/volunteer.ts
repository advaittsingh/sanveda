export type VolunteerStatus =
  | 'pending'
  | 'screening'
  | 'interview'
  | 'orientation'
  | 'approved'
  | 'rejected'
  | 'active'

export type VolunteerType = 'full-time' | 'part-time' | 'weekends' | 'remote' | 'event-based'

export type VolunteerRole =
  | 'healthcare'
  | 'education'
  | 'sports'
  | 'environment'
  | 'social-media'
  | 'technology'
  | 'media'
  | 'fundraising'
  | 'administration'

export interface VolunteerApplication {
  id: string
  volunteerId?: string
  status: VolunteerStatus
  fullName: string
  dateOfBirth: string
  gender: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  occupation: string
  organization: string
  linkedin: string
  education: string
  preferredRoles: VolunteerRole[]
  volunteerType: VolunteerType
  hoursPerWeek: string
  skills: string
  experience: string
  languages: string
  certifications: string
  motivation: string
  aboutYourself: string
  previousExperience: string
  resumeDataUrl?: string
  resumeName?: string
  idProofDataUrl?: string
  idProofName?: string
  photoDataUrl?: string
  photoName?: string
  agreedPolicies: boolean
  agreedBackgroundCheck: boolean
  agreedDataProcessing: boolean
  assignedTeam?: string
  adminNotes?: string
  interviewDate?: string
  createdAt: string
  updatedAt: string
  department?: string
  emergencyContact?: string
  isTeamLeader?: boolean
}

export interface VolunteerFormData {
  fullName: string
  dateOfBirth: string
  gender: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  occupation: string
  organization: string
  linkedin: string
  education: string
  preferredRoles: VolunteerRole[]
  volunteerType: VolunteerType
  hoursPerWeek: string
  skills: string
  experience: string
  languages: string
  certifications: string
  motivation: string
  aboutYourself: string
  previousExperience: string
  resumeFile: File | null
  idProofFile: File | null
  photoFile: File | null
  agreedPolicies: boolean
  agreedBackgroundCheck: boolean
  agreedDataProcessing: boolean
}

export const EMPTY_VOLUNTEER_FORM: VolunteerFormData = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  occupation: '',
  organization: '',
  linkedin: '',
  education: '',
  preferredRoles: [],
  volunteerType: 'part-time',
  hoursPerWeek: '',
  skills: '',
  experience: '',
  languages: '',
  certifications: '',
  motivation: '',
  aboutYourself: '',
  previousExperience: '',
  resumeFile: null,
  idProofFile: null,
  photoFile: null,
  agreedPolicies: false,
  agreedBackgroundCheck: false,
  agreedDataProcessing: false,
}
