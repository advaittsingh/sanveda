#!/usr/bin/env node
/**
 * One-off Neon/Better Auth admin bootstrap.
 * Usage: node --env-file=.env.neon.local scripts/bootstrap-neon-admin.mjs
 */
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { betterAuth } from 'better-auth'
import pg from 'pg'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const email = 'admin@sanveda.org'
const name = 'Sanveda Admin'
const password =
  process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() || randomBytes(12).toString('base64url')

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

async function ensureRoles(client) {
  await client.query(
    `insert into admin_roles (key, name, description, is_system)
     values
       ('super_admin', 'Super Admin', 'Full platform access', true),
       ('admin', 'Admin', 'Operational administrator', true),
       ('finance', 'Finance', 'Finance module access', true),
       ('content', 'Content', 'Content module access', true),
       ('volunteer', 'Volunteer Ops', 'Volunteer module access', true)
     on conflict (key) do nothing`,
  )
  const { rows } = await client.query(
    `select id, key from admin_roles where key = 'super_admin' limit 1`,
  )
  if (!rows[0]) throw new Error('super_admin role missing after seed')
  return rows[0].id
}

async function main() {
  const client = await pool.connect()
  try {
    const roleId = await ensureRoles(client)

    const existing = await client.query(
      `select id, email from public."user" where lower(email) = lower($1) limit 1`,
      [email],
    )

    let userId = existing.rows[0]?.id
    let created = false

    if (!userId) {
      const signup = await auth.api.signUpEmail({
        body: { email, password, name },
      })
      userId = signup.user.id
      created = true
    } else {
      // Reset password for known admin email so login works after migration.
      const ctx = await auth.$context
      const hash = await ctx.password.hash(password)
      await client.query(
        `update public.account
            set password = $2, "updatedAt" = now()
          where "userId" = $1 and "providerId" = 'credential'`,
        [userId, hash],
      )
      const account = await client.query(
        `select id from public.account where "userId" = $1 and "providerId" = 'credential'`,
        [userId],
      )
      if (!account.rowCount) {
        await client.query(
          `insert into public.account (
             id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt"
           ) values (gen_random_uuid(), $1, $2, 'credential', $3, now(), now())`,
          [userId, userId, hash],
        )
      }
      await client.query(
        `update public."user"
            set name = $2, "emailVerified" = true, "updatedAt" = now()
          where id = $1`,
        [userId, name],
      )
    }

    await client.query(
      `insert into profiles (id, full_name, phone)
       values ($1, $2, '')
       on conflict (id) do update
         set full_name = excluded.full_name, updated_at = now()`,
      [userId, name],
    )

    await client.query(
      `insert into admin_users (
         user_id, email, role, role_id, status, is_active, designation
       ) values ($1, $2, 'super_admin', $3, 'active', true, 'Founder Admin')
       on conflict (user_id) do update
         set email = excluded.email,
             role = 'super_admin',
             role_id = excluded.role_id,
             status = 'active',
             is_active = true,
             updated_at = now()`,
      [userId, email, roleId],
    )

    const credsPath = path.join(root, 'ADMIN_CREDENTIALS.local.md')
    const content = `# Sanveda Neon / Better Auth admin credentials (created ${new Date().toISOString().slice(0, 10)})
# Store securely — do not commit this file.

Email: ${email}
Password: ${password}
Role: super_admin
User ID: ${userId}
Auth: Better Auth + Neon
Created: ${created ? 'new user' : 'existing user password reset'}

Login: https://sanveda.vercel.app/admin/login
`
    fs.writeFileSync(credsPath, content)
    console.log(
      JSON.stringify(
        {
          ok: true,
          email,
          userId,
          role: 'super_admin',
          created,
          credentialsFile: 'ADMIN_CREDENTIALS.local.md',
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
