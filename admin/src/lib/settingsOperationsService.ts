import { BRAND, C } from '../constants/brand'
import { DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS } from '../constants/publicDocuments'

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
  authorizedSignature?: string
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

export interface PublicComplianceDocument {
  id: string
  label: string
  fileUrl: string
  enabled: boolean
  sortOrder: number
}

export interface PublicDocumentsSettings {
  documents: PublicComplianceDocument[]
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
  status: 'connected' | 'disabled'
  category: string
}

export interface SettingsDashboardData {
  organization: OrganizationSettings
  branding: BrandingSettings
  donations: DonationSettings
  paymentGateways: PaymentGateway[]
  tax: TaxComplianceSettings
  publicDocuments: PublicDocumentsSettings
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
      {
        id: 'razorpay',
        provider: 'Razorpay',
        status: 'disabled',
        apiKey: '',
        secretKey: '',
        webhookUrl: 'https://sanveda.vercel.app/api/webhooks/razorpay',
        settlementAccount: '',
        mode: 'live',
      },
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
    publicDocuments: {
      documents: DEFAULT_PUBLIC_COMPLIANCE_DOCUMENTS,
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
      { id: '1', name: 'Neon', status: 'disabled', category: 'Database' },
      { id: '10', name: 'Vercel Blob (Private)', status: 'disabled', category: 'Storage' },
      { id: '2', name: 'Razorpay', status: 'disabled', category: 'Payments' },
      { id: '3', name: 'Resend', status: 'disabled', category: 'Email' },
      { id: '4', name: 'WhatsApp', status: 'disabled', category: 'Messaging' },
      { id: '5', name: 'Google Analytics', status: 'disabled', category: 'Analytics' },
      { id: '6', name: 'Meta Pixel', status: 'disabled', category: 'Analytics' },
      { id: '7', name: 'Google Maps', status: 'disabled', category: 'Maps' },
      { id: '8', name: 'AWS S3', status: 'disabled', category: 'Storage' },
      { id: '9', name: 'Cloudflare', status: 'disabled', category: 'CDN' },
    ],
    finance: {
      financialYear: '2026-27',
      currency: 'INR',
      expenseCategories: ['Programs', 'Operations', 'Salaries', 'Travel', 'Marketing', 'Compliance'],
      incomeCategories: ['Donations', 'Grants', 'CSR', 'Membership', 'Events', 'Interest'],
      bankAccounts: [],
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
      dailyBackup: false,
      weeklySnapshot: false,
      lastBackup: '—',
      disasterRecovery: false,
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
    },
    workflows: [
      { id: '1', name: 'Campaign', steps: ['Campaign Draft', 'Manager', 'Director'] },
      { id: '2', name: 'Expense', steps: ['Expense Submitted', 'Finance', 'Director'] },
      { id: '3', name: 'Volunteer', steps: ['Volunteer Application', 'Volunteer Manager', 'Admin'] },
    ],
    analytics: {
      storageUsed: '0 GB',
      apiCalls: 0,
      emailsSent: 0,
      smsSent: 0,
      transactions: 0,
      users: 0,
      campaigns: 0,
      donations: 0,
    },
    aiInsights: [
      { id: '1', message: 'Integration status is shown only when it can be verified.', tone: 'info' as const },
      { id: '2', message: 'Configure payment and email secrets in the Vercel environment.', tone: 'info' as const },
    ],
  }
}

export async function getSettingsDashboardData(): Promise<SettingsDashboardData> {
  return defaultData()
}

export function saveOrganizationSettings(org: OrganizationSettings): void {
  void org
  throw new Error('Organization settings persistence is not implemented.')
}

export function saveBrandingSettings(branding: BrandingSettings): void {
  void branding
  throw new Error('Branding settings persistence is not implemented.')
}

export function saveDonationSettings(donations: DonationSettings): void {
  void donations
  throw new Error('Donation settings persistence is not implemented.')
}

export function saveTaxSettings(tax: TaxComplianceSettings): void {
  void tax
  throw new Error('Tax settings persistence is not implemented.')
}

export function savePublicDocumentsSettings(publicDocuments: PublicDocumentsSettings): void {
  void publicDocuments
  throw new Error('Public document settings persistence is not implemented.')
}

export function formatReceiptNumber(prefix: string, year: string, seq: number): string {
  return `${prefix}-${year.split('-')[0]}-${String(seq).padStart(4, '0')}`
}

export function parseSettingsTab(value: string | null): SettingsTab {
  const valid = SETTINGS_TABS.map((t) => t.value)
  return valid.includes(value as SettingsTab) ? (value as SettingsTab) : 'dashboard'
}
