import { useEffect, useRef, useState } from 'react'
import { C } from '../../constants/brand'
import { useMediaQuery } from '../../hooks/useMediaQuery'

function SectionDivider({ title, subtitle }: { title: string; subtitle?: string }) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const lineStyle: React.CSSProperties = {
    flex: 1,
    maxWidth: mobile ? 80 : 250,
    height: 0,
    borderTop: '2.5px solid',
    borderImageSlice: 1,
    borderImageSource: 'linear-gradient(90deg, rgba(212,164,55,0.08) 0%, rgba(212,164,55,0.5) 100%)',
  }

  return (
    <div style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: mobile ? 12 : 16, width: '100%' }}>
        <div style={lineStyle} />
        <h2
          style={{
            fontFamily: 'Red Hat Display, sans-serif',
            fontWeight: 800,
            fontSize: mobile ? 20 : 24,
            lineHeight: 1,
            color: C.primary,
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h2>
        <div style={{ ...lineStyle, borderImageSource: 'linear-gradient(90deg, rgba(212,164,55,0.5) 0%, rgba(212,164,55,0.08) 100%)' }} />
      </div>
      {subtitle ? (
        <p
          style={{
            margin: '18px 0 0',
            fontWeight: 600,
            fontSize: mobile ? 15 : 18,
            lineHeight: 1.4,
            textAlign: 'center',
            color: C.textMuted,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

interface LogoItem {
  id: number
  image: string
  link: string
}

export default function AboutAwardsCarousel({ subtitle, items }: { subtitle: string; items: LogoItem[] }) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track || items.length === 0) {
      setScrollable(false)
      return
    }
    const check = () => setScrollable(track.scrollWidth > container.clientWidth)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(container)
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  const renderItem = (item: LogoItem) => (
    <a
      key={item.id}
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}
    >
      <img
        src={item.image}
        alt=""
        style={{
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          maxHeight: mobile ? 56 : 96,
          maxWidth: mobile ? 112 : 192,
        }}
      />
    </a>
  )

  const doubled = [...items, ...items]

  return (
    <div
      style={{
        width: '94.44%',
        maxWidth: 1440,
        margin: '0 auto',
        marginBottom: mobile ? 0 : 30,
        background: C.cream,
        borderRadius: mobile ? 20 : 30,
        padding: mobile ? '24px 16px' : '32px 24px',
      }}
    >
      <SectionDivider title="Awards" subtitle={subtitle || undefined} />
      <div ref={containerRef} className="hide-scrollbar" style={{ width: '100%', overflow: 'hidden', padding: '30px 0 8px', position: 'relative' }}>
        {scrollable ? (
          <div className="about-logo-scroll" ref={trackRef}>
            {doubled.map((item, i) => renderItem({ ...item, id: item.id * 1000 + i }))}
          </div>
        ) : (
          <div ref={trackRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {items.map(renderItem)}
          </div>
        )}
      </div>
    </div>
  )
}

export function AboutFeaturedOnHeading() {
  return (
    <div style={{ marginTop: 24 }}>
      <SectionDivider title="Featured On" />
    </div>
  )
}
