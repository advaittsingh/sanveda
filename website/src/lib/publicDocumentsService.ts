import { DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS } from '../constants/publicDocuments'
import type { DocumentItem } from '../constants/documentsContent'
import { dataApi } from './dataApiClient'
import { deliveryUrl } from './privateStorageClient'
import { getSettingsDashboardData } from './settingsOperationsService'

function toDocumentItems(
  rows: { title: string; fileUrl?: string; sortOrder?: number }[],
): DocumentItem[] {
  return rows
    .filter((row) => row.fileUrl?.trim())
    .map((row, index) => ({
      id: index + 1,
      label: row.title,
      image: row.fileUrl!.trim(),
    }))
}

async function loadPublishedPublicDocuments(): Promise<
  { documentId: string; title: string; fileUrl?: string }[]
> {
  const { data, error } = await dataApi
    .publicTable('documents')
    .select('document_id,title,file_url,status,visibility')
    .eq('visibility', 'public')
    .eq('status', 'published')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    documentId: String(row.document_id ?? ''),
    title: String(row.title ?? ''),
    fileUrl: deliveryUrl(row.file_url ? String(row.file_url) : undefined),
  }))
}

export async function getPublicDocuments(): Promise<DocumentItem[]> {
  try {
    const published = (await loadPublishedPublicDocuments())
      .filter((doc) => doc.fileUrl)
      .sort((a, b) => {
        const order = (id: string) => {
          if (id.includes('COI')) return 1
          if (id.includes('12A')) return 2
          if (id.includes('80G')) return 3
          return 99
        }
        return order(a.documentId) - order(b.documentId) || a.title.localeCompare(b.title)
      })

    if (published.length) {
      return toDocumentItems(published.map((doc) => ({ title: doc.title, fileUrl: doc.fileUrl })))
    }
  } catch (error) {
    console.warn('[documents] public DB load failed, trying fallbacks', error)
  }

  try {
    const settings = await getSettingsDashboardData()
    const configured = settings.publicDocuments.documents
      .filter((doc) => doc.enabled && doc.fileUrl.trim())
      .sort((a, b) => a.sortOrder - b.sortOrder)

    if (configured.length) {
      return toDocumentItems(configured.map((doc) => ({ title: doc.label, fileUrl: doc.fileUrl })))
    }
  } catch {
    // Settings may be admin-only; fall through to shipped defaults.
  }

  return toDocumentItems(
    DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS.map((doc) => ({
      title: doc.label,
      fileUrl: doc.fileUrl,
      sortOrder: doc.sortOrder,
    })),
  )
}
