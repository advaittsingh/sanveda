import { describe, expect, it } from 'vitest'
import { createObjectPath, deliveryUrl, sanitizeEntityId, storedPath } from './storage.js'

describe('private storage policy helpers', () => {
  it('builds scoped, non-guessable object paths', () => {
    const path = createObjectPath('document', 'report_2026', 'application/pdf')
    expect(path).toMatch(/^documents\/report_2026\/document-[0-9a-f-]+\.pdf$/)
  })

  it('rejects unsafe entities and mismatched content types', () => {
    expect(() => sanitizeEntityId('../admin')).toThrow(/Invalid storage entity/)
    expect(() => createObjectPath('volunteer-photo', 'valid-id', 'text/html')).toThrow(
      /not allowed/,
    )
  })

  it('round-trips private delivery paths', () => {
    const path = 'documents/report/document-id.pdf'
    expect(storedPath(deliveryUrl(path))).toBe(path)
    expect(storedPath('https://attacker.example/file.pdf')).toBeNull()
  })

  it('builds task proof paths under tasks/', () => {
    const path = createObjectPath(
      'task-proof',
      '11111111-2222-4333-8444-555555555555',
      'image/png',
    )
    expect(path).toMatch(
      /^tasks\/11111111-2222-4333-8444-555555555555\/task-proof-[0-9a-f-]+\.png$/,
    )
  })
})
