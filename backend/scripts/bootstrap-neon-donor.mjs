#!/usr/bin/env node
/**
 * Create/reset a non-admin donor test account (Better Auth + Neon).
 * Usage: node --env-file=.env.neon.local scripts/bootstrap-neon-donor.mjs
 *
 * Intentionally does NOT insert into admin_users — this account is donor-scoped only.
 */
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { betterAuth } from 'better-auth'
import pg from 'pg'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const email = process.env.DONOR_BOOTSTRAP_EMAIL?.trim() || 'donor.test@sanveda.org'
const name = 'Sanveda Test Donor'
const password =
  process.env.DONOR_BOOTSTRAP_PASSWORD?.trim() || randomBytes(12).toString('base64url')

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

async function main() {
  const client = await pool.connect()
  try {
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

    // Critical: donor must never hold admin_users access.
    const removedAdmin = await client.query(
      `delete from admin_users where user_id = $1 returning user_id`,
      [userId],
    )

    // Seed one own donation + a non-owned probe row for scope checks.
    const own = await client.query(
      `select id from donations where user_id = $1 and campaign_title = 'Donor access probe (own)' limit 1`,
      [userId],
    )
    if (!own.rowCount) {
      await client.query(
        `insert into donations (
           user_id, donor_name, donor_email, amount, currency, status, is_anonymous, campaign_title
         ) values ($1, $2, $3, 101, 'INR', 'completed', false, 'Donor access probe (own)')`,
        [userId, name, email],
      )
    }

    const other = await client.query(
      `select id from donations where campaign_title = 'Donor access probe (other)' limit 1`,
    )
    if (!other.rowCount) {
      await client.query(
        `insert into donations (
           user_id, donor_name, donor_email, amount, currency, status, is_anonymous, campaign_title
         ) values (null, 'Other Donor', 'other-probe@example.com', 99999, 'INR', 'completed', false,
                   'Donor access probe (other)')`,
      )
    }

    const credsPath = path.join(root, 'DONOR_CREDENTIALS.local.md')
    const content = `# Sanveda Neon / Better Auth donor test credentials (created ${new Date().toISOString().slice(0, 10)})
# Store securely — do not commit this file.

Email: ${email}
Password: ${password}
Role: donor (no admin_users row)
User ID: ${userId}
Auth: Better Auth + Neon
Created: ${created ? 'new user' : 'existing user password reset'}
Admin row removed: ${removedAdmin.rowCount > 0 ? 'yes' : 'n/a (was not admin)'}

Login: https://sanveda.vercel.app/login
Verify: node --env-file=.env.neon.local scripts/verify-donor-access.mjs
`
    fs.writeFileSync(credsPath, content)
    console.log(
      JSON.stringify(
        {
          ok: true,
          email,
          userId,
          role: 'donor',
          created,
          adminRowRemoved: removedAdmin.rowCount > 0,
          credentialsFile: 'DONOR_CREDENTIALS.local.md',
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
