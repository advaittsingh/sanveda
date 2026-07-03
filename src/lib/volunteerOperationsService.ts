import { readPersistedMetaMap, writePersistedMetaMap } from './persistMeta'
import { downloadCsv } from './adminExport'
import { VOLUNTEER_ROLE_OPTIONS } from '../constants/volunteerContent'
import { getVolunteerApplications } from './volunteerStore'
import type { VolunteerApplication, VolunteerRole, VolunteerStatus } from '../types/volunteer'

const VOLUNTEER_META_KEY = 'sanveda_volunteer_admin_meta'

export type VolunteerViewMode = 'table' | 'kanban'

export interface VolunteerCertification {
  name: string
  status: 'completed' | 'pending'
}

export interface VolunteerAssignment {
  project: string
  role: string
  start: string
  end: string
  status: 'completed' | 'active' | 'upcoming'
}

export interface VolunteerEventParticipation {
  name: string
  attended: boolean
  hours: number
  feedbackScore: number
}

export interface VolunteerAdminMeta {
  emergencyContact?: string
  volunteerHours?: number
  presentDays?: number
  projects?: number
  events?: number
  isTeamLeader?: boolean
  badges?: string[]
  certifications?: VolunteerCertification[]
  assignments?: VolunteerAssignment[]
  eventParticipation?: VolunteerEventParticipation[]
}

export interface VolunteerProfile extends VolunteerApplication {
  primaryRole: string
  department: string
  location: string
  experienceLabel: string
  volunteerHours: number
  presentDays: number
  projects: number
  events: number
  isTeamLeader: boolean
  skillsList: string[]
  badges: string[]
  certificationRecords: VolunteerCertification[]
  assignments: VolunteerAssignment[]
  eventParticipation: VolunteerEventParticipation[]
  performanceScore: number
  performanceBreakdown: {
    attendance: number
    participation: number
    leadership: number
    reliability: number
    impact: number
  }
  emergencyContact: string
  pipelineStage: VolunteerStatus
}

export interface VolunteerFilters {
  search: string
  status: VolunteerStatus | 'all'
  department: string | 'all'
  team: string | 'all'
}

export interface VolunteerTeamSummary {
  name: string
  count: number
}

export interface VolunteerDashboardData {
  volunteers: VolunteerProfile[]
  kpis: {
    totalApplications: number
    pendingReview: number
    approvedVolunteers: number
    activeVolunteers: number
    teamLeaders: number
    volunteerHours: number
  }
  pipeline: Record<VolunteerStatus, VolunteerProfile[]>
  teams: VolunteerTeamSummary[]
  hoursByDepartment: { label: string; hours: number }[]
  volunteersByDepartment: { label: string; value: number; pct: number }[]
  volunteerGrowth: { label: string; value: number }[]
  retentionRates: { label: string; value: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

const DEPARTMENT_MAP: Record<VolunteerRole, string> = {
  healthcare: 'Healthcare',
  education: 'Education',
  sports: 'Operations',
  environment: 'Operations',
  'social-media': 'Fundraising',
  technology: 'Operations',
  media: 'Fundraising',
  fundraising: 'Fundraising',
  administration: 'Operations',
}

const DEFAULT_CERTIFICATIONS: VolunteerCertification[] = [
  { name: 'Orientation', status: 'completed' },
  { name: 'Child Safety', status: 'completed' },
  { name: 'First Aid', status: 'pending' },
  { name: 'Fundraising', status: 'completed' },
]

const DEFAULT_EVENTS = [
  'Blood Donation Camp',
  'Community Cleanup',
  'Education Drive',
  'Sports Program',
  'Medical Camp',
]

function readMetaMap(): Record<string, VolunteerAdminMeta> {
  return readPersistedMetaMap<VolunteerAdminMeta>(VOLUNTEER_META_KEY)
}

function writeMetaMap(map: Record<string, VolunteerAdminMeta>) {
  writePersistedMetaMap(VOLUNTEER_META_KEY, map)
}

function roleLabel(role: VolunteerRole): string {
  return VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function inferDepartment(app: VolunteerApplication): string {
  if (app.assignedTeam) return app.assignedTeam
  const role = app.preferredRoles[0]
  return role ? DEPARTMENT_MAP[role] : 'Operations'
}

function inferHours(app: VolunteerApplication, meta?: VolunteerAdminMeta): number {
  if (meta?.volunteerHours != null) return meta.volunteerHours
  if (app.status !== 'active' && app.status !== 'approved') return 0
  const base = hashCode(app.id) % 400
  return app.status === 'active' ? 80 + base : base % 40
}

function inferPerformance(app: VolunteerApplication, hours: number) {
  const seed = hashCode(app.id)
  const attendance = Math.min(95, 70 + (hours % 26))
  const participation = Math.min(94, 65 + (seed % 30))
  const leadership = app.assignedTeam || (seed % 3 === 0) ? 78 + (seed % 18) : 60 + (seed % 20)
  const reliability = Math.min(96, 72 + (seed % 24))
  const impact = Math.min(95, 68 + (hours % 28))
  const performanceScore = Math.round((attendance + participation + leadership + reliability + impact) / 5)
  return {
    performanceScore,
    performanceBreakdown: { attendance, participation, leadership: leadership, reliability, impact },
  }
}

function inferBadges(hours: number, isLeader: boolean, score: number): string[] {
  const badges: string[] = []
  if (score >= 90) badges.push('Top Volunteer')
  if (hours >= 100) badges.push('100 Hours Club')
  if (isLeader) badges.push('Team Leader')
  if (score >= 85) badges.push('Community Hero')
  if (hours >= 500) badges.push('Impact Champion')
  return badges
}

function buildAssignments(app: VolunteerApplication, meta?: VolunteerAdminMeta): VolunteerAssignment[] {
  if (meta?.assignments?.length) return meta.assignments
  if (app.status !== 'active' && app.status !== 'approved') return []
  const dept = inferDepartment(app)
  return [
    {
      project: `${dept} Outreach Program`,
      role: roleLabel(app.preferredRoles[0] ?? 'administration'),
      start: 'Jan 2026',
      end: 'Mar 2026',
      status: 'completed',
    },
    {
      project: 'Blood Donation Camp',
      role: 'Coordinator',
      start: 'Apr 2026',
      end: '—',
      status: 'active',
    },
  ]
}

function buildEventParticipation(meta?: VolunteerAdminMeta): VolunteerEventParticipation[] {
  if (meta?.eventParticipation?.length) return meta.eventParticipation
  return DEFAULT_EVENTS.map((name, i) => ({
    name,
    attended: i % 3 !== 2,
    hours: 4 + (i * 2),
    feedbackScore: 4 + (i % 2),
  }))
}

function buildProfile(app: VolunteerApplication, metaMap: Record<string, VolunteerAdminMeta>): VolunteerProfile {
  const meta = metaMap[app.id] ?? {}
  const primaryRole = app.preferredRoles[0] ? roleLabel(app.preferredRoles[0]) : 'General'
  const department = inferDepartment(app)
  const volunteerHours = inferHours(app, meta)
  const { performanceScore, performanceBreakdown } = inferPerformance(app, volunteerHours)
  const isTeamLeader = meta.isTeamLeader ?? (volunteerHours >= 200 && app.status === 'active')
  const skillsList = app.skills
    ? app.skills.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    : app.preferredRoles.map(roleLabel)

  return {
    ...app,
    primaryRole,
    department,
    location: `${app.city}${app.state ? `, ${app.state}` : ''}`,
    experienceLabel: app.experience?.trim() || '—',
    volunteerHours,
    presentDays: meta.presentDays ?? Math.round(volunteerHours / 6),
    projects: meta.projects ?? (app.status === 'active' ? 2 + (hashCode(app.id) % 6) : 0),
    events: meta.events ?? (app.status === 'active' ? 3 + (hashCode(app.id) % 10) : 0),
    isTeamLeader,
    skillsList: skillsList.length ? skillsList : ['Communication', 'Teamwork'],
    badges: meta.badges ?? inferBadges(volunteerHours, isTeamLeader, performanceScore),
    certificationRecords: meta.certifications ?? DEFAULT_CERTIFICATIONS.map((c) => ({
      ...c,
      status: app.status === 'active' || app.status === 'approved' ? c.status : 'pending',
    })),
    assignments: buildAssignments(app, meta),
    eventParticipation: buildEventParticipation(meta),
    performanceScore,
    performanceBreakdown,
    emergencyContact: meta.emergencyContact ?? '—',
    pipelineStage: app.status,
  }
}

function computeKpis(volunteers: VolunteerProfile[]) {
  return {
    totalApplications: volunteers.length,
    pendingReview: volunteers.filter((v) => v.status === 'pending' || v.status === 'screening').length,
    approvedVolunteers: volunteers.filter((v) => v.status === 'approved' || v.status === 'active' || v.status === 'orientation').length,
    activeVolunteers: volunteers.filter((v) => v.status === 'active').length,
    teamLeaders: volunteers.filter((v) => v.isTeamLeader).length,
    volunteerHours: volunteers.reduce((s, v) => s + v.volunteerHours, 0),
  }
}

function computeTeams(volunteers: VolunteerProfile[]): VolunteerTeamSummary[] {
  const teams = ['Healthcare Team', 'Education Team', 'Fundraising Team', 'Operations Team']
  return teams.map((name) => ({
    name,
    count: volunteers.filter((v) => {
      const dept = v.department.toLowerCase()
      if (name.includes('Healthcare')) return dept.includes('healthcare')
      if (name.includes('Education')) return dept.includes('education')
      if (name.includes('Fundraising')) return dept.includes('fundraising')
      return dept.includes('operations') || (!dept.includes('healthcare') && !dept.includes('education') && !dept.includes('fundraising'))
    }).filter((v) => v.status === 'active' || v.status === 'approved').length,
  }))
}

function computeAnalytics(volunteers: VolunteerProfile[]) {
  const deptMap = new Map<string, number>()
  for (const v of volunteers.filter((x) => x.status === 'active' || x.status === 'approved')) {
    deptMap.set(v.department, (deptMap.get(v.department) ?? 0) + 1)
  }
  const deptTotal = [...deptMap.values()].reduce((s, v) => s + v, 0) || 1
  const volunteersByDepartment = [...deptMap.entries()].map(([label, value]) => ({
    label,
    value,
    pct: Math.round((value / deptTotal) * 100),
  }))

  const monthMap = new Map<string, number>()
  for (const v of volunteers) {
    const label = new Date(v.createdAt).toLocaleDateString('en-IN', { month: 'short' })
    monthMap.set(label, (monthMap.get(label) ?? 0) + 1)
  }
  const volunteerGrowth = [...monthMap.entries()].slice(-6).map(([label, value]) => ({ label, value }))

  const hoursMap = new Map<string, number>()
  for (const v of volunteers) {
    hoursMap.set(v.department, (hoursMap.get(v.department) ?? 0) + v.volunteerHours)
  }
  const hoursByDepartment = [...hoursMap.entries()].map(([label, hours]) => ({ label, hours }))

  const activeCount = volunteers.filter((v) => v.status === 'active').length
  const total = volunteers.length || 1
  const retentionRates = [
    { label: '1 Month', value: Math.min(95, Math.round((activeCount / total) * 100 + 20)) },
    { label: '6 Months', value: Math.min(85, Math.round((activeCount / total) * 100 + 8)) },
    { label: '1 Year', value: Math.min(72, Math.round((activeCount / total) * 100)) },
  ]

  return { volunteersByDepartment, volunteerGrowth, hoursByDepartment, retentionRates }
}

function computeAiInsights(volunteers: VolunteerProfile[], teams: VolunteerTeamSummary[]) {
  const inactive = volunteers.filter((v) => {
    if (v.status !== 'active') return false
    const days = (Date.now() - new Date(v.updatedAt).getTime()) / 86400000
    return days >= 60
  }).length

  const leaderCandidates = volunteers.filter(
    (v) => v.status === 'active' && !v.isTeamLeader && v.performanceScore >= 85,
  ).length

  const healthcareTeam = teams.find((t) => t.name.includes('Healthcare'))
  const healthcareGap = healthcareTeam && healthcareTeam.count < 25 ? 25 - healthcareTeam.count : 0

  const fiveHundredHours = volunteers.filter((v) => v.volunteerHours >= 500).length

  return [
    { id: 'inactive', message: `${inactive} volunteers inactive for 60 days`, tone: 'warning' as const },
    { id: 'leaders', message: `${leaderCandidates} volunteers eligible for team leader roles`, tone: 'info' as const },
    ...(healthcareGap > 0
      ? [{ id: 'healthcare', message: `Healthcare team requires ${healthcareGap} more volunteers`, tone: 'warning' as const }]
      : []),
    { id: 'hours', message: `${fiveHundredHours} volunteers have crossed 500 service hours`, tone: 'success' as const },
  ]
}

export async function getVolunteerDashboardData(): Promise<VolunteerDashboardData> {
  const applications = await getVolunteerApplications()
  const metaMap = readMetaMap()
  const volunteers = applications.map((app) => buildProfile(app, metaMap))

  const pipeline = {
    pending: volunteers.filter((v) => v.status === 'pending'),
    screening: volunteers.filter((v) => v.status === 'screening'),
    interview: volunteers.filter((v) => v.status === 'interview'),
    approved: volunteers.filter((v) => v.status === 'approved'),
    orientation: volunteers.filter((v) => v.status === 'orientation'),
    active: volunteers.filter((v) => v.status === 'active'),
    rejected: volunteers.filter((v) => v.status === 'rejected'),
  }

  const kpis = computeKpis(volunteers)
  const teams = computeTeams(volunteers)
  const analytics = computeAnalytics(volunteers)
  const aiInsights = computeAiInsights(volunteers, teams)

  return { volunteers, kpis, pipeline, teams, aiInsights, ...analytics }
}

export function filterVolunteers(volunteers: VolunteerProfile[], filters: VolunteerFilters): VolunteerProfile[] {
  return volunteers.filter((v) => {
    if (filters.status !== 'all' && v.status !== filters.status) return false
    if (filters.department !== 'all' && v.department !== filters.department) return false
    if (filters.team !== 'all' && v.assignedTeam !== filters.team) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        v.fullName.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.primaryRole.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export function updateVolunteerMeta(id: string, patch: Partial<VolunteerAdminMeta>) {
  const map = readMetaMap()
  map[id] = { ...map[id], ...patch }
  writeMetaMap(map)
}

export function exportVolunteersCsv(volunteers: VolunteerProfile[]) {
  const headers = [
    'Name',
    'Email',
    'Role',
    'Department',
    'Location',
    'Experience',
    'Status',
    'Hours',
    'Volunteer ID',
  ]
  const rows = volunteers.map((v) => [
    v.fullName,
    v.email,
    v.primaryRole,
    v.department,
    v.location,
    v.experienceLabel,
    v.status,
    v.volunteerHours,
    v.volunteerId ?? '',
  ])
  downloadCsv('volunteers-export.csv', headers, rows)
}

export const PIPELINE_STAGES: { status: VolunteerStatus; label: string }[] = [
  { status: 'pending', label: 'Applications' },
  { status: 'screening', label: 'Screening' },
  { status: 'interview', label: 'Interview' },
  { status: 'approved', label: 'Approved' },
  { status: 'orientation', label: 'Training' },
  { status: 'active', label: 'Active' },
]

export const DEPARTMENT_OPTIONS = ['all', 'Healthcare', 'Education', 'Fundraising', 'Operations'] as const

export const STATUS_FILTER_OPTIONS: { value: VolunteerStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'approved', label: 'Approved' },
  { value: 'orientation', label: 'Training' },
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
]
