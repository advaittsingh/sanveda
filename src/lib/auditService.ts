import { isSupabaseConfigured, requireSupabase } from './supabase'

export interface AuditLog {
  id: string
  userId?: string
  action: string
  entityType: string
  entityId?: string
  details: Record<string, unknown>
  createdAt: string
}

const STORAGE_KEY = 'sanveda_audit_logs'

function readLocal(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocal(items: AuditLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function logAudit(
  action: string,
  entityType: string,
  entityId?: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  const now = new Date().toISOString()
  let userId: string | undefined

  if (isSupabaseConfigured) {
    const { data: { user } } = await requireSupabase().auth.getUser()
    userId = user?.id
    await requireSupabase().from('audit_logs').insert({
      user_id: userId ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details,
    })
    return
  }

  const entry: AuditLog = {
    id: crypto.randomUUID(),
    userId,
    action,
    entityType,
    entityId,
    details,
    createdAt: now,
  }
  const all = readLocal()
  all.unshift(entry)
  writeLocal(all.slice(0, 500))
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => ({
      id: String(row.id),
      userId: row.user_id ? String(row.user_id) : undefined,
      action: String(row.action),
      entityType: String(row.entity_type),
      entityId: row.entity_id ? String(row.entity_id) : undefined,
      details: (row.details as Record<string, unknown>) ?? {},
      createdAt: String(row.created_at),
    }))
  }

  return readLocal().slice(0, limit)
}
