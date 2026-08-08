import { z } from 'zod'

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  FROM_EMAIL: z.string().min(3).optional(),
  /** Inbox that receives new contact-form enquiries (defaults in enquiryNotify). */
  CONTACT_NOTIFY_EMAIL: z.string().email().optional(),
  ADMIN_INVITE_REDIRECT_URL: z.string().url().optional(),
})

let cached: z.infer<typeof serverEnvSchema> | undefined

function resolveDatabaseUrl(env: NodeJS.ProcessEnv): string | undefined {
  return (
    env.DATABASE_URL?.trim() ||
    env.POSTGRES_URL?.trim() ||
    env.POSTGRES_PRISMA_URL?.trim() ||
    env.DATABASE_URL_UNPOOLED?.trim() ||
    env.POSTGRES_URL_NON_POOLING?.trim() ||
    undefined
  )
}

export function serverEnv(): z.infer<typeof serverEnvSchema> {
  if (!cached) {
    cached = serverEnvSchema.parse({
      ...process.env,
      DATABASE_URL: resolveDatabaseUrl(process.env),
    })
  }
  return cached
}
