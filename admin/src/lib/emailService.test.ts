import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  APPLICATION_EMAIL_DEGRADED_MESSAGE,
  enquiryReceivedEmailHtml,
  sendTransactionalEmail,
  trySendTransactionalEmail,
} from './emailService'

describe('enquiryReceivedEmailHtml', () => {
  it('HTML-escapes the recipient name', () => {
    const html = enquiryReceivedEmailHtml(`<script>alert(1)</script>`)
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })
})

describe('sendTransactionalEmail error sanitization', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('never exposes Resend or env var names to callers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          success: false,
          error: 'email_unavailable',
          message: 'Email delivery is not configured',
        }),
      }),
    )

    await expect(
      sendTransactionalEmail('a@example.com', 'Subject', '<p>Hi</p>', 'internship_received', {
        internshipId: 'id-1',
      }),
    ).rejects.toThrow('Email delivery is temporarily unavailable. Please try again later.')

    const error = await sendTransactionalEmail(
      'a@example.com',
      'Subject',
      '<p>Hi</p>',
      'internship_received',
      { internshipId: 'id-1' },
    ).catch((err: unknown) => err)
    expect(error).toBeInstanceOf(Error)
    expect(String((error as Error).message)).not.toMatch(/Resend|RESEND_API_KEY|FROM_EMAIL/)
  })

  it('trySendTransactionalEmail returns false instead of throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: false, status: 'failed' }),
      }),
    )

    await expect(
      trySendTransactionalEmail('a@example.com', 'Subject', '<p>Hi</p>', 'membership_received', {
        membershipId: 'id-1',
      }),
    ).resolves.toBe(false)
  })

  it('exports applicant-facing degraded copy without provider details', () => {
    expect(APPLICATION_EMAIL_DEGRADED_MESSAGE).toMatch(/saved successfully/i)
    expect(APPLICATION_EMAIL_DEGRADED_MESSAGE).not.toMatch(/Resend|RESEND_API_KEY|FROM_EMAIL/)
  })
})
