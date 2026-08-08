import { get } from '@vercel/blob'
import { Readable } from 'node:stream'
import { serverEnv } from '../env.js'
import { apiHandler, HttpError, method } from '../http.js'
import { authorizeDownload, storedPath } from '../storage.js'

export default apiHandler(async (req, res) => {
  method(req, ['GET'])
  const blobToken = serverEnv().BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    throw new HttpError(503, 'File storage is not configured', 'storage_unavailable')
  }
  const pathname = storedPath(req.query.path)
  if (!pathname) throw new HttpError(400, 'A valid file path is required', 'invalid_request')
  await authorizeDownload(req, pathname)

  const result = await get(pathname, { access: 'private', token: blobToken })
  if (!result?.stream) throw new HttpError(404, 'File not found', 'not_found')

  res.setHeader('Content-Type', result.blob.contentType || 'application/octet-stream')
  res.setHeader('Content-Disposition', 'inline')
  res.setHeader('Cache-Control', 'private, no-store')
  if (result.blob.size) res.setHeader('Content-Length', String(result.blob.size))
  // Vercel Blob's web stream type is wider than Node's fromWeb input; cast is safe here.
  Readable.fromWeb(result.stream as import('node:stream/web').ReadableStream).pipe(res)
})
