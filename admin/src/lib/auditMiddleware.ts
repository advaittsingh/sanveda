import { authClient } from './authClient'
import { logAudit } from './auditService'
import { getCurrentAdminRole } from './rbacService'

export interface AuditContext {
  userId?: string
  userName?: string
  role?: string
  ip?: string
  device?: string
}

async function getActor(): Promise<AuditContext> {
  try {
    const [{ data: session }, role] = await Promise.all([
      authClient.getSession(),
      getCurrentAdminRole().catch(() => undefined),
    ])
    const userName =
      session?.user?.name?.trim() ||
      session?.user?.email?.trim() ||
      undefined
    return {
      userId: session?.user?.id,
      userName,
      role,
    }
  } catch {
    return {}
  }
}

/**
 * Wraps an admin mutation with automatic audit logging.
 * Use for all CREATE / UPDATE / DELETE / APPROVE / REJECT / EXPORT actions.
 * IP / User-Agent are attached server-side when the audit row is inserted.
 */
export async function withAudit<T>(
  action: string,
  entityType: string,
  entityId: string | undefined,
  fn: () => Promise<T>,
  details: Record<string, unknown> = {},
): Promise<T> {
  const actor = await getActor()
  const merged = {
    ...details,
    user: details.user ?? actor.userName,
    role: details.role ?? actor.role,
  }
  try {
    const result = await fn()
    await logAudit(action, entityType, entityId, {
      ...merged,
      status: 'success',
      result: typeof result === 'object' ? 'ok' : String(result),
    })
    return result
  } catch (err) {
    await logAudit(`${action}_failed`, entityType, entityId, {
      ...merged,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    throw err
  }
}

export async function auditAction(
  action: string,
  entityType: string,
  entityId: string | undefined,
  details: Record<string, unknown> = {},
): Promise<void> {
  const actor = await getActor()
  await logAudit(action, entityType, entityId, {
    ...details,
    user: details.user ?? actor.userName,
    role: details.role ?? actor.role,
  })
}
