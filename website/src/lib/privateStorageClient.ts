export type StorageUploadCategory =
  | 'volunteer-resume'
  | 'volunteer-id-proof'
  | 'volunteer-photo'
  | 'document'
  | 'gallery-image'
  | 'gallery-video'
  | 'report'
  | 'task-proof'

export interface StoredFile {
  path: string
  deliveryUrl: string
  originalName: string
  contentType: string
  size: number
}

const DELIVERY_PATH = '/api/files'

/** Private Blob paths: category / entityId / filename.ext */
const PRIVATE_BLOB_PATH =
  /^(volunteers|documents|gallery|reports|tasks)\/[A-Za-z0-9][A-Za-z0-9_-]{0,99}\/[A-Za-z0-9][A-Za-z0-9._-]*\.[a-z0-9]+$/i

export function isPrivateBlobPath(path: string): boolean {
  return PRIVATE_BLOB_PATH.test(path.replace(/^\/+/, ''))
}

export function storagePath(value?: string): string | undefined {
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) return value
  if (value.startsWith(`${DELIVERY_PATH}?`)) {
    return new URL(value, 'https://local.invalid').searchParams.get('path') ?? undefined
  }
  if (!/^https?:\/\//i.test(value)) {
    const stripped = value.replace(/^\/+/, '')
    // Public site PDFs live at /documents/*.pdf — keep the leading slash so they
    // are not mistaken for private Blob keys (documents/{entityId}/file).
    if (stripped.startsWith('documents/') && !isPrivateBlobPath(stripped)) {
      return `/${stripped}`
    }
    return stripped
  }
  try {
    const url = new URL(value)
    if (url.hostname.endsWith('.blob.vercel-storage.com')) return decodeURIComponent(url.pathname.slice(1))
    const legacyBucket = '/volunteer-documents/'
    const index = url.pathname.indexOf(legacyBucket)
    return index >= 0 ? decodeURIComponent(url.pathname.slice(index + legacyBucket.length)) : value
  } catch {
    return value
  }
}

export function deliveryUrl(value?: string): string | undefined {
  const path = storagePath(value)
  if (!path || /^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path
  const normalized = path.replace(/^\/+/, '')
  if (!isPrivateBlobPath(normalized)) {
    // Public static asset or other non-blob path — preserve browsable URL.
    if (path.startsWith('/')) return path
    return value
  }
  return `${DELIVERY_PATH}?path=${encodeURIComponent(normalized)}`
}

export async function uploadPrivateFile(
  category: StorageUploadCategory,
  entityId: string,
  file: File,
): Promise<StoredFile> {
  const query = new URLSearchParams({ category, entityId, filename: file.name })
  const response = await fetch(`/api/storage/upload?${query}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  const payload = await response.json() as { data?: StoredFile; message?: string }
  if (!response.ok || !payload.data) throw new Error(payload.message ?? 'File upload failed')
  return payload.data
}

export async function deletePrivateFile(value?: string): Promise<void> {
  const path = storagePath(value)
  if (!path || /^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return
  if (!isPrivateBlobPath(path)) return
  const response = await fetch('/api/storage/object', {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: path.replace(/^\/+/, '') }),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(payload.message ?? 'File deletion failed')
  }
}
