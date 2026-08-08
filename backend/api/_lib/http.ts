import { ZodError, type ZodType } from 'zod'
import type { VercelRequest, VercelResponse } from './vercel.js'

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = 'request_failed',
  ) {
    super(message)
  }
}

export function method(req: VercelRequest, allowed: readonly string[]): void {
  if (!req.method || !allowed.includes(req.method)) {
    throw new HttpError(405, 'Method not allowed', 'method_not_allowed')
  }
}

export function parseBody<T>(req: VercelRequest, schema: ZodType<T>): T {
  return schema.parse(req.body)
}

function zodErrorMessage(error: ZodError): string {
  const first = error.issues[0]
  if (!first) return 'Request validation failed'
  const field = first.path.filter((part): part is string => typeof part === 'string').at(-1)
  if (field === 'phone') return first.message || 'Enter a valid phone number'
  if (field === 'email') return first.message || 'Enter a valid email address'
  if (field) return `${field}: ${first.message}`
  return first.message || 'Request validation failed'
}

export function sendError(res: VercelResponse, error: unknown): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'invalid_request',
      message: zodErrorMessage(error),
      issues: error.issues,
    })
    return
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.code, message: error.message })
    return
  }

  const correlationId = crypto.randomUUID()
  console.error('Unhandled API error', { correlationId, error })
  res.status(500).json({
    error: 'internal_error',
    message: 'An unexpected error occurred',
    correlationId,
  })
}

export function apiHandler(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
): (req: VercelRequest, res: VercelResponse) => Promise<void> {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    try {
      await handler(req, res)
    } catch (error) {
      sendError(res, error)
    }
  }
}
