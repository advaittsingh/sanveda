import { getEnquiries } from './enquiryService'
import { getVolunteerApplications } from './volunteerStore'
import { getMemberships } from './membershipService'
import { getFinancialSummary } from './incomeService'
import { dataApi } from './dataApiClient'

export interface DashboardAnalytics {
  donations: { total: number; count: number; thisMonth: number }
  volunteers: { total: number; pending: number; active: number }
  enquiries: { total: number; new: number }
  memberships: { total: number; pending: number; active: number }
  finance: { totalIncome: number; totalExpenses: number; netBalance: number; pendingExpenses: number }
  campaigns: { total: number; active: number }
}

async function getDonationStats() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data, error } = await dataApi
    .table('donations')
    .select('amount, status, created_at')
    .eq('status', 'completed')
  if (error) throw new Error(error.message)
  const rows = data ?? []
  const total = rows.reduce((s, d) => s + Number(d.amount), 0)
  const thisMonth = rows.filter((d) => String(d.created_at) >= monthStart).reduce((s, d) => s + Number(d.amount), 0)
  return { total, count: rows.length, thisMonth }
}

async function getCampaignStats() {
  const { data, error } = await dataApi.table('campaigns').select('status')
  if (error) throw new Error(error.message)
  const total = data?.length ?? 0
  const active = data?.filter((c) => c.status === 'active').length ?? 0
  return { total, active }
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const [donations, volunteers, enquiries, memberships, finance, campaigns] = await Promise.all([
    getDonationStats(),
    getVolunteerApplications(),
    getEnquiries(),
    getMemberships(),
    getFinancialSummary(),
    getCampaignStats(),
  ])

  return {
    donations,
    volunteers: {
      total: volunteers.length,
      pending: volunteers.filter((v) => v.status === 'pending').length,
      active: volunteers.filter((v) => v.status === 'active' || v.status === 'approved').length,
    },
    enquiries: {
      total: enquiries.length,
      new: enquiries.filter((e) => e.status === 'new').length,
    },
    memberships: {
      total: memberships.length,
      pending: memberships.filter((m) => m.status === 'pending').length,
      active: memberships.filter((m) => m.status === 'active' || m.status === 'approved').length,
    },
    finance,
    campaigns,
  }
}
