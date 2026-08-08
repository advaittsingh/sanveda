import { BRAND } from '../../constants/brand'
import { getSettingsDashboardData } from '../settingsOperationsService'
import type { NgoReceiptProfile } from './types'

const DEFAULT_ACCENT = '#059669'

function normalizeWebsite(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return typeof window !== 'undefined' ? window.location.origin : 'https://sanveda.vercel.app'
  if (trimmed.startsWith('http')) return trimmed.replace(/\/$/, '')
  return `https://${trimmed.replace(/\/$/, '')}`
}

export async function loadNgoReceiptProfile(): Promise<NgoReceiptProfile> {
  const settings = await getSettingsDashboardData()
  const { organization: org, branding, tax } = settings
  const website = normalizeWebsite(org.website)

  return {
    ngoName: org.ngoName || BRAND.shortName,
    legalName: org.legalName || org.ngoName || BRAND.name,
    tagline: BRAND.tagline,
    registrationNumber: org.registrationNumber,
    pan: org.pan,
    eightyGNumber: org.eightyGNumber,
    twelveANumber: org.twelveANumber,
    website,
    supportEmail: org.supportEmail || BRAND.email,
    phone: org.phone || BRAND.phone,
    address: org.address || BRAND.address,
    logo: branding.logo || BRAND.logo,
    primaryColor: branding.primaryColor || BRAND.colors.primary,
    accentColor: DEFAULT_ACCENT,
    signatureImage: branding.authorizedSignature || undefined,
    receiptPrefix: tax.receiptPrefix || 'SVD-80G',
    financialYear: tax.financialYear,
    verificationBaseUrl: website,
  }
}

export function financialYearFromDate(date: Date): string {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month >= 3) return `${year}-${String(year + 1).slice(-2)}`
  return `${year - 1}-${String(year).slice(-2)}`
}
