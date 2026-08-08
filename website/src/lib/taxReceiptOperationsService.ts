import { readPersistedMetaMap, writePersistedMetaMap } from './persistMeta'
import { downloadCsv, printHtmlReport } from './adminExport'
import { finalizeReceipt, assertReceiptMutable } from './financeLedgerService'
import { withAudit } from './auditMiddleware'
import { getAllDonations, type Donation } from './donationService'

export type TaxReceiptTab =
  | 'dashboard'
  | 'receipts'
  | 'eighty_g'
  | 'donation_receipts'
  | 'bulk'
  | 'email_history'
  | 'templates'
  | 'verification'
  | 'reports'

export type ReceiptType =
  | '80g'
  | 'general'
  | 'csr'
  | 'grant'
  | 'membership'
  | 'event'
  | 'in_kind'
  | 'fcra'

export type ReceiptStatus = 'pending' | 'generated' | 'sent' | 'failed' | 'verified'

export type EmailDeliveryStatus = 'pending' | 'sent' | 'opened' | 'failed'

export interface TaxReceiptProfile {
  id: string
  receiptNumber: string
  donationId: string
  donorId: string
  donorName: string
  pan: string
  email: string
  mobile: string
  amount: number
  transactionId: string
  paymentGateway: string
  campaign: string
  project: string
  receiptType: ReceiptType
  receiptTypeLabel: string
  eightyGEligible: boolean
  issueDate: string
  financialYear: string
  status: ReceiptStatus
  verificationUrl: string
  verificationCode: string
  emailStatus: EmailDeliveryStatus
  donationDate: string
}

export interface EightyGCertificate {
  id: string
  certificate: '80G' | '12A'
  certificateNumber: string
  status: 'Active' | 'Expired' | 'Pending'
  validTill: string
  issueDate: string
  authorizedSignatory: string
  digitalSignature: boolean
}

export interface EmailHistoryRecord {
  id: string
  receiptNumber: string
  donorName: string
  email: string
  subject: string
  status: EmailDeliveryStatus
  sentAt: string
}

export interface ReceiptTemplate {
  id: string
  name: string
  type: ReceiptType
  description: string
  isDefault: boolean
}

export interface TaxReceiptFilters {
  search: string
  type: ReceiptType | 'all'
  status: ReceiptStatus | 'all'
  campaign: string | 'all'
  financialYear: string | 'all'
}

export interface TaxReceiptDashboardData {
  receipts: TaxReceiptProfile[]
  certificates: EightyGCertificate[]
  emailHistory: EmailHistoryRecord[]
  templates: ReceiptTemplate[]
  kpis: {
    totalReceipts: number
    eightyGReceipts: number
    pendingGeneration: number
    generatedThisMonth: number
    totalTaxBenefit: number
    failedDeliveries: number
  }
  receiptsGeneratedTrend: { label: string; value: number }[]
  donationsByTaxCategory: { label: string; value: number; pct: number }[]
  aiInsights: { id: string; message: string; tone: 'info' | 'warning' | 'success' }[]
  complianceReports: string[]
  bulkPendingCount: number
}

const META_KEY = 'sanveda_tax_receipt_meta'

export const RECEIPT_TYPE_LABELS: Record<ReceiptType, string> = {
  '80g': '80G',
  general: 'General',
  csr: 'CSR',
  grant: 'Grant',
  membership: 'Membership',
  event: 'Event',
  in_kind: 'In-kind',
  fcra: 'FCRA',
}

export const COMPLIANCE_REPORT_TYPES = [
  '80G Summary Report',
  'Donation Tax Report',
  'Annual Receipt Register',
  'CSR Contribution Report',
  'FCRA Donation Report',
  'Auditor Report',
  'Income Tax Report',
] as const

export const TAX_RECEIPT_TABS: { value: TaxReceiptTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'receipts', label: 'Receipt Management' },
  { value: 'eighty_g', label: '80G Certificates' },
  { value: 'donation_receipts', label: 'Donation Receipts' },
  { value: 'bulk', label: 'Bulk Generation' },
  { value: 'email_history', label: 'Email History' },
  { value: 'templates', label: 'Templates' },
  { value: 'verification', label: 'Verification' },
  { value: 'reports', label: 'Reports' },
]

interface ReceiptMeta {
  pan?: string
  project?: string
  receiptType?: ReceiptType
  status?: ReceiptStatus
  emailStatus?: EmailDeliveryStatus
  verificationCode?: string
  issueDate?: string
}

function readMeta(): Record<string, ReceiptMeta> {
  return readPersistedMetaMap<ReceiptMeta>(META_KEY)
}

function writeMeta(map: Record<string, ReceiptMeta>) {
  writePersistedMetaMap(META_KEY, map)
}

function financialYear(date: Date): string {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month >= 3) return `${year}-${String(year + 1).slice(-2)}`
  return `${year - 1}-${String(year).slice(-2)}`
}

function inferReceiptType(donation: Donation, meta: ReceiptMeta): ReceiptType {
  void donation
  return meta.receiptType ?? 'general'
}

function inferStatus(donation: Donation, meta: ReceiptMeta): ReceiptStatus {
  if (meta.status) return meta.status
  if (donation.status !== 'completed') return 'pending'
  if (donation.receiptNumber) return meta.emailStatus === 'sent' || meta.emailStatus === 'opened' ? 'sent' : 'generated'
  return 'pending'
}

function donationToReceipt(donation: Donation, metaMap: Record<string, ReceiptMeta>): TaxReceiptProfile {
  const meta = metaMap[donation.id] ?? {}
  const receiptNumber = donation.receiptNumber ?? ''
  const receiptType = inferReceiptType(donation, meta)
  const issueDate = meta.issueDate ?? donation.createdAt
  const email = donation.donorEmail ?? ''
  const verificationCode = meta.verificationCode ?? ''

  return {
    id: donation.id,
    receiptNumber,
    donationId: donation.id,
    donorId: donation.userId ?? '',
    donorName: donation.isAnonymous ? 'Anonymous Donor' : (donation.donorName ?? 'Unknown Donor'),
    pan: meta.pan ?? donation.panNumber ?? '—',
    email,
    mobile: donation.donorPhone ?? '—',
    amount: donation.amount,
    transactionId: donation.razorpayPaymentId ?? donation.razorpayOrderId ?? '',
    paymentGateway: donation.razorpayPaymentId ? 'Razorpay' : '—',
    campaign: donation.campaignTitle,
    project: meta.project ?? donation.campaignTitle,
    receiptType,
    receiptTypeLabel: RECEIPT_TYPE_LABELS[receiptType],
    eightyGEligible: false,
    issueDate,
    financialYear: financialYear(new Date(issueDate)),
    status: inferStatus(donation, meta),
    verificationUrl: '',
    verificationCode,
    emailStatus: meta.emailStatus ?? 'pending',
    donationDate: donation.createdAt,
  }
}

function buildTemplates(): ReceiptTemplate[] {
  return [
    { id: '1', name: '80G Template', type: '80g', description: 'Standard 80G tax exemption receipt with PAN and QR verification', isDefault: true },
    { id: '2', name: 'CSR Template', type: 'csr', description: 'Corporate social responsibility donation certificate', isDefault: false },
    { id: '3', name: 'FCRA Template', type: 'fcra', description: 'Foreign contribution receipt under FCRA compliance', isDefault: false },
    { id: '4', name: 'Membership Template', type: 'membership', description: 'Membership fee receipt with validity period', isDefault: false },
    { id: '5', name: 'General Donation Template', type: 'general', description: 'Non-80G general donation acknowledgment', isDefault: false },
  ]
}

export async function getTaxReceiptDashboardData(): Promise<TaxReceiptDashboardData> {
  const donations = (await getAllDonations()).filter((d) => d.status === 'completed' || d.status === 'pending')
  const metaMap = readMeta()

  const receipts = donations.map((d) => donationToReceipt(d, metaMap))

  const eightyGReceipts = receipts.filter((r) => r.receiptType === '80g').length
  const pendingGeneration = receipts.filter((r) => r.status === 'pending').length
  const now = new Date()
  const generatedThisMonth = receipts.filter((r) => {
    const d = new Date(r.issueDate)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && r.status !== 'pending'
  }).length
  const totalTaxBenefit = receipts.filter((r) => r.eightyGEligible).reduce((s, r) => s + r.amount, 0)
  const failedDeliveries = receipts.filter((r) => r.emailStatus === 'failed' || r.status === 'failed').length

  const emailHistory: EmailHistoryRecord[] = receipts
    .filter((r) => r.emailStatus !== 'pending')
    .map((r) => ({
      id: r.id,
      receiptNumber: r.receiptNumber,
      donorName: r.donorName,
      email: r.email,
      subject: 'Your Donation Receipt from Sanveda',
      status: r.emailStatus,
      sentAt: r.issueDate,
    }))

  const categoryMap = new Map<string, number>()
  for (const r of receipts) {
    const key = r.receiptTypeLabel || r.receiptType
    categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1)
  }
  const categoryTotal = receipts.length || 1
  const donationsByTaxCategory = [...categoryMap.entries()]
    .map(([label, value]) => ({ label, value, pct: Math.round((value / categoryTotal) * 100) }))
    .sort((a, b) => b.value - a.value)

  const monthBuckets = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const receiptsGeneratedTrend = monthBuckets.map((label, i) => {
    const count = receipts.filter((r) => {
      const d = new Date(r.issueDate)
      return d.getMonth() === i && r.status !== 'pending'
    }).length
    return { label, value: count }
  }).slice(Math.max(0, now.getMonth() - 5), now.getMonth() + 1)

  const sentCount = receipts.filter((r) => r.emailStatus === 'sent' || r.emailStatus === 'opened').length
  const deliveredTotal = receipts.filter((r) => r.emailStatus !== 'pending').length
  const deliveryRate = deliveredTotal ? Math.round((sentCount / deliveredTotal) * 1000) / 10 : 0
  const missingPan = receipts.filter((r) => r.eightyGEligible && (!r.pan?.trim() || r.pan === '—')).length

  const aiInsights = [
        ...(pendingGeneration > 0
          ? [{ id: 'pending', message: `${pendingGeneration} receipts are pending generation.`, tone: 'warning' as const }]
          : []),
        ...(missingPan > 0
          ? [{ id: 'pan', message: `${missingPan} donor PAN(s) required before 80G issuance.`, tone: 'warning' as const }]
          : []),
        ...(failedDeliveries > 0
          ? [{ id: 'failed', message: `${failedDeliveries} receipt email(s) failed to deliver.`, tone: 'warning' as const }]
          : []),
        ...(deliveredTotal > 0
          ? [{ id: 'delivery', message: `Receipt delivery success rate is ${deliveryRate}%.`, tone: 'success' as const }]
          : []),
        ...(receipts.length === 0
          ? [{ id: 'empty', message: 'No receipts yet. Completed donations will appear here for 80G and tax compliance.', tone: 'info' as const }]
          : []),
      ]

  return {
    receipts,
    certificates: [],
    emailHistory,
    templates: buildTemplates(),
    kpis: {
      totalReceipts: receipts.length,
      eightyGReceipts,
      pendingGeneration,
      generatedThisMonth,
      totalTaxBenefit,
      failedDeliveries,
    },
    receiptsGeneratedTrend,
    donationsByTaxCategory,
    aiInsights,
    complianceReports: [...COMPLIANCE_REPORT_TYPES],
    bulkPendingCount: pendingGeneration,
  }
}

export function filterReceipts(receipts: TaxReceiptProfile[], filters: TaxReceiptFilters): TaxReceiptProfile[] {
  return receipts.filter((r) => {
    if (filters.type !== 'all' && r.receiptType !== filters.type) return false
    if (filters.status !== 'all' && r.status !== filters.status) return false
    if (filters.campaign !== 'all' && r.campaign !== filters.campaign) return false
    if (filters.financialYear !== 'all' && r.financialYear !== filters.financialYear) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      return (
        r.receiptNumber.toLowerCase().includes(q) ||
        r.donorName.toLowerCase().includes(q) ||
        r.pan.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.campaign.toLowerCase().includes(q) ||
        r.transactionId.toLowerCase().includes(q)
      )
    }
    return true
  })
}

export function exportReceiptsCsv(receipts: TaxReceiptProfile[]) {
  downloadCsv(
    'tax-receipts.csv',
    ['Receipt No', 'Donor', 'PAN', 'Email', 'Amount', 'Campaign', 'Type', 'Status', 'Issue Date', 'FY'],
    receipts.map((r) => [
      r.receiptNumber, r.donorName, r.pan, r.email, r.amount, r.campaign,
      r.receiptTypeLabel, r.status, new Date(r.issueDate).toLocaleDateString('en-IN'), r.financialYear,
    ]),
  )
}

export function printReceiptPdf(receipt: TaxReceiptProfile) {
  const date = new Date(receipt.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  printHtmlReport(
    `Donation Receipt — ${receipt.receiptNumber}`,
    'Sanveda Global Humanitarian Foundation',
    [
      `<div style="text-align:center;margin-bottom:24px">
        <h2 style="margin:0;font-size:22px">SANVEDA GLOBAL HUMANITARIAN FOUNDATION</h2>
        <p style="margin:8px 0 0;font-size:16px;font-weight:600">Donation Receipt${receipt.eightyGEligible ? ' — 80G Eligible' : ''}</p>
      </div>
      <table>
        <tr><td><strong>Receipt No</strong></td><td>${receipt.receiptNumber}</td></tr>
        <tr><td><strong>Date</strong></td><td>${date}</td></tr>
        <tr><td><strong>Donor</strong></td><td>${receipt.donorName}</td></tr>
        <tr><td><strong>PAN</strong></td><td>${receipt.pan}</td></tr>
        <tr><td><strong>Amount</strong></td><td>₹${receipt.amount.toLocaleString('en-IN')}</td></tr>
        <tr><td><strong>Transaction ID</strong></td><td>${receipt.transactionId}</td></tr>
        <tr><td><strong>Purpose</strong></td><td>${receipt.campaign}</td></tr>
        <tr><td><strong>80G Exemption</strong></td><td>${receipt.eightyGEligible ? 'Applicable' : 'Not Applicable'}</td></tr>
        <tr><td><strong>Financial Year</strong></td><td>${receipt.financialYear}</td></tr>
      </table>
      <div style="margin-top:32px;display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <p style="margin:0;font-size:12px;color:#64748b">QR Verification</p>
          <p style="margin:4px 0 0;font-family:monospace;font-size:11px">${receipt.verificationUrl}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#64748b">Code: ${receipt.verificationCode}</p>
        </div>
        <div style="text-align:right">
          <p style="margin:0;border-top:1px solid #000;padding-top:8px;font-size:13px">Authorized Signature</p>
        </div>
      </div>`,
    ],
  )
}

export async function generateReceipt(receiptId: string): Promise<void> {
  return withAudit('GENERATE', 'tax_receipts', receiptId, async () => {
    const data = await getTaxReceiptDashboardData()
    const receipt = data.receipts.find((r) => r.id === receiptId)
    if (receipt) await assertReceiptMutable(receipt.receiptNumber)
    const meta = readMeta()
    meta[receiptId] = {
      ...meta[receiptId],
      status: 'generated',
      issueDate: new Date().toISOString(),
    }
    writeMeta(meta)
    if (receipt) await finalizeReceipt(receipt.receiptNumber)
  })
}

export async function sendReceiptEmail(receiptId: string): Promise<void> {
  const meta = readMeta()
  meta[receiptId] = {
    ...meta[receiptId],
    status: 'sent',
    emailStatus: 'sent',
    issueDate: meta[receiptId]?.issueDate ?? new Date().toISOString(),
  }
  writeMeta(meta)
}

export async function bulkGeneratePending(): Promise<number> {
  const data = await getTaxReceiptDashboardData()
  const pending = data.receipts.filter((r) => r.status === 'pending')
  const meta = readMeta()
  pending.forEach((r) => {
    meta[r.id] = { ...meta[r.id], status: 'generated', issueDate: new Date().toISOString() }
  })
  writeMeta(meta)
  return pending.length
}

export async function verifyReceiptByNumber(receiptNumber: string): Promise<TaxReceiptProfile | null> {
  const normalized = receiptNumber.trim().toUpperCase()
  const data = await getTaxReceiptDashboardData()
  const match = data.receipts.find((r) => r.receiptNumber.toUpperCase() === normalized)
  return match ?? null
}
