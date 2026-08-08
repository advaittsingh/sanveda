/** Digits-only length after stripping formatting. */
export function phoneDigitCount(phone: string): number {
  return phone.replace(/\D/g, '').length
}

/**
 * Contact / enquiry phone: 7–15 digits; +, spaces, dashes, and parentheses allowed.
 * Rejects letter-only values like "abc".
 */
export function isValidContactPhone(phone: string): boolean {
  const trimmed = phone.trim()
  if (!trimmed || trimmed.length > 32) return false
  if (!/^[\d+()\s.-]+$/.test(trimmed)) return false
  const digits = phoneDigitCount(trimmed)
  return digits >= 7 && digits <= 15
}

export const CONTACT_PHONE_ERROR =
  'Enter a valid phone number with 7–15 digits (e.g. 9876543210 or +91 98765 43210).'
