import { ASSETS } from './assets'
import type { VolunteerRole, VolunteerType } from '../types/volunteer'

export const VOLUNTEER_PAGE = {
  breadcrumb: 'Volunteer',
  title: 'Become A Volunteer',
  subtitle:
    'Join a community of changemakers dedicated to creating lasting humanitarian impact across healthcare, education, sports, and social welfare.',
}

export const VOLUNTEER_STATS = [
  { value: '500+', label: 'Volunteers' },
  { value: '25+', label: 'Cities' },
  { value: '100+', label: 'Events' },
  { value: '10,000+', label: 'Lives Impacted' },
] as const

export const VOLUNTEER_HERO_IMAGES = [
  ASSETS.ourImpact,
  ASSETS.startCampaign,
  ASSETS.heroBanner,
] as const

export const VOLUNTEER_WHY_CARDS = [
  {
    title: 'Humanitarian Impact',
    description: 'Help underserved communities access healthcare, education, and essential support.',
    icon: 'heart',
  },
  {
    title: 'Skill Development',
    description: 'Gain leadership, communication, and practical field experience.',
    icon: 'growth',
  },
  {
    title: 'Networking',
    description: 'Connect with professionals, NGOs, and fellow changemakers.',
    icon: 'people',
  },
  {
    title: 'Certificates & Recognition',
    description: 'Earn verified volunteer certificates and recommendation letters.',
    icon: 'award',
  },
  {
    title: 'Flexible Opportunities',
    description: 'Choose remote, weekend, part-time, or event-based volunteering.',
    icon: 'calendar',
  },
  {
    title: 'Community Building',
    description: 'Become part of the Sanveda family and grow with purpose.',
    icon: 'community',
  },
] as const

export const VOLUNTEER_CATEGORIES = [
  {
    emoji: '🏥',
    title: 'Healthcare Volunteer',
    items: ['Medical camps', 'Patient support', 'Wellness drives'],
    role: 'healthcare' as VolunteerRole,
  },
  {
    emoji: '📚',
    title: 'Education Volunteer',
    items: ['Teaching', 'Mentoring', 'Workshops'],
    role: 'education' as VolunteerRole,
  },
  {
    emoji: '🏏',
    title: 'Sports Development Volunteer',
    items: ['Sports camps', 'Event management', 'Athlete mentoring'],
    role: 'sports' as VolunteerRole,
  },
  {
    emoji: '🌱',
    title: 'Environmental Volunteer',
    items: ['Plantation drives', 'Sustainability campaigns'],
    role: 'environment' as VolunteerRole,
  },
  {
    emoji: '📱',
    title: 'Social Media Volunteer',
    items: ['Content creation', 'Graphic design', 'Marketing'],
    role: 'social-media' as VolunteerRole,
  },
  {
    emoji: '💻',
    title: 'Technical Volunteer',
    items: ['Website', 'IT support', 'Software systems'],
    role: 'technology' as VolunteerRole,
  },
  {
    emoji: '🎥',
    title: 'Media & Documentation',
    items: ['Photography', 'Videography', 'Storytelling'],
    role: 'media' as VolunteerRole,
  },
  {
    emoji: '🏢',
    title: 'Fundraising Volunteer',
    items: ['Donor relations', 'Campaign support'],
    role: 'fundraising' as VolunteerRole,
  },
] as const

export const VOLUNTEER_BENEFITS = [
  'Experience Certificate',
  'Recommendation Letter',
  'Networking Opportunities',
  'Leadership Experience',
  'Skill Development Workshops',
  'Event Access',
  'Recognition Awards',
] as const

export const VOLUNTEER_PROCESS_STEPS = [
  'Apply',
  'Screening',
  'Interview',
  'Orientation',
  'Onboarding',
  'Volunteer Assignment',
] as const

export const VOLUNTEER_ROLE_OPTIONS: { value: VolunteerRole; label: string; emoji: string }[] = [
  { value: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'sports', label: 'Sports', emoji: '🏏' },
  { value: 'fundraising', label: 'Fundraising', emoji: '🏢' },
  { value: 'media', label: 'Media', emoji: '🎥' },
  { value: 'technology', label: 'Technology', emoji: '💻' },
  { value: 'environment', label: 'Environment', emoji: '🌱' },
  { value: 'administration', label: 'Administration', emoji: '📋' },
]

export const VOLUNTEER_TYPE_OPTIONS: { value: VolunteerType; label: string; hint: string }[] = [
  { value: 'full-time', label: 'Full Time', hint: '30+ hrs/week' },
  { value: 'part-time', label: 'Part Time', hint: '10–20 hrs/week' },
  { value: 'weekends', label: 'Weekends', hint: 'Sat & Sun' },
  { value: 'remote', label: 'Remote', hint: 'Work from home' },
  { value: 'event-based', label: 'Event Based', hint: 'Per campaign' },
]

export const FORM_STEPS = [
  'Personal Information',
  'Professional Information',
  'Volunteer Details',
  'Skills & Motivation',
  'Documents & Consent',
] as const

export const FORM_STEP_SHORT = ['Personal', 'Professional', 'Volunteer', 'Skills', 'Documents'] as const

export const ADMIN_PASSWORD = 'sanveda-volunteer-admin'

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  screening: 'Screening',
  interview: 'Interview Scheduled',
  orientation: 'Orientation',
  approved: 'Approved',
  rejected: 'Rejected',
  active: 'Active',
}
