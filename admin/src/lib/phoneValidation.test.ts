import { describe, expect, it } from 'vitest'
import { isValidContactPhone } from './phoneValidation'

describe('isValidContactPhone', () => {
  it('accepts common Indian and international formats', () => {
    expect(isValidContactPhone('9876543210')).toBe(true)
    expect(isValidContactPhone('+91 98765 43210')).toBe(true)
    expect(isValidContactPhone('(022) 1234-5678')).toBe(true)
  })

  it('rejects non-numeric and too-short values', () => {
    expect(isValidContactPhone('abc')).toBe(false)
    expect(isValidContactPhone('12')).toBe(false)
    expect(isValidContactPhone('')).toBe(false)
    expect(isValidContactPhone('phone-number')).toBe(false)
  })
})
