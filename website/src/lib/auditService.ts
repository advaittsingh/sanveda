import { dataApi } from './dataApiClient'

export interface AuditLog {
  id: string
  userId?: string
  action: string
  entityType: string
  entityId?: string
  details: Record<string, unknown>
  ip?: string
  browser?: string
  device?: string
  createdAt: string
}

export async function logAudit(
  action: string,
  entityType: string,
  entityId?: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  const severity = action.endsWith('_failed') || details.status === 'failed' ? 'warning' : 'info'
  const { error } = await dataApi.table('audit_logs').insert({
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    details,
    severity,
  })
  if (error) {
    console.error('[audit] Failed to write audit log:', error.message, { action, entityType, entityId })
  }
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const { data, error } = await dataApi
    .table('audit_logs')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    action: String(row.action),
    entityType: String(row.entity_type),
    entityId: row.entity_id ? String(row.entity_id) : undefined,
    details: (row.details as Record<string, unknown>) ?? {},
    ip: row.ip_address ? String(row.ip_address) : undefined,
    browser: row.browser ? String(row.browser) : undefined,
    device: row.device ? String(row.device) : undefined,
    createdAt: String(row.occurred_at ?? row.created_at),
  }))
}
