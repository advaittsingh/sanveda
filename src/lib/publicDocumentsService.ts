import { DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS } from '../constants/publicDocuments'
import type { DocumentItem } from '../constants/documentsContent'
import { getSettingsDashboardData } from './settingsOperationsService'

export async function getPublicDocuments(): Promise<DocumentItem[]> {
  const settings = await getSettingsDashboardData()
  const configured = settings.publicDocuments.documents
    .filter((doc) => doc.enabled && doc.fileUrl.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const source = configured.length ? configured : DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS

  return source.map((doc, index) => ({
    id: index + 1,
    label: doc.label,
    image: doc.fileUrl,
  }))
}
