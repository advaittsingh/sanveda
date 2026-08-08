import type { AuthProfile } from '../context/AuthContext'
import type { ClientSession } from './authClient'
import { currentFinancialYear } from './formatIndian'
import { getDonationsByUser, type Donation } from './donationService'
import { getMonthlySubscriptionForDonor } from './monthlyGivingService'
import { dataApi } from './dataApiClient'

export type DonorTier = 'first-time' | 'supporter' | 'champion' | 'patron' | 'legacy'

export interface DonorPreferences {
  address: string
  pan: string
  aadhaar: string
  taxOptIn80G: boolean
  emailUpdates: boolean
  smsUpdates: boolean
  whatsappUpdates: boolean
}

export interface SavedCampaign {
  slug: string
  title: string
  savedAt: string
}

export interface DonorNotification {
  id: string
  message: string
  tone: 'success' | 'info'
  at: string
}

export interface ImpactCause {
  name: string
  beneficiaries: number
  donated: number
}

export interface TimelineEvent {
  year: number
  label: string
}

export interface DonorMonthlyGiving {
  status: 'pending' | 'active' | 'paused' | 'cancelled' | 'completed' | 'failed' | 'none'
  amount: number
  planName: string
  nextDebit: string | null
  subscriberId: string | null
}

export interface TaxReceiptItem {
  id: string
  receiptNumber: string
  date: string
  amount: number
  campaign: string
  financialYear: string
  donation: Donation
}

export interface DonorPortalData {
  profile: {
    name: string
    email: string
    donorId: string
    memberSince: string
    tier: DonorTier
    tierLabel: string
    phone: string
  }
  kpis: {
    totalDonated: number
    donationsMade: number
    taxReceipts: number
    activeMonthlyGiving: boolean
    campaignsSupported: number
    lastDonationAmount: number
    lastDonationDate: string | null
  }
  donations: Donation[]
  monthlyGiving: DonorMonthlyGiving
  taxReceipts: TaxReceiptItem[]
  allTaxReceipts: TaxReceiptItem[]
  impact: { causes: ImpactCause[]; totalBeneficiaries: number }
  savedCampaigns: SavedCampaign[]
  notifications: DonorNotification[]
  timeline: TimelineEvent[]
  preferences: DonorPreferences
}

const TIER_LABELS: Record<DonorTier, string> = {
  'first-time': 'First-Time Donor',
  supporter: 'Supporter',
  champion: 'Champion',
  patron: 'Patron',
  legacy: 'Legacy Donor',
}

function defaultPreferences(): DonorPreferences {
  return {
    address: '',
    pan: '',
    aadhaar: '',
    taxOptIn80G: true,
    emailUpdates: true,
    smsUpdates: false,
    whatsappUpdates: true,
  }
}

export function readDonorPreferences(userId: string): DonorPreferences {
  void userId
  return defaultPreferences()
}

export function writeDonorPreferences(userId: string, prefs: DonorPreferences): void {
  void userId
  void prefs
  throw new Error('Donor preferences are not yet backed by a canonical database table.')
}

const SAVED_CAMPAIGNS_KEY = (userId: string) => `sanveda:saved-campaigns:${userId}`

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  } catch {
    return false
  }
}

export function readSavedCampaigns(userId: string): SavedCampaign[] {
  if (!userId || !canUseLocalStorage()) return []
  try {
    const raw = window.localStorage.getItem(SAVED_CAMPAIGNS_KEY(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is SavedCampaign =>
        Boolean(
          item &&
            typeof item === 'object' &&
            typeof (item as SavedCampaign).slug === 'string' &&
            typeof (item as SavedCampaign).title === 'string',
        ),
      )
      .map((item) => ({
        slug: item.slug,
        title: item.title,
        savedAt: typeof item.savedAt === 'string' ? item.savedAt : new Date().toISOString(),
      }))
  } catch {
    return []
  }
}

export function writeSavedCampaigns(userId: string, items: SavedCampaign[]): void {
  if (!userId || !canUseLocalStorage()) return
  try {
    window.localStorage.setItem(
      SAVED_CAMPAIGNS_KEY(userId),
      JSON.stringify(items.slice(0, 50)),
    )
    window.dispatchEvent(
      new CustomEvent('sanveda:saved-campaigns-changed', { detail: { userId } }),
    )
  } catch {
    // Quota / private mode — keep UI usable without throwing.
  }
}

export function toggleSavedCampaign(userId: string, slug: string, title: string): SavedCampaign[] {
  const existing = readSavedCampaigns(userId)
  const index = existing.findIndex((c) => c.slug === slug)
  if (index >= 0) {
    const next = existing.filter((c) => c.slug !== slug)
    writeSavedCampaigns(userId, next)
    return next
  }
  const next = [{ slug, title, savedAt: new Date().toISOString() }, ...existing]
  writeSavedCampaigns(userId, next)
  return next
}

type PortalUser = ClientSession['user']

function donorIdForUser(user: PortalUser): string {
  const year = new Date(user.createdAt).getFullYear()
  const suffix = user.id.replace(/-/g, '').slice(0, 4).toUpperCase()
  return `DON-${year}-${suffix}`
}

function tierForTotal(total: number, donationCount: number): DonorTier {
  if (donationCount === 0) return 'first-time'
  if (total >= 500000) return 'legacy'
  if (total >= 100000) return 'patron'
  if (total >= 25000) return 'champion'
  return 'supporter'
}

function causeForCampaign(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('education') || t.includes('school') || t.includes('child')) return 'Education'
  if (t.includes('health') || t.includes('medical') || t.includes('cancer')) return 'Healthcare'
  if (t.includes('food') || t.includes('hunger') || t.includes('meal')) return 'Food Support'
  if (t.includes('rural') || t.includes('village') || t.includes('farm')) return 'Rural Development'
  if (t.includes('women') || t.includes('girl')) return 'Women Empowerment'
  return 'General Humanitarian Aid'
}

function financialYearForDate(iso: string): string {
  const d = new Date(iso)
  const year = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1
  const next = (year + 1) % 100
  return `${year}-${String(next).padStart(2, '0')}`
}

function buildImpact(completed: Donation[]): { causes: ImpactCause[]; totalBeneficiaries: number } {
  const map = new Map<string, { donated: number; beneficiaries: number }>()
  for (const d of completed) {
    const name = causeForCampaign(d.campaignTitle)
    const entry = map.get(name) ?? { donated: 0, beneficiaries: 0 }
    entry.donated += d.amount
    map.set(name, entry)
  }
  const causes = [...map.entries()]
    .map(([name, v]) => ({ name, donated: v.donated, beneficiaries: v.beneficiaries }))
    .sort((a, b) => b.donated - a.donated)
  return { causes, totalBeneficiaries: 0 }
}

function buildTimeline(
  user: PortalUser,
  completed: Donation[],
  monthlyActive: boolean,
): TimelineEvent[] {
  const events: TimelineEvent[] = []
  const joinYear = new Date(user.createdAt).getFullYear()
  events.push({ year: joinYear, label: 'Joined Sanveda' })

  const byYear = new Map<number, number>()
  for (const d of completed) {
    const y = new Date(d.createdAt).getFullYear()
    byYear.set(y, (byYear.get(y) ?? 0) + d.amount)
  }
  for (const [year, total] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
    events.push({ year, label: `Donated ₹${total.toLocaleString('en-IN')}` })
  }

  if (monthlyActive) {
    events.push({ year: new Date().getFullYear(), label: 'Became Monthly Donor' })
  }

  const uniqueYears = new Set(events.map((e) => e.year))
  return [...uniqueYears]
    .sort((a, b) => a - b)
    .flatMap((year) => events.filter((e) => e.year === year))
}

function buildNotifications(completed: Donation[]): DonorNotification[] {
  const items: DonorNotification[] = []
  for (const d of completed.slice(0, 5)) {
    items.push({
      id: `thanks-${d.id}`,
      message: `Thank you for donating ₹${d.amount.toLocaleString('en-IN')} to ${d.campaignTitle}`,
      tone: 'success',
      at: d.createdAt,
    })
    if (d.receiptNumber) {
      items.push({
        id: `receipt-${d.id}`,
        message: `Tax receipt ${d.receiptNumber} generated for your donation`,
        tone: 'info',
        at: d.createdAt,
      })
    }
  }
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8)
}

export async function getDonorPortalData(
  user: PortalUser,
  authProfile: AuthProfile | null,
): Promise<DonorPortalData> {
  const donations = await getDonationsByUser(user.id)
  const completed = donations.filter((d) => d.status === 'completed')
  const totalDonated = completed.reduce((s, d) => s + d.amount, 0)
  const receipts = completed.filter((d) => d.receiptNumber)
  const campaigns = new Set(completed.map((d) => d.campaignSlug ?? d.campaignTitle))
  const last = completed[0]

  const email = user.email ?? ''
  const name =
    authProfile?.fullName?.trim() ||
    user.name.trim() ||
    email.split('@')[0]?.replace(/[._]/g, ' ') ||
    'Donor'

  const subscription = await getMonthlySubscriptionForDonor(email)
  const monthlyGiving: DonorMonthlyGiving = subscription
    ? {
        status: subscription.status,
        amount: subscription.amount,
        planName: subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1),
        nextDebit: subscription.status === 'active' ? subscription.nextBillingDate : null,
        subscriberId: subscription.id,
      }
    : { status: 'none', amount: 0, planName: '', nextDebit: null, subscriberId: null }

  const memberSinceDate = completed.length
    ? completed[completed.length - 1].createdAt
    : user.createdAt.toISOString()

  const tier = tierForTotal(totalDonated, completed.length)

  const taxReceipts: TaxReceiptItem[] = receipts.map((d) => ({
    id: d.id,
    receiptNumber: d.receiptNumber!,
    date: d.createdAt,
    amount: d.amount,
    campaign: d.campaignTitle,
    financialYear: financialYearForDate(d.createdAt),
    donation: d,
  }))

  return {
    profile: {
      name,
      email,
      donorId: donorIdForUser(user),
      memberSince: new Date(memberSinceDate).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      }),
      tier,
      tierLabel: TIER_LABELS[tier],
      phone: authProfile?.phone ?? '',
    },
    kpis: {
      totalDonated,
      donationsMade: completed.length,
      taxReceipts: receipts.length,
      activeMonthlyGiving: monthlyGiving.status === 'active',
      campaignsSupported: campaigns.size,
      lastDonationAmount: last?.amount ?? 0,
      lastDonationDate: last?.createdAt ?? null,
    },
    donations,
    monthlyGiving,
    taxReceipts: taxReceipts.filter((r) => r.financialYear === currentFinancialYear()),
    allTaxReceipts: taxReceipts,
    impact: buildImpact(completed),
    savedCampaigns: readSavedCampaigns(user.id),
    notifications: buildNotifications(completed),
    timeline: buildTimeline(user, completed, monthlyGiving.status === 'active'),
    preferences: readDonorPreferences(user.id),
  }
}

export async function updateDonorProfile(
  userId: string,
  patch: { fullName?: string; phone?: string; preferences?: Partial<DonorPreferences> },
): Promise<void> {
  if (patch.preferences) {
    const current = readDonorPreferences(userId)
    writeDonorPreferences(userId, { ...current, ...patch.preferences })
  }

  if (patch.fullName !== undefined || patch.phone !== undefined) {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.fullName !== undefined) row.full_name = patch.fullName
    if (patch.phone !== undefined) row.phone = patch.phone
    const { error } = await dataApi.table('profiles').update(row).eq('id', userId)
    if (error) throw new Error(error.message)
  }
}

export function paymentStatusLabel(status: Donation['status']): string {
  if (status === 'completed') return 'Success'
  if (status === 'pending') return 'Pending'
  if (status === 'failed') return 'Failed'
  return 'Refunded'
}
