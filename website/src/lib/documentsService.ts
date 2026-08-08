import { dataApi } from './dataApiClient'
import { deletePrivateFile, deliveryUrl, storagePath } from './privateStorageClient'

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
    fileUrl: deliveryUrl(row.file_url ? String(row.file_url) : undefined),
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
    file_url: storagePath(doc.fileUrl) ?? null,
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

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  const { data, error } = await dataApi
    .table('documents')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToDocument)
}

export async function saveDocument(input: Partial<DocumentRecord> & { title: string }): Promise<DocumentRecord> {
  const row = documentToRow(input)
  if (input.id) {
    const { data: previous, error: previousError } = await dataApi
      .table('documents')
      .select('file_url')
      .eq('id', input.id)
      .maybeSingle()
    if (previousError) throw new Error(previousError.message)
    const { data, error } = await dataApi
      .table('documents')
      .update(row)
      .eq('id', input.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    const previousFile = previous?.file_url ? String(previous.file_url) : undefined
    if (previousFile && storagePath(previousFile) !== storagePath(input.fileUrl)) {
      await deletePrivateFile(previousFile)
    }
    return rowToDocument(data)
  }
  const { data, error } = await dataApi
      .table('documents')
      .insert({
        ...row,
        document_id: input.documentId ?? `DOC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      })
      .select()
      .single()
  if (error) throw new Error(error.message)
  return rowToDocument(data)
}

export async function deleteDocument(id: string): Promise<void> {
  const { data: existing, error: selectError } = await dataApi
    .table('documents')
    .select('file_url')
    .eq('id', id)
    .maybeSingle()
  if (selectError) throw new Error(selectError.message)
  const { error } = await dataApi.table('documents').delete().eq('id', id)
  if (error) throw new Error(error.message)
  if (existing?.file_url) await deletePrivateFile(String(existing.file_url))
}
