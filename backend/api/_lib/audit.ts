import type { PoolClient } from 'pg'
import { query } from './db.js'
import type { VercelRequest } from './vercel.js'

export type AuditWriteInput = {
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  details?: Record<string, unknown>
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical'
  ip?: string | null
  browser?: string | null
  device?: string | null
}

export type RequestClientMeta = {
  ip: string | null
  browser: string | null
  device: string | null
}

const PUBLIC_SUBMISSION_RESOURCES = {
  enquiries: 'enquiries',
  volunteer_applications: 'volunteers',
  internships: 'internships',
  memberships: 'memberships',
} as const

export type PublicSubmissionResource = keyof typeof PUBLIC_SUBMISSION_RESOURCES

export function isPublicSubmissionResource(
  resource: string,
): resource is PublicSubmissionResource {
  return resource in PUBLIC_SUBMISSION_RESOURCES
}

export function publicSubmissionEntityType(resource: PublicSubmissionResource): string {
  return PUBLIC_SUBMISSION_RESOURCES[resource]
}

/** Prefer submitter identity; fall back to a stable public label. */
export function publicSubmissionActor(input: {
  name?: unknown
  email?: unknown
  full_name?: unknown
  donor_name?: unknown
  donor_email?: unknown
}): string {
  const name = firstNonEmpty(input.name, input.full_name, input.donor_name)
  const email = firstNonEmpty(input.email, input.donor_email)
  if (name && email) return `${name} <${email}>`
  return name ?? email ?? 'Public submission'
}

function firstNonEmpty(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return undefined
}

function headerValue(headers: VercelRequest['headers'], name: string): string | null {
  const raw = headers[name]
  if (Array.isArray(raw)) return raw[0]?.trim() || null
  if (typeof raw === 'string') return raw.trim() || null
  return null
}

function normalizeIp(raw: string | null): string | null {
  if (!raw) return null
  let value = raw.trim()
  if (!value || value.toLowerCase() === 'unknown') return null

  if (value.startsWith('[')) {
    const end = value.indexOf(']')
    if (end > 0) value = value.slice(1, end)
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(value)) {
    value = value.slice(0, value.lastIndexOf(':'))
  }

  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return value
  if (value.includes(':') && /^[0-9a-fA-F:.]+$/.test(value)) return value
  return null
}

export function requestClientMeta(req: VercelRequest): RequestClientMeta {
  const forwarded = headerValue(req.headers, 'x-forwarded-for')
  const forwardedIp = forwarded ? forwarded.split(',')[0]?.trim() ?? null : null
  const realIp = headerValue(req.headers, 'x-real-ip')
  const socketIp =
    typeof req.socket?.remoteAddress === 'string' ? req.socket.remoteAddress : null
  const ip = normalizeIp(forwardedIp) ?? normalizeIp(realIp) ?? normalizeIp(socketIp)
  const browser = headerValue(req.headers, 'user-agent')?.slice(0, 512) ?? null
  return { ip, browser, device: browser }
}

export async function resolveActorDisplayName(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null
  const [row] = await query<{ display_name: string | null }>(
    `select coalesce(
       nullif(trim(p.full_name), ''),
       nullif(trim(u.name), ''),
       nullif(trim(u.email), '')
     ) as display_name
       from "user" u
       left join profiles p on p.id = u.id
      where u.id = $1
      limit 1`,
    [userId],
  )
  return row?.display_name?.trim() || null
}

export async function writeAuditLog(
  client: PoolClient | null,
  input: AuditWriteInput,
): Promise<void> {
  const details = JSON.stringify(input.details ?? {})
  const severity = input.severity ?? 'info'
  const params = [
    input.userId ?? null,
    input.action,
    input.entityType,
    input.entityId ?? null,
    details,
    severity,
    input.ip ?? null,
    input.browser ?? null,
    input.device ?? null,
  ]
  const sql = `insert into audit_logs (
      user_id, action, entity_type, entity_id, details, severity, ip_address, browser, device
    ) values ($1,$2,$3,$4,$5::jsonb,$6,$7::inet,$8,$9)`

  try {
    if (client) await client.query(sql, params)
    else await query(sql, params)
  } catch (error) {
    // Never fail the primary mutation because audit metadata was rejected
    // (e.g. unexpected IP shape). Retry without network fields.
    console.error('[audit] Failed to write audit log with client meta:', error)
    try {
      const fallbackSql = `insert into audit_logs (
          user_id, action, entity_type, entity_id, details, severity
        ) values ($1,$2,$3,$4,$5::jsonb,$6)`
      const fallbackParams = params.slice(0, 6)
      if (client) await client.query(fallbackSql, fallbackParams)
      else await query(fallbackSql, fallbackParams)
    } catch (fallbackError) {
      console.error('[audit] Failed to write audit log:', fallbackError)
    }
  }
}

export async function writePublicSubmissionAudit(
  client: PoolClient | null,
  req: VercelRequest,
  resource: PublicSubmissionResource,
  row: Record<string, unknown>,
): Promise<void> {
  const meta = requestClientMeta(req)
  const actor = publicSubmissionActor(row)
  const entityId = row.id == null ? null : String(row.id)
  await writeAuditLog(client, {
    action: 'CREATE',
    entityType: publicSubmissionEntityType(resource),
    entityId,
    ip: meta.ip,
    browser: meta.browser,
    device: meta.device,
    details: {
      user: actor,
      role: 'Public',
      object: entityId ?? resource,
      source: 'public_submission',
      ip: meta.ip,
      browser: meta.browser,
      device: meta.device,
      status: 'success',
    },
  })
}
