const STORAGE_KEY = 'sanveda_documents'

export type DocumentCategory =
  | 'legal'
  | 'registration'
  | 'tax'
  | 'audit'
  | 'annual_report'
  | 'csr'
  | 'policy'
  | 'project_report'
  | 'financial'
  | 'government'
  | 'certificate'
  | 'media'
  | 'template'
  | 'internal'

export type DocumentFolder =
  | 'legal'
  | 'compliance'
  | 'finance'
  | 'projects'
  | 'campaigns'
  | 'events'
  | 'hr'
  | 'reports'
  | 'policies'
  | 'public'

export type DocumentVisibility = 'public' | 'internal' | 'restricted'
export type DocumentStatus = 'draft' | 'under_review' | 'approved' | 'published' | 'archived'

export interface DocumentVersion {
  version: string
  author: string
  date: string
  changeLog: string
  approvalStatus: DocumentStatus
}

export interface DocumentRecord {
  id: string
  documentId: string
  title: string
  category: DocumentCategory
  folder: DocumentFolder
  description?: string
  owner: string
  version: string
  issueDate: string
  expiryDate?: string
  visibility: DocumentVisibility
  status: DocumentStatus
  tags: string[]
  fileUrl?: string
  fileSizeMb: number
  project?: string
  campaign?: string
  event?: string
  focusArea?: string
  downloads: number
  views: number
  shares: number
  versions: DocumentVersion[]
  isCompliance: boolean
  createdAt: string
  updatedAt: string
}

const DEMO_DOCUMENTS: DocumentRecord[] = [
  {
    id: '1', documentId: 'DOC-2026-001', title: '80G Certificate',
    category: 'certificate', folder: 'compliance', description: 'Income Tax 80G registration certificate',
    owner: 'Finance Team', version: 'v2.1', issueDate: '2024-04-01', expiryDate: '2028-03-31',
    visibility: 'public', status: 'published', tags: ['80g', 'compliance', 'tax'],
    fileUrl: '/assets/focus-areas/healthcare.jpg', fileSizeMb: 1.2,
    downloads: 2450, views: 8200, shares: 120, isCompliance: true,
    versions: [
      { version: 'v1.0', author: 'Admin', date: '2022-04-01', changeLog: 'Initial upload', approvalStatus: 'published' },
      { version: 'v2.0', author: 'Finance', date: '2024-01-15', changeLog: 'Renewal update', approvalStatus: 'approved' },
      { version: 'v2.1', author: 'Finance', date: '2024-04-01', changeLog: 'Corrected registration number', approvalStatus: 'published' },
    ],
    createdAt: '2022-04-01T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z',
  },
  {
    id: '2', documentId: 'DOC-2026-002', title: 'FCRA Certificate',
    category: 'registration', folder: 'compliance', description: 'Foreign Contribution Regulation Act certificate',
    owner: 'Legal Team', version: 'v1.0', issueDate: '2023-06-01', expiryDate: '2027-12-31',
    visibility: 'public', status: 'published', tags: ['fcra', 'compliance', 'legal'],
    fileSizeMb: 0.8, downloads: 1820, views: 5400, shares: 85, isCompliance: true,
    versions: [{ version: 'v1.0', author: 'Legal', date: '2023-06-01', changeLog: 'Initial upload', approvalStatus: 'published' }],
    createdAt: '2023-06-01T00:00:00Z', updatedAt: '2023-06-01T00:00:00Z',
  },
  {
    id: '3', documentId: 'DOC-2026-003', title: 'Annual Report 2025',
    category: 'annual_report', folder: 'reports', description: 'Comprehensive annual impact and financial report',
    owner: 'Communications', version: 'v2.0', issueDate: '2025-06-30',
    visibility: 'public', status: 'published', tags: ['annual', 'report', 'impact'],
    fileSizeMb: 4.5, downloads: 3200, views: 12400, shares: 450, isCompliance: false,
    versions: [
      { version: 'v1.0', author: 'Comms', date: '2025-05-01', changeLog: 'Draft', approvalStatus: 'draft' },
      { version: 'v2.0', author: 'Comms', date: '2025-06-30', changeLog: 'Final with financials', approvalStatus: 'published' },
    ],
    createdAt: '2025-05-01T00:00:00Z', updatedAt: '2025-06-30T00:00:00Z',
  },
  {
    id: '4', documentId: 'DOC-2026-004', title: '12A Registration',
    category: 'registration', folder: 'compliance', description: 'Section 12A income tax exemption',
    owner: 'Finance Team', version: 'v1.0', issueDate: '2020-01-01', expiryDate: '2030-12-31',
    visibility: 'public', status: 'published', tags: ['12a', 'tax', 'compliance'],
    fileSizeMb: 0.6, downloads: 980, views: 3100, shares: 42, isCompliance: true,
    versions: [{ version: 'v1.0', author: 'Finance', date: '2020-01-01', changeLog: 'Initial', approvalStatus: 'published' }],
    createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z',
  },
  {
    id: '5', documentId: 'DOC-2026-005', title: 'Privacy Policy',
    category: 'policy', folder: 'policies', description: 'Data privacy and protection policy',
    owner: 'Legal Team', version: 'v3.0', issueDate: '2025-01-01',
    visibility: 'public', status: 'published', tags: ['policy', 'privacy', 'legal'],
    fileSizeMb: 0.3, downloads: 560, views: 8900, shares: 30, isCompliance: false,
    versions: [
      { version: 'v2.0', author: 'Legal', date: '2024-01-01', changeLog: 'GDPR updates', approvalStatus: 'archived' },
      { version: 'v3.0', author: 'Legal', date: '2025-01-01', changeLog: 'DPDP Act compliance', approvalStatus: 'published' },
    ],
    createdAt: '2022-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '6', documentId: 'DOC-2026-006', title: 'Healthcare Outreach — Impact Report',
    category: 'project_report', folder: 'projects', description: 'Q4 impact assessment for healthcare programme',
    owner: 'Programme Team', version: 'v1.0', issueDate: '2025-12-15',
    visibility: 'internal', status: 'approved', tags: ['healthcare', 'impact', 'project'],
    project: 'Healthcare Outreach', focusArea: 'Healthcare',
    fileSizeMb: 2.1, downloads: 45, views: 180, shares: 12, isCompliance: false,
    versions: [{ version: 'v1.0', author: 'Programme', date: '2025-12-15', changeLog: 'Initial report', approvalStatus: 'approved' }],
    createdAt: '2025-12-15T00:00:00Z', updatedAt: '2025-12-15T00:00:00Z',
  },
  {
    id: '7', documentId: 'DOC-2026-007', title: 'Audit Report FY 2024-25',
    category: 'audit', folder: 'finance', description: 'Independent statutory audit report',
    owner: 'Finance Team', version: 'v1.0', issueDate: '2025-09-30',
    visibility: 'public', status: 'under_review', tags: ['audit', 'finance', 'compliance'],
    fileSizeMb: 3.8, downloads: 0, views: 25, shares: 0, isCompliance: true,
    versions: [{ version: 'v1.0', author: 'Auditor', date: '2025-09-30', changeLog: 'Draft for review', approvalStatus: 'under_review' }],
    createdAt: '2025-09-30T00:00:00Z', updatedAt: '2025-09-30T00:00:00Z',
  },
  {
    id: '8', documentId: 'DOC-2026-008', title: 'CSR Registration Certificate',
    category: 'csr', folder: 'compliance', description: 'Corporate Social Responsibility registration',
    owner: 'Legal Team', version: 'v1.0', issueDate: '2024-03-01', expiryDate: '2029-03-01',
    visibility: 'public', status: 'published', tags: ['csr', 'compliance'],
    fileSizeMb: 0.5, downloads: 720, views: 2100, shares: 55, isCompliance: true,
    versions: [{ version: 'v1.0', author: 'Legal', date: '2024-03-01', changeLog: 'Initial', approvalStatus: 'published' }],
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '9', documentId: 'DOC-2026-009', title: 'Insurance Policy',
    category: 'legal', folder: 'compliance', description: 'Organisation liability insurance',
    owner: 'Admin', version: 'v1.0', issueDate: '2025-04-01', expiryDate: '2026-04-15',
    visibility: 'restricted', status: 'published', tags: ['insurance', 'compliance'],
    fileSizeMb: 1.0, downloads: 12, views: 45, shares: 0, isCompliance: true,
    versions: [{ version: 'v1.0', author: 'Admin', date: '2025-04-01', changeLog: 'Annual renewal', approvalStatus: 'published' }],
    createdAt: '2025-04-01T00:00:00Z', updatedAt: '2025-04-01T00:00:00Z',
  },
  {
    id: '10', documentId: 'DOC-2026-010', title: 'Volunteer Policy',
    category: 'policy', folder: 'policies', description: 'Volunteer engagement and conduct policy',
    owner: 'HR Team', version: 'v1.2', issueDate: '2025-02-01',
    visibility: 'public', status: 'published', tags: ['volunteer', 'policy', 'hr'],
    fileSizeMb: 0.4, downloads: 340, views: 1200, shares: 28, isCompliance: false,
    versions: [
      { version: 'v1.0', author: 'HR', date: '2023-01-01', changeLog: 'Initial', approvalStatus: 'archived' },
      { version: 'v1.2', author: 'HR', date: '2025-02-01', changeLog: 'Updated safety guidelines', approvalStatus: 'published' },
    ],
    createdAt: '2023-01-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
]

function readLocal(): DocumentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEMO_DOCUMENTS
  } catch {
    return DEMO_DOCUMENTS
  }
}

function writeLocal(docs: DocumentRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  return readLocal()
}

export async function saveDocument(input: Partial<DocumentRecord> & { title: string }): Promise<DocumentRecord> {
  const now = new Date().toISOString()
  const all = readLocal()
  const nextId = String(all.length + 1)

  if (input.id) {
    const i = all.findIndex((d) => d.id === input.id)
    if (i >= 0) {
      all[i] = { ...all[i], ...input, updatedAt: now }
      writeLocal(all)
      return all[i]
    }
  }

  const doc: DocumentRecord = {
    id: input.id ?? crypto.randomUUID(),
    documentId: input.documentId ?? `DOC-${new Date().getFullYear()}-${nextId.padStart(3, '0')}`,
    title: input.title,
    category: input.category ?? 'internal',
    folder: input.folder ?? 'public',
    description: input.description,
    owner: input.owner ?? 'Admin',
    version: input.version ?? 'v1.0',
    issueDate: input.issueDate ?? now.split('T')[0],
    expiryDate: input.expiryDate,
    visibility: input.visibility ?? 'internal',
    status: input.status ?? 'draft',
    tags: input.tags ?? [],
    fileUrl: input.fileUrl,
    fileSizeMb: input.fileSizeMb ?? 0.5,
    project: input.project,
    campaign: input.campaign,
    event: input.event,
    focusArea: input.focusArea,
    downloads: input.downloads ?? 0,
    views: input.views ?? 0,
    shares: input.shares ?? 0,
    versions: input.versions ?? [{ version: 'v1.0', author: input.owner ?? 'Admin', date: now.split('T')[0], changeLog: 'Initial upload', approvalStatus: input.status ?? 'draft' }],
    isCompliance: input.isCompliance ?? false,
    createdAt: now,
    updatedAt: now,
  }
  all.unshift(doc)
  writeLocal(all)
  return doc
}

export async function deleteDocument(id: string): Promise<void> {
  writeLocal(readLocal().filter((d) => d.id !== id))
}
