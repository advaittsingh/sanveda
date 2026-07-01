import { useEffect, useRef, useState } from 'react'
import { fetchCMS, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import { sectionShellStyle } from '../constants/sectionStyles'

interface Testimonial {
  id: number
  name: string
  text: string
  image?: string
}

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mobile, setMobile] = useState(false)
  const [title, setTitle] = useState('How do donors describe their experience with our NGO?')
  const [items, setItems] = useState<Testimonial[]>([])
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  useEffect(() => {
    const check = () => {
      setMobile(window.innerWidth < 600)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'Testimonial')
      if (section?.title) setTitle(section.title)
      setItems(
        (section?.relatedCMS ?? [])
          .filter((s) => s.status === 1 || s.status === true)
          .map((s) => ({
            id: s.id,
            name: s.title || '',
            text: s.description || '',
            image: s.image || undefined,
          })),
      )
    }).catch(() => {})
  }, [])

  const cardWidth = mobile ? 280 : 360

  const updateScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 0)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * cardWidth, behavior: 'smooth' })
    setTimeout(updateScroll, 300)
  }

  return (
    <div
      style={{
        ...sectionShellStyle(mobile, { padding: mobile ? '30px 0 20px 16px' : '70px 29px 40px' }),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'Red Hat Display',
          fontWeight: 800,
          fontSize: mobile ? '20px' : '36px',
          textAlign: 'center',
          color: C.primary,
          marginBottom: mobile ? '20px' : '60px',
          maxWidth: mobile ? '293px' : '738px',
          position: 'relative',
          zIndex: 2,
          textTransform: 'capitalize',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>

      <div
        ref={scrollRef}
        onScroll={updateScroll}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: mobile ? '16px' : '24px',
          overflowX: 'auto',
          width: '100%',
          padding: '10px 16px',
          scrollSnapType: 'x mandatory',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {items.map((t) => (
          <div
            key={t.id}
            style={{
              flexShrink: 0,
              width: cardWidth,
              scrollSnapAlign: 'start',
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #f1f1f1',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <img src={ASSETS.quote} alt="" width={32} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: mobile ? '13px' : '14px', color: '#4A4A49', lineHeight: 1.6, marginBottom: '20px' }}>
              {t.text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {t.image && (
                <img src={t.image} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <span style={{ fontWeight: 700, color: C.text, fontSize: '14px' }}>{t.name}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: mobile ? '10px' : '20px', marginTop: mobile ? '20px' : '40px', position: 'relative', zIndex: 2 }}>
        <button
          type="button"
          onClick={() => scroll(-1)}
          disabled={!canLeft}
          style={{
            width: mobile ? 25 : 50,
            height: mobile ? 25 : 50,
            borderRadius: '50%',
            background: canLeft ? C.secondary : '#B9B9B8',
            border: 'none',
            cursor: canLeft ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={ASSETS.leftArrow} alt="Previous" width={mobile ? 8 : 15} style={{ filter: canLeft ? 'brightness(0) invert(1)' : 'none' }} />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          disabled={!canRight}
          style={{
            width: mobile ? 25 : 50,
            height: mobile ? 25 : 50,
            borderRadius: '50%',
            background: canRight ? C.secondary : '#B9B9B8',
            border: 'none',
            cursor: canRight ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(180deg)',
          }}
        >
          <img src={ASSETS.leftArrow} alt="Next" width={mobile ? 8 : 15} style={{ filter: canRight ? 'brightness(0) invert(1)' : 'none' }} />
        </button>
      </div>
    </div>
  )
}
