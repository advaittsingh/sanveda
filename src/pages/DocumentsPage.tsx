import { useEffect, useState } from 'react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import DocumentCard from '../components/documents/DocumentCard'
import SubPageBanner from '../components/ui/SubPageBanner'
import {
  DOCUMENTS_PAGE,
  buildPdfViewerUrl,
  downloadDocument,
  isPdfDocument,
  type DocumentItem,
} from '../constants/documentsContent'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { getPublicDocuments } from '../lib/publicDocumentsService'

export default function DocumentsPage() {
  const mobile = useMediaQuery('(max-width: 767.95px)')
  const heroMobile = useMediaQuery('(max-width: 600px)')
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<DocumentItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DocumentItem[]>([])

  useEffect(() => {
    getPublicDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!preview) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreview(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [preview])

  const handleDownload = async (image: string, label: string) => {
    try {
      await downloadDocument(image, label, mobile)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download this document.')
    }
  }

  return (
    <div className="documents-page">
      <AboutBreadcrumb
        items={[{ label: 'Home', path: '/' }, { label: DOCUMENTS_PAGE.breadcrumb, path: null }]}
      />

      <div className="page-banner-wrap" data-mobile={heroMobile}>
        <SubPageBanner title={DOCUMENTS_PAGE.title} subtitle={DOCUMENTS_PAGE.description} />
      </div>

      <div className="documents-shell">
        <div className="documents-panel" data-mobile={mobile}>
          <div className="documents-panel-header">
            <p className="documents-eyebrow">{DOCUMENTS_PAGE.label}</p>
            <h2 className="documents-panel-title" data-mobile={mobile}>
              {DOCUMENTS_PAGE.title}
            </h2>
          </div>

          {loading ? (
            <div className="documents-loading">
              <div className="documents-spinner" aria-label="Loading documents" />
            </div>
          ) : (
            <div className="documents-grid" data-mobile={mobile}>
              {!loading && documents.length === 0 ? (
                <p className="documents-empty">No documents available.</p>
              ) : (
                documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    label={doc.label}
                    image={doc.image}
                    mobile={mobile}
                    onPreview={() => setPreview(doc)}
                    onDownload={() => handleDownload(doc.image, doc.label)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {preview && (
        <button
          type="button"
          className="documents-lightbox"
          onClick={() => setPreview(null)}
          aria-label="Close document preview"
        >
          {isPdfDocument(preview.image) ? (
            <iframe
              title={preview.label}
              src={buildPdfViewerUrl(preview.image, { toolbar: true })}
              className="documents-lightbox-pdf"
              onClick={(event) => event.stopPropagation()}
            />
          ) : (
            <img
              src={preview.image}
              alt={preview.label}
              className="documents-lightbox-image"
              onClick={(event) => event.stopPropagation()}
            />
          )}
        </button>
      )}

      {error && (
        <div className="documents-toast" role="status">
          <p>{error}</p>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
    </div>
  )
}
