import { describe, expect, it } from 'vitest'
import {
  publicSubmissionActor,
  publicSubmissionEntityType,
  requestClientMeta,
} from './audit.js'
import type { VercelRequest } from './vercel.js'

function fakeReq(headers: Record<string, string | string[] | undefined>): VercelRequest {
  return {
    headers,
    socket: { remoteAddress: '10.0.0.8' },
  } as unknown as VercelRequest
}

describe('requestClientMeta', () => {
  it('prefers the first x-forwarded-for hop and captures user-agent', () => {
    const meta = requestClientMeta(
      fakeReq({
        'x-forwarded-for': '203.0.113.10, 10.0.0.1',
        'user-agent': 'Mozilla/5.0 SanvedaTest',
      }),
    )
    expect(meta.ip).toBe('203.0.113.10')
    expect(meta.browser).toBe('Mozilla/5.0 SanvedaTest')
    expect(meta.device).toBe('Mozilla/5.0 SanvedaTest')
  })

  it('strips IPv4 ports and falls back to x-real-ip', () => {
    const meta = requestClientMeta(
      fakeReq({
        'x-forwarded-for': 'unknown',
        'x-real-ip': '198.51.100.20:443',
        'user-agent': 'curl/8.0',
      }),
    )
    expect(meta.ip).toBe('198.51.100.20')
  })
})

describe('publicSubmissionActor', () => {
  it('uses name and email when both are present', () => {
    expect(
      publicSubmissionActor({ name: 'Ada Lovelace', email: 'ada@example.com' }),
    ).toBe('Ada Lovelace <ada@example.com>')
  })

  it('falls back to Public submission', () => {
    expect(publicSubmissionActor({})).toBe('Public submission')
  })

  it('maps public resources to audit entity types', () => {
    expect(publicSubmissionEntityType('volunteer_applications')).toBe('volunteers')
    expect(publicSubmissionEntityType('enquiries')).toBe('enquiries')
  })
})
