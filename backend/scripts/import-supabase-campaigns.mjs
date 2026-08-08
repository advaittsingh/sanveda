#!/usr/bin/env node
/**
 * One-off: import live campaigns from a restored Supabase project into Neon.
 * Usage: node --env-file=.env scripts/import-supabase-campaigns.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import pg from 'pg'

const sourceUrl = process.env.VITE_SUPABASE_URL?.trim()
const sourceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const targetUrl =
  process.env.DATABASE_URL_UNPOOLED?.trim() ||
  process.env.POSTGRES_URL_NON_POOLING?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim()

if (!sourceUrl || !sourceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!targetUrl) {
  console.error('Missing DATABASE_URL')
  process.exit(1)
}

mkdirSync('.data-import', { recursive: true })

const res = await fetch(`${sourceUrl}/rest/v1/campaigns?select=*&order=id`, {
  headers: {
    apikey: sourceKey,
    Authorization: `Bearer ${sourceKey}`,
  },
})
if (!res.ok) {
  console.error('Supabase campaigns fetch failed', res.status, await res.text())
  process.exit(1)
}
const campaigns = await res.json()
if (!Array.isArray(campaigns) || campaigns.length === 0) {
  console.error('No campaigns found on Supabase')
  process.exit(1)
}

const dumpPath = resolve('.data-import/supabase-campaigns.json')
writeFileSync(dumpPath, JSON.stringify(campaigns, null, 2))
console.log(`Fetched ${campaigns.length} campaign(s) → ${dumpPath}`)

const cleanUrl = (() => {
  const u = new URL(targetUrl)
  u.searchParams.delete('channel_binding')
  return u.toString()
})()

const client = new pg.Client({ connectionString: cleanUrl, application_name: 'sanveda-campaign-import' })
await client.connect()

try {
  await client.query('begin')
  for (const c of campaigns) {
    const category = Array.isArray(c.category)
      ? JSON.stringify(c.category)
      : typeof c.category === 'string'
        ? c.category
        : '[]'
    const descriptions = Array.isArray(c.campaign_descriptions)
      ? JSON.stringify(c.campaign_descriptions)
      : '[]'
    const adminMeta =
      c.admin_meta && typeof c.admin_meta === 'object' ? JSON.stringify(c.admin_meta) : '{}'

    await client.query(
      `insert into campaigns (
         id, slug, title, banner_image, thumbnail_image, goal, raised, description,
         exemption_tag, total_donors, category, hide_goal, hide_raised,
         feature_urgent, feature_recent, featured, campaign_descriptions, admin_meta,
         status, starts_at, ends_at, created_at, updated_at
       ) values (
         $1,$2,$3,$4,$5,$6,$7,$8,
         $9,$10,$11::jsonb,$12,$13,
         $14,$15,$16,$17::jsonb,$18::jsonb,
         $19,$20,$21,$22,$23
       )
       on conflict (id) do update set
         slug = excluded.slug,
         title = excluded.title,
         banner_image = excluded.banner_image,
         thumbnail_image = excluded.thumbnail_image,
         goal = excluded.goal,
         raised = excluded.raised,
         description = excluded.description,
         exemption_tag = excluded.exemption_tag,
         total_donors = excluded.total_donors,
         category = excluded.category,
         hide_goal = excluded.hide_goal,
         hide_raised = excluded.hide_raised,
         feature_urgent = excluded.feature_urgent,
         feature_recent = excluded.feature_recent,
         featured = excluded.featured,
         campaign_descriptions = excluded.campaign_descriptions,
         admin_meta = excluded.admin_meta,
         status = excluded.status,
         starts_at = excluded.starts_at,
         ends_at = excluded.ends_at,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at`,
      [
        c.id,
        c.slug,
        c.title,
        c.banner_image ?? null,
        c.thumbnail_image ?? null,
        c.goal ?? 0,
        c.raised ?? 0,
        c.description ?? null,
        c.exemption_tag ?? null,
        c.total_donors ?? 0,
        category,
        c.hide_goal ?? 0,
        c.hide_raised ?? 0,
        c.feature_urgent ?? 0,
        c.feature_recent ?? 0,
        c.featured ?? 0,
        descriptions,
        adminMeta,
        c.status ?? 'active',
        c.starts_at ?? null,
        c.ends_at ?? null,
        c.created_at ?? new Date().toISOString(),
        c.updated_at ?? new Date().toISOString(),
      ],
    )
    console.log(`  upserted #${c.id} ${c.slug} (${c.status})`)
  }

  await client.query(
    `select setval(pg_get_serial_sequence('public.campaigns','id'), greatest((select coalesce(max(id),1) from campaigns), 1))`,
  )
  await client.query('commit')

  const { rows } = await client.query(
    `select id, slug, title, status, featured, feature_urgent, goal, raised
       from campaigns order by id`,
  )
  console.log('\nNeon campaigns after import:')
  console.table(rows)
} catch (error) {
  await client.query('rollback').catch(() => undefined)
  console.error('Import failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await client.end()
}
