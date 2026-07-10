import { DOCUMENT_ICONS, isPdfDocument } from '../../constants/documentsContent'

interface Props {
  label: string
  image: string
  mobile?: boolean
  onPreview: () => void
  onDownload: () => void
}

export default function DocumentCard({ label, image, mobile, onPreview, onDownload }: Props) {
  const pdf = isPdfDocument(image)

  return (
    <article className="document-card" data-mobile={mobile}>
      <div className="document-card-badge">
        <span>{label}</span>
      </div>

      <div className="document-card-preview">
        <div className="document-card-image-wrap" data-pdf={pdf || undefined}>
          {pdf ? (
            <div className="document-card-pdf">
              <span className="document-card-pdf-label">PDF</span>
              <p className="document-card-pdf-title">{label}</p>
            </div>
          ) : (
            <img src={image} alt={label} loading="lazy" />
          )}
          <div className="document-card-overlay" aria-hidden />
        </div>

        <div className="document-card-actions">
          <button type="button" className="document-card-action" onClick={onPreview} aria-label={`Preview ${label}`}>
            <img src={DOCUMENT_ICONS.maximize} alt="" width={mobile ? 17 : 20} height={mobile ? 17 : 20} />
          </button>
          <button type="button" className="document-card-action" onClick={onDownload} aria-label={`Download ${label}`}>
            <img src={DOCUMENT_ICONS.download} alt="" width={mobile ? 16 : 20} height={mobile ? 16 : 20} />
          </button>
        </div>
      </div>
    </article>
  )
}
