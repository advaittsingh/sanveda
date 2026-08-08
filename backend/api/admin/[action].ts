import { HttpError, sendError } from '../_lib/http.js'
import type { VercelRequest, VercelResponse } from '../_lib/vercel.js'
import invite from '../_lib/handlers/admin-invite.js'
import session from '../_lib/handlers/admin-session.js'

const handlers: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<void>> = {
  session,
  invite,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action ?? '')
    const route = handlers[action]
    if (!route) throw new HttpError(404, 'Unknown admin action', 'not_found')
    await route(req, res)
  } catch (error) {
    sendError(res, error)
  }
}
