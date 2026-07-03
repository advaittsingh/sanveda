import type { CampaignRecord } from './campaignService'
import type { WizardStepValidation } from '../types/campaignAdmin'

export const WIZARD_STEPS = [
  'Basic Details',
  'Beneficiary Details',
  'Story',
  'Media',
  'Financials',
  'Documents',
  'Publishing',
  'Updates & Communication',
] as const

export const DOCUMENT_CATEGORIES = [
  'Medical Report',
  'Aadhaar',
  'Income Certificate',
  'NGO Verification',
  'Hospital Estimate',
  'Consent Form',
  'Photographs',
  'Videos',
] as const

export const STAFF_MEMBERS = ['Admin', 'Priya Sharma', 'Rahul Mehta', 'NGO Coordinator']

export function validateWizardStep(step: number, form: Partial<CampaignRecord>): WizardStepValidation {
  const meta = form.meta ?? {}

  switch (step) {
    case 0: {
      if (!form.title?.trim()) return { status: 'invalid', message: 'Title required' }
      if (!form.slug?.trim()) return { status: 'invalid', message: 'Slug required' }
      if (!meta.campaignType) return { status: 'warning', message: 'Select campaign type' }
      return { status: 'complete' }
    }
    case 1: {
      if (!meta.beneficiary?.name?.trim()) return { status: 'invalid', message: 'Beneficiary name required' }
      if (!meta.beneficiary?.phone) return { status: 'warning', message: 'Phone recommended' }
      return { status: 'complete' }
    }
    case 2: {
      if (!meta.story?.summary?.trim()) return { status: 'warning', message: 'Short summary missing' }
      if (!form.description?.trim() && !meta.story?.fullStory?.trim()) return { status: 'invalid', message: 'Story required' }
      return { status: 'complete' }
    }
    case 3: {
      if (!form.banner_image?.trim()) return { status: 'invalid', message: 'Hero banner required' }
      return { status: 'complete' }
    }
    case 4: {
      if (!form.goal || form.goal <= 0) return { status: 'invalid', message: 'Goal must be > 0' }
      return { status: 'complete' }
    }
    case 5: {
      const docs = meta.documentFiles ?? []
      if (docs.length === 0) return { status: 'warning', message: 'Documents missing' }
      return { status: 'complete' }
    }
    case 6:
      return { status: 'complete' }
    case 7:
      return { status: 'pending' }
    default:
      return { status: 'pending' }
  }
}

export function wizardCompletionPercent(form: Partial<CampaignRecord>): number {
  const validations = WIZARD_STEPS.map((_, i) => validateWizardStep(i, form))
  const complete = validations.filter((v) => v.status === 'complete').length
  return Math.round((complete / WIZARD_STEPS.length) * 100)
}

export function stepIndicator(v: WizardStepValidation): string {
  if (v.status === 'complete') return '✓'
  if (v.status === 'warning') return '⚠'
  if (v.status === 'invalid') return '✖'
  return '○'
}

const DRAFT_KEY = 'sanveda_campaign_wizard_draft'

export function saveWizardDraft(form: Partial<CampaignRecord>) {
  const payload = { ...form, meta: { ...form.meta, lastSavedAt: new Date().toISOString() } }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
}

export function loadWizardDraft(): Partial<CampaignRecord> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) as Partial<CampaignRecord> : null
  } catch {
    return null
  }
}

export function clearWizardDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
