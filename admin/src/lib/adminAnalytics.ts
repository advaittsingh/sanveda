import { getBeneficiaries } from './beneficiaryService'
import { getAllDonations } from './donationService'
import { getExpenses } from './expenseService'
import { getIncomeRecords } from './incomeService'
import { getVolunteerApplications } from './volunteerStore'
import { getAllCampaignsAdmin } from './campaignService'
import { getMemberships } from './membershipService'

export interface ChartPoint {
  label: string
  value: number
  value2?: number
}

function monthKey(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

function lastMonths(count: number) {
  const months: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }))
  }
  return months
}

export async function getDonationsOverTime(): Promise<ChartPoint[]> {
  const donations = (await getAllDonations()).filter((d) => d.status === 'completed')
  const months = lastMonths(6)
  const map = new Map(months.map((m) => [m, 0]))

  for (const d of donations) {
    const key = monthKey(d.createdAt)
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + d.amount)
  }

  return months.map((label) => ({ label, value: map.get(label) ?? 0 }))
}

export async function getCampaignPerformance(): Promise<ChartPoint[]> {
  const campaigns = await getAllCampaignsAdmin()
  return campaigns
    .slice(0, 6)
    .map((c) => ({
      label: c.title.length > 18 ? `${c.title.slice(0, 18)}…` : c.title,
      value: c.raised ?? 0,
      value2: c.goal ?? 0,
    }))
}

export async function getVolunteerGrowth(): Promise<ChartPoint[]> {
  const volunteers = await getVolunteerApplications()
  const months = lastMonths(6)
  const map = new Map(months.map((m) => [m, 0]))

  for (const v of volunteers) {
    const key = monthKey(v.createdAt)
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1)
  }

  return months.map((label) => ({ label, value: map.get(label) ?? 0 }))
}

export async function getBeneficiaryGrowth(): Promise<ChartPoint[]> {
  const beneficiaries = await getBeneficiaries()
  const months = lastMonths(6)
  const map = new Map(months.map((m) => [m, 0]))

  for (const b of beneficiaries) {
    const key = monthKey(b.createdAt)
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1)
  }

  return months.map((label) => ({ label, value: map.get(label) ?? 0 }))
}

export async function getIncomeVsExpenses(): Promise<ChartPoint[]> {
  const [income, expenses] = await Promise.all([getIncomeRecords(), getExpenses()])
  const months = lastMonths(6)
  const incomeMap = new Map(months.map((m) => [m, 0]))
  const expenseMap = new Map(months.map((m) => [m, 0]))

  for (const r of income) {
    const key = monthKey(r.incomeDate)
    if (incomeMap.has(key)) incomeMap.set(key, (incomeMap.get(key) ?? 0) + r.amount)
  }
  for (const e of expenses) {
    const key = monthKey(e.expenseDate)
    if (expenseMap.has(key)) expenseMap.set(key, (expenseMap.get(key) ?? 0) + e.amount)
  }

  return months.map((label) => ({
    label,
    value: incomeMap.get(label) ?? 0,
    value2: expenseMap.get(label) ?? 0,
  }))
}

export async function getDonationSourceBreakdown(): Promise<ChartPoint[]> {
  const donations = (await getAllDonations()).filter((d) => d.status === 'completed')
  const map = new Map<string, number>()

  for (const d of donations) {
    const key = d.campaignTitle || 'General'
    const short = key.length > 20 ? `${key.slice(0, 20)}…` : key
    map.set(short, (map.get(short) ?? 0) + d.amount)
  }

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }))
}

export async function getMemberStats() {
  const memberships = await getMemberships()
  return {
    total: memberships.length,
    active: memberships.filter((m) => m.status === 'active' || m.status === 'approved').length,
    pending: memberships.filter((m) => m.status === 'pending').length,
  }
}

export async function getBeneficiaryCount() {
  return (await getBeneficiaries()).length
}
