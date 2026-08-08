import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import { serverEnv } from './env.js'

const globalPool = globalThis as typeof globalThis & {
  sanvedaPool?: Pool
  sanvedaColumnTypes?: Map<string, Map<string, string>>
}

export const pool =
  globalPool.sanvedaPool ??
  new Pool({
    connectionString: serverEnv().DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: true },
  })

if (process.env.NODE_ENV !== 'production') {
  globalPool.sanvedaPool = pool
}

const columnTypeCache = globalPool.sanvedaColumnTypes ?? new Map<string, Map<string, string>>()
globalPool.sanvedaColumnTypes = columnTypeCache

export async function query<T extends QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, [...values])
  return result.rows
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('begin')
    const value = await work(client)
    await client.query('commit')
    return value
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

/** Resolve PostgreSQL udt_name for public-table columns (cached per process). */
export async function getColumnTypes(
  client: PoolClient,
  table: string,
): Promise<Map<string, string>> {
  const cached = columnTypeCache.get(table)
  if (cached) return cached

  const result = await client.query<{ column_name: string; udt_name: string }>(
    `select column_name, udt_name
       from information_schema.columns
      where table_schema = 'public' and table_name = $1`,
    [table],
  )
  const types = new Map(result.rows.map((row) => [row.column_name, row.udt_name]))
  columnTypeCache.set(table, types)
  return types
}

/**
 * Bind JS values for pg. JSON/JSONB columns must receive JSON text (not JS arrays),
 * otherwise node-pg serializes arrays as PostgreSQL array literals and inserts fail.
 */
export function bindColumnValue(udtName: string | undefined, value: unknown): unknown {
  if (value === undefined) return null
  if (udtName === 'json' || udtName === 'jsonb') {
    if (value === null) return null
    if (typeof value === 'string') return value
    return JSON.stringify(value)
  }
  return value
}
