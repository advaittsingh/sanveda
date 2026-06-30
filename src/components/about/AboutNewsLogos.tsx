import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'

interface LogoItem {
  id: number
  image: string
  link: string
  title: string
}

export default function AboutNewsLogos({ items }: { items: LogoItem[] }) {
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

  const renderItem = (item: LogoItem, key: number) => (
    <a
      key={key}
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}
    >
      <img
        src={item.image}
        alt={item.title}
        style={{
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          maxHeight: mobile ? 60 : 80,
          maxWidth: mobile ? 120 : 160,
        }}
      />
    </a>
  )

  const doubled = items.flatMap((item, i) => [
    { ...item, key: item.id },
    { ...item, key: item.id + 10000 + i },
  ])

  return (
    <div style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto' }}>
      <div ref={containerRef} className="hide-scrollbar" style={{ width: '100%', overflow: 'hidden', padding: '30px 0', position: 'relative' }}>
        {scrollable ? (
          <div className="about-logo-scroll" ref={trackRef}>
            {doubled.map((item) => renderItem(item, item.key))}
          </div>
        ) : (
          <div ref={trackRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {items.map((item) => renderItem(item, item.id))}
          </div>
        )}
      </div>
    </div>
  )
}
