import { getEnquiries } from './enquiryService'
import { getVolunteerApplications } from './volunteerStore'
import { getMemberships } from './membershipService'
import { getFinancialSummary } from './incomeService'
import { isSupabaseConfigured, requireSupabase } from './supabase'

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

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('donations')
      .select('amount, status, created_at')
      .eq('status', 'completed')

    if (error || !data) return { total: 0, count: 0, thisMonth: 0 }

    const total = data.reduce((s, d) => s + Number(d.amount), 0)
    const thisMonth = data
      .filter((d) => d.created_at >= monthStart)
      .reduce((s, d) => s + Number(d.amount), 0)

    return { total, count: data.length, thisMonth }
  }

  try {
    const raw = localStorage.getItem('sanveda_donations')
    const donations = raw ? JSON.parse(raw) as { amount: number; status: string; createdAt: string }[] : []
    const completed = donations.filter((d) => d.status === 'completed')
    return {
      total: completed.reduce((s, d) => s + d.amount, 0),
      count: completed.length,
      thisMonth: completed.filter((d) => d.createdAt >= monthStart).reduce((s, d) => s + d.amount, 0),
    }
  } catch {
    return { total: 0, count: 0, thisMonth: 0 }
  }
}

async function getCampaignStats() {
  if (isSupabaseConfigured) {
    const { data } = await requireSupabase().from('campaigns').select('status')
    const total = data?.length ?? 0
    const active = data?.filter((c) => c.status === 'active').length ?? 0
    return { total, active }
  }
  return { total: 3, active: 3 }
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
