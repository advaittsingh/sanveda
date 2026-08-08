import { useEffect, useState } from 'react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { C } from '../constants/brand'
import { withLocalGalleryAlbums } from '../constants/localGallery'
import { getPublishedAlbums, type GalleryAlbum, type GalleryItem } from '../lib/galleryService'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function GalleryPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const [albums, setAlbums] = useState<GalleryAlbum[]>(() => withLocalGalleryAlbums([]))
  const [selected, setSelected] = useState<GalleryAlbum | null>(null)
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  useEffect(() => {
    getPublishedAlbums()
      .then((remote) => setAlbums(withLocalGalleryAlbums(remote)))
      .catch(() => setAlbums(withLocalGalleryAlbums([])))
  }, [])

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Gallery', path: null }]} />

      <section style={{ width: '94.44%', maxWidth: 1200, margin: '0 auto', padding: mobile ? '24px 16px' : '40px 0' }}>
        <h1 style={{ fontSize: mobile ? 28 : 40, fontWeight: 800, color: C.primary, margin: '0 0 8px' }}>
          Photo Gallery
        </h1>
        <p style={{ color: C.textMuted, marginBottom: 32 }}>
          Stories of impact from across Sanveda&apos;s programmes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() => setSelected(album)}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                overflow: 'hidden',
                padding: 0,
                cursor: 'pointer',
                background: C.white,
                textAlign: 'left',
              }}
            >
              {album.coverImage || album.items[0]?.mediaType === 'image' ? (
                <img
                  src={album.coverImage ?? album.items[0]?.url}
                  alt={album.title}
                  style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                />
              ) : album.items[0]?.mediaType === 'video' ? (
                <video
                  src={album.items[0].url}
                  muted
                  playsInline
                  style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: 200, background: C.grayBg }} />
              )}
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: '0 0 6px', color: C.primary, fontWeight: 700 }}>{album.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>{album.items.length} items</p>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="focus-lightbox" role="dialog" aria-modal="true">
            <button type="button" className="focus-lightbox-backdrop" onClick={() => setSelected(null)} aria-label="Close" />
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                background: C.white,
                borderRadius: 16,
                padding: 24,
                maxWidth: 900,
                width: '90%',
                maxHeight: '85vh',
                overflow: 'auto',
              }}
            >
              <h2 style={{ margin: '0 0 8px', color: C.primary }}>{selected.title}</h2>
              {selected.description && (
                <p style={{ margin: '0 0 16px', color: C.textMuted, fontSize: 14 }}>{selected.description}</p>
              )}
              <div className="focus-gallery-grid">
                {selected.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="focus-gallery-tile"
                    onClick={() => setLightbox(item)}
                  >
                    {item.mediaType === 'video' ? (
                      <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                    ) : (
                      <img src={item.url} alt={item.caption ?? selected.title} />
                    )}
                    {item.caption && <span className="focus-gallery-caption">{item.caption}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
                alt={lightbox.caption ?? 'Gallery'}
                className="documents-lightbox-image"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </button>
        )}
      </section>
    </div>
  )
}
