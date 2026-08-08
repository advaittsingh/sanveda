export type DataResource =
  | 'profiles'
  | 'admin_users'
  | 'admin_roles'
  | 'admin_departments'
  | 'admin_invitations'
  | 'workflow_definitions'
  | 'campaigns'
  | 'blogs'
  | 'cms_pages'
  | 'cms_sections'
  | 'testimonials'
  | 'gallery_albums'
  | 'gallery_items'
  | 'projects'
  | 'project_milestones'
  | 'project_tasks'
  | 'project_funding'
  | 'project_team'
  | 'beneficiaries'
  | 'beneficiary_household_members'
  | 'beneficiary_support'
  | 'beneficiary_outcomes'
  | 'events'
  | 'event_registrations'
  | 'event_agenda'
  | 'event_staffing'
  | 'event_sponsorships'
  | 'event_attendance'
  | 'event_feedback'
  | 'enquiries'
  | 'enquiry_messages'
  | 'enquiry_assignments'
  | 'enquiry_sla_events'
  | 'enquiry_conversions'
  | 'memberships'
  | 'membership_payments'
  | 'membership_participation'
  | 'internships'
  | 'intern_mentoring_sessions'
  | 'intern_tasks'
  | 'intern_attendance'
  | 'intern_stipends'
  | 'internship_assignments'
  | 'volunteer_applications'
  | 'volunteer_assignments'
  | 'volunteer_tasks'
  | 'volunteer_time_entries'
  | 'volunteer_certifications'
  | 'donor_profiles'
  | 'donor_communications'
  | 'donor_tasks'
  | 'donations'
  | 'payment_transactions'
  | 'recurring_donations'
  | 'recurring_payment_attempts'
  | 'donation_receipts'
  | 'donation_ops_meta'
  | 'donation_refunds'
  | 'payment_reconciliation'
  | 'expenses'
  | 'income_records'
  | 'finance_ledger_locks'
  | 'documents'
  | 'verification_records'
  | 'audit_logs'

export type DataFunction =
  | 'create_pending_donation_checkout'
  | 'get_checkout_result'
  | 'verify_receipt_token'
  | 'lookup_verification_code'
  | 'ensure_verification_record'
  | 'lookup_volunteer_application'
  | 'lookup_membership_status'
  | 'lookup_internship_status'
  | 'generate_member_id'
  | 'generate_certificate_number'
  | 'current_admin_access'
  | 'set_admin_role_permissions'
  | 'rbac_dashboard'
  | 'my_service_portal'
  | 'resolve_post_login_destination'
  | 'update_my_task'
  | 'review_task'

type DataError = { message: string; code?: string }
export type DataResult<T> = { data: T; error: null } | { data: null; error: DataError }
type Filter = { kind: 'eq' | 'neq' | 'in'; column: string; value: unknown }
type Order = { column: string; ascending: boolean }
type Operation = 'select' | 'insert' | 'update' | 'delete' | 'upsert'

const DOMAIN_BY_RESOURCE: Record<DataResource, string> = {
  profiles: 'identity',
  admin_users: 'identity',
  admin_roles: 'identity',
  admin_departments: 'identity',
  admin_invitations: 'identity',
  workflow_definitions: 'identity',
  campaigns: 'content',
  blogs: 'content',
  cms_pages: 'content',
  cms_sections: 'content',
  testimonials: 'content',
  gallery_albums: 'content',
  gallery_items: 'content',
  projects: 'programs',
  project_milestones: 'programs',
  project_tasks: 'programs',
  project_funding: 'programs',
  project_team: 'programs',
  beneficiaries: 'programs',
  beneficiary_household_members: 'programs',
  beneficiary_support: 'programs',
  beneficiary_outcomes: 'programs',
  events: 'programs',
  event_registrations: 'programs',
  event_agenda: 'programs',
  event_staffing: 'programs',
  event_sponsorships: 'programs',
  event_attendance: 'programs',
  event_feedback: 'programs',
  enquiries: 'people',
  enquiry_messages: 'people',
  enquiry_assignments: 'people',
  enquiry_sla_events: 'people',
  enquiry_conversions: 'people',
  memberships: 'people',
  membership_payments: 'people',
  membership_participation: 'people',
  internships: 'people',
  intern_mentoring_sessions: 'people',
  intern_tasks: 'people',
  intern_attendance: 'people',
  intern_stipends: 'people',
  internship_assignments: 'people',
  volunteer_applications: 'people',
  volunteer_assignments: 'people',
  volunteer_tasks: 'people',
  volunteer_time_entries: 'people',
  volunteer_certifications: 'people',
  donor_profiles: 'people',
  donor_communications: 'people',
  donor_tasks: 'people',
  donations: 'finance',
  payment_transactions: 'finance',
  recurring_donations: 'finance',
  recurring_payment_attempts: 'finance',
  donation_receipts: 'finance',
  donation_ops_meta: 'finance',
  donation_refunds: 'finance',
  payment_reconciliation: 'finance',
  expenses: 'finance',
  income_records: 'finance',
  finance_ledger_locks: 'finance',
  documents: 'governance',
  verification_records: 'governance',
  audit_logs: 'governance',
}

async function request<T>(path: string, body: unknown): Promise<DataResult<T>> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = (await response.json()) as {
      data?: T
      error?: string
      message?: string
      code?: string
    }
    if (!response.ok) {
      return {
        data: null,
        error: {
          message: payload.message ?? payload.error ?? 'Request failed',
          code: payload.code,
        },
      }
    }
    return { data: (payload.data ?? null) as T, error: null }
  } catch (error) {
    return {
      data: null,
      error: { message: error instanceof Error ? error.message : 'Network request failed' },
    }
  }
}

class DataQuery<T = Record<string, unknown>[]> implements PromiseLike<DataResult<T>> {
  private readonly resource: DataResource
  private readonly audience: 'auto' | 'public'
  private operation: Operation = 'select'
  private columns = '*'
  private values: unknown
  private filters: Filter[] = []
  private orders: Order[] = []
  private rowLimit?: number
  private conflict?: string
  private resultMode: 'many' | 'single' | 'maybeSingle' = 'many'

  constructor(resource: DataResource, audience: 'auto' | 'public' = 'auto') {
    this.resource = resource
    this.audience = audience
  }

  select(columns = '*'): this {
    this.columns = columns
    return this
  }

  insert(values: unknown): this {
    this.operation = 'insert'
    this.values = values
    return this
  }

  update(values: unknown): this {
    this.operation = 'update'
    this.values = values
    return this
  }

  upsert(values: unknown, options?: { onConflict?: string }): this {
    this.operation = 'upsert'
    this.values = values
    this.conflict = options?.onConflict
    return this
  }

  delete(): this {
    this.operation = 'delete'
    return this
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ kind: 'eq', column, value })
    return this
  }

  neq(column: string, value: unknown): this {
    this.filters.push({ kind: 'neq', column, value })
    return this
  }

  in(column: string, value: unknown[]): this {
    this.filters.push({ kind: 'in', column, value })
    return this
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orders.push({ column, ascending: options?.ascending !== false })
    return this
  }

  limit(value: number): this {
    this.rowLimit = value
    return this
  }

  single(): Promise<DataResult<Record<string, unknown>>> {
    this.resultMode = 'single'
    return this.execute<Record<string, unknown>>()
  }

  maybeSingle(): Promise<DataResult<Record<string, unknown> | null>> {
    this.resultMode = 'maybeSingle'
    return this.execute<Record<string, unknown> | null>()
  }

  then<TResult1 = DataResult<T>, TResult2 = never>(
    onfulfilled?: ((value: DataResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute<T>().then(onfulfilled, onrejected)
  }

  private execute<R>(): Promise<DataResult<R>> {
    const domain = DOMAIN_BY_RESOURCE[this.resource]
    return request<R>(`/api/data/${domain}`, {
      resource: this.resource,
      audience: this.audience,
      operation: this.operation,
      columns: this.columns,
      values: this.values,
      filters: this.filters,
      orders: this.orders,
      limit: this.rowLimit,
      onConflict: this.conflict,
      resultMode: this.resultMode,
    })
  }
}

export const dataApi = {
  table<T = Record<string, unknown>[]>(resource: DataResource): DataQuery<T> {
    return new DataQuery<T>(resource)
  },
  publicTable<T = Record<string, unknown>[]>(resource: DataResource): DataQuery<T> {
    return new DataQuery<T>(resource, 'public')
  },
  call<T = unknown>(
    name: DataFunction,
    args: Record<string, unknown> = {},
  ): Promise<DataResult<T>> {
    return request<T>('/api/data/functions', { name, args })
  },
}
