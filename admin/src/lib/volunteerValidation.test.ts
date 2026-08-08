import { describe, expect, it } from 'vitest'
import {
  isSafePersonName,
  validateDateOfBirth,
  validateHoursPerWeek,
  validateStep,
} from './volunteerValidation'
import type { VolunteerFormData } from '../types/volunteer'

function baseForm(overrides: Partial<VolunteerFormData> = {}): VolunteerFormData {
  return {
    fullName: 'Priya Sharma',
    dateOfBirth: '2000-01-15',
    gender: 'female',
    email: 'priya@example.com',
    phone: '9876543210',
    address: '12 MG Road',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    occupation: '',
    organization: '',
    linkedin: '',
    education: '',
    preferredRoles: [],
    volunteerType: '',
    hoursPerWeek: '',
    skills: '',
    experience: '',
    languages: '',
    certifications: '',
    motivation: '',
    aboutYourself: '',
    previousExperience: '',
    resumeUrl: null,
    resumeName: null,
    idProofUrl: null,
    idProofName: null,
    photoUrl: null,
    photoName: null,
    agreedPolicies: false,
    agreedBackgroundCheck: false,
    agreedDataProcessing: false,
    ...overrides,
  } as VolunteerFormData
}

describe('isSafePersonName', () => {
  it('accepts normal names', () => {
    expect(isSafePersonName('Priya Sharma')).toBe(true)
    expect(isSafePersonName("O'Connor")).toBe(true)
    expect(isSafePersonName('Mary-Jane')).toBe(true)
  })

  it('rejects script-like payloads', () => {
    expect(isSafePersonName('<script>alert(1)</script>')).toBe(false)
    expect(isSafePersonName('javascript:alert(1)')).toBe(false)
    expect(isSafePersonName('"><img onerror=alert(1)>')).toBe(false)
    expect(isSafePersonName('Test{payload}')).toBe(false)
  })
})

describe('validateDateOfBirth', () => {
  it('rejects future dates', () => {
    expect(validateDateOfBirth('2030-01-01')).toMatch(/future/i)
  })

  it('rejects under-16 applicants', () => {
    const recent = new Date()
    recent.setFullYear(recent.getFullYear() - 10)
    const value = recent.toISOString().slice(0, 10)
    expect(validateDateOfBirth(value)).toMatch(/16/)
  })

  it('accepts a valid adult DOB', () => {
    expect(validateDateOfBirth('1995-06-01')).toBeUndefined()
  })
})

describe('validateStep step 0', () => {
  it('blocks advancing with unsafe name or future DOB', () => {
    const errors = validateStep(
      0,
      baseForm({ fullName: '<script>alert(1)</script>', dateOfBirth: '2030-01-01' }),
    )
    expect(errors.fullName).toBeTruthy()
    expect(errors.dateOfBirth).toBeTruthy()
  })
})

describe('validateHoursPerWeek', () => {
  it('rejects negative, zero, and non-numeric values', () => {
    expect(validateHoursPerWeek('-5')).toBeTruthy()
    expect(validateHoursPerWeek('0')).toBeTruthy()
    expect(validateHoursPerWeek('abc')).toBeTruthy()
    expect(validateHoursPerWeek('')).toBeTruthy()
  })

  it('accepts a positive hour count', () => {
    expect(validateHoursPerWeek('10')).toBeUndefined()
  })
})

describe('validateStep availability step', () => {
  it('blocks advancing with negative hours', () => {
    const errors = validateStep(
      2,
      baseForm({
        preferredRoles: ['education'],
        volunteerType: 'weekends',
        hoursPerWeek: '-5',
      }),
    )
    expect(errors.hoursPerWeek).toBeTruthy()
  })
})
