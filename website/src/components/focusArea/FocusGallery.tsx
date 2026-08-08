import { useCallback, useEffect, useState } from 'react'
import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'
import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent, type FocusGalleryImage } from '../../constants/focusAreaContent'
import { FocusSection, FocusSectionHeader } from './FocusSection'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusGallery({ area, mobile }: Props) {
  const content = getFocusAreaContent(area)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const images = content.gallery

  const close = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(() => {
    setLightboxIndex((i) => (i == null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])
  const next = useCallback(() => {
    setLightboxIndex((i) => (i == null ? null : (i + 1) % images.length))
  }, [images.length])

  useEffect(() => {
    if (lightboxIndex == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, close, prev, next])

  return (
    <>
      <FocusSection mobile={mobile} variant="cream" delay={200}>
        <FocusSectionHeader label="Visual Stories" title={content.galleryTitle} mobile={mobile} />
        <div className="focus-gallery-grid">
          {images.map((image, index) => (
            <GalleryTile key={`${image.src}-${index}`} image={image} onClick={() => setLightboxIndex(index)} />
          ))}
        </div>
        <div className="focus-gallery-actions">
          <button type="button" className="focus-gallery-view-all" onClick={() => setLightboxIndex(0)}>
            View Full Gallery
          </button>
        </div>

        <div className="focus-stories-block">
          <FocusSectionHeader label="Success Stories" title="Lives Transformed" mobile={mobile} />
          <div className="focus-stories-grid">
            {content.stories.map((story) => (
              <blockquote key={story.author} className="focus-story-card">
                <img src={ASSETS.quote} alt="" width={28} height={28} className="focus-story-quote-icon" />
                <p className="focus-story-text">&ldquo;{story.quote}&rdquo;</p>
                <footer className="focus-story-author">— {story.author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </FocusSection>

      {lightboxIndex != null && (
        <div className="focus-lightbox" role="dialog" aria-modal="true" aria-label="Image gallery">
          <button type="button" className="focus-lightbox-backdrop" onClick={close} aria-label="Close gallery" />
          <div className="focus-lightbox-panel">
            <button type="button" className="focus-lightbox-close" onClick={close} aria-label="Close">
              ×
            </button>
            <button type="button" className="focus-lightbox-nav focus-lightbox-prev" onClick={prev} aria-label="Previous image">
              ‹
            </button>
            <img src={images[lightboxIndex].src} alt={images[lightboxIndex].alt} className="focus-lightbox-image" />
            <button type="button" className="focus-lightbox-nav focus-lightbox-next" onClick={next} aria-label="Next image">
              ›
            </button>
            {(images[lightboxIndex].caption || images[lightboxIndex].alt) && (
              <p className="focus-lightbox-caption" style={{ color: C.white }}>
                {images[lightboxIndex].caption ?? images[lightboxIndex].alt}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function GalleryTile({ image, onClick }: { image: FocusGalleryImage; onClick: () => void }) {
  return (
    <button type="button" className="focus-gallery-tile" onClick={onClick}>
      <img src={image.src} alt={image.alt} loading="lazy" />
      {image.caption && <span className="focus-gallery-caption">{image.caption}</span>}
    </button>
  )
}
