import { HttpError, sendError } from '../_lib/http.js'
import type { VercelRequest, VercelResponse } from '../_lib/vercel.js'
import download from '../_lib/handlers/storage-download.js'
import object from '../_lib/handlers/storage-object.js'
import upload from '../_lib/handlers/storage-upload.js'

const handlers: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<void>> = {
  upload,
  object,
  download,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action ?? '')
    const route = handlers[action]
    if (!route) throw new HttpError(404, 'Unknown storage action', 'not_found')
    await route(req, res)
  } catch (error) {
    sendError(res, error)
  }
}
