import { del } from '@vercel/blob'
import { z } from 'zod'
import { requirePermission } from '../dataAccess.js'
import { serverEnv } from '../env.js'
import { apiHandler, HttpError, method, parseBody } from '../http.js'
import { requireSameOrigin, storedPath } from '../storage.js'

const bodySchema = z.object({ value: z.string().min(1).max(2000) }).strict()

export default apiHandler(async (req, res) => {
  method(req, ['DELETE'])
  requireSameOrigin(req)
  const blobToken = serverEnv().BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    throw new HttpError(503, 'File storage is not configured', 'storage_unavailable')
  }
  const { value } = parseBody(req, bodySchema)
  const pathname = storedPath(value)
  if (!pathname) {
    res.status(204).end()
    return
  }
  if (
    !/^(volunteers|documents|gallery|reports|tasks)\/[A-Za-z0-9][A-Za-z0-9_-]{0,99}\/[A-Za-z0-9][A-Za-z0-9._-]*\.[a-z0-9]+$/.test(
      pathname,
    )
  ) {
    throw new HttpError(400, 'Invalid managed object path', 'invalid_request')
  }

  const module = pathname.startsWith('volunteers/')
    ? 'volunteers'
    : pathname.startsWith('gallery/')
      ? 'gallery'
      : pathname.startsWith('reports/')
        ? 'reports'
        : pathname.startsWith('tasks/')
          ? 'volunteers'
          : 'documents'
  await requirePermission(req, module, 'delete')
  await del(pathname, { token: blobToken })
  res.status(204).end()
})
