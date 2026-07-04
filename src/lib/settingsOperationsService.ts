import { writePersistedMeta, allowLocalStoragePersistence, isProductionDataMode } from './persistMeta'
import { withAudit } from './auditMiddleware'
import { isSupabaseConfigured } from './supabase'
import { BRAND, C } from '../constants/brand'

export type SettingsTab =
  | 'dashboard'
  | 'organization'
  | 'branding'
  | 'finance'
  | 'donations'
  | 'tax'
  | 'certificates'
  | 'communications'
  | 'notifications'
  | 'integrations'
  | 'security'
  | 'workflows'
  | 'ai'
  | 'backup'
  | 'audit'
  | 'analytics'
  | 'system'

export interface OrganizationSettings {
  ngoName: string
  legalName: string
  registrationNumber: string
  pan: string
  gst: string
  twelveANumber: string
  eightyGNumber: string
  csrRegistration: string
  website: string
  supportEmail: string
  phone: string
  address: string
}

export interface BrandingSettings {
  logo: string
  favicon: string
  emailHeader: string
  letterhead: string
  certificateTemplate: string
  primaryColor: string
  secondaryColor: string
  theme: 'light' | 'dark' | 'system'
  darkMode: boolean
}

export interface DonationSettings {
  minimumDonation: number
  suggestedAmounts: number[]
  anonymousDonations: boolean
  internationalDonations: boolean
  recurringDonations: boolean
  offlineDonations: boolean
  campaignFees: number
  platformCharges: number
}

export interface PaymentGateway {
  id: string
  provider: string
  status: 'connected' | 'disabled'
  apiKey: string
  secretKey: string
  webhookUrl: string
  settlementAccount: string
  mode: 'live' | 'test'
}

export interface TaxComplianceSettings {
  eightyGEnabled: boolean
  twelveAEnabled: boolean
  csrEnabled: boolean
  fcraEnabled: boolean
  receiptPrefix: string
  receiptSequence: number
  financialYear: string
}

export interface CertificateTemplate {
  id: string
  name: string
  type: string
  template: string
}

export interface IntegrationStatus {
  id: string
  name: string
  status: 'connected' | 'disabled' | 'demo'
  category: string
}

export interface SettingsDashboardData {
  organization: OrganizationSettings
  branding: BrandingSettings
  donations: DonationSettings
  paymentGateways: PaymentGateway[]
  tax: TaxComplianceSettings
  certificates: CertificateTemplate[]
  communications: { email: string[]; sms: string[]; whatsapp: string[] }
  notifications: { event: string; email: boolean; sms: boolean; whatsapp: boolean; push: boolean; inApp: boolean }[]
  integrations: IntegrationStatus[]
  finance: {
    financialYear: string
    currency: string
    expenseCategories: string[]
    incomeCategories: string[]
    bankAccounts: string[]
    accountingMethod: string
  }
  security: {
    twoFactor: boolean
    sso: boolean
    passwordMinLength: number
    sessionTimeout: string
    ipRestriction: boolean
    deviceRestriction: boolean
    autoLogout: boolean
  }
  ai: {
    openaiKey: string
    geminiKey: string
    anthropicKey: string
    aiReports: boolean
    aiInsights: boolean
    aiContent: boolean
    aiAnalytics: boolean
  }
  automation: {
    autoTaxReceipts: boolean
    autoThankYouEmails: boolean
    autoVolunteerIds: boolean
    autoCertificates: boolean
    autoReports: boolean
    autoReminders: boolean
  }
  backup: {
    dailyBackup: boolean
    weeklySnapshot: boolean
    lastBackup: string
    disasterRecovery: boolean
  }
  auditConfig: {
    retentionPeriod: string
    logLevel: string
    criticalEvents: boolean
    exportSchedule: string
  }
  system: {
    maintenanceMode: boolean
    emergencyShutdown: boolean
    readOnlyMode: boolean
    demoMode: boolean
  }
  workflows: { id: string; name: string; steps: string[] }[]
  analytics: {
    storageUsed: string
    apiCalls: number
    emailsSent: number
    smsSent: number
    transactions: number
    users: number
    campaigns: number
    donations: number
  }
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
}

const STORAGE_KEY = 'sanveda_platform_settings'

export const SETTINGS_TABS: { value: SettingsTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'organization', label: 'Organization' },
  { value: 'branding', label: 'Branding' },
  { value: 'finance', label: 'Finance' },
  { value: 'donations', label: 'Donations' },
  { value: 'tax', label: 'Tax & Compliance' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'communications', label: 'Communications' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'security', label: 'Users & Security' },
  { value: 'workflows', label: 'Approval Workflows' },
  { value: 'ai', label: 'AI & Automation' },
  { value: 'backup', label: 'Backup & Recovery' },
  { value: 'audit', label: 'Audit Configuration' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'system', label: 'System' },
]

function defaultData(): SettingsDashboardData {
  return {
    organization: {
      ngoName: BRAND.name,
      legalName: BRAND.name,
      registrationNumber: '',
      pan: '',
      gst: '',
      twelveANumber: '',
      eightyGNumber: '',
      csrRegistration: '',
      website: 'sanveda.vercel.app',
      supportEmail: BRAND.email,
      phone: BRAND.phone,
      address: BRAND.address,
    },
    branding: {
      logo: BRAND.logo,
      favicon: '/assets/sanveda-logo.png',
      emailHeader: BRAND.logo,
      letterhead: BRAND.logo,
      certificateTemplate: 'default',
      primaryColor: C.primary,
      secondaryColor: C.secondary,
      theme: 'light',
      darkMode: false,
    },
    donations: {
      minimumDonation: 100,
      suggestedAmounts: [500, 1000, 5000, 10000],
      anonymousDonations: true,
      internationalDonations: false,
      recurringDonations: true,
      offlineDonations: true,
      campaignFees: 0,
      platformCharges: 2.5,
    },
    paymentGateways: [
      { id: '1', provider: 'Razorpay', status: 'connected', apiKey: 'rzp_live_***', secretKey: '***', webhookUrl: 'https://sanveda.vercel.app/api/webhooks/razorpay', settlementAccount: 'HDFC ****4521', mode: 'live' },
      { id: '2', provider: 'Stripe', status: 'disabled', apiKey: '', secretKey: '', webhookUrl: '', settlementAccount: '', mode: 'test' },
      { id: '3', provider: 'PayPal', status: 'disabled', apiKey: '', secretKey: '', webhookUrl: '', settlementAccount: '', mode: 'test' },
      { id: '4', provider: 'UPI', status: 'connected', apiKey: 'upi_***', secretKey: '***', webhookUrl: 'https://sanveda.vercel.app/api/webhooks/upi', settlementAccount: 'HDFC ****4521', mode: 'live' },
    ],
    tax: {
      eightyGEnabled: true,
      twelveAEnabled: true,
      csrEnabled: true,
      fcraEnabled: false,
      receiptPrefix: 'SGHF',
      receiptSequence: 1,
      financialYear: '2026-27',
    },
    certificates: [
      { id: '1', name: 'Volunteer Certificate', type: 'volunteer', template: '{{name}}\n{{date}}\n{{program}}\n{{certificate_id}}' },
      { id: '2', name: 'Internship Certificate', type: 'internship', template: '{{name}}\n{{date}}\n{{program}}\n{{certificate_id}}' },
      { id: '3', name: 'Membership Certificate', type: 'membership', template: '{{name}}\n{{date}}\n{{program}}\n{{certificate_id}}' },
      { id: '4', name: 'Donation Certificate', type: 'donation', template: '{{name}}\n{{date}}\n{{amount}}\n{{certificate_id}}' },
      { id: '5', name: 'Appreciation Certificate', type: 'appreciation', template: '{{name}}\n{{date}}\n{{program}}\n{{certificate_id}}' },
    ],
    communications: {
      email: ['SMTP', 'Resend', 'Sendgrid', 'SES'],
      sms: ['MSG91', 'Twilio', 'Fast2SMS'],
      whatsapp: ['Meta Cloud API', 'Twilio WhatsApp', '360Dialog'],
    },
    notifications: [
      { event: 'New Donation', email: true, sms: true, whatsapp: false, push: true, inApp: true },
      { event: 'Volunteer Application', email: true, sms: false, whatsapp: true, push: true, inApp: true },
      { event: 'Membership Application', email: true, sms: false, whatsapp: false, push: true, inApp: true },
      { event: 'Campaign Goal Reached', email: true, sms: true, whatsapp: true, push: true, inApp: true },
      { event: 'Expense Approval', email: true, sms: false, whatsapp: false, push: true, inApp: true },
      { event: 'Tax Receipt Generated', email: true, sms: true, whatsapp: false, push: false, inApp: true },
    ],
    integrations: [
      { id: '1', name: 'Supabase', status: isSupabaseConfigured ? 'connected' : 'demo', category: 'Database' },
      { id: '2', name: 'Razorpay', status: 'connected', category: 'Payments' },
      { id: '3', name: 'Resend', status: 'connected', category: 'Email' },
      { id: '4', name: 'WhatsApp', status: 'connected', category: 'Messaging' },
      { id: '5', name: 'Google Analytics', status: 'connected', category: 'Analytics' },
      { id: '6', name: 'Meta Pixel', status: 'connected', category: 'Analytics' },
      { id: '7', name: 'Google Maps', status: 'connected', category: 'Maps' },
      { id: '8', name: 'AWS S3', status: 'connected', category: 'Storage' },
      { id: '9', name: 'Cloudflare', status: 'connected', category: 'CDN' },
    ],
    finance: {
      financialYear: '2026-27',
      currency: 'INR',
      expenseCategories: ['Programs', 'Operations', 'Salaries', 'Travel', 'Marketing', 'Compliance'],
      incomeCategories: ['Donations', 'Grants', 'CSR', 'Membership', 'Events', 'Interest'],
      bankAccounts: ['HDFC Current ****4521', 'SBI Savings ****8832'],
      accountingMethod: 'Accrual',
    },
    security: {
      twoFactor: true,
      sso: false,
      passwordMinLength: 12,
      sessionTimeout: '30 minutes',
      ipRestriction: false,
      deviceRestriction: false,
      autoLogout: true,
    },
    ai: {
      openaiKey: '',
      geminiKey: '',
      anthropicKey: '',
      aiReports: true,
      aiInsights: true,
      aiContent: true,
      aiAnalytics: true,
    },
    automation: {
      autoTaxReceipts: true,
      autoThankYouEmails: true,
      autoVolunteerIds: true,
      autoCertificates: true,
      autoReports: false,
      autoReminders: true,
    },
    backup: {
      dailyBackup: true,
      weeklySnapshot: true,
      lastBackup: 'Today',
      disasterRecovery: true,
    },
    auditConfig: {
      retentionPeriod: '7 years',
      logLevel: 'Info',
      criticalEvents: true,
      exportSchedule: 'Monthly',
    },
    system: {
      maintenanceMode: false,
      emergencyShutdown: false,
      readOnlyMode: false,
      demoMode: false,
    },
    workflows: [
      { id: '1', name: 'Campaign', steps: ['Campaign Draft', 'Manager', 'Director'] },
      { id: '2', name: 'Expense', steps: ['Expense Submitted', 'Finance', 'Director'] },
      { id: '3', name: 'Volunteer', steps: ['Volunteer Application', 'Volunteer Manager', 'Admin'] },
    ],
    analytics: {
      storageUsed: '2.4 GB',
      apiCalls: 48200,
      emailsSent: 1240,
      smsSent: 380,
      transactions: 892,
      users: 18,
      campaigns: 24,
      donations: 3420,
    },
    aiInsights: isProductionDataMode()
      ? [
          { id: '1', message: 'Platform settings are synced with your live Supabase project.', tone: 'success' as const },
          { id: '2', message: 'Configure Razorpay and email secrets in Supabase Edge Functions for payments.', tone: 'info' as const },
        ]
      : [
          { id: '1', message: 'Platform Settings is the BIOS of NGO OS — all modules derive config from here.', tone: 'info' as const },
          { id: '2', message: 'Razorpay and UPI gateways are connected in live mode.', tone: 'success' as const },
          { id: '3', message: '80G and 12A compliance modules are enabled.', tone: 'success' as const },
          { id: '4', message: 'Demo mode active — connect Supabase for production persistence.', tone: 'warning' as const },
        ],
  }
}

function readStored(): Partial<SettingsDashboardData> | null {
  if (!allowLocalStoragePersistence()) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<SettingsDashboardData>) : null
  } catch {
    return null
  }
}

export async function getSettingsDashboardData(): Promise<SettingsDashboardData> {
  const defaults = defaultData()
  const stored = readStored()
  if (!stored) return defaults
  return {
    ...defaults,
    ...stored,
    organization: { ...defaults.organization, ...stored.organization },
    branding: { ...defaults.branding, ...stored.branding },
    donations: { ...defaults.donations, ...stored.donations },
    tax: { ...defaults.tax, ...stored.tax },
    security: { ...defaults.security, ...stored.security },
    ai: { ...defaults.ai, ...stored.ai },
    automation: { ...defaults.automation, ...stored.automation },
    system: { ...defaults.system, ...stored.system },
  }
}

export function saveOrganizationSettings(org: OrganizationSettings): void {
  void withAudit('UPDATE', 'settings', 'organization', async () => {
    const stored = readStored() ?? {}
    writePersistedMeta(STORAGE_KEY, { ...stored, organization: org })
  })
}

export function saveBrandingSettings(branding: BrandingSettings): void {
  void withAudit('UPDATE', 'settings', 'branding', async () => {
    const stored = readStored() ?? {}
    writePersistedMeta(STORAGE_KEY, { ...stored, branding })
  })
}

export function saveDonationSettings(donations: DonationSettings): void {
  void withAudit('UPDATE', 'settings', 'donations', async () => {
    const stored = readStored() ?? {}
    writePersistedMeta(STORAGE_KEY, { ...stored, donations })
  })
}

export function saveTaxSettings(tax: TaxComplianceSettings): void {
  void withAudit('UPDATE', 'settings', 'tax', async () => {
    const stored = readStored() ?? {}
    writePersistedMeta(STORAGE_KEY, { ...stored, tax })
  })
}

export function formatReceiptNumber(prefix: string, year: string, seq: number): string {
  return `${prefix}-${year.split('-')[0]}-${String(seq).padStart(4, '0')}`
}

export function parseSettingsTab(value: string | null): SettingsTab {
  const valid = SETTINGS_TABS.map((t) => t.value)
  return valid.includes(value as SettingsTab) ? (value as SettingsTab) : 'dashboard'
}
