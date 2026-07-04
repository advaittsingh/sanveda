import { downloadCsv } from './adminExport'
import { isProductionDataMode } from './persistMeta'
import { getAllDocuments, type DocumentCategory, type DocumentFolder, type DocumentRecord, type DocumentStatus, type DocumentVisibility } from './documentsService'

export type { DocumentCategory, DocumentFolder, DocumentStatus, DocumentVisibility }

export interface ComplianceItem {
  name: string
  status: 'active' | 'expired' | 'expiring'
  expires: string
  documentId?: string
}

export interface ExpiryAlert {
  id: string
  title: string
  daysRemaining: number
  severity: 'critical' | 'warning'
}

export interface DocumentProfile extends DocumentRecord {
  categoryLabel: string
  folderLabel: string
  validUntilLabel: string
  isExpiringSoon: boolean
  daysToExpiry?: number
  publicUrl: string
  projectFiles?: string[]
}

export interface DocumentFilters {
  search: string
  category: DocumentCategory | 'all'
  folder: DocumentFolder | 'all'
  status: DocumentStatus | 'all'
  visibility: DocumentVisibility | 'all'
}

export interface DocumentDashboardData {
  documents: DocumentProfile[]
  kpis: {
    totalDocuments: number
    publicDocuments: number
    complianceDocuments: number
    expiringDocuments: number
    reportsGenerated: number
    storageUsedGb: number
  }
  complianceDashboard: ComplianceItem[]
  expiryAlerts: ExpiryAlert[]
  folderStructure: { folder: DocumentFolder; label: string; count: number }[]
  analytics: {
    downloads: number
    views: number
    shares: number
    publicAccess: number
  }
  uploadTrends: { label: string; value: number }[]
  categoryUsage: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'legal', label: 'Legal Documents' },
  { value: 'registration', label: 'Registration Certificates' },
  { value: 'tax', label: 'Tax Documents' },
  { value: 'audit', label: 'Audit Reports' },
  { value: 'annual_report', label: 'Annual Reports' },
  { value: 'csr', label: 'CSR Reports' },
  { value: 'policy', label: 'Policies' },
  { value: 'project_report', label: 'Project Reports' },
  { value: 'financial', label: 'Financial Statements' },
  { value: 'government', label: 'Government Filings' },
  { value: 'certificate', label: 'Certificates' },
  { value: 'media', label: 'Media & Publications' },
  { value: 'template', label: 'Templates' },
  { value: 'internal', label: 'Internal Documents' },
]

export const DOCUMENT_FOLDERS: { value: DocumentFolder; label: string }[] = [
  { value: 'legal', label: 'Legal' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'finance', label: 'Finance' },
  { value: 'projects', label: 'Projects' },
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'events', label: 'Events' },
  { value: 'hr', label: 'HR' },
  { value: 'reports', label: 'Reports' },
  { value: 'policies', label: 'Policies' },
  { value: 'public', label: 'Public Downloads' },
]

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const

const CATEGORY_LABEL = Object.fromEntries(DOCUMENT_CATEGORIES.map((c) => [c.value, c.label])) as Record<DocumentCategory, string>
const FOLDER_LABEL = Object.fromEntries(DOCUMENT_FOLDERS.map((f) => [f.value, f.label])) as Record<DocumentFolder, string>

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function daysUntil(dateStr?: string): number | undefined {
  if (!dateStr) return undefined
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatExpiryLabel(dateStr?: string): string {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

function enrichDocument(doc: DocumentRecord): DocumentProfile {
  const days = daysUntil(doc.expiryDate)
  const seed = hashCode(doc.id)

  const projectFiles = doc.project ? [
    'Proposal.pdf',
    'Budget.xlsx',
    'Progress Report.pdf',
    'Impact Report.pdf',
  ].slice(0, 2 + (seed % 3)) : undefined

  return {
    ...doc,
    categoryLabel: CATEGORY_LABEL[doc.category],
    folderLabel: FOLDER_LABEL[doc.folder],
    validUntilLabel: formatExpiryLabel(doc.expiryDate),
    isExpiringSoon: days !== undefined && days > 0 && days <= 60,
    daysToExpiry: days,
    publicUrl: doc.visibility === 'public' ? '/documents' : '',
    projectFiles,
  }
}

const COMPLIANCE_REGISTRY: Omit<ComplianceItem, 'status'>[] = [
  { name: 'NGO Registration', expires: 'Never' },
  { name: 'PAN', expires: 'Never' },
  { name: '12A', expires: '2030' },
  { name: '80G', expires: '2028' },
  { name: 'FCRA', expires: '2027' },
  { name: 'CSR Registration', expires: '2029' },
]

function buildComplianceDashboard(docs: DocumentProfile[]): ComplianceItem[] {
  const mapped = COMPLIANCE_REGISTRY.map((item) => {
    const match = docs.find((d) =>
      d.title.toLowerCase().includes(item.name.toLowerCase()) ||
      d.tags.some((t) => item.name.toLowerCase().includes(t)),
    )
    const days = match?.daysToExpiry
    let status: ComplianceItem['status'] = 'active'
    if (days !== undefined && days <= 0) status = 'expired'
    else if (days !== undefined && days <= 60) status = 'expiring'
    return { ...item, status, documentId: match?.documentId }
  })

  if (isProductionDataMode()) {
    return mapped.filter((item) => item.documentId)
  }
  return mapped
}

function buildExpiryAlerts(docs: DocumentProfile[]): ExpiryAlert[] {
  return docs
    .filter((d) => d.isExpiringSoon && d.daysToExpiry !== undefined)
    .map((d) => ({
      id: d.id,
      title: d.title,
      daysRemaining: d.daysToExpiry!,
      severity: d.daysToExpiry! <= 30 ? 'critical' as const : 'warning' as const,
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
}

function computeKpis(docs: DocumentProfile[]) {
  const storageMb = docs.reduce((s, d) => s + d.fileSizeMb, 0)
  return {
    totalDocuments: docs.length,
    publicDocuments: docs.filter((d) => d.visibility === 'public').length,
    complianceDocuments: docs.filter((d) => d.isCompliance).length,
    expiringDocuments: docs.filter((d) => d.isExpiringSoon).length,
    reportsGenerated: docs.filter((d) =>
      ['annual_report', 'audit', 'csr', 'project_report', 'financial'].includes(d.category),
    ).length,
    storageUsedGb: Math.round((storageMb / 1024) * 10) / 10 || (isProductionDataMode() ? 0 : 18),
  }
}

function computeAnalytics(docs: DocumentProfile[]) {
  const production = isProductionDataMode()
  const uploadTrends = production
    ? []
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((label, i) => ({
        label,
        value: 15 + i * 12 + (hashCode(label) % 20),
      }))

  const catMap = new Map<string, number>()
  for (const d of docs) catMap.set(d.categoryLabel, (catMap.get(d.categoryLabel) ?? 0) + 1)
  const catTotal = docs.length || 1
  const categoryUsage = [...catMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / catTotal) * 100) }))
    .sort((a, b) => b.value - a.value)

  return {
    uploadTrends,
    categoryUsage,
    analytics: {
      downloads: docs.reduce((s, d) => s + d.downloads, 0),
      views: docs.reduce((s, d) => s + d.views, 0),
      shares: docs.reduce((s, d) => s + d.shares, 0),
      publicAccess: docs.filter((d) => d.visibility === 'public').reduce((s, d) => s + d.views, 0),
    },
  }
}

function computeAiInsights(docs: DocumentProfile[], alerts: ExpiryAlert[]) {
  if (isProductionDataMode()) {
    if (docs.length === 0) {
      return [{ id: 'empty', message: 'No documents yet. Upload compliance certificates, reports, and policies.', tone: 'info' as const }]
    }
    const expiringCount = alerts.filter((a) => a.daysRemaining <= 60).length
    if (expiringCount > 0) {
      return [{ id: 'expiry', message: `${expiringCount} document${expiringCount === 1 ? '' : 's'} expiring within 60 days`, tone: 'warning' as const }]
    }
    return []
  }

  const expiringCount = alerts.filter((a) => a.daysRemaining <= 60).length
  const missingFinancials = docs.some((d) => d.title.includes('Annual Report') && d.status === 'draft')
  const incompleteProjects = docs.filter((d) => d.project && d.status !== 'published').length
  const auditPending = docs.filter((d) => d.category === 'audit' && d.status === 'under_review').length

  return [
    { id: 'expiry', message: `${expiringCount || 4} compliance documents expire within 60 days`, tone: 'warning' as const },
    { id: 'financials', message: missingFinancials ? 'Annual report draft is missing financial attachments' : 'All annual reports have financial attachments attached', tone: 'info' as const },
    { id: 'projects', message: `${incompleteProjects || 3} healthcare projects have incomplete documentation`, tone: 'warning' as const },
    { id: 'duplicates', message: '12 duplicate documents detected across project folders', tone: 'info' as const },
    { id: 'audit', message: `${auditPending || 3} audit reports require approval before publishing`, tone: 'warning' as const },
  ]
}

export async function getDocumentDashboardData(): Promise<DocumentDashboardData> {
  const raw = await getAllDocuments()
  const documents = raw.map(enrichDocument)
  const kpis = computeKpis(documents)
  const complianceDashboard = buildComplianceDashboard(documents)
  const expiryAlerts = buildExpiryAlerts(documents)
  const folderStructure = DOCUMENT_FOLDERS.map((f) => ({
    folder: f.value,
    label: f.label,
    count: documents.filter((d) => d.folder === f.value).length,
  }))
  const { uploadTrends, categoryUsage, analytics } = computeAnalytics(documents)
  const aiInsights = computeAiInsights(documents, expiryAlerts)

  return {
    documents,
    kpis,
    complianceDashboard,
    expiryAlerts,
    folderStructure,
    analytics,
    uploadTrends,
    categoryUsage,
    aiInsights,
  }
}

export function filterDocuments(docs: DocumentProfile[], filters: DocumentFilters): DocumentProfile[] {
  return docs.filter((d) => {
    if (filters.category !== 'all' && d.category !== filters.category) return false
    if (filters.folder !== 'all' && d.folder !== filters.folder) return false
    if (filters.status !== 'all' && d.status !== filters.status) return false
    if (filters.visibility !== 'all' && d.visibility !== filters.visibility) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        d.title.toLowerCase().includes(q) ||
        d.documentId.toLowerCase().includes(q) ||
        d.categoryLabel.toLowerCase().includes(q) ||
        d.tags.some((t) => t.includes(q)) ||
        (d.project?.toLowerCase().includes(q) ?? false) ||
        (d.owner.toLowerCase().includes(q))
      )
    }
    return true
  })
}

export function exportDocumentsCsv(docs: DocumentProfile[]) {
  const headers = ['Document ID', 'Title', 'Category', 'Folder', 'Status', 'Visibility', 'Expiry', 'Version']
  const rows = docs.map((d) => [
    d.documentId,
    d.title,
    d.categoryLabel,
    d.folderLabel,
    d.status,
    d.visibility,
    d.validUntilLabel,
    d.version,
  ])
  downloadCsv('documents-export.csv', headers, rows)
}

export const REPORT_TYPES = [
  'Annual Report',
  'CSR Report',
  'Donor Report',
  'Government Filing',
  'Impact Report',
  'Project Report',
  'Financial Report',
] as const

export const POLICY_TYPES = [
  'Privacy Policy',
  'Refund Policy',
  'Child Protection Policy',
  'Volunteer Policy',
  'HR Policy',
  'Financial Policy',
  'Procurement Policy',
] as const
