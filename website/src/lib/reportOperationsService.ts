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
  return items.map((t) => ({ ...t, scheduled: false }))
}

export async function getReportDashboardData(): Promise<ReportDashboardData> {
  const templates = buildTemplates()

  return {
      kpis: {
        reportsGenerated: 0,
        scheduledReports: 0,
        pendingReports: 0,
        complianceReports: 0,
        lastGenerated: '—',
        automatedPct: 0,
      },
      templates,
      donorReports: [],
      campaignReports: [],
      volunteerMetrics: { applications: 0, approved: 0, active: 0, hoursServed: 0 },
      beneficiaryReports: [],
      projectReports: [],
      grantReports: [],
      impactReports: [],
      scheduledReports: [],
      donationTrends: [],
      expenseDistribution: [],
      geographicImpact: [],
      aiInsights: [{ id: 'empty', message: 'No reports generated yet. Use a template below to create your first report.', tone: 'info' as const }],
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
