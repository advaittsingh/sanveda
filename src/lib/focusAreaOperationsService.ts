import { readPersistedMetaMap, writePersistedMetaMap, isProductionDataMode } from './persistMeta'
import { downloadCsv } from './adminExport'
import { getAllCampaignsAdmin } from './campaignService'
import { campaignMatchesFocusArea, FOCUS_AREAS, type FocusArea } from '../constants/focusAreas'
import { getBeneficiaries } from './beneficiaryService'
import { getEvents } from './eventService'
import { formatIndianCompact } from './formatIndian'
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

export const STRATEGIC_FOCUS_AREAS: { slug: string; name: string; tabLabel: string; keywords: string[] }[] = [
  { slug: 'healthcare', name: 'Healthcare', tabLabel: 'Healthcare', keywords: ['health', 'medical', 'healthcare', 'patient'] },
  { slug: 'education', name: 'Education', tabLabel: 'Education', keywords: ['education', 'school', 'scholarship', 'student'] },
  { slug: 'women-empowerment', name: 'Women Empowerment', tabLabel: 'Women', keywords: ['women', 'empowerment', 'gender'] },
  { slug: 'child-welfare', name: 'Child Welfare', tabLabel: 'Child Welfare', keywords: ['child', 'children', 'welfare'] },
  { slug: 'sports-development', name: 'Sports Development', tabLabel: 'Sports', keywords: ['sport', 'athlete', 'sports'] },
  { slug: 'livelihood-programs', name: 'Livelihood Programs', tabLabel: 'Livelihood', keywords: ['livelihood', 'employment', 'skill'] },
  { slug: 'disaster-relief', name: 'Disaster Relief', tabLabel: 'Disaster Relief', keywords: ['disaster', 'relief', 'flood'] },
  { slug: 'community-development', name: 'Community Development', tabLabel: 'Community', keywords: ['community', 'social', 'upliftment'] },
  { slug: 'environmental-sustainability', name: 'Environmental Sustainability', tabLabel: 'Environment', keywords: ['environment', 'sustainability', 'green'] },
  { slug: 'senior-citizen-welfare', name: 'Senior Citizen Welfare', tabLabel: 'Senior Citizens', keywords: ['senior', 'elderly', 'aged'] },
]

function readMetaMap(): Record<string, FocusAreaAdminMeta> {
  return readPersistedMetaMap<FocusAreaAdminMeta>('sanveda_focus_area_admin_meta')
}

export function updateFocusAreaMeta(slug: string, patch: Partial<FocusAreaAdminMeta>) {
  const map = readMetaMap()
  map[slug] = { ...map[slug], ...patch }
  writePersistedMetaMap(FOCUS_META_KEY, map)
}

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function matchesStrategicArea(text: string, area: typeof STRATEGIC_FOCUS_AREAS[0]): boolean {
  const t = text.toLowerCase()
  return area.keywords.some((k) => t.includes(k))
}

function resolveLegacyArea(slug: string): FocusArea | undefined {
  return FOCUS_AREAS.find((a) => a.slug.includes(slug) || slug.includes(a.slug.split('-')[0]))
}

function buildImpactMetrics(areaName: string, seed: number, beneficiaries: number): { label: string; value: number }[] {
  const n = areaName.toLowerCase()
  if (n.includes('health')) {
    return [
      { label: 'Patients Treated', value: 12000 + (seed % 8000) },
      { label: 'Medical Camps', value: 40 + (seed % 50) },
      { label: 'Blood Units Collected', value: 2000 + (seed % 1500) },
      { label: 'Surgeries Sponsored', value: 80 + (seed % 120) },
    ]
  }
  if (n.includes('education')) {
    return [
      { label: 'Students Supported', value: beneficiaries || 8000 + (seed % 5000) },
      { label: 'Scholarships', value: 400 + (seed % 500) },
      { label: 'Schools Reached', value: 50 + (seed % 50) },
    ]
  }
  if (n.includes('sport')) {
    return [
      { label: 'Athletes Supported', value: 500 + (seed % 400) },
      { label: 'Training Programs', value: 20 + (seed % 15) },
      { label: 'Events Conducted', value: 30 + (seed % 20) },
    ]
  }
  return [
    { label: 'Beneficiaries Reached', value: beneficiaries || 3000 + (seed % 4000) },
    { label: 'Programs Delivered', value: 15 + (seed % 20) },
    { label: 'Communities Served', value: 25 + (seed % 30) },
  ]
}

function buildProfile(
  strategic: typeof STRATEGIC_FOCUS_AREAS[0],
  meta: FocusAreaAdminMeta | undefined,
  allProjects: Awaited<ReturnType<typeof getProjects>>,
  allCampaigns: Awaited<ReturnType<typeof getAllCampaignsAdmin>>,
  allBeneficiaries: Awaited<ReturnType<typeof getBeneficiaries>>,
  allEvents: Awaited<ReturnType<typeof getEvents>>,
): FocusAreaProfile {
  const legacy = resolveLegacyArea(strategic.slug)
  const seed = hashCode(strategic.slug)
  const production = isProductionDataMode()

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
  const events = allEvents.filter(
    (e) => e.title && matchesStrategicArea(`${e.title} ${e.description ?? ''}`, strategic),
  )

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

  const beneficiaryCount = beneficiaries.length || (production ? 0 : 800 + (seed % 4000))
  const fundsRaised =
    projects.reduce((s, p) => s + p.budget, 0) + campaigns.reduce((s, c) => s + (c.raised ?? 0), 0) ||
    (production ? 0 : 5000000 + (seed % 20000000))
  const fundsUtilized =
    projects.reduce((s, p) => s + p.spent, 0) ||
    (production ? 0 : Math.round(fundsRaised * (0.65 + (seed % 20) / 100)))
  const budgetAllocated = fundsRaised
  const fundsRemaining = Math.max(budgetAllocated - fundsUtilized, 0)
  const utilizationPct = budgetAllocated > 0 ? Math.round((fundsUtilized / budgetAllocated) * 100) : 0
  const progressPct = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.progressPercent, 0) / projects.length)
    : production ? 0 : 60 + (seed % 30)

  const volunteerCount = production ? events.length * 5 : 80 + (seed % 300) + events.length * 5
  const donorCount = production ? campaigns.length * 15 : 200 + (seed % 800) + campaigns.length * 15

  return {
    slug: strategic.slug,
    name: strategic.name,
    tabLabel: strategic.tabLabel,
    description: meta?.customDescription ?? legacyFocus.description,
    mission: meta?.mission ?? `Advance ${strategic.name.toLowerCase()} outcomes through verified programmes and community partnerships.`,
    objectives: meta?.objectives ?? `Increase reach, improve outcomes, and ensure transparent fund utilization across ${strategic.name.toLowerCase()} initiatives.`,
    priority: meta?.priority ?? (strategic.slug === 'healthcare' || strategic.slug === 'education' ? 'strategic' : 'high'),
    status: meta?.status ?? 'active',
    image: legacyFocus.image,
    accent: legacyFocus.accent,
    publicUrl: `/focus-areas/${legacyFocus.slug}`,
    projectCount: projects.length || (production ? 0 : 5 + (seed % 12)),
    campaignCount: campaigns.length || (production ? 0 : 3 + (seed % 10)),
    beneficiaryCount,
    volunteerCount,
    donorCount,
    fundsRaised,
    fundsUtilized,
    fundsRemaining,
    budgetAllocated,
    utilizationPct,
    progressPct,
    projects: projectRows.length ? projectRows : production ? [] : [
      { id: '1', title: `${strategic.tabLabel} Outreach`, budget: 5000000, progress: progressPct },
      { id: '2', title: `${strategic.tabLabel} Initiative`, budget: 20000000, progress: Math.max(progressPct - 10, 40) },
    ],
    campaigns: campaignRows.length ? campaignRows : production ? [] : [
      { id: '1', title: `Donate for ${strategic.tabLabel}`, raised: Math.round(fundsRaised * 0.3) },
      { id: '2', title: `${strategic.tabLabel} Drive`, raised: Math.round(fundsRaised * 0.2) },
    ],
    beneficiarySegments: production && beneficiaryCount === 0 ? [] : [
      { label: 'Children', count: Math.round(beneficiaryCount * 0.41) },
      { label: 'Women', count: Math.round(beneficiaryCount * 0.28) },
      { label: 'Senior Citizens', count: Math.round(beneficiaryCount * 0.12) },
      { label: 'Patients', count: Math.round(beneficiaryCount * 0.19) },
    ],
    volunteerSegments: production && volunteerCount === 0 ? [] : [
      { label: 'Doctors', count: Math.round(volunteerCount * 0.13) },
      { label: 'Nurses', count: Math.round(volunteerCount * 0.18) },
      { label: 'Support Staff', count: Math.round(volunteerCount * 0.3) },
      { label: 'General Volunteers', count: Math.round(volunteerCount * 0.39) },
    ],
    impactMetrics: production && beneficiaryCount === 0 ? [] : buildImpactMetrics(strategic.name, seed, beneficiaryCount),
    geographic: production ? { states: 0, districts: 0, villages: 0, cities: 0 } : {
      states: 8 + (seed % 6),
      districts: 20 + (seed % 30),
      villages: 100 + (seed % 250),
      cities: 10 + (seed % 20),
    },
    successStories: production ? [] : [
      {
        title: `${strategic.tabLabel} Impact Story`,
        beneficiary: 'Community Member',
        project: projectRows[0]?.title ?? `${strategic.tabLabel} Programme`,
        quote: `Received support worth ₹${(100000 + seed % 400000).toLocaleString('en-IN')} and fully recovered.`,
        impactScore: 85 + (seed % 15),
        hasPhotos: true,
      },
    ],
    documents: production ? [] : [
      { name: 'Research Reports', uploaded: true },
      { name: 'Project Reports', uploaded: true },
      { name: 'Budgets', uploaded: true },
      { name: 'Case Studies', uploaded: seed % 2 === 0 },
      { name: 'CSR Reports', uploaded: true },
    ],
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
    .map((a) => ({ label: a.tabLabel, value: a.beneficiaryCount, pct: Math.round((a.beneficiaryCount / benTotal) * 100) }))
    .sort((a, b) => b.value - a.value)

  const growthTrends = isProductionDataMode()
    ? []
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
        label,
        value: 20 + i * 15 + (hashCode(label) % 20),
      }))

  return { fundingDistribution, beneficiaryDistribution, growthTrends }
}

function computeAiInsights(areas: FocusAreaProfile[]) {
  if (isProductionDataMode()) {
    const hasData = areas.some((a) => a.projectCount > 0 || a.beneficiaryCount > 0 || a.fundsRaised > 0)
    return hasData
      ? []
      : [{ id: 'empty', message: 'No programme data yet. Link projects and campaigns to focus areas to see insights.', tone: 'info' as const }]
  }

  const healthcare = areas.find((a) => a.slug === 'healthcare')
  const education = areas.find((a) => a.slug === 'education')
  const sports = areas.find((a) => a.slug === 'sports-development')
  const disaster = areas.find((a) => a.slug === 'disaster-relief')
  const women = areas.find((a) => a.slug === 'women-empowerment')
  const totalFunding = areas.reduce((s, a) => s + a.fundsRaised, 0) || 1
  const healthcarePct = healthcare ? Math.round((healthcare.fundsRaised / totalFunding) * 100) : 42

  return [
    { id: 'healthcare', message: `Healthcare generates ${healthcarePct}% of all donations`, tone: 'success' as const },
    { id: 'education', message: `Education has the highest beneficiary growth (${education?.beneficiaryCount.toLocaleString('en-IN') ?? '10,200'} served)`, tone: 'info' as const },
    { id: 'sports', message: `Sports programs require additional funding (${formatIndianCompact(sports?.fundsRemaining ?? 500000)} remaining)`, tone: 'warning' as const },
    { id: 'disaster', message: `Disaster relief projects exceeded target impact by ${disaster ? disaster.progressPct - 70 : 23}%`, tone: 'success' as const },
    { id: 'women', message: `Women's empowerment programs have highest retention (${women?.donorCount ?? 840} donors)`, tone: 'info' as const },
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

export function filterFocusAreas(areas: FocusAreaProfile[], filters: FocusAreaFilters): FocusAreaProfile[] {
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
