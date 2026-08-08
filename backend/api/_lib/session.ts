import { fromNodeHeaders } from 'better-auth/node'
import { auth, type AuthSession } from './auth.js'
import { query } from './db.js'
import { HttpError } from './http.js'
import type { VercelRequest } from './vercel.js'

export async function optionalSession(req: VercelRequest): Promise<AuthSession | null> {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
}

export async function requireSession(req: VercelRequest): Promise<AuthSession> {
  const session = await optionalSession(req)
  if (!session) throw new HttpError(401, 'Authentication required', 'unauthorized')
  return session
}

type AdminAccessRow = {
  is_active: boolean
  status: string
  role_id: string
}

export async function requireAdmin(req: VercelRequest): Promise<AuthSession> {
  const session = await requireSession(req)
  const [access] = await query<AdminAccessRow>(
    `select au.is_active, au.status, au.role_id
       from admin_users au
      where au.user_id = $1
      limit 1`,
    [session.user.id],
  )
  if (!access?.is_active || access.status !== 'active') {
    throw new HttpError(403, 'Active admin access required', 'forbidden')
  }
  return session
}
