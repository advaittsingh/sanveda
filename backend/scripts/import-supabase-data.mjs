#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { get, put } from '@vercel/blob'
import pg from 'pg'
import {
  BETTER_AUTH_TABLES,
  buildIdentityColumns,
  checksumRows,
  loadIdentityMapping,
  mapIdentityRow,
  parseArguments,
  quoteIdentifier,
  sha256,
  topologicalSort,
} from './data-import-helpers.mjs'

const { Client } = pg
const options = parseArguments(process.argv.slice(2))

if (options.help) {
  console.log(`Usage: npm run data:import -- [options]

Dry-run is the default. No target writes occur without --apply.

Options:
  --apply                 Write to Neon and Vercel Blob
  --component <name>      all, database, storage, or reconcile (default: all)
  --mapping-file <path>   JSON Supabase-auth UUID to Better Auth UUID mapping
  --bucket <name>         Restrict storage import; repeat for multiple buckets
  --batch-size <count>    Database insert batch size, 1-1000 (default: 250)
  --state-file <path>     Local checkpoint manifest (default: .data-import/state.json)
  --help                  Show this help`)
  process.exit(0)
}

const wantsDatabase = ['all', 'database', 'reconcile'].includes(options.component)
const wantsStorage = ['all', 'storage'].includes(options.component)
const state = await readState(options.stateFile)

try {
  if (wantsDatabase) await migrateDatabase()
  if (wantsStorage && options.component !== 'reconcile') await migrateStorage()
  console.log(
    options.apply
      ? 'Import and reconciliation completed successfully.'
      : 'Dry-run completed. Re-run with --apply only after reviewing this report.',
  )
} catch (error) {
  console.error(`Import stopped safely: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}

async function migrateDatabase() {
  const sourceUrl = requiredEnvironment('SOURCE_SUPABASE_DATABASE_URL')
  const targetUrl =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    requiredEnvironment('DATABASE_URL')
  const source = new Client({
    connectionString: sourceUrl,
    application_name: 'sanveda-import-source',
  })
  const target = new Client({
    connectionString: targetUrl,
    application_name: 'sanveda-import-target',
  })
  await source.connect()
  await target.connect()
  try {
    await source.query('begin transaction isolation level repeatable read read only')
    const [sourceSchema, targetSchema] = await Promise.all([
      inspectSchema(source),
      inspectSchema(target),
    ])
    const tables = [...sourceSchema.tables.keys()].filter(
      (table) => targetSchema.tables.has(table) && !BETTER_AUTH_TABLES.has(table),
    )
    const orderedTables = topologicalSort(tables, targetSchema.foreignKeys)
    const identityColumns = buildIdentityColumns(targetSchema.foreignKeys)
    const mapping = await loadIdentityMapping(options.mappingFile)
    await validateMappedUsers(target, mapping)

    const prepared = []
    const missingRequired = []
    for (const table of orderedTables) {
      const targetTable = targetSchema.tables.get(table)
      const sourceTable = sourceSchema.tables.get(table)
      const columns = targetTable.columns.filter(
        (column) => sourceTable.columnNames.has(column.name) && column.generated !== 'ALWAYS',
      )
      if (!targetTable.primaryKey.length) {
        throw new Error(`public.${table} has no primary key; refusing a non-idempotent import`)
      }
      if (!targetTable.primaryKey.every((column) => columns.some((item) => item.name === column))) {
        throw new Error(`public.${table} source is missing a target primary-key column`)
      }
      const sourceRows = await selectRows(source, table, columns, targetTable.primaryKey)
      const transformedRows = []
      for (const row of sourceRows) {
        const transformed = mapIdentityRow(row, table, columns, identityColumns, mapping)
        transformedRows.push(transformed.row)
        missingRequired.push(...transformed.missingRequired)
      }
      transformedRows.sort((left, right) =>
        primaryKeyValue(left, targetTable.primaryKey).localeCompare(
          primaryKeyValue(right, targetTable.primaryKey),
        ),
      )
      prepared.push({
        table,
        columns,
        primaryKey: targetTable.primaryKey,
        selfForeignKeys: targetSchema.foreignKeys.filter(
          (foreignKey) =>
            foreignKey.table === table &&
            foreignKey.referencedTable === table &&
            columns.some((column) => column.name === foreignKey.column),
        ),
        rows: transformedRows,
        checksum: checksumRows(transformedRows),
      })
    }

    if (missingRequired.length) {
      const summary = summarizeMissingMappings(missingRequired)
      throw new Error(
        `${missingRequired.length} required identity reference(s) have no mapping (${summary}). ` +
          'Supply --mapping-file; Supabase auth accounts will not be imported.',
      )
    }

    const sourceFinance = await reconcileFinancialRecords(source, sourceSchema.tables)
    printFinancialReport('Source', sourceFinance)
    if (sourceFinance.blockingIssues) {
      throw new Error('Source financial reconciliation found blocking inconsistencies')
    }

    console.log(
      `Database plan: ${prepared.length} application tables in dependency order; Better Auth tables excluded.`,
    )
    for (const item of prepared) {
      console.log(`  ${item.table}: ${item.rows.length} row(s), sha256 ${item.checksum}`)
    }

    if (options.component === 'reconcile') {
      await reconcilePreparedTables(target, prepared)
      const targetFinance = await reconcileFinancialRecords(target, targetSchema.tables)
      printFinancialReport('Target', targetFinance)
      if (targetFinance.blockingIssues) throw new Error('Target financial reconciliation failed')
      return
    }
    if (!options.apply) {
      for (const item of prepared) {
        try {
          await reconcilePreparedTable(target, item)
        } catch {
          console.log(`Target import pending for ${item.table}: rows or checksum differ`)
        }
      }
      printFinancialReport(
        'Current target',
        await reconcileFinancialRecords(target, targetSchema.tables),
      )
      return
    }

    for (const item of prepared) {
      await importTable(target, item)
      await reconcilePreparedTable(target, item)
      state.database ??= {}
      state.database[item.table] = {
        rows: item.rows.length,
        checksum: item.checksum,
        completedAt: new Date().toISOString(),
      }
      await writeState(options.stateFile, state)
    }
    await resetSequences(target)
    const targetFinance = await reconcileFinancialRecords(target, targetSchema.tables)
    printFinancialReport('Target', targetFinance)
    if (targetFinance.blockingIssues) throw new Error('Target financial reconciliation failed')
  } finally {
    await source.query('rollback').catch(() => {})
    await Promise.all([source.end(), target.end()])
  }
}

async function inspectSchema(client) {
  const [columnsResult, primaryKeysResult, foreignKeysResult] = await Promise.all([
    client.query(`
      select table_name, column_name, is_nullable = 'YES' as nullable,
             is_generated as generated
      from information_schema.columns
      where table_schema = 'public' and table_name not like '\\_import\\_%' escape '\\'
      order by table_name, ordinal_position
    `),
    client.query(`
      select tc.table_name, kcu.column_name, kcu.ordinal_position
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on kcu.constraint_schema = tc.constraint_schema
       and kcu.constraint_name = tc.constraint_name
      where tc.table_schema = 'public' and tc.constraint_type = 'PRIMARY KEY'
      order by tc.table_name, kcu.ordinal_position
    `),
    client.query(`
      select source.relname as table_name, source_column.attname as column_name,
             target.relname as referenced_table, target_column.attname as referenced_column
      from pg_constraint constraint_record
      join pg_class source on source.oid = constraint_record.conrelid
      join pg_namespace source_namespace on source_namespace.oid = source.relnamespace
      join pg_class target on target.oid = constraint_record.confrelid
      join lateral unnest(constraint_record.conkey, constraint_record.confkey)
        with ordinality as keys(source_number, target_number, position) on true
      join pg_attribute source_column
        on source_column.attrelid = source.oid and source_column.attnum = keys.source_number
      join pg_attribute target_column
        on target_column.attrelid = target.oid and target_column.attnum = keys.target_number
      where constraint_record.contype = 'f' and source_namespace.nspname = 'public'
    `),
  ])
  const tables = new Map()
  for (const row of columnsResult.rows) {
    if (!tables.has(row.table_name)) {
      tables.set(row.table_name, { columns: [], columnNames: new Set(), primaryKey: [] })
    }
    const table = tables.get(row.table_name)
    table.columns.push({
      name: row.column_name,
      nullable: row.nullable,
      generated: row.generated,
    })
    table.columnNames.add(row.column_name)
  }
  for (const row of primaryKeysResult.rows) {
    tables.get(row.table_name)?.primaryKey.push(row.column_name)
  }
  const foreignKeys = foreignKeysResult.rows.map((row) => ({
    table: row.table_name,
    column: row.column_name,
    referencedTable: row.referenced_table,
    referencedColumn: row.referenced_column,
  }))
  return { tables, foreignKeys }
}

async function selectRows(client, table, columns, primaryKey) {
  const selected = columns.map((column) => quoteIdentifier(column.name)).join(', ')
  const ordered = primaryKey.map(quoteIdentifier).join(', ')
  return (
    await client.query(
      `select ${selected} from public.${quoteIdentifier(table)} order by ${ordered}`,
    )
  ).rows
}

async function validateMappedUsers(target, mapping) {
  if (!mapping.size) return
  const targetIds = [...new Set(mapping.values())]
  const result = await target.query(
    'select id::text from public."user" where id = any($1::uuid[])',
    [targetIds],
  )
  const existing = new Set(result.rows.map((row) => row.id))
  const missing = targetIds.filter((id) => !existing.has(id))
  if (missing.length) {
    throw new Error(
      `${missing.length} mapped Better Auth user(s) do not exist in the target; recreate users first`,
    )
  }
}

async function importTable(target, item) {
  await target.query('begin')
  try {
    await target.query(`alter table public.${quoteIdentifier(item.table)} disable trigger user`)
    const nullableSelfReferences = item.selfForeignKeys.filter((foreignKey) =>
      item.columns.some((column) => column.name === foreignKey.column && column.nullable),
    )
    const requiredSelfReferences = item.selfForeignKeys.filter(
      (foreignKey) =>
        !item.columns.some((column) => column.name === foreignKey.column && column.nullable),
    )
    if (requiredSelfReferences.length) {
      throw new Error(
        `${item.table} contains a required self-reference that cannot be safely batch imported`,
      )
    }
    if (nullableSelfReferences.length) {
      const stagedRows = item.rows.map((row) => {
        const staged = { ...row }
        for (const foreignKey of nullableSelfReferences) staged[foreignKey.column] = null
        return staged
      })
      for (let offset = 0; offset < stagedRows.length; offset += options.batchSize) {
        await upsertBatch(target, item, stagedRows.slice(offset, offset + options.batchSize))
      }
    }
    for (let offset = 0; offset < item.rows.length; offset += options.batchSize) {
      await upsertBatch(target, item, item.rows.slice(offset, offset + options.batchSize))
    }
    await target.query(`alter table public.${quoteIdentifier(item.table)} enable trigger user`)
    await target.query('commit')
    console.log(`Imported ${item.table}: ${item.rows.length} row(s)`)
  } catch (error) {
    await target.query('rollback')
    throw error
  }
}

async function upsertBatch(target, item, rows) {
  if (!rows.length) return
  const columnNames = item.columns.map((column) => column.name)
  const values = []
  const tuples = rows.map((row) => {
    const placeholders = columnNames.map((column) => {
      values.push(row[column])
      return `$${values.length}`
    })
    return `(${placeholders.join(', ')})`
  })
  const updates = columnNames
    .filter((column) => !item.primaryKey.includes(column))
    .map((column) => `${quoteIdentifier(column)} = excluded.${quoteIdentifier(column)}`)
  const conflictAction = updates.length ? `do update set ${updates.join(', ')}` : 'do nothing'
  await target.query(
    `insert into public.${quoteIdentifier(item.table)}
       (${columnNames.map(quoteIdentifier).join(', ')})
     overriding system value
     values ${tuples.join(', ')}
     on conflict (${item.primaryKey.map(quoteIdentifier).join(', ')}) ${conflictAction}`,
    values,
  )
}

async function reconcilePreparedTables(target, prepared) {
  for (const item of prepared) await reconcilePreparedTable(target, item)
}

async function reconcilePreparedTable(target, item) {
  const targetRows = await selectRows(target, item.table, item.columns, item.primaryKey)
  const expectedKeys = new Set(item.rows.map((row) => primaryKeyValue(row, item.primaryKey)))
  const matchingRows = targetRows.filter((row) =>
    expectedKeys.has(primaryKeyValue(row, item.primaryKey)),
  )
  matchingRows.sort((left, right) =>
    primaryKeyValue(left, item.primaryKey).localeCompare(primaryKeyValue(right, item.primaryKey)),
  )
  const checksum = checksumRows(matchingRows)
  if (matchingRows.length !== item.rows.length || checksum !== item.checksum) {
    throw new Error(
      `${item.table} reconciliation failed: expected ${item.rows.length}/${item.checksum}, ` +
        `received ${matchingRows.length}/${checksum}`,
    )
  }
  const extras = targetRows.length - matchingRows.length
  console.log(
    `Reconciled ${item.table}: ${matchingRows.length} row(s), checksum matched` +
      (extras ? `; preserved ${extras} target-only row(s)` : ''),
  )
}

function primaryKeyValue(row, primaryKey) {
  return primaryKey.map((column) => JSON.stringify(row[column])).join('\u001f')
}

async function resetSequences(target) {
  const result = await target.query(`
    select table_name, column_name,
           pg_get_serial_sequence(format('%I.%I', table_schema, table_name), column_name) as sequence_name
    from information_schema.columns
    where table_schema = 'public'
      and (is_identity = 'YES' or column_default like 'nextval(%')
  `)
  await target.query('begin')
  try {
    for (const row of result.rows) {
      if (!row.sequence_name) continue
      await target.query(
        `select setval($1::regclass,
          greatest(coalesce((select max(${quoteIdentifier(row.column_name)}) from public.${quoteIdentifier(row.table_name)}), 0), 1),
          exists(select 1 from public.${quoteIdentifier(row.table_name)}))`,
        [row.sequence_name],
      )
    }
    await resetPatternSequence(target, 'public.receipt_number_seq', 'donations', 'receipt_number')
    await resetPatternSequence(target, 'public.member_number_seq', 'memberships', 'member_id')
    await resetPatternSequence(
      target,
      'public.certificate_number_seq',
      'memberships',
      'certificate_number',
    )
    await target.query('commit')
    console.log('Reset target identity and business sequences.')
  } catch (error) {
    await target.query('rollback')
    throw error
  }
}

async function resetPatternSequence(target, sequence, table, column) {
  await target.query(
    `select setval($1::regclass,
       greatest(coalesce((
         select max((regexp_match(${quoteIdentifier(column)}, '([0-9]+)$'))[1]::bigint)
         from public.${quoteIdentifier(table)}
       ), 0), 1),
       exists(select 1 from public.${quoteIdentifier(table)}
         where ${quoteIdentifier(column)} ~ '[0-9]+$'))`,
    [sequence],
  )
}

async function reconcileFinancialRecords(client, tables) {
  const checks = []
  if (hasTables(tables, 'donations', 'donation_receipts')) {
    checks.push([
      'receipts without matching donation or receipt number',
      `select count(*)::int as count
       from public.donation_receipts receipt
       left join public.donations donation on donation.id = receipt.donation_id
       where donation.id is null
          or (donation.receipt_number is not null
              and donation.receipt_number <> receipt.receipt_number)`,
    ])
    if (hasColumns(tables, 'donation_receipts', 'checksum_sha256', 'receipt_snapshot')) {
      checks.push([
        'receipt snapshot checksum mismatches',
        `select count(*)::int as count
         from public.donation_receipts
         where checksum_sha256 is not null
           and checksum_sha256 <> encode(digest(receipt_snapshot::text, 'sha256'), 'hex')`,
      ])
    }
  }
  if (hasTables(tables, 'donations', 'donation_refunds')) {
    checks.push([
      'refund totals exceeding donation amounts',
      `select count(*)::int as count from (
         select donation.id
         from public.donations donation
         join public.donation_refunds refund on refund.donation_id = donation.id
         where refund.status in ('approved','processing','completed')
         group by donation.id, donation.amount
         having sum(refund.amount) > donation.amount
       ) invalid_refunds`,
    ])
  }
  if (hasTables(tables, 'donations', 'payment_transactions')) {
    checks.push([
      'payment transactions with missing donations',
      `select count(*)::int as count
       from public.payment_transactions transaction_record
       left join public.donations donation on donation.id = transaction_record.donation_id
       where transaction_record.donation_id is not null and donation.id is null`,
    ])
  }
  if (hasTables(tables, 'donations', 'income_records')) {
    checks.push([
      'donation income records with amount/currency mismatch',
      `select count(*)::int as count
       from public.income_records income
       join public.donations donation
         on income.source = 'donation' and income.reference_id = donation.id::text
       where income.amount <> donation.amount or income.currency <> donation.currency`,
    ])
  }
  if (hasTables(tables, 'journal_entries', 'journal_entry_lines')) {
    checks.push([
      'unbalanced posted journal entries',
      `select count(*)::int as count from (
         select entry.id
         from public.journal_entries entry
         left join public.journal_entry_lines line on line.journal_entry_id = entry.id
         where entry.status in ('posted','reversed')
         group by entry.id
         having coalesce(sum(line.debit), 0) <> coalesce(sum(line.credit), 0)
       ) invalid_journals`,
    ])
  }
  const results = []
  for (const [name, query] of checks) {
    const count = (await client.query(query)).rows[0].count
    results.push({ name, count })
  }
  return {
    checks: results,
    blockingIssues: results.reduce((sum, result) => sum + result.count, 0),
  }
}

function printFinancialReport(label, report) {
  console.log(`${label} payment/receipt/refund/finance reconciliation:`)
  if (!report.checks.length) console.log('  no canonical financial tables present')
  for (const check of report.checks) console.log(`  ${check.name}: ${check.count}`)
  console.log(`  blocking inconsistencies: ${report.blockingIssues}`)
}

function hasTables(tables, ...names) {
  return names.every((name) => tables.has(name))
}

function hasColumns(tables, table, ...columns) {
  return columns.every((column) => tables.get(table)?.columnNames.has(column))
}

async function migrateStorage() {
  const sourceUrl = requiredEnvironment('SOURCE_SUPABASE_STORAGE_URL')
  const sourceKey = requiredEnvironment('SOURCE_SUPABASE_STORAGE_SERVICE_ROLE_KEY')
  const blobToken = requiredEnvironment('BLOB_READ_WRITE_TOKEN')
  const sourceStorage = createSourceStorageClient(sourceUrl, sourceKey)
  const sourceBuckets = await sourceStorage.listBuckets()
  const selectedBuckets = options.buckets.length
    ? sourceBuckets.filter((bucket) => options.buckets.includes(bucket.name))
    : sourceBuckets
  const missingBuckets = options.buckets.filter(
    (name) => !sourceBuckets.some((bucket) => bucket.name === name),
  )
  if (missingBuckets.length)
    throw new Error(`Source bucket(s) not found: ${missingBuckets.join(', ')}`)

  let objectCount = 0
  for (const bucket of selectedBuckets) {
    const objects = await listStorageObjects(sourceStorage, bucket.name)
    for (const objectPath of objects) {
      const sourceBytes = await sourceStorage.download(bucket.name, objectPath)
      const sourceChecksum = sha256(sourceBytes)
      const pathname = `${bucket.name}/${objectPath}`
      objectCount += 1
      if (options.apply) {
        await put(pathname, sourceBytes, {
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: true,
          token: blobToken,
        })
      }
      const targetVerification = await verifyBlob(
        pathname,
        blobToken,
        sourceBytes.length,
        sourceChecksum,
      )
      if (options.apply && !targetVerification.matches) {
        throw new Error(`Blob verification failed for ${pathname}`)
      }
      console.log(
        `  ${pathname}: ${sourceBytes.length} bytes, sha256 ${sourceChecksum}, ` +
          (targetVerification.matches ? 'target verified' : 'target write pending'),
      )
      if (options.apply) {
        state.storage ??= {}
        state.storage[pathname] = {
          size: sourceBytes.length,
          checksum: sourceChecksum,
          completedAt: new Date().toISOString(),
        }
        await writeState(options.stateFile, state)
      }
    }
  }
  console.log(
    `Storage ${options.apply ? 'imported' : 'plan'}: ${objectCount} object(s) across ${selectedBuckets.length} bucket(s).`,
  )
}

function createSourceStorageClient(sourceUrl, sourceKey) {
  const baseUrl = new URL('/storage/v1/', sourceUrl.endsWith('/') ? sourceUrl : `${sourceUrl}/`)
  const headers = {
    apikey: sourceKey,
    authorization: `Bearer ${sourceKey}`,
  }

  async function request(path, init = {}) {
    const response = await fetch(new URL(path, baseUrl), {
      ...init,
      headers: { ...headers, ...init.headers },
    })
    if (!response.ok) {
      const body = await response.text()
      let detail = body
      try {
        const parsed = JSON.parse(body)
        detail = parsed.message ?? parsed.error ?? body
      } catch {
        // Keep the source response text when it is not JSON.
      }
      throw new Error(`${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`)
    }
    return response
  }

  return {
    async listBuckets() {
      try {
        return await (await request('bucket')).json()
      } catch (error) {
        throw new Error(`Unable to list source storage buckets: ${error.message}`)
      }
    },
    async listObjects(bucket, prefix, offset) {
      const encodedBucket = encodeURIComponent(bucket)
      try {
        return await (
          await request(`object/list/${encodedBucket}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              prefix,
              limit: 1000,
              offset,
              sortBy: { column: 'name', order: 'asc' },
            }),
          })
        ).json()
      } catch (error) {
        throw new Error(`Unable to list ${bucket}/${prefix}: ${error.message}`)
      }
    },
    async download(bucket, objectPath) {
      const encodedPath = [bucket, ...objectPath.split('/')].map(encodeURIComponent).join('/')
      try {
        const response = await request(`object/${encodedPath}`)
        return Buffer.from(await response.arrayBuffer())
      } catch (error) {
        throw new Error(`Unable to download ${bucket}/${objectPath}: ${error.message}`)
      }
    },
  }
}

async function listStorageObjects(sourceStorage, bucket, prefix = '') {
  const paths = []
  for (let offset = 0; ; offset += 1000) {
    const data = await sourceStorage.listObjects(bucket, prefix, offset)
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id == null) paths.push(...(await listStorageObjects(sourceStorage, bucket, path)))
      else paths.push(path)
    }
    if (data.length < 1000) break
  }
  return paths
}

async function verifyBlob(pathname, token, expectedSize, expectedChecksum) {
  try {
    const result = await get(pathname, { access: 'private', token, useCache: false })
    if (!result || result.blob.size !== expectedSize) return { matches: false }
    const bytes = Buffer.from(await new Response(result.stream).arrayBuffer())
    return { matches: bytes.length === expectedSize && sha256(bytes) === expectedChecksum }
  } catch {
    return { matches: false }
  }
}

function summarizeMissingMappings(missing) {
  const counts = new Map()
  for (const item of missing) {
    const key = `${item.table}.${item.column}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts].map(([key, count]) => `${key}: ${count}`).join(', ')
}

function requiredEnvironment(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} is unavailable; live import remains pending. Configure server-only credentials and retry.`,
    )
  }
  return value
}

async function readState(path) {
  try {
    return JSON.parse(await readFile(resolve(path), 'utf8'))
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return { version: 1 }
    throw error
  }
}

async function writeState(path, value) {
  const absolutePath = resolve(path)
  await mkdir(dirname(absolutePath), { recursive: true, mode: 0o700 })
  const temporaryPath = `${absolutePath}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 })
  await rename(temporaryPath, absolutePath)
}
