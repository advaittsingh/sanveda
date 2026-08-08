import { put } from '@vercel/blob'
import { z } from 'zod'
import { serverEnv } from '../env.js'
import { apiHandler, HttpError, method } from '../http.js'
import {
  authorizeUpload,
  createObjectPath,
  deliveryUrl,
  readRequestBytes,
  requireSameOrigin,
  uploadPolicies,
  type UploadCategory,
} from '../storage.js'

const querySchema = z.object({
  category: z.enum(Object.keys(uploadPolicies) as [UploadCategory, ...UploadCategory[]]),
  entityId: z.string().min(1).max(100),
  filename: z.string().trim().min(1).max(255),
})

export default apiHandler(async (req, res) => {
  method(req, ['POST'])
  requireSameOrigin(req)
  const blobToken = serverEnv().BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    throw new HttpError(
      503,
      'File storage is not configured. Ask an admin to set BLOB_READ_WRITE_TOKEN.',
      'storage_unavailable',
    )
  }
  const input = querySchema.parse({
    category: req.query.category,
    entityId: req.query.entityId,
    filename: req.query.filename,
  })
  const policy = uploadPolicies[input.category]
  const contentType = String(req.headers['content-type'] ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase()
  if (!(policy.types as readonly string[]).includes(contentType)) {
    throw new HttpError(415, 'File type is not allowed for this category', 'unsupported_media_type')
  }
  const ownerUserId = await authorizeUpload(req, input.category, input.entityId)
  const bytes = await readRequestBytes(req, policy.maxBytes)
  const pathname = createObjectPath(input.category, input.entityId, contentType)

  try {
    await put(pathname, bytes, {
      access: 'private',
      addRandomSuffix: false,
      contentType,
      token: blobToken,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blob upload failed'
    console.error('Blob upload failed', { pathname, message })
    throw new HttpError(502, 'Could not store the uploaded file. Please try again.', 'storage_failed')
  }

  res.status(201).json({
    data: {
      path: pathname,
      deliveryUrl: deliveryUrl(pathname),
      originalName: input.filename,
      contentType,
      size: bytes.length,
      ownerUserId,
    },
  })
})
