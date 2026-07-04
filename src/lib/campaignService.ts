import type { Campaign } from '../types'
import type { CampaignAdminMeta, CampaignWorkflowStatus } from '../types/campaignAdmin'
import { SANVEDA_CAMPAIGNS } from '../constants/campaignContent'
import { withAudit } from './auditMiddleware'
import { isSupabaseConfigured, requireSupabase } from './supabase'

export type CampaignStatus = CampaignWorkflowStatus

export interface CampaignRecord extends Campaign {
  slug: string
  status: CampaignStatus
  featureUrgent?: number
  featureRecent?: number
  meta?: CampaignAdminMeta
}

const ADMIN_CAMPAIGNS_KEY = 'sanveda_admin_campaigns'

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
  const meta = row.admin_meta as CampaignAdminMeta | undefined
  return {
    ...campaign,
    slug: String(row.slug),
    status: row.status as CampaignStatus,
    featureUrgent: Number(row.feature_urgent ?? 0),
    featureRecent: Number(row.feature_recent ?? 0),
    meta: meta ?? undefined,
  }
}

function staticToRecord(c: Campaign, index = 0): CampaignRecord {
  const ext = c as Campaign & { FeatureUrgentCampaign?: number; featureRecentCampaign?: number }
  const slug = c.redirects?.[0]?.primary_url ?? `campaign-${c.id}`
  const category = parseCategoryLabel(c.category)
  const createdAt = new Date(Date.now() - index * 86400000 * 14).toISOString()
  const endDate = new Date(Date.now() + (12 + index * 5) * 86400000).toISOString()

  return {
    ...c,
    slug,
    status: index === 0 ? 'published' : index === 1 ? 'review' : 'published',
    featureUrgent: ext.FeatureUrgentCampaign ?? 0,
    featureRecent: ext.featureRecentCampaign ?? 0,
    meta: {
      beneficiary: {
        name: index === 0 ? 'Ramesh Kumar' : index === 1 ? 'Priya Sharma' : 'Community Beneficiary',
        age: 14 + index,
        location: index % 2 === 0 ? 'Delhi' : 'Mumbai',
        category: category,
        verified: true,
      },
      focusArea: category,
      createdBy: 'Admin',
      createdAt,
      endDate,
      gallery: [c.banner_image, c.thumbnail_image].filter(Boolean) as string[],
      updateCount: 3 + index,
      commentCount: 8 + index * 2,
      featured: index === 0,
      trending: index <= 1,
      urgent: Boolean(ext.FeatureUrgentCampaign),
      recommended: index === 2,
      timeline: [
        { label: 'Created', date: createdAt },
        { label: 'Approved', date: new Date(Date.parse(createdAt) + 86400000).toISOString() },
        { label: 'Published', date: new Date(Date.parse(createdAt) + 86400000 * 2).toISOString() },
      ],
    },
  }
}

function parseCategoryLabel(cat: Campaign['category']): string {
  if (!cat) return 'General'
  if (Array.isArray(cat)) return cat[0] ?? 'General'
  try {
    const parsed = JSON.parse(cat)
    return Array.isArray(parsed) ? String(parsed[0]) : String(cat)
  } catch {
    return String(cat)
  }
}

function loadLocalAdminCampaigns(): CampaignRecord[] | null {
  try {
    const raw = localStorage.getItem(ADMIN_CAMPAIGNS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CampaignRecord[]
  } catch {
    return null
  }
}

function saveLocalAdminCampaigns(campaigns: CampaignRecord[]) {
  localStorage.setItem(ADMIN_CAMPAIGNS_KEY, JSON.stringify(campaigns))
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

  const local = loadLocalAdminCampaigns()
  if (local?.length) return local

  return SANVEDA_CAMPAIGNS.map((c, i) => staticToRecord(c, i))
}

export async function saveCampaign(input: Partial<CampaignRecord> & { title: string; slug: string }): Promise<CampaignRecord> {
  return withAudit(input.id ? 'UPDATE' : 'CREATE', 'campaigns', String(input.id ?? input.slug), async () => {
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
      admin_meta: input.meta ?? null,
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

  const campaigns = await getAllCampaignsAdmin()
  const record: CampaignRecord = {
    id: input.id ?? Date.now(),
    title: input.title,
    slug: input.slug,
    banner_image: input.banner_image,
    thumbnail_image: input.thumbnail_image,
    goal: input.goal ?? 0,
    raised: input.raised ?? 0,
    description: input.description,
    exemption_tag: input.exemption_tag,
    total_donors: input.total_donors ?? 0,
    category: input.category,
    hide_goal: input.hide_goal ?? 0,
    hide_raised: input.hide_raised ?? 0,
    status: input.status ?? 'draft',
    featureUrgent: input.featureUrgent ?? 0,
    featureRecent: input.featureRecent ?? 0,
    CampaignDescriptions: input.CampaignDescriptions ?? [],
    redirects: [{ primary_url: input.slug, primary_name: input.title }],
    meta: input.meta,
  }

  if (input.id) {
    const next = campaigns.map((c) => (c.id === input.id ? { ...c, ...record, id: input.id } : c))
    saveLocalAdminCampaigns(next)
    return next.find((c) => c.id === input.id)!
  }

  const next = [...campaigns, record]
  saveLocalAdminCampaigns(next)
  return record
  })
}

export async function deleteCampaign(id: number): Promise<void> {
  return withAudit('DELETE', 'campaigns', String(id), async () => {
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase().from('campaigns').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return
  }

  const campaigns = await getAllCampaignsAdmin()
  saveLocalAdminCampaigns(campaigns.filter((c) => c.id !== id))
  })
}

export async function bulkUpdateCampaignStatus(ids: number[], status: CampaignStatus): Promise<void> {
  return withAudit('UPDATE', 'campaigns', ids.join(','), async () => {
  const campaigns = await getAllCampaignsAdmin()
  const idSet = new Set(ids)
  const next = campaigns.map((c) => (idSet.has(c.id) ? { ...c, status } : c))

  if (isSupabaseConfigured) {
    await Promise.all(
      ids.map((id) => {
        const c = next.find((x) => x.id === id)
        if (c) return saveCampaign(c)
        return Promise.resolve()
      }),
    )
    return
  }

  saveLocalAdminCampaigns(next)
  })
}
