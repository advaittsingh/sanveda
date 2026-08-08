import { describe, expect, it } from 'vitest'
import { deliveryUrl, isPrivateBlobPath, storagePath } from './privateStorageClient'

describe('privateStorageClient path helpers', () => {
  it('keeps public compliance PDFs as site paths', () => {
    const publicPdf = '/documents/coi-sanveda-global-humanitarian-foundation.pdf'
    expect(storagePath(publicPdf)).toBe(publicPdf)
    expect(deliveryUrl(publicPdf)).toBe(publicPdf)
    expect(isPrivateBlobPath(publicPdf)).toBe(false)
  })

  it('routes private Blob document uploads through /api/files', () => {
    const privatePath = 'documents/abc123/certificate.pdf'
    expect(isPrivateBlobPath(privatePath)).toBe(true)
    expect(deliveryUrl(privatePath)).toBe(
      '/api/files?path=documents%2Fabc123%2Fcertificate.pdf',
    )
  })

  it('does not treat documents/file.pdf as a private Blob key', () => {
    expect(isPrivateBlobPath('documents/80g-sanveda-global.pdf')).toBe(false)
    expect(deliveryUrl('/documents/80g-sanveda-global.pdf')).toBe(
      '/documents/80g-sanveda-global.pdf',
    )
  })
})
