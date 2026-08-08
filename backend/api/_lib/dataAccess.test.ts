import { describe, expect, it } from 'vitest'
import { quoteIdentifier, selectColumns, validatePublicInsert } from './dataAccess.js'

describe('data API validation helpers', () => {
  it('quotes approved identifiers and rejects SQL fragments', () => {
    expect(quoteIdentifier('created_at')).toBe('"created_at"')
    expect(() => quoteIdentifier('id; drop table user')).toThrow(/Invalid identifier/)
    expect(selectColumns('id,created_at')).toBe('"id", "created_at"')
    expect(() => selectColumns('id,count(*)')).toThrow(/explicit column names/)
  })

  it('strictly validates public enquiry writes', () => {
    const enquiry = {
      name: 'A Donor',
      phone: '9876543210',
      email: 'donor@example.com',
      subject: 'Receipt',
      message: 'Please resend my receipt.',
    }
    expect(validatePublicInsert('enquiries', enquiry)).toEqual(enquiry)
    expect(() => validatePublicInsert('enquiries', { ...enquiry, is_admin: true })).toThrow()
    expect(() => validatePublicInsert('donations', enquiry)).toThrow(/not allowed/)
  })

  it('rejects invalid enquiry phone formats', () => {
    const enquiry = {
      name: 'A Donor',
      phone: 'abc',
      email: 'donor@example.com',
      subject: 'Receipt',
      message: 'Please resend my receipt.',
    }
    expect(() => validatePublicInsert('enquiries', enquiry)).toThrow()
    expect(() =>
      validatePublicInsert('enquiries', { ...enquiry, phone: '12' }),
    ).toThrow()
    expect(
      validatePublicInsert('enquiries', { ...enquiry, phone: '+91 98765 43210' }),
    ).toMatchObject({ phone: '+91 98765 43210' })
  })

  it('rejects HTML/script payloads in enquiry free-text fields', () => {
    const enquiry = {
      name: 'A Donor',
      phone: '9876543210',
      email: 'donor@example.com',
      subject: 'Receipt',
      message: 'Please resend my receipt.',
    }
    expect(() =>
      validatePublicInsert('enquiries', {
        ...enquiry,
        name: '<script>alert(1)</script>',
      }),
    ).toThrow()
    expect(() =>
      validatePublicInsert('enquiries', {
        ...enquiry,
        message: 'Hello <img src=x onerror=alert(1)>',
      }),
    ).toThrow()
  })
})


