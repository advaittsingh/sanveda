import { isSupabaseConfigured, requireSupabase } from './supabase'
import { allowLocalStoragePersistence, isProductionDataMode } from './persistMeta'

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

const STORAGE_KEY = 'sanveda_documents'

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
      { version: 'v2.1', author: 'Finance', date: '2024-04-01', changeLog: 'Corrected registration number', approvalStatus: 'published' },
    ],
    createdAt: '2022-04-01T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z',
  },
]

function rowToDocument(row: Record<string, unknown>): DocumentRecord {
  return {
    id: String(row.id),
    documentId: String(row.document_id),
    title: String(row.title),
    category: row.category as DocumentCategory,
    folder: row.folder as DocumentFolder,
    description: row.description ? String(row.description) : undefined,
    owner: String(row.owner ?? 'Admin'),
    version: String(row.version ?? 'v1.0'),
    issueDate: row.issue_date ? String(row.issue_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    expiryDate: row.expiry_date ? String(row.expiry_date).slice(0, 10) : undefined,
    visibility: (row.visibility as DocumentVisibility) ?? 'internal',
    status: (row.status as DocumentStatus) ?? 'draft',
    tags: Array.isArray(row.tags) ? row.tags as string[] : [],
    fileUrl: row.file_url ? String(row.file_url) : undefined,
    fileSizeMb: Number(row.file_size_mb ?? 0),
    project: row.project ? String(row.project) : undefined,
    campaign: row.campaign ? String(row.campaign) : undefined,
    event: row.event ? String(row.event) : undefined,
    focusArea: row.focus_area ? String(row.focus_area) : undefined,
    downloads: Number(row.downloads ?? 0),
    views: Number(row.views ?? 0),
    shares: Number(row.shares ?? 0),
    versions: Array.isArray(row.versions) ? row.versions as DocumentVersion[] : [],
    isCompliance: Boolean(row.is_compliance),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

function documentToRow(doc: Partial<DocumentRecord>) {
  return {
    document_id: doc.documentId,
    title: doc.title,
    category: doc.category,
    folder: doc.folder,
    description: doc.description ?? null,
    owner: doc.owner ?? 'Admin',
    version: doc.version ?? 'v1.0',
    issue_date: doc.issueDate ?? null,
    expiry_date: doc.expiryDate ?? null,
    visibility: doc.visibility ?? 'internal',
    status: doc.status ?? 'draft',
    tags: doc.tags ?? [],
    file_url: doc.fileUrl ?? null,
    file_size_mb: doc.fileSizeMb ?? 0,
    project: doc.project ?? null,
    campaign: doc.campaign ?? null,
    event: doc.event ?? null,
    focus_area: doc.focusArea ?? null,
    downloads: doc.downloads ?? 0,
    views: doc.views ?? 0,
    shares: doc.shares ?? 0,
    versions: doc.versions ?? [],
    is_compliance: doc.isCompliance ?? false,
    updated_at: new Date().toISOString(),
  }
}

function readLocal(): DocumentRecord[] {
  if (!allowLocalStoragePersistence()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : (isProductionDataMode() ? [] : DEMO_DOCUMENTS)
  } catch {
    return isProductionDataMode() ? [] : DEMO_DOCUMENTS
  }
}

function writeLocal(docs: DocumentRecord[]) {
  if (!allowLocalStoragePersistence()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    if ((data ?? []).length === 0 && !isProductionDataMode()) {
      return DEMO_DOCUMENTS
    }
    return (data ?? []).map(rowToDocument)
  }
  return readLocal()
}

export async function saveDocument(input: Partial<DocumentRecord> & { title: string }): Promise<DocumentRecord> {
  const now = new Date().toISOString()

  if (isSupabaseConfigured) {
    const row = documentToRow(input)
    if (input.id) {
      const { data, error } = await requireSupabase()
        .from('documents')
        .update(row)
        .eq('id', input.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return rowToDocument(data)
    }
    const { data, error } = await requireSupabase()
      .from('documents')
      .insert({
        ...row,
        document_id: input.documentId ?? `DOC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return rowToDocument(data)
  }

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
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase().from('documents').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }
  writeLocal(readLocal().filter((d) => d.id !== id))
}
