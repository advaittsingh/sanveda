#!/usr/bin/env node
/**
 * Sign in as the donor test account and probe admin/finance endpoints.
 * Usage: node --env-file=.env.neon.local scripts/verify-donor-access.mjs
 *
 * Reads credentials from DONOR_CREDENTIALS.local.md or env overrides.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const baseURL = (process.env.VERIFY_BASE_URL || process.env.BETTER_AUTH_URL || 'https://sanveda.vercel.app').replace(
  /\/$/,
  '',
)

function loadDonorCreds() {
  const email = process.env.DONOR_BOOTSTRAP_EMAIL?.trim()
  const password = process.env.DONOR_BOOTSTRAP_PASSWORD?.trim()
  if (email && password) return { email, password }

  const credsPath = path.join(root, 'DONOR_CREDENTIALS.local.md')
  if (!fs.existsSync(credsPath)) {
    throw new Error('Missing DONOR_CREDENTIALS.local.md — run scripts/bootstrap-neon-donor.mjs first')
  }
  const text = fs.readFileSync(credsPath, 'utf8')
  const emailMatch = text.match(/^Email:\s*(.+)$/m)
  const passwordMatch = text.match(/^Password:\s*(.+)$/m)
  if (!emailMatch || !passwordMatch) throw new Error('Could not parse donor credentials file')
  return { email: emailMatch[1].trim(), password: passwordMatch[1].trim() }
}

function collectCookies(response, jar) {
  const raw = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : []
  const fallback = response.headers.get('set-cookie')
  const parts = raw.length ? raw : fallback ? [fallback] : []
  for (const part of parts) {
    const [pair] = part.split(';')
    const eq = pair.indexOf('=')
    if (eq <= 0) continue
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim())
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

async function signIn(email, password) {
  const jar = new Map()
  const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: baseURL,
    },
    body: JSON.stringify({ email, password }),
  })
  collectCookies(response, jar)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`Sign-in failed (${response.status}): ${JSON.stringify(body)}`)
  }
  if (!jar.size) {
    throw new Error('Sign-in succeeded but no session cookies were returned')
  }
  return { jar, user: body.user ?? body.data?.user ?? null }
}

async function probe(jar, label, init) {
  const response = await fetch(init.url, {
    method: init.method,
    headers: {
      ...(init.headers ?? {}),
      Cookie: cookieHeader(jar),
      Origin: baseURL,
    },
    body: init.body,
  })
  const text = await response.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    json = null
  }
  return {
    label,
    status: response.status,
    ok: response.ok,
    body: json ?? text.slice(0, 300),
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function main() {
  const { email, password } = loadDonorCreds()
  console.log(JSON.stringify({ baseURL, email, step: 'signing-in' }))
  const { jar, user } = await signIn(email, password)

  const results = []

  results.push(
    await probe(jar, 'GET /api/admin/session', {
      url: `${baseURL}/api/admin/session`,
      method: 'GET',
    }),
  )

  results.push(
    await probe(jar, 'POST /api/admin/session', {
      url: `${baseURL}/api/admin/session`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }),
  )

  const financeProbes = [
    { resource: 'payment_transactions', expect: 'reject' },
    { resource: 'expenses', expect: 'reject' },
    { resource: 'income_records', expect: 'reject' },
    { resource: 'finance_ledger_locks', expect: 'reject' },
    { resource: 'donation_ops_meta', expect: 'reject' },
    { resource: 'donations', expect: 'scoped' },
  ]

  for (const item of financeProbes) {
    results.push(
      await probe(jar, `POST /api/data/finance (${item.resource})`, {
        url: `${baseURL}/api/data/finance`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: item.resource,
          audience: 'auto',
          operation: 'select',
          columns: '*',
          filters: [],
          orders: [],
          limit: 50,
          resultMode: 'many',
        }),
      }),
    )
  }

  // Assertions
  const adminGet = results.find((r) => r.label === 'GET /api/admin/session')
  const adminPost = results.find((r) => r.label === 'POST /api/admin/session')
  assert(adminGet.status === 403, `admin GET expected 403, got ${adminGet.status}`)
  assert(adminPost.status === 403, `admin POST expected 403, got ${adminPost.status}`)

  for (const item of financeProbes.filter((p) => p.expect === 'reject')) {
    const row = results.find((r) => r.label.includes(`(${item.resource})`))
    assert(row.status === 403, `${item.resource} expected 403, got ${row.status}`)
  }

  const donations = results.find((r) => r.label.includes('(donations)'))
  assert(donations.status === 200, `donations select expected 200, got ${donations.status}`)
  const rows = Array.isArray(donations.body?.data) ? donations.body.data : []
  const leakedOther = rows.some(
    (row) =>
      row.campaign_title === 'Donor access probe (other)' ||
      Number(row.amount) === 99999 ||
      (user?.id && row.user_id && row.user_id !== user.id),
  )
  assert(!leakedOther, 'donations response leaked another donor/sensitive row')
  assert(
    rows.every((row) => row.user_id === user?.id),
    'donations response contained a non-owned user_id',
  )
  // Own seeded row should be visible when present
  const hasOwn = rows.some((row) => row.campaign_title === 'Donor access probe (own)')
  assert(hasOwn, 'expected own seeded donation in scoped donations response')

  const summary = {
    ok: true,
    email,
    userId: user?.id ?? null,
    checks: results.map((r) => ({
      label: r.label,
      status: r.status,
      message: r.body?.message ?? r.body?.error ?? null,
      rowCount: Array.isArray(r.body?.data) ? r.body.data.length : undefined,
    })),
  }
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2))
  process.exit(1)
})
