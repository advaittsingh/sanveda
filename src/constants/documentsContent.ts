import { ASSETS } from '../constants/assets'
import { BRAND } from './brand'

export const DOCUMENTS_CMS_ID = 118

export const DOCUMENTS_PAGE = {
  label: 'Transparency',
  breadcrumb: 'Documents',
  title: 'Verified Documents',
  description: `Access ${BRAND.shortName}'s registration, 80G, 12A, and CSR certificates — ensuring full transparency and accountability in everything we do.`,
}

export interface DocumentItem {
  id: number
  label: string
  image: string
}

export function sanitizeDocumentFilename(label: string): string {
  return label
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'document'
}

export function getDocumentExtension(url: string): string {
  const match = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/)
  return match ? `.${match[1].toLowerCase()}` : '.png'
}

export async function downloadDocument(imageUrl: string, label: string, mobile?: boolean): Promise<void> {
  const filename = `${sanitizeDocumentFilename(label)}${getDocumentExtension(imageUrl)}`

  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('fetch failed')
    const blob = await response.blob()
    if (!blob.size) throw new Error('empty blob')

    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
    return
  } catch {
    if (mobile) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer')
      return
    }
    throw new Error(
      'Could not download automatically. The file may be blocked by browser security — try opening the preview and saving from there.',
    )
  }
}

export const DOCUMENT_ICONS = {
  maximize: ASSETS.documentMaximize,
  download: ASSETS.documentDownload,
}
