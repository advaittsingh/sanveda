import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOCAL_GALLERY_ALBUM } from '../constants/localGallery'
import { C } from '../constants/brand'
import { creamSectionStyle } from '../constants/sectionStyles'
import { useBreakpoints } from '../hooks/useMediaQuery'
import type { GalleryItem } from '../lib/galleryService'
import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'
import ViewAllButton from './ui/ViewAllButton'

export default function OurGallery() {
  const navigate = useNavigate()
  const { mobile, tablet } = useBreakpoints()
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)
  const items = LOCAL_GALLERY_ALBUM.items
  const gridColumns = mobile ? '1fr 1fr' : tablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)'

  return (
    <section
      aria-label="Gallery"
      style={{
        ...creamSectionStyle(mobile, {
          width: mobile ? 'calc(100% - 32px)' : '94.44%',
          padding: mobile ? '32px 16px 28px' : '48px 34px 40px',
        }),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: mobile ? 24 : 36, width: '100%' }}>
        <SectionLabel mobile={mobile} center>
          Our Gallery
        </SectionLabel>
        <div style={{ marginTop: 12 }}>
          <SectionTitle mobile={mobile} maxWidth={mobile ? '280px' : '620px'}>
            {LOCAL_GALLERY_ALBUM.title}
          </SectionTitle>
        </div>
        {LOCAL_GALLERY_ALBUM.description && (
          <p
            style={{
              margin: '12px auto 0',
              maxWidth: 560,
              color: C.textMuted,
              fontSize: mobile ? 13 : 15,
              lineHeight: 1.5,
            }}
          >
            {LOCAL_GALLERY_ALBUM.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: mobile ? 10 : 14,
          width: '100%',
          marginBottom: mobile ? 24 : 36,
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightbox(item)}
            aria-label={item.mediaType === 'video' ? 'Play gallery video' : 'View gallery photo'}
            style={{
              position: 'relative',
              border: 'none',
              padding: 0,
              borderRadius: 14,
              overflow: 'hidden',
              cursor: 'pointer',
              aspectRatio: '1',
              background: '#e8e8e8',
            }}
          >
            {item.mediaType === 'video' ? (
              <>
                <video
                  src={item.url}
                  muted
                  playsInline
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(4, 27, 77, 0.28)',
                  }}
                >
                  <span
                    style={{
                      width: mobile ? 36 : 44,
                      height: mobile ? 36 : 44,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.92)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        width: 0,
                        height: 0,
                        marginLeft: 3,
                        borderStyle: 'solid',
                        borderWidth: '7px 0 7px 12px',
                        borderColor: 'transparent transparent transparent #041B4D',
                      }}
                    />
                  </span>
                </span>
              </>
            ) : (
              <img
                src={item.url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </button>
        ))}
      </div>

      <ViewAllButton text="View Full Gallery" mobile={mobile} onClick={() => navigate('/gallery')} />

      {lightbox && (
        <button type="button" className="documents-lightbox" onClick={() => setLightbox(null)} aria-label="Close">
          {lightbox.mediaType === 'video' ? (
            <video
              src={lightbox.url}
              controls
              autoPlay
              playsInline
              className="documents-lightbox-image"
              style={{ maxWidth: '92vw', maxHeight: '85vh', background: '#000' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightbox.url}
              alt="Gallery"
              className="documents-lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </button>
      )}
    </section>
  )
}
