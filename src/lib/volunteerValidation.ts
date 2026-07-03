import type { VolunteerFormData } from '../types/volunteer'

export function validateStep(step: number, form: VolunteerFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  if (step === 0) {
    if (!form.fullName.trim()) errors.fullName = 'Full name is required'
    if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
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
