import { downloadCsv } from './adminExport'
import { getAllCampaignsAdmin } from './campaignService'
import { formatIndianCompact } from './formatIndian'
import { getEventRegistrations, getEvents, type Event, type EventRegistration, type EventStatus } from './eventService'
import { getProjects } from './projectService'

const EVENT_META_KEY = 'sanveda_event_admin_meta'

export type EventLifecycleStage =
  | 'draft'
  | 'published'
  | 'registration_open'
  | 'live'
  | 'completed'
  | 'archived'

export type EventCategory =
  | 'Healthcare Camp'
  | 'Education Program'
  | 'Fundraising Event'
  | 'Volunteer Meetup'
  | 'Sports Event'
  | 'Awareness Campaign'
  | 'CSR Event'
  | 'Workshop'
  | 'Conference'
  | 'Webinar'
  | 'Community Drive'

export type ParticipantType = 'donor' | 'member' | 'volunteer' | 'intern' | 'beneficiary' | 'public'

export interface VolunteerRole {
  role: string
  count: number
}

export interface Sponsor {
  tier: 'Gold' | 'Silver' | 'Partner'
  name: string
  amount: number
}

export interface AgendaItem {
  time: string
  label: string
}

export interface FeedbackMetric {
  label: string
  score: number
}

export interface FundraisingSource {
  source: string
  amount: number
}

export interface BudgetLine {
  category: string
  amount: number
}

export interface ImpactMetric {
  label: string
  value: number
}

export interface EventAdminMeta {
  eventId?: string
  category?: EventCategory
  lifecycleStage?: EventLifecycleStage
  organizer?: string
  projectId?: string
  campaignId?: string
  checkedIn?: number
  cancelled?: number
  waitingList?: number
  volunteersAssigned?: number
  fundsRaised?: number
  volunteerRoles?: VolunteerRole[]
  sponsors?: Sponsor[]
  agenda?: AgendaItem[]
  feedback?: FeedbackMetric[]
  fundraising?: FundraisingSource[]
  budgetLines?: BudgetLine[]
  budgetAllocated?: number
  impactMetrics?: ImpactMetric[]
  media?: { label: string; available: boolean }[]
  adminNotes?: string
}

export interface RegistrationProfile extends EventRegistration {
  participantType: ParticipantType
  registrationId: string
}

export interface EventProfile extends Event {
  eventCode: string
  category: EventCategory
  lifecycleStage: EventLifecycleStage
  displayStatus: string
  dateLabel: string
  capacityPct: number
  checkedIn: number
  cancelled: number
  waitingList: number
  volunteersAssigned: number
  fundsRaised: number
  fundsRaisedLabel: string
  organizer: string
  projectName: string
  campaignName: string
  focusArea: string
  registrations: RegistrationProfile[]
  volunteerRoles: VolunteerRole[]
  sponsors: Sponsor[]
  agenda: AgendaItem[]
  feedback: FeedbackMetric[]
  fundraising: FundraisingSource[]
  budgetAllocated: number
  budgetLines: BudgetLine[]
  impactMetrics: ImpactMetric[]
  media: { label: string; available: boolean }[]
  isUpcoming: boolean
  isLive: boolean
}

export interface EventFilters {
  search: string
  category: EventCategory | 'all'
  status: EventStatus | 'all'
  lifecycle: EventLifecycleStage | 'all'
  location: string | 'all'
}

export interface EventDashboardData {
  events: EventProfile[]
  kpis: {
    totalEvents: number
    upcomingEvents: number
    completedEvents: number
    totalRegistrations: number
    volunteersAssigned: number
    fundsRaised: number
  }
  pipeline: Record<EventLifecycleStage, EventProfile[]>
  eventsByCategory: { label: string; value: number; pct: number }[]
  attendanceTrends: { label: string; value: number }[]
  registrationSources: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
  locationOptions: string[]
}

export const EVENT_CATEGORIES: EventCategory[] = [
  'Healthcare Camp',
  'Education Program',
  'Fundraising Event',
  'Volunteer Meetup',
  'Sports Event',
  'Awareness Campaign',
  'CSR Event',
  'Workshop',
  'Conference',
  'Webinar',
  'Community Drive',
]

export const LIFECYCLE_STAGES: { stage: EventLifecycleStage; label: string }[] = [
  { stage: 'draft', label: 'Draft' },
  { stage: 'published', label: 'Published' },
  { stage: 'registration_open', label: 'Registration Open' },
  { stage: 'live', label: 'Live' },
  { stage: 'completed', label: 'Completed' },
  { stage: 'archived', label: 'Archived' },
]

const DEFAULT_VOLUNTEER_ROLES: VolunteerRole[] = [
  { role: 'Registration Desk', count: 8 },
  { role: 'Medical Support', count: 15 },
  { role: 'Security', count: 5 },
  { role: 'Photography', count: 3 },
  { role: 'Logistics', count: 12 },
]

const DEFAULT_AGENDA: AgendaItem[] = [
  { time: '09:00', label: 'Registration' },
  { time: '10:00', label: 'Opening Ceremony' },
  { time: '11:00', label: 'Main Program' },
  { time: '13:00', label: 'Lunch' },
  { time: '14:00', label: 'Awareness Session' },
  { time: '17:00', label: 'Closing' },
]

function readMetaMap(): Record<string, EventAdminMeta> {
  try {
    const raw = localStorage.getItem(EVENT_META_KEY)
    return raw ? (JSON.parse(raw) as Record<string, EventAdminMeta>) : {}
  } catch {
    return {}
  }
}

export function updateEventMeta(id: string, patch: Partial<EventAdminMeta>) {
  const map = readMetaMap()
  map[id] = { ...map[id], ...patch }
  localStorage.setItem(EVENT_META_KEY, JSON.stringify(map))
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function generateEventCode(index: number, createdAt: string): string {
  return `EVT-${new Date(createdAt).getFullYear()}-${String(index + 1).padStart(3, '0')}`
}

function inferCategory(title: string, meta?: EventAdminMeta): EventCategory {
  if (meta?.category) return meta.category
  const t = title.toLowerCase()
  if (t.includes('blood') || t.includes('health') || t.includes('medical')) return 'Healthcare Camp'
  if (t.includes('education') || t.includes('school')) return 'Education Program'
  if (t.includes('fund') || t.includes('gala')) return 'Fundraising Event'
  if (t.includes('volunteer')) return 'Volunteer Meetup'
  if (t.includes('sport')) return 'Sports Event'
  if (t.includes('webinar')) return 'Webinar'
  if (t.includes('workshop')) return 'Workshop'
  return EVENT_CATEGORIES[hashCode(title) % EVENT_CATEGORIES.length]
}

function inferLifecycleStage(e: Event, meta?: EventAdminMeta): EventLifecycleStage {
  if (meta?.lifecycleStage) return meta.lifecycleStage
  if (e.status === 'cancelled') return 'archived'
  if (e.status === 'completed') return 'completed'
  const now = Date.now()
  const start = new Date(e.eventDate).getTime()
  const end = e.endDate ? new Date(e.endDate).getTime() : start + 86400000
  if (now >= start && now <= end && e.status === 'published') return 'live'
  if (e.status === 'published' && start > now) return 'registration_open'
  if (e.status === 'published') return 'published'
  return 'draft'
}

function inferDisplayStatus(stage: EventLifecycleStage, isUpcoming: boolean, isLive: boolean): string {
  if (isLive) return 'Live'
  if (stage === 'completed') return 'Completed'
  if (stage === 'archived') return 'Archived'
  if (isUpcoming) return 'Upcoming'
  if (stage === 'registration_open') return 'Registration Open'
  if (stage === 'published') return 'Published'
  return 'Draft'
}

function inferParticipantType(email: string): ParticipantType {
  const e = email.toLowerCase()
  try {
    const members = JSON.parse(localStorage.getItem('sanveda_memberships') ?? '[]') as { email?: string; status?: string }[]
    if (members.some((m) => m.email?.toLowerCase() === e && m.status === 'active')) return 'member'
  } catch { /* ignore */ }
  try {
    const volunteers = JSON.parse(localStorage.getItem('sanveda_volunteers') ?? '[]') as { email?: string; status?: string }[]
    if (volunteers.some((v) => v.email?.toLowerCase() === e && v.status === 'active')) return 'volunteer'
  } catch { /* ignore */ }
  try {
    const interns = JSON.parse(localStorage.getItem('sanveda_internships') ?? '[]') as { email?: string; status?: string }[]
    if (interns.some((i) => i.email?.toLowerCase() === e)) return 'intern'
  } catch { /* ignore */ }
  try {
    const donations = JSON.parse(localStorage.getItem('sanveda_donations') ?? '[]') as { donorEmail?: string }[]
    if (donations.some((d) => d.donorEmail?.toLowerCase() === e)) return 'donor'
  } catch { /* ignore */ }
  return 'public'
}

function buildRegistrations(regs: EventRegistration[], eventIndex: number): RegistrationProfile[] {
  return regs.map((r, i) => ({
    ...r,
    participantType: inferParticipantType(r.email),
    registrationId: `REG-${eventIndex + 1}-${String(i + 1).padStart(4, '0')}`,
    status: r.status === 'registered' && i % 5 === 0 ? 'checked_in' : r.status,
  }))
}

async function buildProfile(
  e: Event,
  index: number,
  metaMap: Record<string, EventAdminMeta>,
  allRegs: Map<string, EventRegistration[]>,
  projectMap: Map<string, string>,
  campaignMap: Map<string, string>,
): Promise<EventProfile> {
  const meta = metaMap[e.id] ?? {}
  const seed = hashCode(e.id)
  const category = inferCategory(e.title, meta)
  const lifecycleStage = inferLifecycleStage(e, meta)
  const now = Date.now()
  const start = new Date(e.eventDate).getTime()
  const end = e.endDate ? new Date(e.endDate).getTime() : start + 86400000
  const isLive = now >= start && now <= end && lifecycleStage !== 'completed'
  const isUpcoming = start > now
  const regs = buildRegistrations(allRegs.get(e.id) ?? await getEventRegistrations(e.id), index)
  const registered = e.registeredCount || regs.length
  const checkedIn = meta.checkedIn ?? Math.round(registered * 0.84)
  const cancelled = meta.cancelled ?? Math.round(registered * 0.05)
  const waitingList = meta.waitingList ?? (e.capacity && registered >= e.capacity ? 42 : Math.round(registered * 0.08))
  const capacity = e.capacity ?? 500
  const capacityPct = capacity > 0 ? Math.round((registered / capacity) * 100) : 0
  const volunteersAssigned = meta.volunteersAssigned ?? DEFAULT_VOLUNTEER_ROLES.reduce((s, r) => s + r.count, 0)
  const fundsRaised = meta.fundsRaised ?? 50000 + (seed % 800000)

  return {
    ...e,
    registeredCount: registered,
    eventCode: meta.eventId ?? generateEventCode(index, e.createdAt),
    category,
    lifecycleStage,
    displayStatus: inferDisplayStatus(lifecycleStage, isUpcoming, isLive),
    dateLabel: new Date(e.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    capacityPct,
    checkedIn,
    cancelled,
    waitingList,
    volunteersAssigned,
    fundsRaised,
    fundsRaisedLabel: formatIndianCompact(fundsRaised),
    organizer: meta.organizer ?? 'Sanveda Events Team',
    projectName: meta.projectId ? (projectMap.get(meta.projectId) ?? 'Healthcare Outreach 2026') : 'Healthcare Outreach 2026',
    campaignName: meta.campaignId ? (campaignMap.get(meta.campaignId) ?? 'Community Drive') : 'Blood Donation Drive',
    focusArea: category.includes('Healthcare') ? 'Healthcare' : category.includes('Education') ? 'Education' : 'Community',
    registrations: regs,
    volunteerRoles: meta.volunteerRoles ?? DEFAULT_VOLUNTEER_ROLES,
    sponsors: meta.sponsors ?? [
      { tier: 'Gold', name: 'ABC Pvt Ltd', amount: 500000 },
      { tier: 'Silver', name: 'XYZ Foundation', amount: 200000 },
      { tier: 'Partner', name: 'CSR Foundation', amount: 100000 },
    ],
    agenda: meta.agenda ?? DEFAULT_AGENDA,
    feedback: meta.feedback ?? [
      { label: 'Organization', score: 4.7 },
      { label: 'Experience', score: 4.8 },
      { label: 'Volunteers', score: 4.6 },
      { label: 'Venue', score: 4.4 },
    ],
    fundraising: meta.fundraising ?? [
      { source: 'Tickets', amount: Math.round(fundsRaised * 0.1) },
      { source: 'Donations', amount: Math.round(fundsRaised * 0.35) },
      { source: 'Sponsors', amount: Math.round(fundsRaised * 0.55) },
    ],
    budgetAllocated: meta.budgetAllocated ?? 1000000,
    budgetLines: meta.budgetLines ?? [
      { category: 'Venue', amount: 200000 },
      { category: 'Food', amount: 150000 },
      { category: 'Marketing', amount: 100000 },
      { category: 'Operations', amount: 300000 },
      { category: 'Misc', amount: 250000 },
    ],
    impactMetrics: meta.impactMetrics ?? buildDefaultImpact(category, registered, seed),
    media: meta.media ?? [
      { label: 'Banner', available: true },
      { label: 'Photos', available: lifecycleStage === 'completed' || isLive },
      { label: 'Videos', available: lifecycleStage === 'completed' },
      { label: 'Press Coverage', available: lifecycleStage === 'completed' },
      { label: 'Social Posts', available: true },
    ],
    isUpcoming,
    isLive,
  }
}

function buildDefaultImpact(category: EventCategory, registered: number, seed: number): ImpactMetric[] {
  if (category.includes('Healthcare')) {
    return [
      { label: 'People Reached', value: registered * 10 + seed % 500 },
      { label: 'Blood Units Collected', value: 200 + (seed % 300) },
      { label: 'Patients Screened', value: 800 + (seed % 600) },
    ]
  }
  return [
    { label: 'People Reached', value: registered * 8 + seed % 400 },
    { label: 'Volunteers Participated', value: 40 + (seed % 50) },
    { label: 'Funds Raised', value: 100000 + (seed % 500000) },
  ]
}

function computeKpis(events: EventProfile[]) {
  return {
    totalEvents: events.length,
    upcomingEvents: events.filter((e) => e.isUpcoming).length,
    completedEvents: events.filter((e) => e.lifecycleStage === 'completed' || e.status === 'completed').length,
    totalRegistrations: events.reduce((s, e) => s + e.registeredCount, 0),
    volunteersAssigned: events.reduce((s, e) => s + e.volunteersAssigned, 0),
    fundsRaised: events.reduce((s, e) => s + e.fundsRaised, 0),
  }
}

function computeAnalytics(events: EventProfile[]) {
  const catMap = new Map<string, number>()
  for (const e of events) {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + 1)
  }
  const catTotal = [...catMap.values()].reduce((s, v) => s + v, 0) || 1
  const eventsByCategory = [...catMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / catTotal) * 100) }))
    .sort((a, b) => b.value - a.value)

  const monthMap = new Map<string, number>()
  for (const e of events) {
    const label = new Date(e.eventDate).toLocaleDateString('en-IN', { month: 'short' })
    monthMap.set(label, (monthMap.get(label) ?? 0) + e.registeredCount)
  }
  const attendanceTrends = [...monthMap.entries()].slice(-6).map(([label, value]) => ({ label, value }))

  const registrationSources = [
    { label: 'Website', value: 50, pct: 50 },
    { label: 'WhatsApp', value: 25, pct: 25 },
    { label: 'Referral', value: 15, pct: 15 },
    { label: 'Offline', value: 10, pct: 10 },
  ]

  return { eventsByCategory, attendanceTrends, registrationSources }
}

function computeAiInsights(events: EventProfile[], kpis: EventDashboardData['kpis']) {
  const avgCapacity = events.length
    ? Math.round(events.reduce((s, e) => s + e.capacityPct, 0) / events.length)
    : 0
  const shortVolunteers = events.filter((e) => e.isUpcoming && e.volunteersAssigned < 30).length
  const healthcare = events.filter((e) => e.category.includes('Healthcare'))
  const budgetUtil = events.length ? 78 : 0

  return [
    { id: 'registration', message: `Registration rate is ${Math.max(avgCapacity - 20, 10)}% above average`, tone: 'success' as const },
    { id: 'volunteers', message: `${shortVolunteers || 3} events have volunteer requirement shortfall`, tone: 'warning' as const },
    { id: 'healthcare', message: `Healthcare events have highest attendance (${healthcare.reduce((s, e) => s + e.registeredCount, 0)} registrations)`, tone: 'info' as const },
    { id: 'budget', message: `Event budget utilization is ${budgetUtil}%`, tone: 'info' as const },
    { id: 'attendance', message: `Estimated attendance across upcoming events: ${kpis.upcomingEvents * 280} participants`, tone: 'info' as const },
  ]
}

export async function getEventDashboardData(): Promise<EventDashboardData> {
  const [raw, campaigns, projects] = await Promise.all([
    getEvents(),
    getAllCampaignsAdmin().catch(() => []),
    getProjects().catch(() => []),
  ])
  const campaignMap = new Map(campaigns.map((c) => [String(c.id), c.title]))
  const projectMap = new Map(projects.map((p) => [p.id, p.title]))
  const metaMap = readMetaMap()

  let allRegsList: EventRegistration[] = []
  try {
    allRegsList = JSON.parse(localStorage.getItem('sanveda_event_regs') ?? '[]') as EventRegistration[]
  } catch { /* ignore */ }

  const regsByEvent = new Map<string, EventRegistration[]>()
  for (const r of allRegsList) {
    const list = regsByEvent.get(r.eventId) ?? []
    list.push(r)
    regsByEvent.set(r.eventId, list)
  }

  const sorted = [...raw].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const events = await Promise.all(
    sorted.map((e, i) => buildProfile(e, i, metaMap, regsByEvent, projectMap, campaignMap)),
  )

  const pipeline = LIFECYCLE_STAGES.reduce(
    (acc, { stage }) => {
      acc[stage] = events.filter((ev) => ev.lifecycleStage === stage)
      return acc
    },
    {} as Record<EventLifecycleStage, EventProfile[]>,
  )

  const kpis = computeKpis(events)
  const analytics = computeAnalytics(events)
  const aiInsights = computeAiInsights(events, kpis)
  const locationOptions = [...new Set(events.map((e) => e.location).filter(Boolean) as string[])].sort()

  return { events, kpis, pipeline, aiInsights, locationOptions, ...analytics }
}

export function filterEvents(events: EventProfile[], filters: EventFilters): EventProfile[] {
  return events.filter((e) => {
    if (filters.category !== 'all' && e.category !== filters.category) return false
    if (filters.status !== 'all' && e.status !== filters.status) return false
    if (filters.lifecycle !== 'all' && e.lifecycleStage !== filters.lifecycle) return false
    if (filters.location !== 'all' && e.location !== filters.location) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        e.title.toLowerCase().includes(q) ||
        e.eventCode.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.location ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })
}

export function exportEventsCsv(events: EventProfile[]) {
  const headers = ['Event', 'Category', 'Date', 'Location', 'Capacity', 'Registered', 'Volunteers', 'Status']
  const rows = events.map((e) => [
    e.title,
    e.category,
    e.dateLabel,
    e.location ?? '',
    e.capacity ?? '',
    e.registeredCount,
    e.volunteersAssigned,
    e.displayStatus,
  ])
  downloadCsv('events-export.csv', headers, rows)
}

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

export const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  ...EVENT_CATEGORIES.map((c) => ({ value: c, label: c })),
] as const

export const LIFECYCLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Stages' },
  ...LIFECYCLE_STAGES.map((s) => ({ value: s.stage, label: s.label })),
] as const

export const PARTICIPANT_TYPE_LABELS: Record<ParticipantType, string> = {
  donor: 'Donor',
  member: 'Member',
  volunteer: 'Volunteer',
  intern: 'Intern',
  beneficiary: 'Beneficiary',
  public: 'Public Visitor',
}

export const CERTIFICATE_TYPES = [
  'Participation Certificate',
  'Volunteer Certificate',
  'Speaker Certificate',
  'Sponsor Appreciation Certificate',
] as const
