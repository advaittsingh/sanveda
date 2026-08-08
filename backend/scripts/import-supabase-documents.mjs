#!/usr/bin/env node
/**
 * Import published public compliance documents from Supabase into Neon.
 * PDFs already live at /public/documents/* (same paths as file_url).
 * Usage: node --env-file=.env scripts/import-supabase-documents.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
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

const res = await fetch(`${sourceUrl}/rest/v1/documents?select=*&order=created_at`, {
  headers: { apikey: sourceKey, Authorization: `Bearer ${sourceKey}` },
})
if (!res.ok) {
  console.error('Supabase documents fetch failed', res.status, await res.text())
  process.exit(1)
}
const documents = await res.json()
if (!Array.isArray(documents) || documents.length === 0) {
  console.error('No documents found on Supabase')
  process.exit(1)
}

const dumpPath = resolve('.data-import/supabase-documents.json')
writeFileSync(dumpPath, JSON.stringify(documents, null, 2))
console.log(`Fetched ${documents.length} document(s) → ${dumpPath}`)

const cleanUrl = (() => {
  const u = new URL(targetUrl)
  u.searchParams.delete('channel_binding')
  return u.toString()
})()

const client = new pg.Client({
  connectionString: cleanUrl,
  application_name: 'sanveda-documents-import',
})
await client.connect()

try {
  await client.query('begin')
  for (const d of documents) {
    await client.query(
      `insert into documents (
         id, document_id, title, category, folder, description, owner, version,
         issue_date, expiry_date, visibility, status, tags, file_url, file_size_mb,
         project, campaign, event, focus_area, downloads, views, shares, versions,
         is_compliance, created_at, updated_at
       ) values (
         $1,$2,$3,$4,$5,$6,$7,$8,
         $9,$10,$11,$12,$13::jsonb,$14,$15,
         $16,$17,$18,$19,$20,$21,$22,$23::jsonb,
         $24,$25,$26
       )
       on conflict (id) do update set
         document_id = excluded.document_id,
         title = excluded.title,
         category = excluded.category,
         folder = excluded.folder,
         description = excluded.description,
         owner = excluded.owner,
         version = excluded.version,
         issue_date = excluded.issue_date,
         expiry_date = excluded.expiry_date,
         visibility = excluded.visibility,
         status = excluded.status,
         tags = excluded.tags,
         file_url = excluded.file_url,
         file_size_mb = excluded.file_size_mb,
         project = excluded.project,
         campaign = excluded.campaign,
         event = excluded.event,
         focus_area = excluded.focus_area,
         downloads = excluded.downloads,
         views = excluded.views,
         shares = excluded.shares,
         versions = excluded.versions,
         is_compliance = excluded.is_compliance,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at`,
      [
        d.id,
        d.document_id,
        d.title,
        d.category,
        d.folder ?? 'public',
        d.description ?? null,
        d.owner ?? 'Admin',
        d.version ?? 'v1.0',
        d.issue_date ?? null,
        d.expiry_date ?? null,
        d.visibility ?? 'public',
        d.status ?? 'published',
        JSON.stringify(Array.isArray(d.tags) ? d.tags : []),
        d.file_url ?? null,
        d.file_size_mb ?? 0,
        d.project ?? null,
        d.campaign ?? null,
        d.event ?? null,
        d.focus_area ?? null,
        d.downloads ?? 0,
        d.views ?? 0,
        d.shares ?? 0,
        JSON.stringify(Array.isArray(d.versions) ? d.versions : []),
        Boolean(d.is_compliance),
        d.created_at ?? new Date().toISOString(),
        d.updated_at ?? new Date().toISOString(),
      ],
    )
    console.log(`  upserted ${d.document_id} — ${d.title} (${d.status}/${d.visibility})`)
  }
  await client.query('commit')

  const { rows } = await client.query(
    `select document_id, title, status, visibility, file_url
       from documents
      order by document_id`,
  )
  console.log('\nNeon documents after import:')
  console.table(rows)
} catch (error) {
  await client.query('rollback').catch(() => undefined)
  console.error('Import failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await client.end()
}
