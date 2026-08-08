#!/usr/bin/env node
/**
 * Create/reset volunteer + intern portal test accounts (Better Auth + Neon).
 * Usage: node --env-file=.env scripts/bootstrap-neon-service-portal.mjs
 *
 * Does NOT grant admin_users access — these accounts are portal-scoped only.
 */
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { betterAuth } from 'better-auth'
import pg from 'pg'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const ACCOUNTS = [
  {
    kind: 'volunteer',
    email: process.env.VOLUNTEER_BOOTSTRAP_EMAIL?.trim() || 'volunteer.test@sanveda.org',
    name: 'Sanveda Test Volunteer',
    password:
      process.env.VOLUNTEER_BOOTSTRAP_PASSWORD?.trim() ||
      process.env.SERVICE_PORTAL_BOOTSTRAP_PASSWORD?.trim() ||
      'SanvedaVolunteer2026!',
  },
  {
    kind: 'intern',
    email: process.env.INTERN_BOOTSTRAP_EMAIL?.trim() || 'intern.test@sanveda.org',
    name: 'Sanveda Test Intern',
    password:
      process.env.INTERN_BOOTSTRAP_PASSWORD?.trim() ||
      process.env.SERVICE_PORTAL_BOOTSTRAP_PASSWORD?.trim() ||
      'SanvedaIntern2026!',
  },
]

function resolveDatabaseUrl(env) {
  const raw =
    env.DATABASE_URL_UNPOOLED ||
    env.POSTGRES_URL_NON_POOLING ||
    env.DATABASE_URL ||
    env.POSTGRES_URL
  if (!raw) throw new Error('DATABASE_URL / POSTGRES_URL is required')
  const url = new URL(raw)
  url.searchParams.delete('channel_binding')
  return url.toString()
}

const databaseUrl = resolveDatabaseUrl(process.env)
const secret = process.env.BETTER_AUTH_SECRET
const baseURL = process.env.BETTER_AUTH_URL || 'https://sanveda.vercel.app'
if (!secret || secret.length < 32) throw new Error('BETTER_AUTH_SECRET must be at least 32 characters')

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: true },
  max: 2,
})

const auth = betterAuth({
  database: pool,
  baseURL,
  secret,
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  advanced: {
    database: { generateId: 'uuid' },
  },
})

async function ensureUser(client, account) {
  const existing = await client.query(
    `select id, email from public."user" where lower(email) = lower($1) limit 1`,
    [account.email],
  )

  let userId = existing.rows[0]?.id
  let created = false

  if (!userId) {
    const signup = await auth.api.signUpEmail({
      body: { email: account.email, password: account.password, name: account.name },
    })
    userId = signup.user.id
    created = true
  } else {
    const ctx = await auth.$context
    const hash = await ctx.password.hash(account.password)
    await client.query(
      `update public.account
          set password = $2, "updatedAt" = now()
        where "userId" = $1 and "providerId" = 'credential'`,
      [userId, hash],
    )
    const accountRow = await client.query(
      `select id from public.account where "userId" = $1 and "providerId" = 'credential'`,
      [userId],
    )
    if (!accountRow.rowCount) {
      await client.query(
        `insert into public.account (
           id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
         ) values (gen_random_uuid(), $1, 'credential', $2, $3, now(), now())`,
        [userId, userId, hash],
      )
    }
    await client.query(
      `update public."user"
          set name = $2, "emailVerified" = true, "updatedAt" = now()
        where id = $1`,
      [userId, account.name],
    )
  }

  await client.query(
    `insert into profiles (id, full_name, phone)
     values ($1, $2, '')
     on conflict (id) do update
       set full_name = excluded.full_name, updated_at = now()`,
    [userId, account.name],
  )

  const removedAdmin = await client.query(
    `delete from admin_users where user_id = $1 returning user_id`,
    [userId],
  )

  return { userId, created, adminRowRemoved: removedAdmin.rowCount > 0 }
}

async function ensureVolunteerRecord(client, userId, email, name) {
  const year = new Date().getFullYear()
  const appId = `SVD-APP-${year}-TESTVOLUNTEER000000000000001`
  const volunteerId = `SVG-${year}-TEST01`

  await client.query(
    `insert into volunteer_applications (
       id, volunteer_id, status, full_name, email, phone, city, state, country,
       preferred_roles, volunteer_type, hours_per_week, skills, motivation,
       agreed_policies, agreed_background_check, agreed_data_processing,
       assigned_team, department, user_id, created_at, updated_at
     ) values (
       $1, $2, 'active', $3, $4, '+91 90000 11111', 'Pune', 'Maharashtra', 'India',
       $5::jsonb, 'part-time', '4', 'Teaching, mentoring',
       'Test volunteer account for portal QA.',
       true, true, true, 'Education — Pune', 'Programmes', $6, now() - interval '30 days', now()
     )
     on conflict (id) do update set
       volunteer_id = excluded.volunteer_id,
       status = 'active',
       full_name = excluded.full_name,
       email = excluded.email,
       user_id = excluded.user_id,
       assigned_team = excluded.assigned_team,
       department = excluded.department,
       updated_at = now()`,
    [appId, volunteerId, name, email.toLowerCase(), JSON.stringify(['education', 'fundraising']), userId],
  )

  // Also claim any older seed rows with the same email.
  await client.query(
    `update volunteer_applications
        set user_id = $1, updated_at = now()
      where lower(email) = lower($2)`,
    [userId, email],
  )

  const project = await client.query(
    `select id from projects where status = 'active' order by created_at asc limit 1`,
  )
  const projectId = project.rows[0]?.id
  if (projectId) {
    await client.query(
      `insert into volunteer_assignments (
         volunteer_application_id, project_id, role, starts_at, status
       )
       select $1, $2, 'Weekend Teacher', now() - interval '20 days', 'active'
       where not exists (
         select 1 from volunteer_assignments
          where volunteer_application_id = $1
            and project_id = $2
            and status in ('assigned','active')
       )`,
      [appId, projectId],
    )
    await client.query(
      `insert into project_team (project_id, member_name, role, user_id, joined_on)
       select $1, $2, 'Volunteer', $3, current_date
       where not exists (
         select 1 from project_team
          where project_id = $1
            and lower(member_name) = lower($2)
            and lower(role) like '%volunteer%'
       )`,
      [projectId, name, userId],
    )
  }

  await client.query(
    `insert into volunteer_tasks (volunteer_application_id, project_id, title, due_date, status)
     select $1, $2, 'Prepare weekend lesson plan', current_date + 3, 'pending'
     where not exists (
       select 1 from volunteer_tasks
        where volunteer_application_id = $1 and title = 'Prepare weekend lesson plan'
     )`,
    [appId, projectId],
  )
  await client.query(
    `insert into volunteer_tasks (volunteer_application_id, project_id, title, due_date, status)
     select $1, $2, 'Attend Sunday teaching session', current_date + 7, 'in_progress'
     where not exists (
       select 1 from volunteer_tasks
        where volunteer_application_id = $1 and title = 'Attend Sunday teaching session'
     )`,
    [appId, projectId],
  )
  await client.query(
    `insert into volunteer_tasks (volunteer_application_id, project_id, title, due_date, status)
     select $1, $2, 'Submit monthly hours log', current_date - 2, 'completed'
     where not exists (
       select 1 from volunteer_tasks
        where volunteer_application_id = $1 and title = 'Submit monthly hours log'
     )`,
    [appId, projectId],
  )

  return { appId, volunteerId, projectId: projectId ?? null }
}

async function ensureInternRecord(client, userId, email, name) {
  const year = new Date().getFullYear()
  const applicationId = `SVD-INT-${year}-TESTINTERN000000000000000001`
  const internId = await client.query(
    `select id from internships where application_id = $1 limit 1`,
    [applicationId],
  )

  let internshipUuid = internId.rows[0]?.id
  if (!internshipUuid) {
    const inserted = await client.query(
      `insert into internships (
         application_id, full_name, email, phone, university, course, semester,
         preferred_department, duration_weeks, motivation, skills, status,
         intern_code, pipeline_stage, program_name, mentor_name, mode,
         stipend_amount, start_date, end_date, certificate_number, user_id,
         created_at, updated_at
       ) values (
         $1, $2, $3, '+91 90000 22222', 'TISS Mumbai', 'MA Social Work', '3',
         'Programmes', 12, 'Test intern account for portal QA.',
         'Research, fieldwork', 'completed', 'INTC-TEST-01', 'completed',
         'Field Programmes Internship', 'Meera Joshi', 'hybrid', 8000,
         current_date - 90, current_date - 10,
         $4, $5, now() - interval '100 days', now()
       )
       returning id`,
      [applicationId, name, email.toLowerCase(), `SVD-INT-CERT-${year}-TEST01`, userId],
    )
    internshipUuid = inserted.rows[0].id
  } else {
    await client.query(
      `update internships set
         full_name = $2,
         email = $3,
         status = 'completed',
         intern_code = coalesce(intern_code, 'INTC-TEST-01'),
         certificate_number = coalesce(certificate_number, $4),
         mentor_name = coalesce(mentor_name, 'Meera Joshi'),
         preferred_department = coalesce(preferred_department, 'Programmes'),
         start_date = coalesce(start_date, current_date - 90),
         end_date = coalesce(end_date, current_date - 10),
         user_id = $5,
         updated_at = now()
       where id = $1`,
      [internshipUuid, name, email.toLowerCase(), `SVD-INT-CERT-${year}-TEST01`, userId],
    )
  }

  await client.query(
    `update internships set user_id = $1, updated_at = now() where lower(email) = lower($2)`,
    [userId, email],
  )

  await client.query(
    `insert into intern_tasks (internship_id, title, due_date, status, score)
     select $1, 'Baseline survey write-up', current_date - 20, 'completed', 92
     where not exists (
       select 1 from intern_tasks where internship_id = $1 and title = 'Baseline survey write-up'
     )`,
    [internshipUuid],
  )
  await client.query(
    `insert into intern_tasks (internship_id, title, due_date, status)
     select $1, 'Impact story draft', current_date + 7, 'in_progress'
     where not exists (
       select 1 from intern_tasks where internship_id = $1 and title = 'Impact story draft'
     )`,
    [internshipUuid],
  )

  const project = await client.query(
    `select id from projects where status = 'active' order by created_at asc limit 1`,
  )
  const projectId = project.rows[0]?.id
  if (projectId) {
    await client.query(
      `insert into internship_assignments (
         internship_id, project_id, role, starts_at, status
       )
       select $1, $2, 'Field Research Intern', now() - interval '80 days', 'completed'
       where not exists (
         select 1 from internship_assignments
          where internship_id = $1
            and project_id = $2
            and status in ('assigned','active','completed')
       )`,
      [internshipUuid, projectId],
    )
    await client.query(
      `insert into project_team (project_id, member_name, role, user_id, joined_on)
       select $1, $2, 'Intern', $3, current_date - 80
       where not exists (
         select 1 from project_team
          where project_id = $1
            and lower(member_name) = lower($2)
            and lower(role) like '%intern%'
       )`,
      [projectId, name, userId],
    )
    await client.query(
      `insert into project_tasks (project_id, title, due_date, status, assigned_name)
       select $1, 'Submit field notes pack', current_date + 3, 'in_progress', $2
       where not exists (
         select 1 from project_tasks
          where project_id = $1 and title = 'Submit field notes pack' and assigned_name = $2
       )`,
      [projectId, name],
    )
  }

  return { applicationId, internshipUuid, projectId: projectId ?? null }
}

async function main() {
  const client = await pool.connect()
  const results = []
  try {
    for (const account of ACCOUNTS) {
      const user = await ensureUser(client, account)
      const linked =
        account.kind === 'volunteer'
          ? await ensureVolunteerRecord(client, user.userId, account.email, account.name)
          : await ensureInternRecord(client, user.userId, account.email, account.name)
      results.push({
        kind: account.kind,
        email: account.email,
        password: account.password,
        userId: user.userId,
        created: user.created,
        adminRowRemoved: user.adminRowRemoved,
        linked,
      })
    }

    const credsPath = path.join(root, 'SERVICE_PORTAL_CREDENTIALS.local.md')
    const lines = [
      `# Sanveda service portal test credentials (created ${new Date().toISOString().slice(0, 10)})`,
      `# Store securely — do not commit this file.`,
      '',
      'Login: https://sanveda.vercel.app/login',
      'Portal: https://sanveda.vercel.app/portal',
      '',
    ]
    for (const row of results) {
      lines.push(`## ${row.kind}`)
      lines.push(`Email: ${row.email}`)
      lines.push(`Password: ${row.password}`)
      lines.push(`User ID: ${row.userId}`)
      lines.push(`Linked: ${JSON.stringify(row.linked)}`)
      lines.push('')
    }
    fs.writeFileSync(credsPath, lines.join('\n'))

    console.log(
      JSON.stringify(
        {
          ok: true,
          credentialsFile: 'SERVICE_PORTAL_CREDENTIALS.local.md',
          accounts: results.map(({ password, ...rest }) => ({
            ...rest,
            passwordSet: Boolean(password),
          })),
          // Include passwords in stdout for local operator convenience.
          login: results.map((row) => ({
            kind: row.kind,
            email: row.email,
            password: row.password,
            portal: 'https://sanveda.vercel.app/portal',
          })),
        },
        null,
        2,
      ),
    )
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
