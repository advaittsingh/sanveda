import { betterAuth } from 'better-auth'
import { pool } from './db.js'
import { escapeHtml, sendEmail } from './email.js'
import { serverEnv } from './env.js'

const env = serverEnv()

const PRODUCTION_HOSTS = [
  'sanveda.vercel.app',
  'sanveda-curvvtech.vercel.app',
  'www.sanvedahumanitarian.org',
  'sanvedahumanitarian.org',
] as const

function resolveAllowedHosts(): string[] {
  const fromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).host
      } catch {
        return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
      }
    })

  const fallbackHost = new URL(env.BETTER_AUTH_URL).host
  return [...new Set([...PRODUCTION_HOSTS, fallbackHost, 'localhost:5173', '127.0.0.1:5173', ...fromEnv])]
}

function resolveTrustedOrigins(): string[] {
  const hosts = resolveAllowedHosts()
  const origins = hosts.flatMap((host) => {
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return [`http://${host}`, `https://${host}`]
    }
    return [`https://${host}`]
  })
  const fromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  return [...new Set([env.BETTER_AUTH_URL.replace(/\/$/, ''), ...origins, ...fromEnv])]
}

export const auth = betterAuth({
  database: pool,
  // Resolve base URL from the request host so custom domains and Vercel aliases
  // can sign in/out without INVALID_ORIGIN / cookie-host mismatches.
  baseURL: {
    allowedHosts: resolveAllowedHosts(),
    fallback: env.BETTER_AUTH_URL,
    protocol: 'auto',
  },
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: resolveTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Set your Sanveda password',
        html: [
          `<p>Hello ${escapeHtml(user.name)},</p>`,
          '<p>Use the secure link below to set your Sanveda password.</p>',
          `<p><a href="${escapeHtml(url)}">Set password</a></p>`,
          '<p>If you did not request this, you can ignore this email.</p>',
        ].join(''),
      })
    },
  },
  user: {
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      // Prefer live DB session checks so sign-out cannot leave a stale cookie cache.
      enabled: false,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    database: {
      generateId: 'uuid',
    },
  },
})

export type AuthSession = typeof auth.$Infer.Session
