import { DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS } from '../constants/publicDocuments'
import type { DocumentItem } from '../constants/documentsContent'
import { getAllDocuments } from './documentsService'
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

export async function getPublicDocuments(): Promise<DocumentItem[]> {
  const adminDocs = await getAllDocuments()
  const published = adminDocs
    .filter((doc) => doc.visibility === 'public' && doc.status === 'published' && doc.fileUrl)
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

  const settings = await getSettingsDashboardData()
  const configured = settings.publicDocuments.documents
    .filter((doc) => doc.enabled && doc.fileUrl.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (configured.length) {
    return toDocumentItems(configured.map((doc) => ({ title: doc.label, fileUrl: doc.fileUrl })))
  }

  return toDocumentItems(
    DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS.map((doc) => ({
      title: doc.label,
      fileUrl: doc.fileUrl,
      sortOrder: doc.sortOrder,
    })),
  )
}
