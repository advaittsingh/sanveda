import { useEffect, useState } from 'react'
import { fetchCMS, getCMSSection } from '../api'
import { C } from '../constants/brand'
import { useBreakpoints } from '../hooks/useMediaQuery'
import type { CMSItem } from '../types'

export default function OurImpact() {
  const { mobile, md } = useBreakpoints()
  const [section, setSection] = useState<CMSItem | null>(null)

  useEffect(() => {
    fetchCMS().then((cms) => setSection(getCMSSection(cms, 'Our Impact') ?? null)).catch(() => {})
  }, [])

  if (!section) return null

  const heading = section.title ?? 'Our Impact'
  const description = section.description ?? ''
  const image = section.image

  return (
    <section style={{ width: mobile ? 'calc(100% - 32px)' : '94.44%', maxWidth: 1440, margin: '0 auto 40px' }}>
      <div
        style={{
          borderRadius: mobile ? 20 : 34,
          backgroundColor: C.primary,
          minHeight: md ? 'auto' : 610,
          display: 'flex',
          flexDirection: md ? 'column' : 'row',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: md ? '100%' : '50%',
            padding: mobile ? '40px 24px' : md ? '40px 32px' : '56px 48px 56px 56px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              color: C.secondary,
              fontWeight: 700,
              fontSize: mobile ? 12 : 18,
              lineHeight: 1,
              margin: '0 0 10px',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            Our Impact
          </p>
          <h2
            style={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: mobile ? 24 : 36,
              lineHeight: 1.2,
              margin: '0 0 14px',
              fontFamily: 'Red Hat Display, sans-serif',
            }}
          >
            {heading}
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.82)',
              fontSize: mobile ? 13 : 15,
              lineHeight: 1.65,
              margin: '0 0 36px',
              maxWidth: 520,
            }}
          >
            {description}
          </p>

        </div>

        {image && <div
          style={{
            width: md ? '100%' : '50%',
            minHeight: mobile ? 280 : md ? 320 : 610,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <img
            src={image}
            alt="Our Impact"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0,
              display: 'block',
            }}
          />
        </div>}
      </div>
    </section>
  )
}
