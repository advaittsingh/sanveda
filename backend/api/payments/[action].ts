import { HttpError, sendError } from '../_lib/http.js'
import type { VercelRequest, VercelResponse } from '../_lib/vercel.js'
import createOrder from '../_lib/handlers/create-order.js'
import createSubscription from '../_lib/handlers/create-subscription.js'
import refund from '../_lib/handlers/refund.js'
import verify from '../_lib/handlers/verify.js'
import verifySubscription from '../_lib/handlers/verify-subscription.js'

const handlers: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<void>> = {
  'create-order': createOrder,
  'create-subscription': createSubscription,
  verify,
  'verify-subscription': verifySubscription,
  refund,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action ?? '')
    const route = handlers[action]
    if (!route) throw new HttpError(404, 'Unknown payment action', 'not_found')
    await route(req, res)
  } catch (error) {
    sendError(res, error)
  }
}
