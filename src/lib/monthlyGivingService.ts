import { downloadCsv, printHtmlReport, renderMetricSection, renderTableSection } from './adminExport'
import { getAllDonations } from './donationService'
import { formatIndianCompact, formatTrend } from './formatIndian'
import { isProductionDataMode } from './persistMeta'

const MONTHLY_GIVING_KEY = 'sanveda_monthly_giving_subscribers'

type PlanId = 'supporter' | 'champion' | 'patron'
type SubscriberStatus = 'active' | 'paused' | 'cancelled'
type ChargeStatus = 'paid' | 'failed'

interface PlanDefinition {
  id: PlanId
  name: string
  amount: number
}

export interface MonthlyGivingAuditLog {
  id: string
  action: string
  detail: string
  at: string
}

export interface MonthlyGivingSubscriber {
  id: string
  donorName: string
  donorEmail: string
  donorPhone: string
  planId: PlanId
  amount: number
  startDate: string
  nextBillingDate: string
  lastPaymentDate: string
  status: SubscriberStatus
  lastChargeStatus: ChargeStatus
  lifetimeValue: number
  monthsActive: number
  cancelledAt?: string
  pausedAt?: string
  lastContactedAt?: string
  notes?: string
  auditLogs: MonthlyGivingAuditLog[]
}

export interface MonthlyGivingDashboardData {
  subscribers: MonthlyGivingSubscriber[]
  kpis: {
    activeSubscribers: number
    monthlyRecurringRevenue: number
    newThisMonth: number
    cancelledThisMonth: number
    renewalRate: number
    lifetimeValue: number
    subscriberTrend: string
    subscriberTrendPositive: boolean
    revenueTrend: string
    revenueTrendPositive: boolean
  }
  revenueTrend: { label: string; value: number }[]
  subscriberGrowth: { label: string; newSubscribers: number; cancelledSubscribers: number }[]
  planSummaries: Array<{ id: PlanId; name: string; amount: number; subscribers: number; mrr: number }>
  churn: { currentChurn: number; retention: number; renewals: number }
  recentSubscribers: MonthlyGivingSubscriber[]
  failedRenewals: MonthlyGivingSubscriber[]
  topSubscribers: Array<{ name: string; value: number; planName: string }>
  forecast: { nextMonth: number; nextQuarter: number; nextYear: number; yoyGrowth: number }
}

const PLAN_DEFINITIONS: PlanDefinition[] = [
  { id: 'supporter', name: 'Supporter', amount: 499 },
  { id: 'champion', name: 'Champion', amount: 999 },
  { id: 'patron', name: 'Patron', amount: 2499 },
]

const FIRST_NAMES = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Rajesh', 'Ankit', 'Meera', 'Pooja', 'Nikhil', 'Ritika',
  'Sanjay', 'Kavya', 'Dev', 'Asha', 'Manish', 'Neha', 'Abhishek', 'Isha', 'Rohan', 'Tanvi',
]

const LAST_NAMES = [
  'Sharma', 'Verma', 'Singh', 'Patel', 'Nair', 'Kumar', 'Agarwal', 'Joshi', 'Reddy', 'Menon',
  'Kapoor', 'Bose', 'Yadav', 'Mishra', 'Gupta', 'Saxena', 'Iyer', 'Das', 'Kulkarni', 'Pillai',
]

function readSubscribers(): MonthlyGivingSubscriber[] {
  try {
    const raw = localStorage.getItem(MONTHLY_GIVING_KEY)
    return raw ? (JSON.parse(raw) as MonthlyGivingSubscriber[]) : []
  } catch {
    return []
  }
}

function writeSubscribers(subscribers: MonthlyGivingSubscriber[]) {
  localStorage.setItem(MONTHLY_GIVING_KEY, JSON.stringify(subscribers))
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

function formatMonth(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { month: 'short' })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function buildAudit(action: string, detail: string): MonthlyGivingAuditLog {
  return {
    id: crypto.randomUUID(),
    action,
    detail,
    at: new Date().toISOString(),
  }
}

function getPlan(planId: PlanId) {
  return PLAN_DEFINITIONS.find((plan) => plan.id === planId) ?? PLAN_DEFINITIONS[0]
}

function namePool(realDonors: string[]): string[] {
  const synthetic = FIRST_NAMES.flatMap((first) => LAST_NAMES.map((last) => `${first} ${last}`))
  return Array.from(new Set([...realDonors, ...synthetic]))
}

function planForIndex(index: number): PlanId {
  if (index < 65) return 'supporter'
  if (index < 177) return 'champion'
  return 'patron'
}

function buildSeedSubscriber(index: number, donors: string[]): MonthlyGivingSubscriber {
  const now = new Date()
  const baseName = donors[index % donors.length] ?? `Donor ${index + 1}`
  const safeName = baseName.replace(/\s+/g, '.').toLowerCase()
  const planId = index < 248 ? planForIndex(index) : PLAN_DEFINITIONS[index % PLAN_DEFINITIONS.length].id
  const plan = getPlan(planId)
  const monthsActive = index < 18 ? 1 + (index % 2) : 2 + (index % 18)
  const startDateBase =
    index < 18
      ? new Date(now.getFullYear(), now.getMonth(), 1 + (index % 18))
      : new Date(now.getFullYear(), now.getMonth() - monthsActive, 1 + (index % 24))

  const status: SubscriberStatus =
    index < 248 ? 'active' :
    index < 266 ? 'paused' : 'cancelled'

  const failedRenewal = status === 'active' && index % 41 === 0
  const nextBillingDate =
    failedRenewal
      ? new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - (index % 5)))
      : addMonths(startDateBase, monthsActive + 1)

  const cancelledAt =
    status === 'cancelled'
      ? index < 273
        ? new Date(now.getFullYear(), now.getMonth(), 2 + (index - 266)).toISOString()
        : new Date(now.getFullYear(), now.getMonth() - 1 - ((index - 266) % 4), 5 + (index % 14)).toISOString()
      : undefined

  const pausedAt =
    status === 'paused'
      ? new Date(now.getFullYear(), now.getMonth() - ((index - 248) % 2), 8 + ((index - 248) % 10)).toISOString()
      : undefined

  const paidMonths = status === 'cancelled' ? Math.max(1, monthsActive - 1) : monthsActive
  const lifetimeValue = plan.amount * paidMonths
  const lastPaymentDate = new Date(nextBillingDate.getTime() - 30 * 86400000).toISOString()

  return {
    id: `subscriber-${index + 1}`,
    donorName: baseName,
    donorEmail: `${safeName}+${index + 1}@example.org`,
    donorPhone: `98${String(10000000 + index).slice(-8)}`,
    planId,
    amount: plan.amount,
    startDate: startDateBase.toISOString(),
    nextBillingDate: nextBillingDate.toISOString(),
    lastPaymentDate,
    status,
    lastChargeStatus: failedRenewal ? 'failed' : 'paid',
    lifetimeValue,
    monthsActive: paidMonths,
    cancelledAt,
    pausedAt,
    notes:
      planId === 'patron'
        ? 'Potential candidate for stewardship and beneficiary updates.'
        : planId === 'champion'
          ? 'Responds well to milestone-based impact emails.'
          : 'Prefers concise monthly updates and tax receipt reminders.',
    auditLogs: [
      {
        id: crypto.randomUUID(),
        action: 'Subscription created',
        detail: `${getPlan(planId).name} plan activated`,
        at: startDateBase.toISOString(),
      },
      {
        id: crypto.randomUUID(),
        action: failedRenewal ? 'Renewal failed' : 'Renewal collected',
        detail: failedRenewal ? 'Auto-debit failed and needs retry.' : `Collected ${formatIndianCompact(plan.amount)}`,
        at: lastPaymentDate,
      },
    ],
  }
}

async function ensureSubscribers(): Promise<MonthlyGivingSubscriber[]> {
  const existing = readSubscribers()
  if (existing.length) return existing
  if (isProductionDataMode()) return []

  const donations = await getAllDonations()
  const realDonors = donations
    .map((donation) => donation.donorName ?? donation.donorEmail)
    .filter((value): value is string => Boolean(value))
  const donors = namePool(realDonors)
  const seeded = Array.from({ length: 286 }, (_, index) => buildSeedSubscriber(index, donors))
  writeSubscribers(seeded)
  return seeded
}

function updateSubscriberRecord(id: string, updater: (subscriber: MonthlyGivingSubscriber) => MonthlyGivingSubscriber) {
  const subscribers = readSubscribers()
  const next = subscribers.map((subscriber) => (subscriber.id === id ? updater(subscriber) : subscriber))
  writeSubscribers(next)
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function monthlyBuckets(length: number) {
  const now = new Date()
  return Array.from({ length }, (_, index) => {
    const bucketDate = new Date(now.getFullYear(), now.getMonth() - (length - 1 - index), 1)
    return {
      key: monthKey(bucketDate),
      label: bucketDate.toLocaleDateString('en-IN', { month: 'short' }),
      start: bucketDate,
      end: new Date(bucketDate.getFullYear(), bucketDate.getMonth() + 1, 1),
    }
  })
}

function isSubscriberActiveInMonth(subscriber: MonthlyGivingSubscriber, start: Date, end: Date) {
  const startedBeforeEnd = subscriber.startDate < end.toISOString()
  const notCancelledBeforeStart = !subscriber.cancelledAt || subscriber.cancelledAt >= start.toISOString()
  return startedBeforeEnd && notCancelledBeforeStart
}

export async function getMonthlyGivingDashboardData(): Promise<MonthlyGivingDashboardData> {
  const subscribers = await ensureSubscribers()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const activeSubscribers = subscribers.filter((subscriber) => subscriber.status === 'active')
  const previousMonthActive = subscribers.filter((subscriber) => {
    const startedBeforePreviousMonthEnd = subscriber.startDate < monthStart.toISOString()
    const notCancelledBeforePreviousMonth = !subscriber.cancelledAt || subscriber.cancelledAt >= previousMonthStart.toISOString()
    return startedBeforePreviousMonthEnd && notCancelledBeforePreviousMonth
  })
  const previousMrr = previousMonthActive
    .filter((subscriber) => subscriber.status !== 'paused')
    .reduce((sum, subscriber) => sum + subscriber.amount, 0)
  const currentMrr = activeSubscribers.reduce((sum, subscriber) => sum + subscriber.amount, 0)

  const newThisMonth = subscribers.filter((subscriber) => subscriber.startDate >= monthStart.toISOString()).length
  const cancelledThisMonth = subscribers.filter((subscriber) => (subscriber.cancelledAt ?? '') >= monthStart.toISOString()).length
  const paidRenewals = activeSubscribers.filter((subscriber) => subscriber.lastChargeStatus === 'paid').length
  const renewalRate = activeSubscribers.length ? Math.round((paidRenewals / activeSubscribers.length) * 100) : 0
  const averageLifetimeValue = subscribers.length
    ? Math.round(subscribers.reduce((sum, subscriber) => sum + subscriber.lifetimeValue, 0) / subscribers.length)
    : 0

  const subscriberTrend = formatTrend(activeSubscribers.length, previousMonthActive.length)
  const revenueTrend = formatTrend(currentMrr, previousMrr)

  const revenueTrendData = monthlyBuckets(7).map((bucket) => ({
    label: bucket.label,
    value: subscribers
      .filter((subscriber) => subscriber.status !== 'paused' && isSubscriberActiveInMonth(subscriber, bucket.start, bucket.end))
      .reduce((sum, subscriber) => sum + subscriber.amount, 0),
  }))

  const growthData = monthlyBuckets(6).map((bucket) => ({
    label: bucket.label,
    newSubscribers: subscribers.filter(
      (subscriber) => subscriber.startDate >= bucket.start.toISOString() && subscriber.startDate < bucket.end.toISOString(),
    ).length,
    cancelledSubscribers: subscribers.filter((subscriber) => {
      return Boolean(subscriber.cancelledAt && subscriber.cancelledAt >= bucket.start.toISOString() && subscriber.cancelledAt < bucket.end.toISOString())
    }).length,
  }))

  const planSummaries = PLAN_DEFINITIONS.map((plan) => {
    const list = activeSubscribers.filter((subscriber) => subscriber.planId === plan.id)
    return {
      id: plan.id,
      name: plan.name,
      amount: plan.amount,
      subscribers: list.length,
      mrr: list.reduce((sum, subscriber) => sum + subscriber.amount, 0),
    }
  })

  const monthOpeningBase = previousMonthActive.length || 1
  const churnValue = Number(((cancelledThisMonth / monthOpeningBase) * 100).toFixed(1))
  const retention = Number((100 - churnValue).toFixed(1))

  const recentSubscribers = [...subscribers]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 12)

  const failedRenewals = activeSubscribers
    .filter((subscriber) => subscriber.lastChargeStatus === 'failed')
    .sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate))
    .slice(0, 5)

  const topSubscribers = [...subscribers]
    .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
    .slice(0, 5)
    .map((subscriber) => ({
      name: subscriber.donorName,
      value: subscriber.lifetimeValue,
      planName: getPlan(subscriber.planId).name,
    }))

  const nextYear = Math.round(currentMrr * 12 * (retention / 100))
  const lastYearBaseline = Math.round(previousMrr * 12)
  const yoyGrowth =
    lastYearBaseline > 0
      ? Number((((nextYear - lastYearBaseline) / lastYearBaseline) * 100).toFixed(1))
      : 0

  const forecast = {
    nextMonth: Math.round(currentMrr * (renewalRate / 100)),
    nextQuarter: Math.round(currentMrr * 3 * (retention / 100)),
    nextYear,
    yoyGrowth,
  }

  return {
    subscribers,
    kpis: {
      activeSubscribers: activeSubscribers.length,
      monthlyRecurringRevenue: currentMrr,
      newThisMonth,
      cancelledThisMonth,
      renewalRate,
      lifetimeValue: averageLifetimeValue,
      subscriberTrend: subscriberTrend.text,
      subscriberTrendPositive: subscriberTrend.positive,
      revenueTrend: revenueTrend.text,
      revenueTrendPositive: revenueTrend.positive,
    },
    revenueTrend: revenueTrendData,
    subscriberGrowth: growthData,
    planSummaries,
    churn: {
      currentChurn: churnValue,
      retention,
      renewals: renewalRate,
    },
    recentSubscribers,
    failedRenewals,
    topSubscribers,
    forecast,
  }
}

export async function pauseSubscriber(id: string) {
  await ensureSubscribers()
  updateSubscriberRecord(id, (subscriber) => ({
    ...subscriber,
    status: 'paused',
    pausedAt: new Date().toISOString(),
    auditLogs: [...subscriber.auditLogs, buildAudit('Subscription paused', 'Paused by admin from Monthly Giving dashboard.')],
  }))
}

export async function resumeSubscriber(id: string) {
  await ensureSubscribers()
  updateSubscriberRecord(id, (subscriber) => ({
    ...subscriber,
    status: 'active',
    pausedAt: undefined,
    lastChargeStatus: 'paid',
    nextBillingDate: addMonths(new Date(), 1).toISOString(),
    auditLogs: [...subscriber.auditLogs, buildAudit('Subscription resumed', 'Subscriber moved back to active billing.')],
  }))
}

export async function cancelSubscriber(id: string) {
  await ensureSubscribers()
  updateSubscriberRecord(id, (subscriber) => ({
    ...subscriber,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    auditLogs: [...subscriber.auditLogs, buildAudit('Subscription cancelled', 'Subscriber cancelled from admin operations desk.')],
  }))
}

export async function retryFailedRenewal(id: string) {
  await ensureSubscribers()
  updateSubscriberRecord(id, (subscriber) => ({
    ...subscriber,
    status: 'active',
    lastChargeStatus: 'paid',
    lastPaymentDate: new Date().toISOString(),
    nextBillingDate: addMonths(new Date(), 1).toISOString(),
    lifetimeValue: subscriber.lifetimeValue + subscriber.amount,
    monthsActive: subscriber.monthsActive + 1,
    auditLogs: [...subscriber.auditLogs, buildAudit('Retry successful', `Renewal recovered for ${formatIndianCompact(subscriber.amount)}.`)],
  }))
}

export async function markSubscriberContacted(id: string) {
  await ensureSubscribers()
  updateSubscriberRecord(id, (subscriber) => ({
    ...subscriber,
    lastContactedAt: new Date().toISOString(),
    auditLogs: [...subscriber.auditLogs, buildAudit('Reminder sent', 'Billing reminder shared with subscriber.')],
  }))
}

export async function updateSubscriberNotes(id: string, notes: string) {
  await ensureSubscribers()
  updateSubscriberRecord(id, (subscriber) => ({
    ...subscriber,
    notes,
  }))
}

export function exportMonthlyGivingCsv(subscribers: MonthlyGivingSubscriber[]) {
  downloadCsv(
    'monthly-giving.csv',
    ['Donor', 'Plan', 'Amount', 'Start', 'Next Billing', 'Status', 'Lifetime Value'],
    subscribers.map((subscriber) => [
      subscriber.donorName,
      getPlan(subscriber.planId).name,
      subscriber.amount,
      formatDate(subscriber.startDate),
      formatDate(subscriber.nextBillingDate),
      subscriber.status,
      subscriber.lifetimeValue,
    ]),
  )
}

export function exportMonthlyGivingPdf(data: MonthlyGivingDashboardData) {
  printHtmlReport('Monthly Giving', 'Recurring donor dashboard and retention snapshot.', [
    renderMetricSection('KPIs', [
      { label: 'Active Subscribers', value: String(data.kpis.activeSubscribers) },
      { label: 'MRR', value: formatIndianCompact(data.kpis.monthlyRecurringRevenue) },
      { label: 'Renewal Rate', value: `${data.kpis.renewalRate}%` },
      { label: 'Lifetime Value', value: formatIndianCompact(data.kpis.lifetimeValue) },
    ]),
    renderTableSection(
      'Top Subscribers',
      ['Donor', 'Plan', 'Lifetime Value'],
      data.topSubscribers.map((subscriber) => [
        subscriber.name,
        subscriber.planName,
        formatIndianCompact(subscriber.value),
      ]),
    ),
    renderTableSection(
      'Recent Subscribers',
      ['Donor', 'Plan', 'Amount', 'Start', 'Next Billing', 'Status'],
      data.recentSubscribers.slice(0, 8).map((subscriber) => [
        subscriber.donorName,
        getPlan(subscriber.planId).name,
        formatIndianCompact(subscriber.amount),
        formatMonth(subscriber.startDate),
        formatMonth(subscriber.nextBillingDate),
        subscriber.status,
      ]),
    ),
  ])
}
