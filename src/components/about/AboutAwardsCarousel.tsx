import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'

function SectionDivider({ title, subtitle }: { title: string; subtitle?: string }) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const lineStyle: React.CSSProperties = {
    flex: 1,
    maxWidth: mobile ? 120 : 250,
    height: 0,
    borderTop: '2.5px solid',
    borderImageSlice: 1,
    borderImageSource: 'linear-gradient(90deg, rgba(201, 224, 137, 0.08) 0%, rgba(98, 131, 9, 0.4) 100%)',
  }

  return (
    <div style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: mobile ? 10 : 18, width: '100%' }}>
        <div style={lineStyle} />
        <h2
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: mobile ? 16 : 22,
            lineHeight: mobile ? '16px' : '18px',
            color: '#8EA946',
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h2>
        <div style={{ ...lineStyle, borderImageSource: 'linear-gradient(90deg, rgba(98, 131, 9, 0.4) 0%, rgba(201, 224, 137, 0.08) 100%)' }} />
      </div>
      {subtitle ? (
        <p
          style={{
            margin: '18px 0 0',
            fontWeight: 800,
            fontSize: mobile ? 16 : 24,
            lineHeight: 1,
            textAlign: 'center',
            textTransform: 'capitalize',
            color: '#1D1D1B',
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
    <div style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto', marginBottom: mobile ? 0 : 30 }}>
      <SectionDivider title="Awards" subtitle={subtitle || undefined} />
      <div ref={containerRef} className="hide-scrollbar" style={{ width: '100%', overflow: 'hidden', padding: '30px 0', position: 'relative' }}>
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
  return <SectionDivider title="Featured On" />
}
