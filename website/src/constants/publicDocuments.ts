import type { PublicComplianceDocument } from '../lib/settingsOperationsService'

/** Default Sanveda compliance PDFs served from /public/documents. */
export const DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS: PublicComplianceDocument[] = [
  {
    id: 'coi',
    label: 'Certificate of Incorporation',
    fileUrl: '/documents/coi-sanveda-global-humanitarian-foundation.pdf',
    enabled: true,
    sortOrder: 1,
  },
  {
    id: '12a',
    label: '12A Registration Certificate',
    fileUrl: '/documents/12a-sanveda-global.pdf',
    enabled: true,
    sortOrder: 2,
  },
  {
    id: '80g',
    label: '80G Registration Certificate',
    fileUrl: '/documents/80g-sanveda-global.pdf',
    enabled: true,
    sortOrder: 3,
  },
]
