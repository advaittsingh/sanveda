import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildIdentityColumns,
  checksumRows,
  mapIdentityRow,
  parseArguments,
  quoteIdentifier,
  topologicalSort,
} from './data-import-helpers.mjs'

test('orders tables after their foreign-key dependencies', () => {
  assert.deepEqual(
    topologicalSort(
      ['children', 'parents', 'roots'],
      [
        { table: 'children', referencedTable: 'parents' },
        { table: 'parents', referencedTable: 'roots' },
      ],
    ),
    ['roots', 'parents', 'children'],
  )
})

test('maps identity references through identity-root tables', () => {
  const foreignKeys = [
    {
      table: 'profiles',
      column: 'id',
      referencedTable: 'user',
      referencedColumn: 'id',
    },
    {
      table: 'blogs',
      column: 'author_id',
      referencedTable: 'profiles',
      referencedColumn: 'id',
    },
  ]
  const identityColumns = buildIdentityColumns(foreignKeys)
  assert(identityColumns.has('blogs.author_id'))
  const result = mapIdentityRow(
    { id: 1, author_id: 'source-user' },
    'blogs',
    [
      { name: 'id', nullable: false },
      { name: 'author_id', nullable: true },
    ],
    identityColumns,
    new Map(),
  )
  assert.equal(result.row.author_id, null)
  assert.deepEqual(result.missingRequired, [])
})

test('reports missing required identity mappings', () => {
  const result = mapIdentityRow(
    { user_id: 'source-user' },
    'admin_users',
    [{ name: 'user_id', nullable: false }],
    new Set(['admin_users.user_id']),
    new Map(),
  )
  assert.equal(result.missingRequired.length, 1)
})

test('produces stable checksums independent of object key order', () => {
  assert.equal(checksumRows([{ a: 1, b: 2 }]), checksumRows([{ b: 2, a: 1 }]))
})

test('parses dry-run defaults and validates batch size', () => {
  assert.deepEqual(parseArguments([]), {
    apply: false,
    component: 'all',
    batchSize: 250,
    mappingFile: undefined,
    stateFile: '.data-import/state.json',
    buckets: [],
  })
  assert.throws(() => parseArguments(['--batch-size', '0']), /batch-size/)
  assert.equal(quoteIdentifier('a"b'), '"a""b"')
})
