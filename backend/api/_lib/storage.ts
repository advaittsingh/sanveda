import { query } from './db.js'
import { HttpError } from './http.js'
import { requirePermission } from './dataAccess.js'
import { optionalSession, requireSession } from './session.js'
import type { VercelRequest } from './vercel.js'

export const DELIVERY_PATH = '/api/files'

const MIME_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
}

export const uploadPolicies = {
  'volunteer-resume': {
    prefix: 'volunteers',
    maxBytes: 2_500_000,
    types: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    permission: null,
  },
  'volunteer-id-proof': {
    prefix: 'volunteers',
    maxBytes: 2_500_000,
    types: ['application/pdf', 'image/jpeg', 'image/png'],
    permission: null,
  },
  'volunteer-photo': {
    prefix: 'volunteers',
    maxBytes: 2_500_000,
    types: ['image/jpeg', 'image/png', 'image/webp'],
    permission: null,
  },
  document: {
    prefix: 'documents',
    maxBytes: 4_000_000,
    types: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    permission: ['documents', 'edit'],
  },
  'gallery-image': {
    prefix: 'gallery',
    maxBytes: 4_000_000,
    types: ['image/jpeg', 'image/png', 'image/webp'],
    permission: ['gallery', 'edit'],
  },
  'gallery-video': {
    prefix: 'gallery',
    maxBytes: 4_000_000,
    types: ['video/mp4', 'video/webm'],
    permission: ['gallery', 'edit'],
  },
  report: {
    prefix: 'reports',
    maxBytes: 4_000_000,
    types: [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    permission: ['reports', 'edit'],
  },
  'task-proof': {
    prefix: 'tasks',
    maxBytes: 4_000_000,
    types: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    permission: null,
  },
} as const

export type UploadCategory = keyof typeof uploadPolicies

export function requireSameOrigin(req: VercelRequest): void {
  const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '')
    .split(',')[0]
    .trim()
  const origin = String(req.headers.origin ?? '')
  const referer = String(req.headers.referer ?? '')
  const source = origin || referer
  if (!host || !source) throw new HttpError(403, 'Same-origin request required', 'forbidden')
  let sourceHost: string
  try {
    sourceHost = new URL(source).host
  } catch {
    throw new HttpError(403, 'Invalid request origin', 'forbidden')
  }
  if (sourceHost !== host) throw new HttpError(403, 'Cross-origin request rejected', 'forbidden')
}

export function sanitizeEntityId(value: string): string {
  const normalized = value.trim()
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(normalized)) {
    throw new HttpError(400, 'Invalid storage entity', 'invalid_request')
  }
  return normalized
}

export function createObjectPath(
  category: UploadCategory,
  entityId: string,
  contentType: string,
): string {
  const policy = uploadPolicies[category]
  const extension = MIME_EXTENSION[contentType]
  if (!extension || !(policy.types as readonly string[]).includes(contentType)) {
    throw new HttpError(415, 'File type is not allowed for this category', 'unsupported_media_type')
  }
  const kind = category.startsWith('volunteer-') ? category.slice('volunteer-'.length) : category
  return `${policy.prefix}/${sanitizeEntityId(entityId)}/${kind}-${crypto.randomUUID()}.${extension}`
}

export function deliveryUrl(pathname: string): string {
  return `${DELIVERY_PATH}?path=${encodeURIComponent(pathname)}`
}

export function storedPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const raw = value.trim()
  if (raw.startsWith(`${DELIVERY_PATH}?`)) {
    return new URL(raw, 'https://local.invalid').searchParams.get('path')
  }
  if (!/^https?:\/\//i.test(raw)) return raw.replace(/^\/+/, '')
  try {
    const url = new URL(raw)
    if (url.hostname.endsWith('.blob.vercel-storage.com'))
      return decodeURIComponent(url.pathname.slice(1))
  } catch {
    return null
  }
  return null
}

export async function readRequestBytes(req: VercelRequest, maxBytes: number): Promise<Buffer> {
  const declaredLength = Number(req.headers['content-length'] ?? 0)
  if (declaredLength > maxBytes) throw new HttpError(413, 'File is too large', 'file_too_large')
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > maxBytes) throw new HttpError(413, 'File is too large', 'file_too_large')
    return req.body
  }
  const chunks: Buffer[] = []
  let length = 0
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    length += bytes.length
    if (length > maxBytes) throw new HttpError(413, 'File is too large', 'file_too_large')
    chunks.push(bytes)
  }
  if (!length) throw new HttpError(400, 'File body is empty', 'invalid_request')
  return Buffer.concat(chunks)
}

export async function authorizeUpload(
  req: VercelRequest,
  category: UploadCategory,
  entityId: string,
): Promise<string | null> {
  const permission = uploadPolicies[category].permission
  if (permission) {
    const session = await requirePermission(req, permission[0], permission[1])
    return session.user.id
  }
  if (category === 'task-proof') {
    const session = await requireSession(req)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entityId)) {
      throw new HttpError(400, 'Invalid task id', 'invalid_request')
    }
    const [owned] = await query<{ ok: boolean }>(
      `select true as ok where exists (
         select 1 from volunteer_tasks vt
           join volunteer_applications va on va.id = vt.volunteer_application_id
          where vt.id = $1::uuid and va.user_id = $2
       ) or exists (
         select 1 from intern_tasks it
           join internships i on i.id = it.internship_id
          where it.id = $1::uuid and i.user_id = $2
       )`,
      [entityId, session.user.id],
    )
    if (!owned) throw new HttpError(403, 'You can only upload proof for your own tasks', 'forbidden')
    return session.user.id
  }
  if (!category.startsWith('volunteer-') || !/^SVD-APP-\d{4}-[A-F0-9]{32}$/.test(entityId)) {
    throw new HttpError(403, 'Upload is not allowed', 'forbidden')
  }
  return null
}

export async function authorizeDownload(req: VercelRequest, pathname: string): Promise<void> {
  const session = await optionalSession(req)
  if (pathname.startsWith('volunteers/')) {
    const applicationId = pathname.split('/')[1]
    const [row] = await query<{ user_id: string | null; matched: boolean }>(
      `select user_id,
              ($2 = any(array[resume_url, id_proof_url, photo_url])) as matched
         from volunteer_applications where id = $1 limit 1`,
      [applicationId, pathname],
    )
    if (!row?.matched) throw new HttpError(404, 'File not found', 'not_found')
    if (session && row.user_id === session.user.id) return
    await requirePermission(req, 'volunteers', 'view')
    return
  }

  if (pathname.startsWith('documents/') || pathname.startsWith('reports/')) {
    const [row] = await query<{ owner_user_id: string | null; visibility: string; status: string }>(
      `select owner_user_id, visibility, status from documents
        where file_url = $1 or file_url = $2 limit 1`,
      [pathname, deliveryUrl(pathname)],
    )
    if (!row) throw new HttpError(404, 'File not found', 'not_found')
    if (row.visibility === 'public' && row.status === 'published') return
    if (session && row.owner_user_id === session.user.id) return
    await requirePermission(req, pathname.startsWith('reports/') ? 'reports' : 'documents', 'view')
    return
  }

  if (pathname.startsWith('gallery/')) {
    const [row] = await query<{ status: string }>(
      `select a.status from gallery_albums a
         left join gallery_items i on i.album_id = a.id
        where i.url = $1 or i.url = $2 or a.cover_image = $1 or a.cover_image = $2
        limit 1`,
      [pathname, deliveryUrl(pathname)],
    )
    if (!row) throw new HttpError(404, 'File not found', 'not_found')
    if (row.status === 'published') return
    await requirePermission(req, 'gallery', 'view')
    return
  }

  if (pathname.startsWith('tasks/')) {
    const taskId = pathname.split('/')[1]
    if (!taskId || !/^[0-9a-f-]{36}$/i.test(taskId)) {
      throw new HttpError(404, 'File not found', 'not_found')
    }
    const [row] = await query<{ owner_user_id: string | null; module: string }>(
      `select va.user_id as owner_user_id, 'volunteers' as module
         from volunteer_tasks vt
         join volunteer_applications va on va.id = vt.volunteer_application_id
        where vt.id = $1::uuid
       union all
       select i.user_id as owner_user_id, 'internships' as module
         from intern_tasks it
         join internships i on i.id = it.internship_id
        where it.id = $1::uuid
       limit 1`,
      [taskId],
    )
    if (!row) throw new HttpError(404, 'File not found', 'not_found')
    if (session && row.owner_user_id === session.user.id) return
    await requirePermission(req, row.module, 'view')
    return
  }

  throw new HttpError(404, 'File not found', 'not_found')
}
