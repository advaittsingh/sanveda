import { useEffect, useState } from 'react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import DocumentCard from '../components/documents/DocumentCard'
import SubPageBanner from '../components/ui/SubPageBanner'
import { fetchCMS, getCMSSectionById } from '../api'
import {
  DOCUMENTS_CMS_ID,
  DOCUMENTS_PAGE,
  downloadDocument,
  type DocumentItem,
} from '../constants/documentsContent'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function DocumentsPage() {
  const mobile = useMediaQuery('(max-width: 767.95px)')
  const heroMobile = useMediaQuery('(max-width: 600px)')
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pageTitle, setPageTitle] = useState(DOCUMENTS_PAGE.title)
  const [pageDescription, setPageDescription] = useState(DOCUMENTS_PAGE.description)
  const [documents, setDocuments] = useState<DocumentItem[]>([])

  useEffect(() => {
    fetchCMS()
      .then((cms) => {
        const section = getCMSSectionById(cms, DOCUMENTS_CMS_ID) ?? cms.find((s) => s.section === 'Documents Section')
        if (!section) return

        const title = (section.title ?? '').trim()
        const description = (section.description ?? '').trim()
        if (title) setPageTitle(title)
        if (description) setPageDescription(description)

        const items = (section.relatedCMS ?? [])
          .filter((item) => item && (item.status === 1 || item.status === true))
          .map((item) => ({
            id: item.id,
            label: (item.title ?? '').trim(),
            image: (item.image ?? '').trim(),
          }))
          .filter((item) => item.image)

        setDocuments(items)
      })
      .catch(() => {})
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
        <SubPageBanner title={pageTitle} subtitle={pageDescription} />
      </div>

      <div className="documents-shell">
        <div className="documents-panel" data-mobile={mobile}>
          <div className="documents-panel-header">
            <p className="documents-eyebrow">{DOCUMENTS_PAGE.label}</p>
            <h2 className="documents-panel-title" data-mobile={mobile}>
              {pageTitle}
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
                    onPreview={() => setPreview(doc.image)}
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
          <img
            src={preview}
            alt="Document preview"
            className="documents-lightbox-image"
            onClick={(event) => event.stopPropagation()}
          />
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
