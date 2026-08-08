import { readPersistedMetaMap, writePersistedMetaMap } from './persistMeta'
import { downloadCsv } from './adminExport'
import { getAllCampaignsAdmin } from './campaignService'
import { campaignMatchesFocusArea, FOCUS_AREAS, type FocusArea } from '../constants/focusAreas'
import { getBeneficiaries } from './beneficiaryService'
import { getEvents } from './eventService'
import { getProjects } from './projectService'

const FOCUS_META_KEY = 'sanveda_focus_area_admin_meta'

export type FocusAreaStatus = 'active' | 'planned' | 'paused' | 'archived'
export type FocusPriority = 'low' | 'medium' | 'high' | 'strategic'

export interface FocusAreaProjectRow {
  id: string
  title: string
  budget: number
  progress: number
}

export interface FocusAreaCampaignRow {
  id: string
  title: string
  raised: number
}

export interface BeneficiarySegment {
  label: string
  count: number
}

export interface VolunteerSegment {
  label: string
  count: number
}

export interface SuccessStory {
  title: string
  beneficiary: string
  project: string
  quote: string
  impactScore: number
  hasPhotos: boolean
}

export interface FocusAreaDocument {
  name: string
  uploaded: boolean
}

export interface FocusAreaAdminMeta {
  mission?: string
  objectives?: string
  priority?: FocusPriority
  status?: FocusAreaStatus
  customDescription?: string
}

export interface FocusAreaProfile {
  slug: string
  name: string
  tabLabel: string
  description: string
  mission: string
  objectives: string
  priority: FocusPriority
  status: FocusAreaStatus
  image: string
  accent: string
  publicUrl: string
  projectCount: number
  campaignCount: number
  beneficiaryCount: number
  volunteerCount: number
  donorCount: number
  fundsRaised: number
  fundsUtilized: number
  fundsRemaining: number
  budgetAllocated: number
  utilizationPct: number
  progressPct: number
  projects: FocusAreaProjectRow[]
  campaigns: FocusAreaCampaignRow[]
  beneficiarySegments: BeneficiarySegment[]
  volunteerSegments: VolunteerSegment[]
  impactMetrics: { label: string; value: number }[]
  geographic: { states: number; districts: number; villages: number; cities: number }
  successStories: SuccessStory[]
  documents: FocusAreaDocument[]
}

export interface FocusAreaFilters {
  search: string
  status: FocusAreaStatus | 'all'
  priority: FocusPriority | 'all'
}

export interface FocusAreaDashboardData {
  focusAreas: FocusAreaProfile[]
  kpis: {
    totalFocusAreas: number
    activeProjects: number
    beneficiariesServed: number
    totalFunding: number
    volunteers: number
    campaignsRunning: number
  }
  fundingDistribution: { label: string; value: number }[]
  beneficiaryDistribution: { label: string; value: number; pct: number }[]
  growthTrends: { label: string; value: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

export const STRATEGIC_FOCUS_AREAS = FOCUS_AREAS.map((area) => ({
  slug: area.slug,
  name: area.title,
  tabLabel: area.tabLabel,
  keywords: [...area.keywords, ...area.categoryKeys],
}))

function readMetaMap(): Record<string, FocusAreaAdminMeta> {
  return readPersistedMetaMap<FocusAreaAdminMeta>('sanveda_focus_area_admin_meta')
}

export function updateFocusAreaMeta(slug: string, patch: Partial<FocusAreaAdminMeta>) {
  const map = readMetaMap()
  map[slug] = { ...map[slug], ...patch }
  writePersistedMetaMap(FOCUS_META_KEY, map)
}

function matchesStrategicArea(text: string, area: (typeof STRATEGIC_FOCUS_AREAS)[0]): boolean {
  const t = text.toLowerCase()
  return area.keywords.some((k) => t.includes(k))
}

function resolveLegacyArea(slug: string): FocusArea | undefined {
  return FOCUS_AREAS.find((a) => a.slug === slug)
}

function buildProfile(
  strategic: (typeof STRATEGIC_FOCUS_AREAS)[0],
  meta: FocusAreaAdminMeta | undefined,
  allProjects: Awaited<ReturnType<typeof getProjects>>,
  allCampaigns: Awaited<ReturnType<typeof getAllCampaignsAdmin>>,
  allBeneficiaries: Awaited<ReturnType<typeof getBeneficiaries>>,
  allEvents: Awaited<ReturnType<typeof getEvents>>,
): FocusAreaProfile {
  const legacy = resolveLegacyArea(strategic.slug)

  const legacyFocus: FocusArea = legacy ?? {
    slug: strategic.slug,
    title: strategic.name,
    tabLabel: strategic.tabLabel,
    summary: strategic.name,
    description: `${strategic.name} programmes at Sanveda.`,
    image: '/assets/focus-areas/community.jpg',
    icon: '',
    accent: '#0B2C6B',
    categoryKeys: strategic.keywords,
    keywords: strategic.keywords,
  }

  const projects = allProjects.filter(
    (p) => p.focusArea && matchesStrategicArea(p.focusArea, strategic),
  )
  const campaigns = allCampaigns.filter((c) => campaignMatchesFocusArea(c, legacyFocus))
  const beneficiaries = allBeneficiaries.filter(
    (b) => b.category && matchesStrategicArea(b.category, strategic),
  )
  void allEvents

  const projectRows: FocusAreaProjectRow[] = projects.slice(0, 6).map((p) => ({
    id: p.id,
    title: p.title,
    budget: p.budget,
    progress: p.progressPercent,
  }))

  const campaignRows: FocusAreaCampaignRow[] = campaigns.slice(0, 6).map((c) => ({
    id: String(c.id),
    title: c.title,
    raised: c.raised ?? 0,
  }))

  const beneficiaryCount = beneficiaries.length
  const fundsRaised =
    projects.reduce((s, p) => s + p.budget, 0) +
      campaigns.reduce((s, c) => s + (c.raised ?? 0), 0) || 0
  const fundsUtilized = projects.reduce((s, p) => s + p.spent, 0) || 0
  const budgetAllocated = fundsRaised
  const fundsRemaining = Math.max(budgetAllocated - fundsUtilized, 0)
  const utilizationPct =
    budgetAllocated > 0 ? Math.round((fundsUtilized / budgetAllocated) * 100) : 0
  const progressPct = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.progressPercent, 0) / projects.length)
    : 0

  const volunteerCount = 0
  const donorCount = 0

  return {
    slug: strategic.slug,
    name: strategic.name,
    tabLabel: strategic.tabLabel,
    description: meta?.customDescription ?? legacyFocus.description,
    mission:
      meta?.mission ??
      `Advance ${strategic.name.toLowerCase()} outcomes through verified programmes and community partnerships.`,
    objectives:
      meta?.objectives ??
      `Increase reach, improve outcomes, and ensure transparent fund utilization across ${strategic.name.toLowerCase()} initiatives.`,
    priority:
      meta?.priority ??
      (strategic.slug === 'healthcare-therapeutic-support' ||
      strategic.slug === 'education-skill-development'
        ? 'strategic'
        : 'high'),
    status: meta?.status ?? 'active',
    image: legacyFocus.image,
    accent: legacyFocus.accent,
    publicUrl: `/focus-areas/${legacyFocus.slug}`,
    projectCount: projects.length,
    campaignCount: campaigns.length,
    beneficiaryCount,
    volunteerCount,
    donorCount,
    fundsRaised,
    fundsUtilized,
    fundsRemaining,
    budgetAllocated,
    utilizationPct,
    progressPct,
    projects: projectRows,
    campaigns: campaignRows,
    beneficiarySegments: [],
    volunteerSegments: [],
    impactMetrics: [],
    geographic: { states: 0, districts: 0, villages: 0, cities: 0 },
    successStories: [],
    documents: [],
  }
}

function computeKpis(areas: FocusAreaProfile[]) {
  return {
    totalFocusAreas: areas.length,
    activeProjects: areas.reduce((s, a) => s + a.projectCount, 0),
    beneficiariesServed: areas.reduce((s, a) => s + a.beneficiaryCount, 0),
    totalFunding: areas.reduce((s, a) => s + a.fundsRaised, 0),
    volunteers: areas.reduce((s, a) => s + a.volunteerCount, 0),
    campaignsRunning: areas.reduce((s, a) => s + a.campaignCount, 0),
  }
}

function computeAnalytics(areas: FocusAreaProfile[]) {
  const fundingDistribution = areas
    .map((a) => ({ label: a.tabLabel, value: a.fundsRaised }))
    .sort((a, b) => b.value - a.value)

  const benTotal = areas.reduce((s, a) => s + a.beneficiaryCount, 0) || 1
  const beneficiaryDistribution = areas
    .map((a) => ({
      label: a.tabLabel,
      value: a.beneficiaryCount,
      pct: Math.round((a.beneficiaryCount / benTotal) * 100),
    }))
    .sort((a, b) => b.value - a.value)

  const growthTrends: { label: string; value: number }[] = []

  return { fundingDistribution, beneficiaryDistribution, growthTrends }
}

function computeAiInsights(areas: FocusAreaProfile[]) {
  const hasData = areas.some(
    (a) => a.projectCount > 0 || a.beneficiaryCount > 0 || a.fundsRaised > 0,
  )
  return hasData
    ? []
    : [
        {
          id: 'empty',
          message:
            'No programme data yet. Link projects and campaigns to focus areas to see insights.',
          tone: 'info' as const,
        },
      ]
}

export async function getFocusAreaDashboardData(): Promise<FocusAreaDashboardData> {
  const [projects, campaigns, beneficiaries, events] = await Promise.all([
    getProjects().catch(() => []),
    getAllCampaignsAdmin().catch(() => []),
    getBeneficiaries().catch(() => []),
    getEvents().catch(() => []),
  ])
  const metaMap = readMetaMap()
  const focusAreas = STRATEGIC_FOCUS_AREAS.map((s) =>
    buildProfile(s, metaMap[s.slug], projects, campaigns, beneficiaries, events),
  )

  const kpis = computeKpis(focusAreas)
  const analytics = computeAnalytics(focusAreas)
  const aiInsights = computeAiInsights(focusAreas)

  return { focusAreas, kpis, aiInsights, ...analytics }
}

export function filterFocusAreas(
  areas: FocusAreaProfile[],
  filters: FocusAreaFilters,
): FocusAreaProfile[] {
  return areas.filter((a) => {
    if (filters.status !== 'all' && a.status !== filters.status) return false
    if (filters.priority !== 'all' && a.priority !== filters.priority) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    }
    return true
  })
}

export function exportFocusAreasCsv(areas: FocusAreaProfile[]) {
  const headers = ['Focus Area', 'Projects', 'Beneficiaries', 'Budget', 'Progress', 'Status']
  const rows = areas.map((a) => [
    a.name,
    a.projectCount,
    a.beneficiaryCount,
    a.fundsRaised,
    `${a.progressPct}%`,
    a.status,
  ])
  downloadCsv('focus-areas-export.csv', headers, rows)
}

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'planned', label: 'Planned' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
] as const

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'strategic', label: 'Strategic' },
] as const
