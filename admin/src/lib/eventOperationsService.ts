import { downloadCsv } from './adminExport'
import { getAllCampaignsAdmin } from './campaignService'
import { formatIndianCompact } from './formatIndian'
import { getEventRegistrations, getEvents, type Event, type EventRegistration, type EventStatus } from './eventService'
import { getProjects } from './projectService'
import { groupWorkflowRows, listWorkflowRows, updateDomainRoot, type WorkflowRow } from './domainWorkflowService'

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

export async function updateEventMeta(id: string, patch: Partial<EventAdminMeta>) {
  const rootPatch: Record<string, unknown> = {}
  if ('eventId' in patch) rootPatch.event_code = patch.eventId || null
  if ('category' in patch) rootPatch.category = patch.category || null
  if ('lifecycleStage' in patch) rootPatch.lifecycle_stage = patch.lifecycleStage || null
  if ('organizer' in patch) rootPatch.organizer = patch.organizer || null
  if ('projectId' in patch) rootPatch.project_id = patch.projectId || null
  if ('campaignId' in patch) rootPatch.campaign_id = patch.campaignId ? Number(patch.campaignId) : null
  if ('adminNotes' in patch) rootPatch.admin_notes = patch.adminNotes ?? null
  await updateDomainRoot('events', id, rootPatch)
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
  void email
  return 'public'
}

function buildRegistrations(regs: EventRegistration[], eventIndex: number): RegistrationProfile[] {
  return regs.map((r, i) => ({
    ...r,
    participantType: inferParticipantType(r.email),
    registrationId: `REG-${eventIndex + 1}-${String(i + 1).padStart(4, '0')}`,
    status: r.status,
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
  const category = (e.category as EventCategory | undefined) ?? meta.category ?? 'Community Drive'
  const lifecycleStage = (e.lifecycleStage as EventLifecycleStage | undefined) ?? meta.lifecycleStage ?? 'draft'
  const now = Date.now()
  const start = new Date(e.eventDate).getTime()
  const end = e.endDate ? new Date(e.endDate).getTime() : start + 86400000
  const isLive = now >= start && now <= end && lifecycleStage !== 'completed'
  const isUpcoming = start > now
  const regs = buildRegistrations(allRegs.get(e.id) ?? await getEventRegistrations(e.id), index)
  const registered = e.registeredCount || regs.length
  const checkedIn = meta.checkedIn ?? 0
  const cancelled = meta.cancelled ?? 0
  const waitingList = meta.waitingList ?? 0
  const capacity = e.capacity ?? 0
  const capacityPct = capacity > 0 ? Math.round((registered / capacity) * 100) : 0
  const volunteersAssigned = meta.volunteersAssigned ?? 0
  const fundsRaised = meta.fundsRaised ?? 0

  return {
    ...e,
    registeredCount: registered,
    eventCode: e.eventCode ?? meta.eventId ?? '',
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
    organizer: e.organizer ?? meta.organizer ?? '',
    projectName: e.projectId ? (projectMap.get(e.projectId) ?? '') : '',
    campaignName: e.campaignId ? (campaignMap.get(e.campaignId) ?? '') : '',
    focusArea: '',
    registrations: regs,
    volunteerRoles: meta.volunteerRoles ?? [],
    sponsors: meta.sponsors ?? [],
    agenda: meta.agenda ?? [],
    feedback: meta.feedback ?? [],
    fundraising: meta.fundraising ?? [],
    budgetAllocated: meta.budgetAllocated ?? 0,
    budgetLines: meta.budgetLines ?? [],
    impactMetrics: meta.impactMetrics ?? [],
    media: meta.media ?? [],
    isUpcoming,
    isLive,
  }
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

  const registrationSources: { label: string; value: number; pct: number }[] = []

  return { eventsByCategory, attendanceTrends, registrationSources }
}

function computeAiInsights(events: EventProfile[], kpis: EventDashboardData['kpis']) {
  void kpis
  return events.length ? [] : [{ id: 'empty', message: 'No events are available yet.', tone: 'info' as const }]
}

export async function getEventDashboardData(): Promise<EventDashboardData> {
  const [raw, campaigns, projects] = await Promise.all([
    getEvents(),
    getAllCampaignsAdmin().catch(() => []),
    getProjects().catch(() => []),
  ])
  const campaignMap = new Map(campaigns.map((c) => [String(c.id), c.title]))
  const projectMap = new Map(projects.map((p) => [p.id, p.title]))
  const ids = raw.map((event) => event.id)
  const [agenda, staffing, sponsorships, attendance, feedback] = await Promise.all([
    listWorkflowRows('event_agenda', 'event_id', ids),
    listWorkflowRows('event_staffing', 'event_id', ids),
    listWorkflowRows('event_sponsorships', 'event_id', ids),
    listWorkflowRows('event_attendance', 'event_id', ids),
    listWorkflowRows('event_feedback', 'event_id', ids),
  ])
  const agendaByEvent = groupWorkflowRows(agenda, 'event_id')
  const staffingByEvent = groupWorkflowRows(staffing, 'event_id')
  const sponsorshipsByEvent = groupWorkflowRows(sponsorships, 'event_id')
  const attendanceByEvent = groupWorkflowRows(attendance, 'event_id')
  const feedbackByEvent = groupWorkflowRows(feedback, 'event_id')
  const metaMap = Object.fromEntries(raw.map((event) => {
    const staff = staffingByEvent.get(event.id) ?? []
    const attendanceRows = attendanceByEvent.get(event.id) ?? []
    const feedbackRows = feedbackByEvent.get(event.id) ?? []
    const scoreRows = feedbackRows.filter((row) => row.score != null)
    const roleCounts = new Map<string, number>()
    staff.forEach((row) => roleCounts.set(String(row.role), (roleCounts.get(String(row.role)) ?? 0) + 1))
    return [event.id, {
      adminNotes: event.adminNotes,
      checkedIn: attendanceRows.filter((row) => row.status === 'attended').length,
      cancelled: attendanceRows.filter((row) => row.status === 'cancelled').length,
      waitingList: attendanceRows.filter((row) => row.status === 'waitlisted').length,
      volunteersAssigned: staff.length,
      volunteerRoles: [...roleCounts].map(([role, count]) => ({ role, count })),
      sponsors: (sponsorshipsByEvent.get(event.id) ?? []).map((row: WorkflowRow) => ({
        tier: (row.tier || 'Partner') as Sponsor['tier'],
        name: String(row.sponsor_name),
        amount: Number(row.amount ?? 0),
      })),
      fundsRaised: (sponsorshipsByEvent.get(event.id) ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
      agenda: (agendaByEvent.get(event.id) ?? []).map((row: WorkflowRow) => ({
        time: String(row.starts_at),
        label: String(row.title),
      })),
      feedback: scoreRows.length ? [{
        label: 'Overall rating',
        score: scoreRows.reduce((sum, row) => sum + Number(row.score), 0) / scoreRows.length,
      }] : [],
    } satisfies EventAdminMeta]
  }))

  const allRegsList: EventRegistration[] = []

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
