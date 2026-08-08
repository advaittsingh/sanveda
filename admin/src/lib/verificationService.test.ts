import { describe, expect, it } from 'vitest'
import { normalizeVerifyInput } from './verificationService'

describe('normalizeVerifyInput', () => {
  it('extracts codes from verify URLs', () => {
    expect(normalizeVerifyInput('https://sanveda.vercel.app/verify/SVD-VOL-123')).toBe('SVD-VOL-123')
    expect(normalizeVerifyInput('/verify/SVD-INT-CERT-9')).toBe('SVD-INT-CERT-9')
  })

  it('extracts verify URLs from legacy JSON QR payloads', () => {
    expect(
      normalizeVerifyInput(
        JSON.stringify({
          receiptNumber: 'SVD-80G-2026-1',
          verify: 'https://sanveda.vercel.app/verify/abcd',
        }),
      ),
    ).toBe('abcd')
  })

  it('returns bare tokens unchanged', () => {
    expect(normalizeVerifyInput('  SVD-MEMBER-1  ')).toBe('SVD-MEMBER-1')
  })
})
