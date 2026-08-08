import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

export const BETTER_AUTH_TABLES = new Set(['user', 'session', 'account', 'verification'])

export function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`
}

export function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (value instanceof Date) return JSON.stringify(value.toISOString())
  if (Buffer.isBuffer(value)) return JSON.stringify(value.toString('base64'))
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
    .join(',')}}`
}

export function checksumRows(rows) {
  const hash = createHash('sha256')
  for (const row of rows) hash.update(canonicalize(row)).update('\n')
  return hash.digest('hex')
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

export function topologicalSort(tables, foreignKeys) {
  const selected = new Set(tables)
  const dependencies = new Map(tables.map((table) => [table, new Set()]))
  for (const foreignKey of foreignKeys) {
    if (
      selected.has(foreignKey.table) &&
      selected.has(foreignKey.referencedTable) &&
      foreignKey.table !== foreignKey.referencedTable
    ) {
      dependencies.get(foreignKey.table).add(foreignKey.referencedTable)
    }
  }

  const result = []
  while (dependencies.size) {
    const ready = [...dependencies]
      .filter(([, values]) => [...values].every((value) => !dependencies.has(value)))
      .map(([table]) => table)
      .sort()
    if (!ready.length) {
      const cycle = [...dependencies.keys()].sort()
      throw new Error(`Foreign-key cycle requires manual handling: ${cycle.join(', ')}`)
    }
    for (const table of ready) {
      result.push(table)
      dependencies.delete(table)
    }
  }
  return result
}

export function buildIdentityColumns(foreignKeys) {
  const identityColumns = new Set(['user.id'])
  let changed = true
  while (changed) {
    changed = false
    for (const foreignKey of foreignKeys) {
      const referenced = `${foreignKey.referencedTable}.${foreignKey.referencedColumn}`
      const current = `${foreignKey.table}.${foreignKey.column}`
      if (identityColumns.has(referenced) && !identityColumns.has(current)) {
        identityColumns.add(current)
        changed = true
      }
    }
  }
  return identityColumns
}

export function mapIdentityRow(row, table, columns, identityColumns, mapping) {
  const mapped = { ...row }
  const missingRequired = []
  for (const column of columns) {
    if (!identityColumns.has(`${table}.${column.name}`) || row[column.name] == null) continue
    const replacement = mapping.get(String(row[column.name]))
    if (replacement) mapped[column.name] = replacement
    else if (column.nullable) mapped[column.name] = null
    else missingRequired.push({ table, column: column.name, sourceId: String(row[column.name]) })
  }
  return { row: mapped, missingRequired }
}

export async function loadIdentityMapping(path) {
  if (!path) return new Map()
  const parsed = JSON.parse(await readFile(path, 'utf8'))
  const entries = Array.isArray(parsed)
    ? parsed.map((item) => [item.sourceSupabaseUserId, item.targetBetterAuthUserId])
    : Object.entries(parsed)
  const mapping = new Map()
  for (const [source, target] of entries) {
    if (!isUuid(source) || !isUuid(target)) {
      throw new Error('Identity mapping keys and values must be UUIDs')
    }
    mapping.set(source, target)
  }
  return mapping
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value),
  )
}

export function parseArguments(argv) {
  const options = {
    apply: false,
    component: 'all',
    batchSize: 250,
    mappingFile: undefined,
    stateFile: '.data-import/state.json',
    buckets: [],
  }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--apply') options.apply = true
    else if (argument === '--help' || argument === '-h') options.help = true
    else if (argument === '--component') options.component = requiredValue(argv, ++index, argument)
    else if (argument === '--batch-size')
      options.batchSize = Number(requiredValue(argv, ++index, argument))
    else if (argument === '--mapping-file')
      options.mappingFile = requiredValue(argv, ++index, argument)
    else if (argument === '--state-file') options.stateFile = requiredValue(argv, ++index, argument)
    else if (argument === '--bucket') options.buckets.push(requiredValue(argv, ++index, argument))
    else throw new Error(`Unknown argument: ${argument}`)
  }
  if (!['all', 'database', 'storage', 'reconcile'].includes(options.component)) {
    throw new Error('--component must be all, database, storage, or reconcile')
  }
  if (!Number.isInteger(options.batchSize) || options.batchSize < 1 || options.batchSize > 1000) {
    throw new Error('--batch-size must be an integer from 1 to 1000')
  }
  return options
}

function requiredValue(argv, index, flag) {
  const value = argv[index]
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`)
  return value
}
