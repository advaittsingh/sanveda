import type { Campaign } from '../types'
import type { CampaignAdminMeta, CampaignWorkflowStatus } from '../types/campaignAdmin'
import { withAudit } from './auditMiddleware'
import { dataApi } from './dataApiClient'

export type CampaignStatus = CampaignWorkflowStatus

export interface CampaignRecord extends Campaign {
  slug: string
  status: CampaignStatus
  featureUrgent?: number
  featureRecent?: number
  featured?: number
  meta?: CampaignAdminMeta
}

function dbRowToCampaign(row: Record<string, unknown>): Campaign {
  const adminMeta = row.admin_meta as CampaignAdminMeta | null | undefined
  const featuredFlag = Number(row.featured ?? 0) || (adminMeta?.featured ? 1 : 0)

  const base: Campaign = {
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

  return Object.assign(base, {
    featuredCampaign: featuredFlag,
    FeatureUrgentCampaign: Number(row.feature_urgent ?? 0),
    featureRecentCampaign: Number(row.feature_recent ?? 0),
  })
}

function dbRowToCampaignRecord(row: Record<string, unknown>): CampaignRecord {
  const campaign = dbRowToCampaign(row)
  const meta = row.admin_meta as CampaignAdminMeta | undefined
  const featured = Number(row.featured ?? 0) || (meta?.featured ? 1 : 0)
  return {
    ...campaign,
    slug: String(row.slug),
    status: row.status as CampaignStatus,
    featureUrgent: Number(row.feature_urgent ?? 0),
    featureRecent: Number(row.feature_recent ?? 0),
    featured,
    meta: meta ? { ...meta, featured: Boolean(featured) } : featured ? { featured: true } : undefined,
  }
}

async function loadPublishedCampaigns(): Promise<Campaign[]> {
  const { data, error } = await dataApi
    .publicTable('campaigns')
    .select('*')
    .in('status', ['active', 'published', 'approved'])
    .order('id')

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbRowToCampaign)
}

export async function loadCampaigns(): Promise<Campaign[]> {
  return loadPublishedCampaigns()
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

  if (params?.featuredCampaign !== undefined) {
    const flag = Number(params.featuredCampaign)
    list = list.filter((c) => {
      const ext = c as Campaign & { featuredCampaign?: number }
      return (ext.featuredCampaign ?? 0) === flag
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
  const { data, error } = await dataApi
    .table('campaigns')
    .select('*')
    .order('id')
  if (error) throw new Error(error.message)
  return (data ?? []).map(dbRowToCampaignRecord)
}

export async function saveCampaign(input: Partial<CampaignRecord> & { title: string; slug: string }): Promise<CampaignRecord> {
  return withAudit(input.id ? 'UPDATE' : 'CREATE', 'campaigns', String(input.id ?? input.slug), async () => {
  const now = new Date().toISOString()

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
      featured: input.featured ?? (input.meta?.featured ? 1 : 0),
      campaign_descriptions: input.CampaignDescriptions ?? [],
      status: input.status ?? 'draft',
      admin_meta: {
        ...(input.meta ?? {}),
        featured: Boolean(input.featured ?? input.meta?.featured),
      },
      updated_at: now,
    }

  if (input.id) {
      const { data, error } = await dataApi.table('campaigns').update(row).eq('id', input.id).select().single()
      if (error) throw new Error(error.message)
      return dbRowToCampaignRecord(data)
    }

  const { data, error } = await dataApi.table('campaigns').insert(row).select().single()
  if (error) throw new Error(error.message)
  return dbRowToCampaignRecord(data)
  })
}

export async function deleteCampaign(id: number): Promise<void> {
  return withAudit('DELETE', 'campaigns', String(id), async () => {
  const { error } = await dataApi.table('campaigns').delete().eq('id', id)
  if (error) throw new Error(error.message)
  })
}

export async function bulkUpdateCampaignStatus(ids: number[], status: CampaignStatus): Promise<void> {
  return withAudit('UPDATE', 'campaigns', ids.join(','), async () => {
  const campaigns = await getAllCampaignsAdmin()
  const idSet = new Set(ids)
  const next = campaigns.map((c) => (idSet.has(c.id) ? { ...c, status } : c))

  await Promise.all(
    ids.map((id) => {
      const c = next.find((x) => x.id === id)
      if (c) return saveCampaign(c)
      return Promise.resolve()
    }),
  )
  })
}
