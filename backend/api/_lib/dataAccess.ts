import { z } from 'zod'
import { query } from './db.js'
import { HttpError } from './http.js'
import { optionalSession, requireAdmin } from './session.js'
import type { VercelRequest } from './vercel.js'

export const domains = [
  'identity',
  'content',
  'programs',
  'people',
  'finance',
  'governance',
] as const
export type DataDomain = (typeof domains)[number]

export type ResourcePolicy = {
  domain: DataDomain
  module: string
  publicRead?: { where: string; columns: string }
  donorOwned?: boolean
}

export const resources = {
  profiles: { domain: 'identity', module: 'admin_users', donorOwned: true },
  admin_users: { domain: 'identity', module: 'admin_users' },
  admin_roles: { domain: 'identity', module: 'admin_users' },
  admin_departments: { domain: 'identity', module: 'admin_users' },
  admin_invitations: { domain: 'identity', module: 'admin_users' },
  workflow_definitions: { domain: 'identity', module: 'admin_users' },
  campaigns: {
    domain: 'content',
    module: 'campaigns',
    publicRead: {
      where: `status in ('active','approved','published')
        and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())`,
      columns:
        'id,slug,title,banner_image,thumbnail_image,goal,raised,description,exemption_tag,total_donors,category,hide_goal,hide_raised,feature_urgent,feature_recent,featured,campaign_descriptions,status,starts_at,ends_at,created_at,updated_at',
    },
  },
  blogs: {
    domain: 'content',
    module: 'blogs',
    publicRead: {
      where: `status = 'published' and (published_at is null or published_at <= now())`,
      columns:
        'id,slug,title,banner_image,description,content,category,status,published_at,created_at,updated_at',
    },
  },
  cms_pages: {
    domain: 'content',
    module: 'content',
    publicRead: {
      where: `status = 'published' and (published_at is null or published_at <= now())`,
      columns: 'id,slug,title,path,status,seo,published_at,created_at,updated_at',
    },
  },
  cms_sections: {
    domain: 'content',
    module: 'content',
    publicRead: {
      where: `is_enabled = true and exists (select 1 from cms_pages p where p.id = cms_sections.page_id and p.status = 'published')`,
      columns:
        'id,page_id,key,section_type,content,sort_order,is_enabled,is_reusable,created_at,updated_at',
    },
  },
  testimonials: {
    domain: 'content',
    module: 'content',
    publicRead: {
      where: `status = 'published'`,
      columns:
        'id,name,designation,photo_url,quote,rating,category,is_featured,status,sort_order,created_at,updated_at',
    },
  },
  gallery_albums: {
    domain: 'content',
    module: 'gallery',
    publicRead: {
      where: `status = 'published'`,
      columns: 'id,slug,title,description,cover_image,status,sort_order,created_at,updated_at',
    },
  },
  gallery_items: {
    domain: 'content',
    module: 'gallery',
    publicRead: {
      where: `exists (select 1 from gallery_albums a where a.id = gallery_items.album_id and a.status = 'published')`,
      columns: 'id,album_id,media_type,url,caption,metadata,sort_order,created_at',
    },
  },
  projects: {
    domain: 'programs',
    module: 'projects',
    publicRead: {
      where: `status in ('active','completed')`,
      columns:
        'id,slug,title,description,focus_area,status,budget,spent,beneficiaries_count,start_date,end_date,manager_name,progress_percent,project_code,lifecycle_stage,priority,location,received_funds,created_at,updated_at',
    },
  },
  project_milestones: { domain: 'programs', module: 'projects' },
  project_tasks: { domain: 'programs', module: 'projects' },
  project_funding: { domain: 'programs', module: 'projects' },
  project_team: { domain: 'programs', module: 'projects' },
  beneficiaries: { domain: 'programs', module: 'beneficiaries' },
  beneficiary_household_members: { domain: 'programs', module: 'beneficiaries' },
  beneficiary_support: { domain: 'programs', module: 'beneficiaries' },
  beneficiary_outcomes: { domain: 'programs', module: 'beneficiaries' },
  events: {
    domain: 'programs',
    module: 'events',
    publicRead: {
      where: `status = 'published'`,
      columns:
        'id,project_id,campaign_id,slug,title,description,location,event_date,end_date,capacity,registered_count,status,banner_image,event_code,category,lifecycle_stage,organizer,created_at,updated_at',
    },
  },
  event_registrations: { domain: 'programs', module: 'events' },
  event_agenda: { domain: 'programs', module: 'events' },
  event_staffing: { domain: 'programs', module: 'events' },
  event_sponsorships: { domain: 'programs', module: 'events' },
  event_attendance: { domain: 'programs', module: 'events' },
  event_feedback: { domain: 'programs', module: 'events' },
  enquiries: { domain: 'people', module: 'enquiries' },
  enquiry_messages: { domain: 'people', module: 'enquiries' },
  enquiry_assignments: { domain: 'people', module: 'enquiries' },
  enquiry_sla_events: { domain: 'people', module: 'enquiries' },
  enquiry_conversions: { domain: 'people', module: 'enquiries' },
  memberships: { domain: 'people', module: 'memberships' },
  membership_payments: { domain: 'people', module: 'memberships' },
  membership_participation: { domain: 'people', module: 'memberships' },
  internships: { domain: 'people', module: 'internships' },
  intern_mentoring_sessions: { domain: 'people', module: 'internships' },
  intern_tasks: { domain: 'people', module: 'internships' },
  intern_attendance: { domain: 'people', module: 'internships' },
  intern_stipends: { domain: 'people', module: 'internships' },
  internship_assignments: { domain: 'people', module: 'internships' },
  volunteer_applications: { domain: 'people', module: 'volunteers' },
  volunteer_assignments: { domain: 'people', module: 'volunteers' },
  volunteer_tasks: { domain: 'people', module: 'volunteers' },
  volunteer_time_entries: { domain: 'people', module: 'volunteers' },
  volunteer_certifications: { domain: 'people', module: 'volunteers' },
  donor_profiles: { domain: 'people', module: 'donations' },
  donor_communications: { domain: 'people', module: 'donations' },
  donor_tasks: { domain: 'people', module: 'donations' },
  donations: {
    domain: 'finance',
    module: 'donations',
    donorOwned: true,
    publicRead: {
      where: `status = 'completed'`,
      columns:
        'id,campaign_id,campaign_slug,campaign_title,amount,currency,is_anonymous,donor_name,status,created_at',
    },
  },
  payment_transactions: { domain: 'finance', module: 'finance' },
  recurring_donations: { domain: 'finance', module: 'donations', donorOwned: true },
  recurring_payment_attempts: { domain: 'finance', module: 'donations' },
  donation_receipts: { domain: 'finance', module: 'donations', donorOwned: true },
  donation_ops_meta: { domain: 'finance', module: 'donations' },
  donation_refunds: { domain: 'finance', module: 'donations' },
  payment_reconciliation: { domain: 'finance', module: 'finance' },
  expenses: { domain: 'finance', module: 'finance' },
  income_records: { domain: 'finance', module: 'finance' },
  finance_ledger_locks: { domain: 'finance', module: 'finance' },
  documents: {
    domain: 'governance',
    module: 'documents',
    publicRead: {
      where: `visibility = 'public' and status = 'published'`,
      columns:
        'id,document_id,title,category,folder,description,version,issue_date,expiry_date,visibility,status,tags,file_url,file_size_mb,project,campaign,event,focus_area,downloads,views,shares,is_compliance,created_at,updated_at',
    },
  },
  verification_records: { domain: 'governance', module: 'documents' },
  audit_logs: { domain: 'governance', module: 'audit' },
} as const satisfies Record<string, ResourcePolicy>

export type ResourceName = keyof typeof resources

const identifier = z.string().regex(/^[a-z][a-z0-9_]*$/)
const filterSchema = z.object({
  kind: z.enum(['eq', 'neq', 'in']),
  column: identifier,
  value: z.unknown(),
})

export const dataRequestSchema = z.object({
  resource: z.enum(Object.keys(resources) as [ResourceName, ...ResourceName[]]),
  audience: z.enum(['auto', 'public']).default('auto'),
  operation: z.enum(['select', 'insert', 'update', 'delete', 'upsert']),
  columns: z.string().max(1000).default('*'),
  values: z.unknown().optional(),
  filters: z.array(filterSchema).max(12).default([]),
  orders: z
    .array(z.object({ column: identifier, ascending: z.boolean() }))
    .max(3)
    .default([]),
  limit: z.number().int().positive().max(500).optional(),
  onConflict: z
    .string()
    .regex(/^[a-z][a-z0-9_]*(,[a-z][a-z0-9_]*)*$/)
    .optional(),
  resultMode: z.enum(['many', 'single', 'maybeSingle']).default('many'),
})

const contactPhoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number is too short')
  .max(32, 'Phone number is too long')
  .regex(/^[\d+()\s.-]+$/, 'Enter a valid phone number')
  .refine((value) => {
    const digits = value.replace(/\D/g, '').length
    return digits >= 7 && digits <= 15
  }, 'Enter a valid phone number with 7–15 digits')

/** Reject markup / script-like payloads in free-text public writes. */
const plainTextField = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine(
      (value) => !/<[^>]*>|javascript:|on\w+\s*=|data:text\/html/i.test(value),
      'HTML or script content is not allowed',
    )

const enquirySchema = z
  .object({
    name: plainTextField(2, 160),
    phone: contactPhoneSchema,
    email: z.string().trim().email().max(254),
    subject: plainTextField(2, 240),
    message: plainTextField(5, 5000),
  })
  .strict()
const eventRegistrationSchema = z
  .object({
    event_id: z.string().uuid(),
    full_name: z.string().trim().min(2).max(160),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(32).nullable().optional(),
  })
  .strict()
const membershipSchema = z
  .object({
    user_id: z.string().uuid().nullable().optional(),
    full_name: z.string().trim().min(2).max(160),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(7).max(32),
    address: z.string().trim().max(500),
    city: z.string().trim().max(120),
    state: z.string().trim().max(120),
    country: z.string().trim().max(120),
    occupation: z.string().trim().max(160),
    motivation: z.string().trim().max(3000),
    tier: z.enum(['standard', 'patron', 'founding']),
    status: z.literal('pending'),
  })
  .strict()
const internshipSchema = z
  .object({
    application_id: z.string().regex(/^SVD-INT-\d{4}-[A-F0-9]{32}$/),
    full_name: z.string().trim().min(2).max(160),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(7).max(32),
    university: z.string().max(200),
    course: z.string().max(160),
    semester: z.string().max(80),
    preferred_department: z.string().max(160),
    duration_weeks: z.number().int().positive().max(104),
    motivation: z.string().max(3000),
    skills: z.string().max(3000),
    status: z.literal('pending'),
  })
  .strict()
const personNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(160)
  .refine(
    (value) =>
      !/[<>{}[\]\\/`]|script|javascript:|on\w+=/i.test(value) &&
      /^[\p{L}\p{M}][\p{L}\p{M} .'’\-]*$/u.test(value),
    'Enter a valid name using letters only',
  )

const volunteerDobSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date of birth')
  .refine((value) => {
    const dob = new Date(`${value}T00:00:00Z`)
    if (Number.isNaN(dob.getTime())) return false
    const today = new Date()
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    const dobUtc = Date.UTC(dob.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate())
    if (dobUtc > todayUtc) return false
    const minUtc = Date.UTC(today.getUTCFullYear() - 100, today.getUTCMonth(), today.getUTCDate())
    if (dobUtc < minUtc) return false
    const minAgeUtc = Date.UTC(today.getUTCFullYear() - 16, today.getUTCMonth(), today.getUTCDate())
    return dobUtc <= minAgeUtc
  }, 'Date of birth must be a realistic past date and at least 16 years ago')

const volunteerSchema = z
  .object({
    id: z.string().regex(/^SVD-APP-\d{4}-[A-F0-9]{32}$/),
    volunteer_id: z.null().optional(),
    status: z.literal('pending'),
    full_name: personNameSchema,
    date_of_birth: volunteerDobSchema.nullable(),
    gender: z.string().max(40),
    email: z.string().email().max(254),
    phone: z.string().min(7).max(32),
    address: z.string().max(500),
    city: z.string().max(120),
    state: z.string().max(120),
    country: z.string().max(120),
    occupation: z.string().max(160),
    organization: z.string().max(200),
    linkedin: z.string().max(500),
    education: z.string().max(500),
    preferred_roles: z.array(z.string().max(120)).max(20),
    volunteer_type: z.string().max(80),
    hours_per_week: z
      .string()
      .trim()
      .max(80)
      .regex(/^\d+(\.\d+)?$/, 'Hours per week must be a positive number')
      .refine((value) => {
        const hours = Number(value)
        return Number.isFinite(hours) && hours > 0 && hours <= 168
      }, 'Hours per week must be between 1 and 168'),
    skills: z.string().max(3000),
    experience: z.string().max(3000),
    languages: z.string().max(1000),
    certifications: z.string().max(2000),
    motivation: z.string().max(3000),
    about_yourself: z.string().max(3000),
    previous_experience: z.string().max(3000),
    resume_url: z.string().max(1000).nullable(),
    resume_name: z.string().max(255).nullable(),
    id_proof_url: z.string().max(1000).nullable(),
    id_proof_name: z.string().max(255).nullable(),
    photo_url: z.string().max(1000).nullable(),
    photo_name: z.string().max(255).nullable(),
    agreed_policies: z.literal(true),
    agreed_background_check: z.boolean(),
    agreed_data_processing: z.literal(true),
    assigned_team: z.null().optional(),
    admin_notes: z.null().optional(),
    interview_date: z.null().optional(),
    department: z.null().optional(),
    emergency_contact: z.null().optional(),
    is_team_leader: z.null().optional(),
    updated_at: z.string().datetime(),
  })
  .strict()

const publicInsertSchemas: Partial<Record<ResourceName, z.ZodType>> = {
  enquiries: enquirySchema,
  event_registrations: eventRegistrationSchema,
  memberships: membershipSchema,
  internships: internshipSchema,
  volunteer_applications: volunteerSchema,
}

const LEGACY_MODULES: Record<string, string[]> = {
  finance: ['donations', 'finance', 'beneficiaries', 'audit'],
  content: ['campaigns', 'blogs', 'gallery', 'events', 'content'],
  volunteer: ['volunteers', 'internships', 'enquiries'],
}

export async function requirePermission(req: VercelRequest, module: string, action: string) {
  const session = await requireAdmin(req)
  const [row] = await query<{
    role: string
    role_key: string | null
    permissions: string[] | null
  }>(
    `select au.role, ar.key as role_key,
       array_remove(array_agg(ap.key order by ap.key), null) as permissions
       from admin_users au
       left join admin_roles ar on ar.id = au.role_id
       left join admin_role_permissions arp on arp.role_id = au.role_id
       left join admin_permissions ap on ap.id = arp.permission_id
      where au.user_id = $1
      group by au.role, ar.key`,
    [session.user.id],
  )
  const role = row?.role_key ?? row?.role
  const keys = new Set(row?.permissions ?? [])
  const allowed =
    role === 'super_admin' ||
    role === 'admin' ||
    keys.has(`${module}.${action}`) ||
    keys.has(`${module}.manage`) ||
    (action === 'view' && (keys.has(`${module}.read`) || keys.has(`${module}.write`))) ||
    (['create', 'edit'].includes(action) && keys.has(`${module}.write`)) ||
    ((row?.permissions?.length ?? 0) === 0 &&
      Boolean(role && LEGACY_MODULES[role]?.includes(module)))
  if (!allowed) throw new HttpError(403, `Missing ${module}.${action} permission`, 'forbidden')
  return session
}

export async function accessForRequest(
  req: VercelRequest,
  resource: ResourceName,
  operation: string,
  audience: 'auto' | 'public',
) {
  const policy: ResourcePolicy = resources[resource]
  if (audience === 'public') {
    if (operation !== 'select' || !policy.publicRead) {
      throw new HttpError(403, 'This resource has no public read operation', 'forbidden')
    }
    return { kind: 'public' as const, policy }
  }
  const session = await optionalSession(req)
  let activeAdmin = false
  if (session) {
    const [admin] = await query<{ ok: boolean }>(
      `select true as ok from admin_users where user_id = $1 and is_active and status = 'active'`,
      [session.user.id],
    )
    activeAdmin = Boolean(admin)
  }
  if (operation === 'select' && policy.publicRead && !session)
    return { kind: 'public' as const, policy }
  if (operation === 'insert' && publicInsertSchemas[resource]) {
    return { kind: 'public-write' as const, policy, session }
  }
  if (policy.donorOwned && session) {
    if (!activeAdmin) {
      const donorAllowed =
        operation === 'select' || (resource === 'profiles' && operation === 'update')
      if (!donorAllowed) throw new HttpError(403, 'Donor access is read-only', 'forbidden')
      return { kind: 'donor' as const, policy, session }
    }
  }
  const action =
    operation === 'select'
      ? 'view'
      : operation === 'insert'
        ? 'create'
        : operation === 'delete'
          ? 'delete'
          : 'edit'
  const adminSession = await requirePermission(req, policy.module, action)
  return { kind: 'admin' as const, policy, session: adminSession }
}

export function validatePublicInsert(resource: ResourceName, values: unknown): unknown {
  const schema = publicInsertSchemas[resource]
  if (!schema) throw new HttpError(403, 'Public write is not allowed', 'forbidden')
  return schema.parse(values)
}

export function quoteIdentifier(value: string): string {
  if (!/^[a-z][a-z0-9_]*$/.test(value))
    throw new HttpError(400, 'Invalid identifier', 'invalid_request')
  return `"${value}"`
}

export function selectColumns(value: string): string {
  if (value.trim() === '*') return '*'
  const columns = value.split(',').map((part) => part.trim())
  if (!columns.length || columns.some((column) => !/^[a-z][a-z0-9_]*$/.test(column))) {
    throw new HttpError(400, 'Only explicit column names are supported', 'invalid_request')
  }
  return columns.map(quoteIdentifier).join(', ')
}
