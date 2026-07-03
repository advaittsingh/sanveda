import { isSupabaseConfigured, requireSupabase } from './supabase'

export type VerificationType = 'donation_receipt' | 'membership_certificate' | 'volunteer_id' | 'internship_certificate'

export interface VerificationRecord {
  id: string
  code: string
  type: VerificationType
  holderName: string
  referenceId: string
  metadata: Record<string, unknown>
  validUntil?: string
  revoked: boolean
  createdAt: string
}

const STORAGE_KEY = 'sanveda_verifications'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'SVD-'
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function rowToRecord(row: Record<string, unknown>): VerificationRecord {
  return {
    id: String(row.id),
    code: String(row.code),
    type: row.type as VerificationType,
    holderName: String(row.holder_name),
    referenceId: String(row.reference_id),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    validUntil: row.valid_until ? String(row.valid_until) : undefined,
    revoked: Boolean(row.revoked),
    createdAt: String(row.created_at),
  }
}

function readLocal(): VerificationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocal(items: VerificationRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function registerVerification(input: {
  type: VerificationType
  holderName: string
  referenceId: string
  metadata?: Record<string, unknown>
  validUntil?: string
}): Promise<VerificationRecord> {
  const code = generateCode()

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('verification_records')
      .insert({
        code,
        type: input.type,
        holder_name: input.holderName,
        reference_id: input.referenceId,
        metadata: input.metadata ?? {},
        valid_until: input.validUntil ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return rowToRecord(data)
  }

  const record: VerificationRecord = {
    id: crypto.randomUUID(),
    code,
    type: input.type,
    holderName: input.holderName,
    referenceId: input.referenceId,
    metadata: input.metadata ?? {},
    validUntil: input.validUntil,
    revoked: false,
    createdAt: new Date().toISOString(),
  }
  const all = readLocal()
  all.unshift(record)
  writeLocal(all)
  return record
}

export async function verifyCode(code: string): Promise<VerificationRecord | null> {
  const normalized = code.trim().toUpperCase()

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('verification_records')
      .select('*')
      .eq('code', normalized)
      .maybeSingle()

    if (error || !data) return null
    return rowToRecord(data)
  }

  return readLocal().find((r) => r.code === normalized) ?? null
}

export function isVerificationValid(record: VerificationRecord): { valid: boolean; reason?: string } {
  if (record.revoked) return { valid: false, reason: 'This document has been revoked.' }
  if (record.validUntil && new Date(record.validUntil) < new Date()) {
    return { valid: false, reason: 'This document has expired.' }
  }
  return { valid: true }
}
