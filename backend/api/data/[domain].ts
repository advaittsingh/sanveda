import type { QueryResultRow } from 'pg'
import {
  isPublicSubmissionResource,
  requestClientMeta,
  resolveActorDisplayName,
  writePublicSubmissionAudit,
} from '../_lib/audit.js'
import { bindColumnValue, getColumnTypes, transaction } from '../_lib/db.js'
import {
  accessForRequest,
  dataRequestSchema,
  domains,
  quoteIdentifier,
  resources,
  selectColumns,
  validatePublicInsert,
  type ResourcePolicy,
  type ResourceName,
} from '../_lib/dataAccess.js'
import { notifyEnquiryCreated } from '../_lib/enquiryNotify.js'
import { apiHandler, HttpError, method, parseBody } from '../_lib/http.js'

type JsonRow = QueryResultRow & Record<string, unknown>

function objectValues(value: unknown): Record<string, unknown> {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new HttpError(400, 'Object values are required', 'invalid_request')
  }
  return value as Record<string, unknown>
}

function asDetailsObject(value: unknown): Record<string, unknown> {
  if (!value || Array.isArray(value) || typeof value !== 'object') return {}
  return value as Record<string, unknown>
}

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const domain = String(req.query.domain ?? '')
  if (!domains.includes(domain as (typeof domains)[number])) {
    throw new HttpError(404, 'Unknown API domain', 'not_found')
  }

  const input = parseBody(req, dataRequestSchema)
  const resource = input.resource as ResourceName
  const policy: ResourcePolicy = resources[resource]
  if (policy.domain !== domain)
    throw new HttpError(404, 'Resource is not in this domain', 'not_found')
  const access = await accessForRequest(req, resource, input.operation, input.audience)
  if (access.kind === 'public') {
    const approvedColumns = new Set(
      access.policy.publicRead!.columns.split(',').map((column) => column.trim()),
    )
    const requestedIdentifiers = [
      ...input.filters.map((filter) => filter.column),
      ...input.orders.map((order) => order.column),
    ]
    if (requestedIdentifiers.some((identifier) => !approvedColumns.has(identifier))) {
      throw new HttpError(400, 'Public query uses a non-public field', 'invalid_request')
    }
  }
  if (access.kind === 'donor' && resource === 'profiles' && input.operation === 'update') {
    const keys = Object.keys(objectValues(input.values))
    if (keys.some((key) => !['full_name', 'phone', 'updated_at'].includes(key))) {
      throw new HttpError(400, 'Profile update contains a protected field', 'invalid_request')
    }
  }

  const result = await transaction(async (client) => {
    const params: unknown[] = []
    const conditions: string[] = []
    const addParam = (value: unknown) => {
      params.push(value)
      return `$${params.length}`
    }

    for (const filter of input.filters) {
      const column = quoteIdentifier(filter.column)
      if (filter.kind === 'in') {
        if (!Array.isArray(filter.value))
          throw new HttpError(400, 'IN filter requires an array', 'invalid_request')
        if (filter.value.length === 0) conditions.push('false')
        else conditions.push(`${column} = any(${addParam(filter.value)})`)
      } else {
        const operator = filter.kind === 'eq' ? '=' : '<>'
        conditions.push(`${column} ${operator} ${addParam(filter.value)}`)
      }
    }

    let values = input.values
    if (access.kind === 'public') {
      conditions.push(`(${access.policy.publicRead!.where})`)
    } else if (access.kind === 'public-write') {
      values = validatePublicInsert(resource, values)
      if (resource === 'memberships') {
        values = { ...objectValues(values), user_id: access.session?.user.id ?? null }
      }
      if (resource === 'event_registrations') {
        const row = objectValues(values)
        const event = await client.query<{ id: string }>(
          `select id from events
            where id = $1 and status = 'published'
              and (capacity is null or registered_count < capacity)
            for update`,
          [row.event_id],
        )
        if (!event.rowCount)
          throw new HttpError(409, 'Event is unavailable or full', 'event_unavailable')
      }
    } else if (access.kind === 'donor') {
      if (resource === 'profiles') {
        conditions.push(`id = ${addParam(access.session.user.id)}`)
      } else if (resource === 'donations' || resource === 'recurring_donations') {
        conditions.push(`user_id = ${addParam(access.session.user.id)}`)
      } else if (resource === 'donation_receipts') {
        conditions.push(`exists (
          select 1 from donations owned
           where owned.id = donation_receipts.donation_id and owned.user_id = ${addParam(access.session.user.id)}
        )`)
      }
    } else if (
      access.kind === 'admin' &&
      ['insert', 'update', 'upsert'].includes(input.operation)
    ) {
      const row = objectValues(values)
      if (resource === 'audit_logs') {
        const meta = requestClientMeta(req)
        const displayName =
          (await resolveActorDisplayName(access.session.user.id)) ??
          access.session.user.name ??
          access.session.user.email ??
          'Admin'
        const details = {
          ...asDetailsObject(row.details),
          user: displayName,
          ip: meta.ip,
          browser: meta.browser,
          device: meta.device ?? asDetailsObject(row.details).device,
        }
        values = {
          ...row,
          user_id: access.session.user.id,
          ip_address: meta.ip,
          browser: meta.browser,
          device: meta.device,
          details,
        }
      }
      if (resource === 'donation_refunds') values = { ...row, initiated_by: access.session.user.id }
      if (resource === 'finance_ledger_locks')
        values = { ...row, locked_by: access.session.user.id }
      if (resource === 'documents' && input.operation === 'insert') {
        values = { ...row, owner_user_id: access.session.user.id }
      }
    }

    const table = quoteIdentifier(resource)
    const where = conditions.length ? ` where ${conditions.join(' and ')}` : ''
    const publicColumns =
      access.kind === 'public' ? access.policy.publicRead!.columns : input.columns
    const returning = selectColumns(publicColumns)
    const columnTypes =
      input.operation === 'select' || input.operation === 'delete'
        ? null
        : await getColumnTypes(client, resource)
    const addRowParam = (column: string, value: unknown) =>
      addParam(bindColumnValue(columnTypes?.get(column), value))
    let sql: string

    if (input.operation === 'select') {
      const order = input.orders.length
        ? ` order by ${input.orders.map((item) => `${quoteIdentifier(item.column)} ${item.ascending ? 'asc' : 'desc'}`).join(', ')}`
        : ''
      const limit = Math.min(input.limit ?? 200, 500)
      sql = `select ${returning} from ${table}${where}${order} limit ${addParam(limit)}`
    } else if (input.operation === 'insert') {
      const row = objectValues(values)
      const keys = Object.keys(row)
      if (!keys.length) throw new HttpError(400, 'Insert values are empty', 'invalid_request')
      const placeholders = keys.map((key) => addRowParam(key, row[key]))
      sql = `insert into ${table} (${keys.map(quoteIdentifier).join(', ')})
             values (${placeholders.join(', ')}) returning ${returning}`
    } else if (input.operation === 'update') {
      if (!where) throw new HttpError(400, 'Update requires a filter', 'invalid_request')
      const row = objectValues(values)
      const keys = Object.keys(row)
      if (!keys.length) throw new HttpError(400, 'Update values are empty', 'invalid_request')
      const assignments = keys.map(
        (key) => `${quoteIdentifier(key)} = ${addRowParam(key, row[key])}`,
      )
      sql = `update ${table} set ${assignments.join(', ')}${where} returning ${returning}`
    } else if (input.operation === 'delete') {
      if (!where) throw new HttpError(400, 'Delete requires a filter', 'invalid_request')
      sql = `delete from ${table}${where} returning ${returning}`
    } else {
      const row = objectValues(values)
      const keys = Object.keys(row)
      const conflict = input.onConflict?.split(',') ?? []
      if (!keys.length || !conflict.length || conflict.some((key) => !keys.includes(key))) {
        throw new HttpError(400, 'Valid upsert conflict columns are required', 'invalid_request')
      }
      const placeholders = keys.map((key) => addRowParam(key, row[key]))
      const updateKeys = keys.filter((key) => !conflict.includes(key))
      sql = `insert into ${table} (${keys.map(quoteIdentifier).join(', ')})
             values (${placeholders.join(', ')})
             on conflict (${conflict.map(quoteIdentifier).join(', ')}) do update set
             ${updateKeys.map((key) => `${quoteIdentifier(key)} = excluded.${quoteIdentifier(key)}`).join(', ')}
             returning ${returning}`
    }

    const queryResult = await client.query<JsonRow>(sql, params)
    if (access.kind === 'public' && resource === 'donations') {
      for (const row of queryResult.rows) {
        if (row.is_anonymous) row.donor_name = null
      }
    }
    if (
      access.kind === 'public-write' &&
      resource === 'event_registrations' &&
      queryResult.rows[0]
    ) {
      await client.query(
        `update events set registered_count = registered_count + 1 where id = $1`,
        [queryResult.rows[0].event_id],
      )
    }
    if (input.resultMode === 'single') {
      if (queryResult.rows.length !== 1)
        throw new HttpError(404, 'Expected one record', 'not_found')
      return queryResult.rows[0]
    }
    if (input.resultMode === 'maybeSingle') {
      if (queryResult.rows.length > 1)
        throw new HttpError(409, 'Expected at most one record', 'multiple_records')
      return queryResult.rows[0] ?? null
    }
    return queryResult.rows
  })

  // Best-effort audit after the intake row commits so an audit failure never
  // rolls back Contact / Volunteer / Internship / Membership submissions.
  if (
    access.kind === 'public-write' &&
    input.operation === 'insert' &&
    isPublicSubmissionResource(resource)
  ) {
    const row = (Array.isArray(result) ? result[0] : result) as Record<string, unknown> | null | undefined
    if (row?.id != null) {
      try {
        await writePublicSubmissionAudit(null, req, resource, row)
      } catch (error) {
        console.error('[audit] Public submission audit failed:', error)
      }
    }
  }

  // Best-effort notifications outside the DB transaction so a mail outage
  // never rolls back a successfully saved enquiry.
  if (access.kind === 'public-write' && resource === 'enquiries') {
    const enquiry = (Array.isArray(result) ? result[0] : result) as
      | {
          id?: unknown
          name?: unknown
          email?: unknown
          phone?: unknown
          subject?: unknown
          message?: unknown
        }
      | null
      | undefined
    if (enquiry?.id && enquiry.email) {
      const notify = await notifyEnquiryCreated({
        id: String(enquiry.id),
        name: String(enquiry.name ?? ''),
        email: String(enquiry.email),
        phone: String(enquiry.phone ?? ''),
        subject: String(enquiry.subject ?? ''),
        message: String(enquiry.message ?? ''),
      })
      res.status(200).json({ data: result, notify })
      return
    }
  }

  res.status(200).json({ data: result })
})
