import { DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS } from '../constants/publicDocuments'
import type { DocumentRecord } from './documentsService'

const COMPLIANCE_META: Record<
  string,
  {
    documentId: string
    category: DocumentRecord['category']
    folder: DocumentRecord['folder']
    description: string
    tags: string[]
    fileSizeMb: number
    expiryDate?: string
  }
> = {
  coi: {
    documentId: 'DOC-SVD-COI-001',
    category: 'registration',
    folder: 'legal',
    description: 'Certificate of Incorporation — Sanveda Global Humanitarian Foundation',
    tags: ['coi', 'registration', 'incorporation', 'compliance'],
    fileSizeMb: 0.46,
  },
  '12a': {
    documentId: 'DOC-SVD-12A-001',
    category: 'tax',
    folder: 'compliance',
    description: 'Section 12A registration certificate under the Income Tax Act, 1961',
    tags: ['12a', 'tax', 'compliance'],
    fileSizeMb: 1.53,
    expiryDate: '2030-03-31',
  },
  '80g': {
    documentId: 'DOC-SVD-80G-001',
    category: 'certificate',
    folder: 'compliance',
    description: 'Section 80G registration certificate under the Income Tax Act, 1961',
    tags: ['80g', 'tax', 'compliance', 'donation'],
    fileSizeMb: 1.11,
    expiryDate: '2028-03-31',
  },
}

export function getDefaultComplianceDocuments(): DocumentRecord[] {
  const now = new Date().toISOString()
  const issueDate = '2026-07-10'

  return DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS.filter((doc) => doc.enabled).map((doc) => {
    const meta = COMPLIANCE_META[doc.id]
    return {
      id: `seed-${doc.id}`,
      documentId: meta.documentId,
      title: doc.label,
      category: meta.category,
      folder: meta.folder,
      description: meta.description,
      owner: 'Compliance Team',
      version: 'v1.0',
      issueDate,
      expiryDate: meta.expiryDate,
      visibility: 'public',
      status: 'published',
      tags: meta.tags,
      fileUrl: doc.fileUrl,
      fileSizeMb: meta.fileSizeMb,
      downloads: 0,
      views: 0,
      shares: 0,
      versions: [
        {
          version: 'v1.0',
          author: 'Admin',
          date: issueDate,
          changeLog: 'Official certificate uploaded',
          approvalStatus: 'published',
        },
      ],
      isCompliance: true,
      createdAt: now,
      updatedAt: now,
    }
  })
}

export function mergeWithDefaultComplianceDocuments(documents: DocumentRecord[]): DocumentRecord[] {
  const defaults = getDefaultComplianceDocuments()
  const existingIds = new Set(documents.map((d) => d.documentId))
  const missing = defaults.filter((d) => !existingIds.has(d.documentId))
  if (!missing.length) return documents
  return [...missing, ...documents]
}
