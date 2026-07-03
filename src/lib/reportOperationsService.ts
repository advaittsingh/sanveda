import { downloadCsv } from './adminExport'

export type ReportCategory =
  | 'impact'
  | 'financial'
  | 'donor'
  | 'volunteer'
  | 'beneficiary'
  | 'campaign'
  | 'project'
  | 'grant'
  | 'compliance'
  | 'operational'
  | 'board'
  | 'analytics'

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'dashboard'
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'

export interface ReportTemplate {
  id: string
  name: string
  category: ReportCategory
  categoryLabel: string
  description: string
  formats: ReportFormat[]
  lastGenerated?: string
  scheduled?: boolean
}

export interface DonorReportProfile {
  id: string
  name: string
  totalDonations: number
  campaignsSupported: number
  beneficiariesImpacted: number
  taxReceiptsAvailable: boolean
}

export interface CampaignReportProfile {
  id: string
  title: string
  goal: number
  raised: number
  utilized: number
  donors: number
  beneficiaries: number
  completionPct: number
  roi: number
}

export interface VolunteerReportMetrics {
  applications: number
  approved: number
  active: number
  hoursServed: number
}

export interface BeneficiaryReportProfile {
  id: string
  program: string
  count: number
  supportProvided: number
  recovered: number
}

export interface ProjectReportProfile {
  id: string
  title: string
  budget: number
  received: number
  utilized: number
  beneficiaries: number
  volunteers: number
  events: number
}

export interface GrantReportProfile {
  id: string
  name: string
  allocated: number
  spent: number
  remaining: number
  milestonesPct: number
}

export interface ImpactReportProfile {
  id: string
  program: string
  fundsRaised: number
  fundsUtilized: number
  beneficiaries: number
  volunteers: number
  events: number
  outcomeRate: number
}

export interface ScheduledReport {
  id: string
  name: string
  frequency: ScheduleFrequency
  nextRun: string
  recipients: string[]
}

export interface ReportDashboardData {
  kpis: {
    reportsGenerated: number
    scheduledReports: number
    pendingReports: number
    complianceReports: number
    lastGenerated: string
    automatedPct: number
  }
  templates: ReportTemplate[]
  donorReports: DonorReportProfile[]
  campaignReports: CampaignReportProfile[]
  volunteerMetrics: VolunteerReportMetrics
  beneficiaryReports: BeneficiaryReportProfile[]
  projectReports: ProjectReportProfile[]
  grantReports: GrantReportProfile[]
  impactReports: ImpactReportProfile[]
  scheduledReports: ScheduledReport[]
  donationTrends: { label: string; value: number }[]
  expenseDistribution: { label: string; value: number; pct: number }[]
  geographicImpact: { label: string; value: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

export const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'impact', label: 'Impact Reports' },
  { value: 'financial', label: 'Financial Reports' },
  { value: 'donor', label: 'Donor Reports' },
  { value: 'volunteer', label: 'Volunteer Reports' },
  { value: 'beneficiary', label: 'Beneficiary Reports' },
  { value: 'campaign', label: 'Campaign Reports' },
  { value: 'project', label: 'Project Reports' },
  { value: 'grant', label: 'Grant Reports' },
  { value: 'compliance', label: 'Compliance Reports' },
  { value: 'operational', label: 'Operational Reports' },
  { value: 'board', label: 'Board Reports' },
  { value: 'analytics', label: 'Analytics Reports' },
]

export const REPORT_TEMPLATES_LIST = [
  'Annual NGO Report',
  'CSR Impact Report',
  'Donor Impact Statement',
  'Grant Utilization Report',
  'Project Closure Report',
  'Volunteer Performance Report',
  'Beneficiary Support Report',
  'Board Meeting Report',
] as const

export const FINANCIAL_REPORT_TYPES = [
  'Income Statement',
  'Balance Sheet',
  'Cash Flow',
  'Fund Utilization',
  'Grant Utilization',
  'Expense Reports',
  'Audit Reports',
] as const

export const COMPLIANCE_REPORT_TYPES = [
  '80G Reports',
  '12A Reports',
  'FCRA Reports',
  'CSR Reports',
  'Audit Reports',
  'Government Filings',
] as const

export const BOARD_REPORT_TYPES = [
  'Fundraising Performance',
  'Program Performance',
  'Financial Health',
  'Operational Health',
  'Impact Metrics',
  'Growth Trends',
] as const

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function buildTemplates(): ReportTemplate[] {
  const items: Omit<ReportTemplate, 'lastGenerated' | 'scheduled'>[] = [
    { id: '1', name: 'Annual Impact Report', category: 'impact', categoryLabel: 'Impact Reports', description: 'Comprehensive programme outcomes and beneficiary impact', formats: ['pdf', 'excel', 'dashboard'] },
    { id: '2', name: 'Income Statement', category: 'financial', categoryLabel: 'Financial Reports', description: 'Revenue and expense summary for the period', formats: ['pdf', 'excel', 'csv'] },
    { id: '3', name: 'Donor Impact Statement', category: 'donor', categoryLabel: 'Donor Reports', description: 'Per-donor giving history and impact metrics', formats: ['pdf', 'excel'] },
    { id: '4', name: 'Volunteer Hours Report', category: 'volunteer', categoryLabel: 'Volunteer Reports', description: 'Hours served, attendance, and performance', formats: ['pdf', 'csv'] },
    { id: '5', name: 'Beneficiary Outcome Report', category: 'beneficiary', categoryLabel: 'Beneficiary Reports', description: 'Support provided and recovery outcomes', formats: ['pdf', 'excel'] },
    { id: '6', name: 'Campaign Performance', category: 'campaign', categoryLabel: 'Campaign Reports', description: 'Goal, raised, utilization, and ROI', formats: ['pdf', 'dashboard'] },
    { id: '7', name: 'Project Closure Report', category: 'project', categoryLabel: 'Project Reports', description: 'Budget, beneficiaries, volunteers, and outcomes', formats: ['pdf', 'excel'] },
    { id: '8', name: 'Grant Utilization Report', category: 'grant', categoryLabel: 'Grant Reports', description: 'Allocated, spent, remaining, and milestones', formats: ['pdf', 'excel'] },
    { id: '9', name: 'FCRA Compliance Report', category: 'compliance', categoryLabel: 'Compliance Reports', description: 'Foreign contribution regulatory filing', formats: ['pdf'] },
    { id: '10', name: 'Monthly Operations Summary', category: 'operational', categoryLabel: 'Operational Reports', description: 'Cross-module operational metrics', formats: ['pdf', 'csv', 'dashboard'] },
    { id: '11', name: 'Quarterly Board Report', category: 'board', categoryLabel: 'Board Reports', description: 'Executive summary for trustees and board', formats: ['pdf', 'dashboard'] },
    { id: '12', name: 'Donation Trends Analysis', category: 'analytics', categoryLabel: 'Analytics Reports', description: 'Trends, geographic impact, and distribution', formats: ['dashboard', 'excel'] },
  ]
  return items.map((t, i) => ({
    ...t,
    lastGenerated: i % 3 === 0 ? 'Today' : i % 3 === 1 ? 'Yesterday' : '3 days ago',
    scheduled: i % 4 === 0,
  }))
}

export async function getReportDashboardData(): Promise<ReportDashboardData> {
  const templates = buildTemplates()

  return {
    kpis: {
      reportsGenerated: 2345,
      scheduledReports: 128,
      pendingReports: 16,
      complianceReports: 52,
      lastGenerated: 'Today',
      automatedPct: 84,
    },
    templates,
    donorReports: [
      { id: '1', name: 'Rahul Sharma', totalDonations: 500000, campaignsSupported: 4, beneficiariesImpacted: 52, taxReceiptsAvailable: true },
      { id: '2', name: 'ABC Corp CSR', totalDonations: 10000000, campaignsSupported: 2, beneficiariesImpacted: 420, taxReceiptsAvailable: true },
      { id: '3', name: 'Priya Mehta', totalDonations: 125000, campaignsSupported: 3, beneficiariesImpacted: 18, taxReceiptsAvailable: true },
    ],
    campaignReports: [
      { id: '1', title: 'Cancer Treatment Fund', goal: 5000000, raised: 4820000, utilized: 4200000, donors: 1240, beneficiaries: 78, completionPct: 96, roi: 3.2 },
      { id: '2', title: 'Education Scholarship Drive', goal: 2000000, raised: 1850000, utilized: 1600000, donors: 680, beneficiaries: 120, completionPct: 92, roi: 2.8 },
    ],
    volunteerMetrics: { applications: 845, approved: 620, active: 280, hoursServed: 14200 },
    beneficiaryReports: [
      { id: '1', program: 'Cancer Beneficiaries', count: 128, supportProvided: 24000000, recovered: 84 },
      { id: '2', program: 'Education Support', count: 450, supportProvided: 8500000, recovered: 380 },
    ],
    projectReports: [
      { id: '1', title: 'Healthcare Outreach', budget: 5000000, received: 4800000, utilized: 3600000, beneficiaries: 5420, volunteers: 280, events: 18 },
      { id: '2', title: 'Education Initiative', budget: 4000000, received: 3900000, utilized: 3280000, beneficiaries: 3200, volunteers: 150, events: 12 },
    ],
    grantReports: [
      { id: '1', name: 'UNICEF Grant', allocated: 20000000, spent: 14500000, remaining: 5500000, milestonesPct: 75 },
      { id: '2', name: 'Tata Trusts CSR', allocated: 12000000, spent: 9600000, remaining: 2400000, milestonesPct: 80 },
    ],
    impactReports: [
      { id: '1', program: 'Healthcare Program', fundsRaised: 40000000, fundsUtilized: 36000000, beneficiaries: 5420, volunteers: 280, events: 18, outcomeRate: 82 },
      { id: '2', program: 'Education Program', fundsRaised: 25000000, fundsUtilized: 21000000, beneficiaries: 3200, volunteers: 150, events: 12, outcomeRate: 78 },
    ],
    scheduledReports: [
      { id: '1', name: 'Monthly Donor Summary', frequency: 'monthly', nextRun: '2026-08-01', recipients: ['Board Members', 'Finance Team'] },
      { id: '2', name: 'Quarterly Board Report', frequency: 'quarterly', nextRun: '2026-10-01', recipients: ['Board Members', 'Trustees'] },
      { id: '3', name: 'Annual Audit Report', frequency: 'annually', nextRun: '2027-03-31', recipients: ['Auditors', 'Board Members', 'Government'] },
    ],
    donationTrends: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
      label,
      value: 800000 + i * 600000 + (hashCode(label) % 400000),
    })),
    expenseDistribution: [
      { label: 'Healthcare', value: 45, pct: 45 },
      { label: 'Education', value: 25, pct: 25 },
      { label: 'Sports', value: 15, pct: 15 },
      { label: 'Operations', value: 15, pct: 15 },
    ],
    geographicImpact: [
      { label: 'Delhi', value: 4200 },
      { label: 'Mumbai', value: 3800 },
      { label: 'Pune', value: 2100 },
      { label: 'Chennai', value: 1900 },
    ],
    aiInsights: [
      { id: 'healthcare', message: 'Healthcare projects generated the highest impact this quarter', tone: 'success' as const },
      { id: 'donations', message: 'Donation growth increased by 42% year-over-year', tone: 'success' as const },
      { id: 'education', message: 'Education programs remain underfunded relative to beneficiary demand', tone: 'warning' as const },
      { id: 'grants', message: '3 grants require reporting submissions this month', tone: 'warning' as const },
      { id: 'volunteer', message: 'Volunteer retention dropped by 8% — review engagement programmes', tone: 'info' as const },
    ],
  }
}

export function filterTemplates(templates: ReportTemplate[], category: ReportCategory | 'all'): ReportTemplate[] {
  if (category === 'all') return templates
  return templates.filter((t) => t.category === category)
}

export function exportReportListCsv(templates: ReportTemplate[]) {
  downloadCsv(
    'reports-export.csv',
    ['Report', 'Category', 'Last Generated', 'Scheduled'],
    templates.map((t) => [t.name, t.categoryLabel, t.lastGenerated ?? '—', t.scheduled ? 'Yes' : 'No']),
  )
}
