import {
  downloadCsv,
  printHtmlReport,
  renderMetricSection,
  renderTableSection,
} from './adminExport'
import { formatIndianCompact, formatTrend } from './formatIndian'
import { dataApi } from './dataApiClient'

type PlanId = 'supporter' | 'champion' | 'patron'
export type SubscriberStatus =
  | 'pending'
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'completed'
  | 'failed'
type ChargeStatus = 'paid' | 'failed' | 'pending'

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
  planSummaries: Array<{
    id: PlanId
    name: string
    amount: number
    subscribers: number
    mrr: number
  }>
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

function formatMonth(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { month: 'short' })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getPlan(planId: PlanId) {
  return PLAN_DEFINITIONS.find((plan) => plan.id === planId) ?? PLAN_DEFINITIONS[0]
}

function planForAmount(amount: number): PlanId {
  if (amount >= 2499) return 'patron'
  if (amount >= 999) return 'champion'
  return 'supporter'
}

async function fetchSubscribers(email?: string): Promise<MonthlyGivingSubscriber[]> {
  let subscriptionsQuery = dataApi
    .table('recurring_donations')
    .select('*')
    .order('created_at', { ascending: false })
  if (email) subscriptionsQuery = subscriptionsQuery.eq('donor_email', email.trim().toLowerCase())
  const { data: subscriptions, error } = await subscriptionsQuery
  if (error) throw new Error(error.message)
  const ids = (subscriptions ?? []).map((row) => String(row.id))
  if (!ids.length) return []

  const [{ data: attempts, error: attemptsError }, { data: audits, error: auditsError }] = email
    ? [
        { data: [], error: null },
        { data: [], error: null },
      ]
    : await Promise.all([
        dataApi
          .table('recurring_payment_attempts')
          .select('*')
          .in('recurring_donation_id', ids)
          .order('scheduled_for', { ascending: false }),
        dataApi
          .table('audit_logs')
          .select('*')
          .eq('entity_type', 'recurring_donations')
          .in('entity_id', ids)
          .order('occurred_at', { ascending: false }),
      ])
  if (attemptsError) throw new Error(attemptsError.message)
  if (auditsError) throw new Error(auditsError.message)

  return (subscriptions ?? []).map((row) => {
    const subscriberAttempts = (attempts ?? []).filter(
      (attempt) => attempt.recurring_donation_id === row.id,
    )
    const successful = subscriberAttempts.filter((attempt) => attempt.status === 'succeeded')
    const latest = subscriberAttempts[0]
    const planId = planForAmount(Number(row.amount))
    return {
      id: String(row.id),
      donorName: row.donor_name ? String(row.donor_name) : '',
      donorEmail: row.donor_email ? String(row.donor_email) : '',
      donorPhone: row.donor_phone ? String(row.donor_phone) : '',
      planId,
      amount: Number(row.amount),
      startDate: String(row.starts_at),
      nextBillingDate: row.next_charge_at ? String(row.next_charge_at) : '',
      lastPaymentDate: successful[0]?.attempted_at ? String(successful[0].attempted_at) : '',
      status: row.status as SubscriberStatus,
      lastChargeStatus:
        latest?.status === 'failed'
          ? 'failed'
          : latest?.status === 'succeeded'
            ? 'paid'
            : 'pending',
      lifetimeValue: successful.length * Number(row.amount),
      monthsActive: successful.length,
      cancelledAt: row.cancelled_at ? String(row.cancelled_at) : undefined,
      auditLogs: (audits ?? [])
        .filter((audit) => audit.entity_id === row.id)
        .map((audit) => ({
          id: String(audit.id),
          action: String(audit.action),
          detail: JSON.stringify(audit.details ?? {}),
          at: String(audit.occurred_at),
        })),
    }
  })
}

/** Donor portal: find the authenticated donor's canonical subscription. */
export async function getMonthlySubscriptionForDonor(
  email: string,
): Promise<MonthlyGivingSubscriber | null> {
  if (!email.trim()) return null
  return (await fetchSubscribers(email))[0] ?? null
}

async function auditSubscriber(id: string, action: string, details: Record<string, unknown> = {}) {
  const { error } = await dataApi.table('audit_logs').insert({
    action,
    entity_type: 'recurring_donations',
    entity_id: id,
    details,
  })
  if (error) throw new Error(error.message)
}

async function updateSubscriber(id: string, patch: Record<string, unknown>, action: string) {
  const { error } = await dataApi
    .table('recurring_donations')
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  await auditSubscriber(id, action)
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
  const notCancelledBeforeStart =
    !subscriber.cancelledAt || subscriber.cancelledAt >= start.toISOString()
  return startedBeforeEnd && notCancelledBeforeStart
}

export async function getMonthlyGivingDashboardData(): Promise<MonthlyGivingDashboardData> {
  const subscribers = await fetchSubscribers()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const activeSubscribers = subscribers.filter((subscriber) => subscriber.status === 'active')
  const previousMonthActive = subscribers.filter((subscriber) => {
    const startedBeforePreviousMonthEnd = subscriber.startDate < monthStart.toISOString()
    const notCancelledBeforePreviousMonth =
      !subscriber.cancelledAt || subscriber.cancelledAt >= previousMonthStart.toISOString()
    return startedBeforePreviousMonthEnd && notCancelledBeforePreviousMonth
  })
  const previousMrr = previousMonthActive
    .filter((subscriber) => subscriber.status !== 'paused')
    .reduce((sum, subscriber) => sum + subscriber.amount, 0)
  const currentMrr = activeSubscribers.reduce((sum, subscriber) => sum + subscriber.amount, 0)

  const newThisMonth = subscribers.filter(
    (subscriber) => subscriber.startDate >= monthStart.toISOString(),
  ).length
  const cancelledThisMonth = subscribers.filter(
    (subscriber) => (subscriber.cancelledAt ?? '') >= monthStart.toISOString(),
  ).length
  const paidRenewals = activeSubscribers.filter(
    (subscriber) => subscriber.lastChargeStatus === 'paid',
  ).length
  const renewalRate = activeSubscribers.length
    ? Math.round((paidRenewals / activeSubscribers.length) * 100)
    : 0
  const averageLifetimeValue = subscribers.length
    ? Math.round(
        subscribers.reduce((sum, subscriber) => sum + subscriber.lifetimeValue, 0) /
          subscribers.length,
      )
    : 0

  const subscriberTrend = formatTrend(activeSubscribers.length, previousMonthActive.length)
  const revenueTrend = formatTrend(currentMrr, previousMrr)

  const revenueTrendData = monthlyBuckets(7).map((bucket) => ({
    label: bucket.label,
    value: subscribers
      .filter(
        (subscriber) =>
          subscriber.status !== 'paused' &&
          isSubscriberActiveInMonth(subscriber, bucket.start, bucket.end),
      )
      .reduce((sum, subscriber) => sum + subscriber.amount, 0),
  }))

  const growthData = monthlyBuckets(6).map((bucket) => ({
    label: bucket.label,
    newSubscribers: subscribers.filter(
      (subscriber) =>
        subscriber.startDate >= bucket.start.toISOString() &&
        subscriber.startDate < bucket.end.toISOString(),
    ).length,
    cancelledSubscribers: subscribers.filter((subscriber) => {
      return Boolean(
        subscriber.cancelledAt &&
        subscriber.cancelledAt >= bucket.start.toISOString() &&
        subscriber.cancelledAt < bucket.end.toISOString(),
      )
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
  await updateSubscriber(id, { status: 'paused' }, 'SUBSCRIPTION_PAUSED')
}

export async function resumeSubscriber(id: string) {
  await updateSubscriber(id, { status: 'active' }, 'SUBSCRIPTION_RESUMED')
}

export async function cancelSubscriber(id: string) {
  await updateSubscriber(
    id,
    {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      next_charge_at: null,
    },
    'SUBSCRIPTION_CANCELLED',
  )
}

export async function retryFailedRenewal(id: string) {
  const scheduledFor = new Date().toISOString()
  const { error } = await dataApi.table('recurring_payment_attempts').insert({
    recurring_donation_id: id,
    scheduled_for: scheduledFor,
    status: 'scheduled',
    attempt_number: 1,
  })
  if (error) throw new Error(error.message)
  await auditSubscriber(id, 'RENEWAL_RETRY_SCHEDULED', { scheduledFor })
}

export async function markSubscriberContacted(id: string) {
  await auditSubscriber(id, 'SUBSCRIBER_CONTACT_RECORDED')
}

export async function updateSubscriberNotes(id: string, notes: string) {
  await auditSubscriber(id, 'SUBSCRIBER_NOTES_UPDATED', { notes: notes.trim() })
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
      data.recentSubscribers
        .slice(0, 8)
        .map((subscriber) => [
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
