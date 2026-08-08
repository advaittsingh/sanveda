import type { VolunteerFormData } from '../types/volunteer'

/** Letters (incl. accents), spaces, apostrophes, hyphens, periods — no markup or script payloads. */
export function isSafePersonName(name: string): boolean {
  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 160) return false
  // Reject HTML/script-like content before the letter allow-list check.
  if (/<[^>]*>/i.test(trimmed)) return false
  if (/javascript:|data:\s*text\/html|on\w+\s*=/i.test(trimmed)) return false
  if (/[<>{}[\]\\/`|]/.test(trimmed)) return false
  return /^[\p{L}\p{M}][\p{L}\p{M} .'’\-]*$/u.test(trimmed)
}

export function dobBounds(today = new Date()): { min: string; max: string; minAgeDate: string } {
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const max = toDateInputValue(endOfToday)

  const oldest = new Date(endOfToday)
  oldest.setFullYear(oldest.getFullYear() - 100)
  const min = toDateInputValue(oldest)

  const minAge = new Date(endOfToday)
  minAge.setFullYear(minAge.getFullYear() - 16)
  const minAgeDate = toDateInputValue(minAge)

  return { min, max, minAgeDate }
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function validateDateOfBirth(value: string): string | undefined {
  if (!value.trim()) return 'Date of birth is required'

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Enter a valid date of birth'

  const dob = new Date(`${value}T00:00:00`)
  if (Number.isNaN(dob.getTime()) || toDateInputValue(dob) !== value) {
    return 'Enter a valid date of birth'
  }

  const { min, max, minAgeDate } = dobBounds()
  if (value > max) return 'Date of birth cannot be in the future'
  if (value < min) return 'Please enter a realistic date of birth'
  if (value > minAgeDate) return 'You must be at least 16 years old to apply as a volunteer'

  return undefined
}

/** Positive whole hours only, 1–168. */
export function validateHoursPerWeek(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return 'Hours per week is required'
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return 'Enter a valid number of hours (no negatives).'
  const hours = Number(trimmed)
  if (!Number.isFinite(hours) || hours <= 0) return 'Hours per week must be greater than zero.'
  if (hours > 168) return 'Hours per week cannot exceed 168.'
  return undefined
}

export function validateStep(step: number, form: VolunteerFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  if (step === 0) {
    if (!form.fullName.trim()) errors.fullName = 'Full name is required'
    else if (!isSafePersonName(form.fullName)) {
      errors.fullName = 'Enter a valid name using letters only (no HTML or special characters).'
    }

    const dobError = validateDateOfBirth(form.dateOfBirth)
    if (dobError) errors.dateOfBirth = dobError

    if (!form.gender) errors.gender = 'Please select gender'
    if (!form.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'
    if (!form.phone.trim()) errors.phone = 'Phone is required'
    if (!form.address.trim()) errors.address = 'Address is required'
    if (!form.city.trim()) errors.city = 'City is required'
    if (!form.state.trim()) errors.state = 'State is required'
    if (!form.country.trim()) errors.country = 'Country is required'
  }

  if (step === 2) {
    if (!form.preferredRoles.length) errors.preferredRoles = 'Select at least one role'
    if (!form.volunteerType) errors.volunteerType = 'Select volunteer type'
    const hoursError = validateHoursPerWeek(form.hoursPerWeek)
    if (hoursError) errors.hoursPerWeek = hoursError
  }

  if (step === 3) {
    if (!form.motivation.trim()) errors.motivation = 'Please share your motivation'
    if (!form.aboutYourself.trim()) errors.aboutYourself = 'Tell us about yourself'
  }

  if (step === 4) {
    if (!form.agreedPolicies) errors.agreedPolicies = 'You must agree to volunteer policies'
    if (!form.agreedBackgroundCheck) errors.agreedBackgroundCheck = 'Background verification consent is required'
    if (!form.agreedDataProcessing) errors.agreedDataProcessing = 'Data processing consent is required'
  }

  return errors
}

/** Validate every step (used on final submit so Step 1 checks cannot be skipped). */
export function validateAllSteps(form: VolunteerFormData): Record<string, string> {
  const errors: Record<string, string> = {}
  for (let step = 0; step <= 4; step += 1) {
    Object.assign(errors, validateStep(step, form))
  }
  return errors
}
