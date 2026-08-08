import { dataApi } from './dataApiClient'

export type VerificationType =
  | 'donation_receipt'
  | 'membership_certificate'
  | 'volunteer_id'
  | 'internship_certificate'
  | 'appointment_letter'
  | 'letter_of_recommendation'

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

/** Normalize pasted/scanned QR payloads into a bare verification token. */
export function normalizeVerifyInput(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { verify?: unknown; receiptNumber?: unknown }
      if (typeof parsed.verify === 'string' && parsed.verify.trim()) {
        return normalizeVerifyInput(parsed.verify)
      }
      if (typeof parsed.receiptNumber === 'string' && parsed.receiptNumber.trim()) {
        return parsed.receiptNumber.trim()
      }
    } catch {
      // fall through
    }
  }

  try {
    const url = new URL(trimmed)
    const match = url.pathname.match(/\/verify\/(.+)$/i)
    if (match?.[1]) return decodeURIComponent(match[1]).trim()
  } catch {
    // not a full URL
  }

  const pathMatch = trimmed.match(/\/verify\/([^?\s#]+)/i)
  if (pathMatch?.[1]) return decodeURIComponent(pathMatch[1]).trim()

  return trimmed
}

/**
 * Ensure a verification row exists for this public reference and return the code
 * that should be encoded in document QR URLs.
 */
export async function ensureVerificationCode(input: {
  type: VerificationType
  holderName: string
  referenceId: string
  metadata?: Record<string, unknown>
  validUntil?: string
}): Promise<string> {
  const referenceId = input.referenceId.trim()
  if (!referenceId) throw new Error('Verification reference is required')

  const { data, error } = await dataApi.call<Record<string, unknown>>('ensure_verification_record', {
    p_type: input.type,
    p_holder_name: input.holderName,
    p_reference_id: referenceId,
    ...(input.metadata ? { p_metadata: input.metadata } : {}),
    ...(input.validUntil ? { p_valid_until: input.validUntil } : {}),
  })
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Could not register verification record')
  // Encode the public reference in QRs so it matches printed IDs / certificate numbers.
  // Lookup accepts both verification code and reference_id.
  return referenceId
}

export async function registerVerification(input: {
  type: VerificationType
  holderName: string
  referenceId: string
  metadata?: Record<string, unknown>
  validUntil?: string
}): Promise<VerificationRecord> {
  const code = await ensureVerificationCode(input)
  const verified = await verifyCode(code)
  if (verified) return verified
  return {
    id: '',
    code,
    type: input.type,
    holderName: input.holderName,
    referenceId: input.referenceId.trim(),
    metadata: input.metadata ?? {},
    validUntil: input.validUntil,
    revoked: false,
    createdAt: new Date().toISOString(),
  }
}

export async function verifyCode(code: string): Promise<VerificationRecord | null> {
  const normalized = normalizeVerifyInput(code).toUpperCase()
  if (!normalized) return null

  const { data, error } = await dataApi.call<Record<string, unknown>>('lookup_verification_code', {
    p_code: normalized,
  })
  if (error || !data) return null
  return {
    id: '',
    code: String(data.code ?? normalized),
    type: data.type as VerificationType,
    holderName: String(data.holderName),
    referenceId: String(data.referenceId),
    metadata: {},
    validUntil: data.validUntil ? String(data.validUntil) : undefined,
    revoked: Boolean(data.revoked),
    createdAt: String(data.createdAt),
  }
}

export interface VerifiedReceipt {
  valid: true
  receiptNumber: string
  donorName?: string
  amount: number
  currency: string
  campaignTitle: string
  paymentId: string
  paidAt: string
  pan?: string
  taxEligible: boolean
  checksumSha256: string
  generatedAt: string
}

export async function verifyReceiptToken(token: string): Promise<VerifiedReceipt | null> {
  const normalized = normalizeVerifyInput(token)
  if (!normalized) return null
  // Receipt tokens are 64-char hex checkout tokens.
  if (!/^[a-f0-9]{64}$/i.test(normalized)) return null
  const { data, error } = await dataApi.call<VerifiedReceipt>('verify_receipt_token', {
    p_token: normalized,
  })
  if (error || !data?.valid) return null
  return data as VerifiedReceipt
}

export function isVerificationValid(record: VerificationRecord): { valid: boolean; reason?: string } {
  if (record.revoked) return { valid: false, reason: 'This document has been revoked.' }
  if (record.validUntil && new Date(record.validUntil) < new Date()) {
    return { valid: false, reason: 'This document has expired.' }
  }
  return { valid: true }
}
