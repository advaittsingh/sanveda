import { createHash, randomBytes } from 'node:crypto'
import { z } from 'zod'
import {
  publicSubmissionActor,
  requestClientMeta,
  writeAuditLog,
} from '../_lib/audit.js'
import { query, transaction } from '../_lib/db.js'
import { requirePermission } from '../_lib/dataAccess.js'
import { apiHandler, HttpError, method, parseBody } from '../_lib/http.js'
import { optionalSession, requireAdmin, requireSession } from '../_lib/session.js'
import { storedPath } from '../_lib/storage.js'

const requestSchema = z.discriminatedUnion('name', [
  z.object({
    name: z.literal('create_pending_donation_checkout'),
    args: z
      .object({
        p_campaign_title: z.string().trim().min(1).max(240),
        p_amount: z.number().min(100).max(10_000_000).multipleOf(0.01),
        p_currency: z.literal('INR'),
        p_campaign_id: z.number().int().positive().nullable(),
        p_campaign_slug: z.string().trim().max(200).nullable(),
        p_is_anonymous: z.boolean(),
        p_donor_name: z.string().trim().max(160).nullable(),
        p_donor_email: z.string().trim().email().max(254).nullable(),
        p_donor_phone: z.string().trim().max(32).nullable(),
        p_is_monthly: z.boolean().optional(),
      })
      .strict(),
  }),
  z.object({
    name: z.literal('get_checkout_result'),
    args: z.object({ p_checkout_token: z.string().regex(/^[a-f0-9]{64}$/i) }).strict(),
  }),
  z.object({
    name: z.literal('verify_receipt_token'),
    args: z.object({ p_token: z.string().regex(/^[a-f0-9]{64}$/i) }).strict(),
  }),
  z.object({
    name: z.literal('lookup_verification_code'),
    args: z.object({ p_code: z.string().trim().min(8).max(96) }).strict(),
  }),
  z.object({
    name: z.literal('ensure_verification_record'),
    args: z
      .object({
        p_type: z.enum([
          'donation_receipt',
          'membership_certificate',
          'volunteer_id',
          'internship_certificate',
          'appointment_letter',
          'letter_of_recommendation',
        ]),
        p_holder_name: z.string().trim().min(1).max(200),
        p_reference_id: z.string().trim().min(8).max(96),
        p_metadata: z.record(z.string(), z.unknown()).optional(),
        p_valid_until: z.string().trim().max(32).optional(),
      })
      .strict(),
  }),
  z.object({
    name: z.literal('lookup_volunteer_application'),
    args: z
      .object({
        p_id: z.string().regex(/^SVD-APP-\d{4}-[A-F0-9]{32}$/),
        p_email: z.string().email().max(254),
      })
      .strict(),
  }),
  z.object({
    name: z.literal('lookup_membership_status'),
    args: z.object({ p_id: z.string().uuid(), p_email: z.string().email().max(254) }).strict(),
  }),
  z.object({
    name: z.literal('lookup_internship_status'),
    args: z
      .object({
        p_application_id: z.string().regex(/^SVD-INT-\d{4}-[A-F0-9]{32}$/),
        p_email: z.string().email().max(254),
      })
      .strict(),
  }),
  z.object({ name: z.literal('generate_member_id'), args: z.object({}).strict() }),
  z.object({ name: z.literal('generate_certificate_number'), args: z.object({}).strict() }),
  z.object({ name: z.literal('current_admin_access'), args: z.object({}).strict() }),
  z.object({ name: z.literal('rbac_dashboard'), args: z.object({}).strict() }),
  z.object({ name: z.literal('my_service_portal'), args: z.object({}).strict() }),
  z.object({ name: z.literal('resolve_post_login_destination'), args: z.object({}).strict() }),
  z.object({
    name: z.literal('update_my_task'),
    args: z
      .object({
        p_kind: z.enum(['volunteer', 'intern']),
        p_task_id: z.string().uuid(),
        p_status: z.enum(['pending', 'in_progress', 'completed']).optional(),
        p_proof_url: z.string().trim().min(1).max(1000).optional(),
        p_proof_name: z.string().trim().min(1).max(255).optional(),
        p_proof_content_type: z.string().trim().min(1).max(120).optional(),
      })
      .strict()
      .refine(
        (value) =>
          Boolean(value.p_status) ||
          Boolean(value.p_proof_url) ||
          Boolean(value.p_proof_name) ||
          Boolean(value.p_proof_content_type),
        { message: 'Provide a status update and/or proof of work' },
      )
      .refine(
        (value) =>
          !value.p_proof_url ||
          (Boolean(value.p_proof_name) && Boolean(value.p_proof_content_type)),
        { message: 'Proof uploads require file name and content type' },
      ),
  }),
  z.object({
    name: z.literal('review_task'),
    args: z
      .object({
        p_kind: z.enum(['volunteer', 'intern']),
        p_task_id: z.string().uuid(),
        p_approval_status: z.enum(['approved', 'rejected', 'changes_requested']),
        p_notes: z.string().trim().max(2000).optional(),
      })
      .strict(),
  }),
  z.object({
    name: z.literal('set_admin_role_permissions'),
    args: z
      .object({
        p_role_key: z.string().regex(/^[a-z][a-z0-9_]*$/),
        p_permissions: z
          .array(
            z
              .object({
                module: z.string().regex(/^[a-z][a-z0-9_]*$/),
                action: z.string().regex(/^[a-z][a-z0-9_]*$/),
              })
              .strict(),
          )
          .max(500),
      })
      .strict(),
  }),
])

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  const input = parseBody(req, requestSchema)
  let data: unknown

  if (input.name === 'create_pending_donation_checkout') {
    const session = await optionalSession(req)
    const token = randomBytes(32).toString('hex')
    const isMonthly = Boolean(input.args.p_is_monthly)
    if (isMonthly && input.args.p_campaign_id == null) {
      throw new HttpError(
        400,
        'Monthly autopay requires a specific cause/campaign',
        'campaign_required',
      )
    }
    const meta = requestClientMeta(req)
    data = await transaction(async (client) => {
      if (input.args.p_campaign_id != null) {
        const campaign = await client.query(
          `select 1 from campaigns where id = $1 and status in ('active','approved','published')`,
          [input.args.p_campaign_id],
        )
        if (!campaign.rowCount)
          throw new HttpError(400, 'Campaign is not available for donations', 'invalid_campaign')
      }
      const result = await client.query<Record<string, unknown>>(
        `insert into donations (
           user_id,campaign_id,campaign_slug,campaign_title,amount,currency,is_anonymous,
           donor_name,donor_email,donor_phone,status,checkout_token_hash,donation_type
         ) values ($1,$2,nullif(trim($3),''),trim($4),$5,'INR',$6,$7,lower($8),$9,'pending',$10,$11)
         returning id,user_id,campaign_id,campaign_slug,campaign_title,amount,currency,is_anonymous,
           donor_name,donor_email,donor_phone,status,donation_type,razorpay_order_id,razorpay_payment_id,
           razorpay_subscription_id,receipt_number,created_at`,
        [
          session?.user.id ?? null,
          input.args.p_campaign_id,
          input.args.p_campaign_slug,
          input.args.p_campaign_title,
          input.args.p_amount,
          input.args.p_is_anonymous,
          input.args.p_is_anonymous ? null : input.args.p_donor_name,
          input.args.p_donor_email,
          input.args.p_donor_phone,
          sha256(token),
          isMonthly ? 'recurring' : 'one_time',
        ],
      )
      return { donation: result.rows[0], checkoutToken: token }
    })
    const checkout = data as {
      donation?: Record<string, unknown>
      checkoutToken: string
    }
    // Best-effort after commit so audit failures cannot abort checkout.
    if (isMonthly && checkout.donation?.id != null) {
      const actor = publicSubmissionActor({
        donor_name: checkout.donation.donor_name,
        donor_email: checkout.donation.donor_email,
        name: input.args.p_is_anonymous ? null : input.args.p_donor_name,
        email: input.args.p_donor_email,
      })
      try {
        await writeAuditLog(null, {
          userId: session?.user.id ?? null,
          action: 'CREATE',
          entityType: 'recurring_donations',
          entityId: String(checkout.donation.id),
          ip: meta.ip,
          browser: meta.browser,
          device: meta.device,
          details: {
            user: actor,
            role: 'Public',
            object: 'Monthly donation signup',
            source: 'public_submission',
            monthly: true,
            amount: checkout.donation.amount,
            campaignTitle: checkout.donation.campaign_title,
            ip: meta.ip,
            browser: meta.browser,
            device: meta.device,
            status: 'success',
          },
        })
      } catch (error) {
        console.error('[audit] Monthly donation audit failed:', error)
      }
    }
  } else if (input.name === 'get_checkout_result') {
    const [row] = await query<Record<string, unknown>>(
      `select d.id,d.status,d.amount,d.currency,d.campaign_title as "campaignTitle",
              d.razorpay_payment_id as "paymentId",d.receipt_number as "receiptNumber",
              d.paid_at as "paidAt",r.receipt_snapshot as receipt
         from donations d left join donation_receipts r on r.donation_id = d.id
        where d.checkout_token_hash = $1 limit 1`,
      [sha256(input.args.p_checkout_token)],
    )
    data = row ?? null
  } else if (input.name === 'verify_receipt_token') {
    const [row] = await query<Record<string, unknown>>(
      `select true as valid,r.receipt_snapshot->>'receiptNumber' as "receiptNumber",
              r.receipt_snapshot->>'donorName' as "donorName",r.receipt_snapshot->'amount' as amount,
              r.receipt_snapshot->>'currency' as currency,r.receipt_snapshot->>'campaignTitle' as "campaignTitle",
              r.receipt_snapshot->>'paymentId' as "paymentId",r.receipt_snapshot->>'paidAt' as "paidAt",
              r.receipt_snapshot->>'pan' as pan,
              coalesce((r.receipt_snapshot->>'taxEligible')::boolean,false) as "taxEligible",
              r.checksum_sha256 as "checksumSha256",r.generated_at as "generatedAt"
         from donation_receipts r where r.verification_token_hash = $1 limit 1`,
      [sha256(input.args.p_token)],
    )
    data = row ?? null
  } else if (input.name === 'lookup_verification_code') {
    const needle = input.args.p_code.trim().toUpperCase()
    const [row] = await query<Record<string, unknown>>(
      `select code,type,holder_name as "holderName",reference_id as "referenceId",
              valid_until as "validUntil",revoked,created_at as "createdAt"
         from verification_records
        where upper(code) = $1
           or upper(reference_id) = $1
        order by case when upper(code) = $1 then 0 else 1 end, created_at desc
        limit 1`,
      [needle],
    )
    data = row ?? null
  } else if (input.name === 'ensure_verification_record') {
    const session = await optionalSession(req)
    const isPublicReceipt =
      input.args.p_type === 'donation_receipt' &&
      /^SVD-80G-\d{4}-[A-Z0-9-]+$/i.test(input.args.p_reference_id.trim())
    if (!session && !isPublicReceipt) {
      throw new HttpError(401, 'Authentication required', 'unauthorized')
    }
    const referenceId = input.args.p_reference_id.trim()
    const code = referenceId.toUpperCase()
    const [existing] = await query<Record<string, unknown>>(
      `select code,type,holder_name as "holderName",reference_id as "referenceId",
              valid_until as "validUntil",revoked,created_at as "createdAt"
         from verification_records
        where upper(code) = $1 or upper(reference_id) = $1
        order by case when upper(code) = $1 then 0 else 1 end, created_at desc
        limit 1`,
      [code],
    )
    if (existing) {
      data = existing
    } else {
      const [row] = await query<Record<string, unknown>>(
        `insert into verification_records (code, type, holder_name, reference_id, metadata, valid_until)
         values ($1, $2, $3, $4, $5::jsonb, $6::date)
         on conflict (code) do update
           set holder_name = excluded.holder_name,
               metadata = verification_records.metadata || excluded.metadata,
               valid_until = coalesce(excluded.valid_until, verification_records.valid_until),
               revoked = false
         returning code,type,holder_name as "holderName",reference_id as "referenceId",
                   valid_until as "validUntil",revoked,created_at as "createdAt"`,
        [
          code,
          input.args.p_type,
          input.args.p_holder_name.trim(),
          referenceId,
          JSON.stringify(input.args.p_metadata ?? {}),
          input.args.p_valid_until?.trim() || null,
        ],
      )
      data = row ?? null
    }
  } else if (input.name === 'lookup_volunteer_application') {
    const [row] = await query<Record<string, unknown>>(
      `select id,volunteer_id,status,full_name,email,preferred_roles,created_at,
              interview_date,assigned_team
         from volunteer_applications where id = $1 and lower(email) = lower(trim($2)) limit 1`,
      [input.args.p_id, input.args.p_email],
    )
    data = row ?? null
  } else if (input.name === 'lookup_membership_status') {
    const [row] = await query<Record<string, unknown>>(
      `select id,member_id,full_name,email,status,tier,certificate_number,renewal_date,created_at
         from memberships where id = $1 and lower(email) = lower(trim($2)) limit 1`,
      [input.args.p_id, input.args.p_email],
    )
    data = row ?? null
  } else if (input.name === 'lookup_internship_status') {
    const [row] = await query<Record<string, unknown>>(
      `select id,application_id,full_name,email,status,preferred_department,certificate_number,
              start_date,end_date,created_at
         from internships where application_id = $1 and lower(email) = lower(trim($2)) limit 1`,
      [input.args.p_application_id, input.args.p_email],
    )
    data = row ?? null
  } else if (input.name === 'rbac_dashboard') {
    await requirePermission(req, 'admin_users', 'view')
    const [users, profiles, roles, departments, invitations, audit, workflows] = await Promise.all([
      query<Record<string, unknown>>(
        `select au.*,jsonb_build_object('name',d.name) as admin_departments,
                jsonb_build_object('key',r.key,'name',r.name) as admin_roles
           from admin_users au left join admin_departments d on d.id=au.department_id
           left join admin_roles r on r.id=au.role_id order by au.created_at desc limit 500`,
      ),
      query<Record<string, unknown>>(
        `select id,full_name,phone,avatar_url from profiles limit 500`,
      ),
      query<Record<string, unknown>>(
        `select r.id,r.key,r.name,r.description,r.is_system,
          coalesce(jsonb_agg(jsonb_build_object('admin_permissions',
            jsonb_build_object('module',p.module,'action',p.action)))
            filter (where p.id is not null),'[]'::jsonb) as admin_role_permissions
         from admin_roles r left join admin_role_permissions rp on rp.role_id=r.id
         left join admin_permissions p on p.id=rp.permission_id
         group by r.id order by r.name limit 200`,
      ),
      query<Record<string, unknown>>(
        `select id,name from admin_departments order by name limit 200`,
      ),
      query<Record<string, unknown>>(
        `select i.id,i.email,i.last_sent_at,i.role_id,i.department_id,
                jsonb_build_object('id',r.id,'key',r.key,'name',r.name) as admin_roles,
                jsonb_build_object('id',d.id,'name',d.name) as admin_departments
           from admin_invitations i join admin_roles r on r.id=i.role_id
           left join admin_departments d on d.id=i.department_id
          where i.status='pending' order by i.last_sent_at desc limit 200`,
      ),
      query<Record<string, unknown>>(
        `select id,user_id,action,entity_type,old_data,new_data,details,ip_address,browser,occurred_at
           from audit_logs order by occurred_at desc limit 100`,
      ),
      query<Record<string, unknown>>(
        `select id,name,steps from workflow_definitions where is_active=true order by name limit 200`,
      ),
    ])
    data = { users, profiles, roles, departments, invitations, audit, workflows }
  } else if (input.name === 'current_admin_access') {
    const session = await requireAdmin(req)
    const [row] = await query<{ role: string; permissions: string[] | null }>(
      `select coalesce(ar.key,au.role) as role,
              case when coalesce(ar.key,au.role) in ('super_admin','admin') then array['*']::text[]
                   else array_remove(array_agg(ap.key order by ap.key),null) end as permissions
         from admin_users au left join admin_roles ar on ar.id = au.role_id
         left join admin_role_permissions arp on arp.role_id = au.role_id
         left join admin_permissions ap on ap.id = arp.permission_id
        where au.user_id = $1 group by au.role,ar.key`,
      [session.user.id],
    )
    data = row ?? null
  } else if (input.name === 'resolve_post_login_destination') {
    const session = await requireSession(req)
    const [admin] = await query<{ ok: boolean }>(
      `select true as ok from admin_users
        where user_id = $1 and is_active and status = 'active' limit 1`,
      [session.user.id],
    )
    if (admin) {
      data = { destination: 'admin' }
    } else {
      const email = String(session.user.email ?? '').trim().toLowerCase()
      const [service] = await query<{ ok: boolean }>(
        `select true as ok where exists (
           select 1 from volunteer_applications
            where user_id = $1 or ($2 <> '' and lower(email) = $2)
         ) or exists (
           select 1 from internships
            where user_id = $1 or ($2 <> '' and lower(email) = $2)
         )`,
        [session.user.id, email],
      )
      data = { destination: service ? 'portal' : 'donor' }
    }
  } else if (input.name === 'my_service_portal') {
    const session = await requireSession(req)
    const userId = session.user.id
    const email = String(session.user.email ?? '').trim().toLowerCase()
    if (!email) throw new HttpError(400, 'Account email is required', 'invalid_request')

    // Link applications that match this account email and are not already claimed.
    await query(
      `update volunteer_applications
          set user_id = $1, updated_at = now()
        where user_id is null and lower(email) = $2`,
      [userId, email],
    )
    await query(
      `update internships
          set user_id = $1, updated_at = now()
        where user_id is null and lower(email) = $2`,
      [userId, email],
    )

    const volunteers = await query<Record<string, unknown>>(
      `select id, volunteer_id, status, full_name, email, phone, city, state, country,
              preferred_roles, volunteer_type, hours_per_week, skills, assigned_team,
              department, interview_date, created_at, updated_at, photo_url
         from volunteer_applications
        where user_id = $1 or lower(email) = $2
        order by created_at desc limit 20`,
      [userId, email],
    )
    const internships = await query<Record<string, unknown>>(
      `select id, application_id, intern_code, status, full_name, email, phone, university,
              course, preferred_department, duration_weeks, mentor_name, mode, program_name,
              certificate_number, start_date, end_date, created_at, updated_at, pipeline_stage
         from internships
        where user_id = $1 or lower(email) = $2
        order by created_at desc limit 20`,
      [userId, email],
    )

    const volunteerIds = volunteers.map((row) => String(row.id))
    const internshipIds = internships.map((row) => String(row.id))

    const volunteerAssignments = volunteerIds.length
      ? await query<Record<string, unknown>>(
          `select va.id, va.volunteer_application_id, va.project_id, va.role, va.starts_at, va.ends_at,
                  va.status, p.title as project_title, p.status as project_status, p.slug as project_slug
             from volunteer_assignments va
             left join projects p on p.id = va.project_id
            where va.volunteer_application_id = any($1::text[])
            order by va.starts_at desc nulls last, va.created_at desc`,
          [volunteerIds],
        )
      : []

    const internshipAssignments = internshipIds.length
      ? await query<Record<string, unknown>>(
          `select ia.id, ia.internship_id, ia.project_id, ia.role, ia.starts_at, ia.ends_at,
                  ia.status, p.title as project_title, p.status as project_status, p.slug as project_slug
             from internship_assignments ia
             left join projects p on p.id = ia.project_id
            where ia.internship_id = any($1::uuid[])
            order by ia.starts_at desc nulls last, ia.created_at desc`,
          [internshipIds],
        )
      : []

    const internTasks = internshipIds.length
      ? await query<Record<string, unknown>>(
          `select id, internship_id, title, due_date, status, score, created_at,
                  proof_url, proof_name, proof_content_type, proof_uploaded_at,
                  approval_status, approval_notes, approved_at
             from intern_tasks
            where internship_id = any($1::uuid[])
            order by due_date nulls last, created_at desc`,
          [internshipIds],
        )
      : []

    const volunteerTasks = volunteerIds.length
      ? await query<Record<string, unknown>>(
          `select id, volunteer_application_id, project_id, title, due_date, status, created_at,
                  proof_url, proof_name, proof_content_type, proof_uploaded_at,
                  approval_status, approval_notes, approved_at
             from volunteer_tasks
            where volunteer_application_id = any($1::text[])
            order by due_date nulls last, created_at desc`,
          [volunteerIds],
        ).catch(() => [] as Record<string, unknown>[])
      : []

    const projectIds = [
      ...new Set(
        [...volunteerAssignments, ...internshipAssignments]
          .map((row) => (row.project_id ? String(row.project_id) : ''))
          .filter(Boolean),
      ),
    ]
    const projectTasks = projectIds.length
      ? await query<Record<string, unknown>>(
          `select id, project_id, title, due_date, status, assigned_name, assigned_to
             from project_tasks
            where project_id = any($1::uuid[])
              and (
                assigned_name is not null and lower(assigned_name) = any($2::text[])
                or assigned_to = $3
              )
            order by due_date nulls last, created_at desc`,
          [
            projectIds,
            [
              ...new Set(
                [...volunteers, ...internships]
                  .map((row) => String(row.full_name ?? '').trim().toLowerCase())
                  .filter(Boolean),
              ),
            ],
            userId,
          ],
        )
      : []

    data = {
      volunteer: volunteers[0]
        ? {
            id: volunteers[0].id,
            volunteerId: volunteers[0].volunteer_id,
            status: volunteers[0].status,
            fullName: volunteers[0].full_name,
            email: volunteers[0].email,
            phone: volunteers[0].phone,
            city: volunteers[0].city,
            state: volunteers[0].state,
            country: volunteers[0].country,
            preferredRoles: volunteers[0].preferred_roles ?? [],
            volunteerType: volunteers[0].volunteer_type,
            hoursPerWeek: volunteers[0].hours_per_week,
            skills: volunteers[0].skills,
            assignedTeam: volunteers[0].assigned_team,
            department: volunteers[0].department,
            interviewDate: volunteers[0].interview_date,
            createdAt: volunteers[0].created_at,
            updatedAt: volunteers[0].updated_at,
            photoDataUrl: volunteers[0].photo_url,
          }
        : null,
      internship: internships[0]
        ? {
            id: internships[0].id,
            applicationId: internships[0].application_id,
            internCode: internships[0].intern_code,
            status: internships[0].status,
            fullName: internships[0].full_name,
            email: internships[0].email,
            phone: internships[0].phone,
            university: internships[0].university,
            course: internships[0].course,
            preferredDepartment: internships[0].preferred_department,
            durationWeeks: internships[0].duration_weeks,
            mentorName: internships[0].mentor_name,
            mode: internships[0].mode,
            programName: internships[0].program_name,
            certificateNumber: internships[0].certificate_number,
            startDate: internships[0].start_date,
            endDate: internships[0].end_date,
            createdAt: internships[0].created_at,
            updatedAt: internships[0].updated_at,
            pipelineStage: internships[0].pipeline_stage,
          }
        : null,
      volunteerAssignments: volunteerAssignments.map((row) => ({
        id: row.id,
        volunteerApplicationId: row.volunteer_application_id,
        projectId: row.project_id,
        projectTitle: row.project_title,
        projectStatus: row.project_status,
        projectSlug: row.project_slug,
        role: row.role,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        status: row.status,
      })),
      internshipAssignments: internshipAssignments.map((row) => ({
        id: row.id,
        internshipId: row.internship_id,
        projectId: row.project_id,
        projectTitle: row.project_title,
        projectStatus: row.project_status,
        projectSlug: row.project_slug,
        role: row.role,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        status: row.status,
      })),
      internTasks: internTasks.map((row) => ({
        id: row.id,
        internshipId: row.internship_id,
        title: row.title,
        dueDate: row.due_date,
        status: row.status,
        score: row.score,
        proofUrl: row.proof_url,
        proofName: row.proof_name,
        proofContentType: row.proof_content_type,
        proofUploadedAt: row.proof_uploaded_at,
        approvalStatus: row.approval_status ?? 'unreviewed',
        approvalNotes: row.approval_notes,
        approvedAt: row.approved_at,
      })),
      volunteerTasks: volunteerTasks.map((row) => ({
        id: row.id,
        volunteerApplicationId: row.volunteer_application_id,
        projectId: row.project_id,
        title: row.title,
        dueDate: row.due_date,
        status: row.status,
        proofUrl: row.proof_url,
        proofName: row.proof_name,
        proofContentType: row.proof_content_type,
        proofUploadedAt: row.proof_uploaded_at,
        approvalStatus: row.approval_status ?? 'unreviewed',
        approvalNotes: row.approval_notes,
        approvedAt: row.approved_at,
      })),
      projectTasks: projectTasks.map((row) => ({
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        dueDate: row.due_date,
        status: row.status,
        assignedName: row.assigned_name,
      })),
    }
  } else if (input.name === 'update_my_task') {
    const session = await requireSession(req)
    const userId = session.user.id
    const { p_kind, p_task_id, p_status, p_proof_url, p_proof_name, p_proof_content_type } = input.args

    let proofPath: string | null = null
    if (p_proof_url) {
      proofPath = storedPath(p_proof_url)
      if (!proofPath || !proofPath.startsWith(`tasks/${p_task_id}/`)) {
        throw new HttpError(400, 'Proof file is invalid for this task', 'invalid_request')
      }
    }

    if (p_kind === 'volunteer') {
      const [owned] = await query<{ id: string }>(
        `select vt.id
           from volunteer_tasks vt
           join volunteer_applications va on va.id = vt.volunteer_application_id
          where vt.id = $1::uuid and va.user_id = $2`,
        [p_task_id, userId],
      )
      if (!owned) throw new HttpError(403, 'You can only update your own volunteer tasks', 'forbidden')

      const [updated] = await query<Record<string, unknown>>(
        `update volunteer_tasks
            set status = coalesce($2, status),
                proof_url = coalesce($3, proof_url),
                proof_name = coalesce($4, proof_name),
                proof_content_type = coalesce($5, proof_content_type),
                proof_uploaded_at = case when $3 is not null then now() else proof_uploaded_at end,
                approval_status = 'unreviewed',
                approved_by = null,
                approved_at = null,
                approval_notes = null
          where id = $1::uuid
          returning id, title, due_date, status, project_id,
                    proof_url, proof_name, proof_content_type, proof_uploaded_at,
                    approval_status, approval_notes, approved_at`,
        [p_task_id, p_status ?? null, proofPath, p_proof_name ?? null, p_proof_content_type ?? null],
      )
      data = {
        id: updated.id,
        title: updated.title,
        dueDate: updated.due_date,
        status: updated.status,
        projectId: updated.project_id,
        proofUrl: updated.proof_url,
        proofName: updated.proof_name,
        proofContentType: updated.proof_content_type,
        proofUploadedAt: updated.proof_uploaded_at,
        approvalStatus: updated.approval_status ?? 'unreviewed',
        approvalNotes: updated.approval_notes,
        approvedAt: updated.approved_at,
        source: 'volunteer',
      }
    } else {
      const [owned] = await query<{ id: string }>(
        `select it.id
           from intern_tasks it
           join internships i on i.id = it.internship_id
          where it.id = $1::uuid and i.user_id = $2`,
        [p_task_id, userId],
      )
      if (!owned) throw new HttpError(403, 'You can only update your own internship tasks', 'forbidden')

      const [updated] = await query<Record<string, unknown>>(
        `update intern_tasks
            set status = coalesce($2, status),
                proof_url = coalesce($3, proof_url),
                proof_name = coalesce($4, proof_name),
                proof_content_type = coalesce($5, proof_content_type),
                proof_uploaded_at = case when $3 is not null then now() else proof_uploaded_at end,
                approval_status = 'unreviewed',
                approved_by = null,
                approved_at = null,
                approval_notes = null
          where id = $1::uuid
          returning id, title, due_date, status, score,
                    proof_url, proof_name, proof_content_type, proof_uploaded_at,
                    approval_status, approval_notes, approved_at`,
        [p_task_id, p_status ?? null, proofPath, p_proof_name ?? null, p_proof_content_type ?? null],
      )
      data = {
        id: updated.id,
        title: updated.title,
        dueDate: updated.due_date,
        status: updated.status,
        score: updated.score,
        proofUrl: updated.proof_url,
        proofName: updated.proof_name,
        proofContentType: updated.proof_content_type,
        proofUploadedAt: updated.proof_uploaded_at,
        approvalStatus: updated.approval_status ?? 'unreviewed',
        approvalNotes: updated.approval_notes,
        approvedAt: updated.approved_at,
        source: 'intern',
      }
    }
  } else if (input.name === 'review_task') {
    const { p_kind, p_task_id, p_approval_status, p_notes } = input.args
    const module = p_kind === 'volunteer' ? 'volunteers' : 'internships'
    const session = await requirePermission(req, module, 'edit')
    const notes = p_notes?.trim() ? p_notes.trim() : null

    if (p_kind === 'volunteer') {
      const [task] = await query<{
        id: string
        status: string
        proof_url: string | null
      }>(
        `select id, status, proof_url from volunteer_tasks where id = $1::uuid`,
        [p_task_id],
      )
      if (!task) throw new HttpError(404, 'Task not found', 'not_found')
      if (p_approval_status === 'approved') {
        if (task.status !== 'completed' || !task.proof_url) {
          throw new HttpError(
            400,
            'Approve only when the task is completed and proof of work is uploaded',
            'invalid_request',
          )
        }
      }
      const [updated] = await query<Record<string, unknown>>(
        `update volunteer_tasks
            set approval_status = $2,
                approval_notes = $3,
                approved_by = $4,
                approved_at = now()
          where id = $1::uuid
          returning id, title, due_date, status, project_id,
                    proof_url, proof_name, proof_content_type, proof_uploaded_at,
                    approval_status, approval_notes, approved_at, approved_by`,
        [p_task_id, p_approval_status, notes, session.user.id],
      )
      data = {
        id: updated.id,
        kind: 'volunteer',
        title: updated.title,
        dueDate: updated.due_date,
        status: updated.status,
        projectId: updated.project_id,
        proofUrl: updated.proof_url,
        proofName: updated.proof_name,
        approvalStatus: updated.approval_status,
        approvalNotes: updated.approval_notes,
        approvedAt: updated.approved_at,
        approvedBy: updated.approved_by,
      }
    } else {
      const [task] = await query<{
        id: string
        status: string
        proof_url: string | null
      }>(`select id, status, proof_url from intern_tasks where id = $1::uuid`, [p_task_id])
      if (!task) throw new HttpError(404, 'Task not found', 'not_found')
      if (p_approval_status === 'approved') {
        if (task.status !== 'completed' || !task.proof_url) {
          throw new HttpError(
            400,
            'Approve only when the task is completed and proof of work is uploaded',
            'invalid_request',
          )
        }
      }
      const [updated] = await query<Record<string, unknown>>(
        `update intern_tasks
            set approval_status = $2,
                approval_notes = $3,
                approved_by = $4,
                approved_at = now()
          where id = $1::uuid
          returning id, title, due_date, status, score,
                    proof_url, proof_name, proof_content_type, proof_uploaded_at,
                    approval_status, approval_notes, approved_at, approved_by`,
        [p_task_id, p_approval_status, notes, session.user.id],
      )
      data = {
        id: updated.id,
        kind: 'intern',
        title: updated.title,
        dueDate: updated.due_date,
        status: updated.status,
        score: updated.score,
        proofUrl: updated.proof_url,
        proofName: updated.proof_name,
        approvalStatus: updated.approval_status,
        approvalNotes: updated.approval_notes,
        approvedAt: updated.approved_at,
        approvedBy: updated.approved_by,
      }
    }
  } else {
    const module =
      input.name === 'set_admin_role_permissions'
        ? 'admin_users'
        : input.name === 'generate_member_id'
          ? 'memberships'
          : 'memberships'
    const action = input.name === 'set_admin_role_permissions' ? 'edit' : 'edit'
    const session = await requirePermission(req, module, action)
    data = await transaction(async (client) => {
      await client.query(`select set_config('app.user_id',$1,true)`, [session.user.id])
      if (input.name === 'generate_member_id') {
        const result = await client.query<{ value: string }>(
          `select 'SVD-MEM-'||to_char(current_date,'YYYY')||'-'||lpad(nextval('member_number_seq')::text,6,'0') as value`,
        )
        return result.rows[0]?.value
      }
      if (input.name === 'generate_certificate_number') {
        const result = await client.query<{ value: string }>(
          `select 'SVD-CERT-'||to_char(current_date,'YYYY')||'-'||lpad(nextval('certificate_number_seq')::text,6,'0') as value`,
        )
        return result.rows[0]?.value
      }
      await client.query(`select set_admin_role_permissions($1,$2::jsonb)`, [
        input.args.p_role_key,
        JSON.stringify(input.args.p_permissions),
      ])
      return null
    })
  }

  res.status(200).json({ data })
})
