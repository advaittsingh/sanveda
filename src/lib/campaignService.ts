import type { Campaign } from '../types'
import { SANVEDA_CAMPAIGNS } from '../constants/campaignContent'
import { isSupabaseConfigured, requireSupabase } from './supabase'

export type CampaignStatus = 'draft' | 'pending' | 'active' | 'closed'

export interface CampaignRecord extends Campaign {
  slug: string
  status: CampaignStatus
  featureUrgent?: number
  featureRecent?: number
}

function dbRowToCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: Number(row.id),
    title: String(row.title),
    banner_image: row.banner_image ? String(row.banner_image) : undefined,
    thumbnail_image: row.thumbnail_image ? String(row.thumbnail_image) : undefined,
    goal: Number(row.goal),
    raised: Number(row.raised),
    description: row.description ? String(row.description) : undefined,
    exemption_tag: row.exemption_tag ? String(row.exemption_tag) : undefined,
    total_donors: Number(row.total_donors ?? 0),
    hide_goal: Number(row.hide_goal ?? 0),
    hide_raised: Number(row.hide_raised ?? 0),
    category: row.category as Campaign['category'],
    redirects: [{ primary_url: String(row.slug), primary_name: String(row.title) }],
    CampaignDescriptions: Array.isArray(row.campaign_descriptions)
      ? (row.campaign_descriptions as Campaign['CampaignDescriptions'])
      : [],
  }
}

function dbRowToCampaignRecord(row: Record<string, unknown>): CampaignRecord {
  const campaign = dbRowToCampaign(row)
  return {
    ...campaign,
    slug: String(row.slug),
    status: row.status as CampaignStatus,
    featureUrgent: Number(row.feature_urgent ?? 0),
    featureRecent: Number(row.feature_recent ?? 0),
  }
}

function staticToRecord(c: Campaign): CampaignRecord {
  const ext = c as Campaign & { FeatureUrgentCampaign?: number; featureRecentCampaign?: number }
  return {
    ...c,
    slug: c.redirects?.[0]?.primary_url ?? `campaign-${c.id}`,
    status: 'active',
    featureUrgent: ext.FeatureUrgentCampaign ?? 0,
    featureRecent: ext.featureRecentCampaign ?? 0,
  }
}

async function loadFromSupabase(): Promise<Campaign[] | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await requireSupabase()
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('id')

  if (error || !data?.length) return null
  return data.map(dbRowToCampaign)
}

export async function loadCampaigns(): Promise<Campaign[]> {
  const remote = await loadFromSupabase()
  return remote ?? SANVEDA_CAMPAIGNS
}

export function filterCampaigns(
  campaigns: Campaign[],
  params?: Record<string, string | number>,
): Campaign[] {
  let list = [...campaigns]

  if (params?.FeatureUrgentCampaign !== undefined) {
    const flag = Number(params.FeatureUrgentCampaign)
    list = list.filter((c) => {
      const ext = c as Campaign & { FeatureUrgentCampaign?: number; feature_urgent?: number }
      return (ext.FeatureUrgentCampaign ?? ext.feature_urgent) === flag
    })
  }

  if (params?.featureRecentCampaign !== undefined) {
    const flag = Number(params.featureRecentCampaign)
    list = list.filter((c) => {
      const ext = c as Campaign & { featureRecentCampaign?: number; feature_recent?: number }
      return (ext.featureRecentCampaign ?? ext.feature_recent) === flag
    })
  }

  const limit = params?.limit ? Number(params.limit) : undefined
  if (limit && limit > 0) list = list.slice(0, limit)

  return list
}

export async function fetchCampaignBySlugFromStore(slug: string): Promise<Campaign | null> {
  const campaigns = await loadCampaigns()
  return campaigns.find((c) => c.redirects?.[0]?.primary_url === slug) ?? null
}

export async function getAllCampaignsAdmin(): Promise<CampaignRecord[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('campaigns')
      .select('*')
      .order('id')

    if (error) throw new Error(error.message)
    if (data?.length) return data.map(dbRowToCampaignRecord)
  }

  return SANVEDA_CAMPAIGNS.map(staticToRecord)
}

export async function saveCampaign(input: Partial<CampaignRecord> & { title: string; slug: string }): Promise<CampaignRecord> {
  const now = new Date().toISOString()

  if (isSupabaseConfigured) {
    const row = {
      slug: input.slug,
      title: input.title,
      banner_image: input.banner_image ?? null,
      thumbnail_image: input.thumbnail_image ?? null,
      goal: input.goal ?? 0,
      raised: input.raised ?? 0,
      description: input.description ?? null,
      exemption_tag: input.exemption_tag ?? null,
      total_donors: input.total_donors ?? 0,
      category: input.category ?? [],
      hide_goal: input.hide_goal ?? 0,
      hide_raised: input.hide_raised ?? 0,
      feature_urgent: input.featureUrgent ?? 0,
      feature_recent: input.featureRecent ?? 0,
      campaign_descriptions: input.CampaignDescriptions ?? [],
      status: input.status ?? 'draft',
      updated_at: now,
    }

    if (input.id) {
      const { data, error } = await requireSupabase().from('campaigns').update(row).eq('id', input.id).select().single()
      if (error) throw new Error(error.message)
      return dbRowToCampaignRecord(data)
    }

    const { data, error } = await requireSupabase().from('campaigns').insert(row).select().single()
    if (error) throw new Error(error.message)
    return dbRowToCampaignRecord(data)
  }

  throw new Error('Campaign admin requires Supabase configuration')
}

export async function deleteCampaign(id: number): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Campaign admin requires Supabase')
  const { error } = await requireSupabase().from('campaigns').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
