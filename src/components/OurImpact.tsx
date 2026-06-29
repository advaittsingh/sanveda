import { useEffect, useState } from 'react'
import { fetchCMS, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import { useBreakpoints } from '../hooks/useMediaQuery'
import type { CMSItem } from '../types'

const DEFAULT_STATS = [
  { value: '100Cr+', title: 'Impact Statistics', label: 'Raised' },
  { value: '1k+', title: 'Success Metrics', label: 'Successful Campaigns' },
  { value: '2000+', title: 'Annual Impact Report', label: 'Monthly Donors' },
  { value: '100k+', title: 'Impact Statistics Test', label: 'Lives Impacted' },
]

export default function OurImpact() {
  const { mobile } = useBreakpoints()
  const [section, setSection] = useState<CMSItem | null>(null)

  useEffect(() => {
    fetchCMS().then((cms) => setSection(getCMSSection(cms, 'Our Impact') ?? null)).catch(() => {})
  }, [])

  const stats = (section?.relatedCMS ?? [])
    .filter((s) => s.status === 1 || s.status === true)
    .slice(0, 4)
    .map((s) => ({
      value: s.description || '',
      title: s.title || '',
      label: s.sub_title || s.stand_title || '',
    }))

  const gridStats = stats.length ? stats : DEFAULT_STATS
  const heading = section?.title ?? 'Our Impact'
  const description =
    section?.description ??
    'Discover the inspiring stories of individuals and communities transformed by our programs. Our success stories highlight the real-life impact of your donations.'
  const image = section?.image || ASSETS.ourImpact

  return (
    <section style={{ width: mobile ? 'calc(100% - 32px)' : '94.44%', maxWidth: 1440, margin: '0 auto 40px' }}>
      <div
        style={{
          borderRadius: mobile ? 20 : 34,
          backgroundColor: C.primary,
          minHeight: mobile ? 'auto' : 610,
          display: 'flex',
          flexDirection: mobile ? 'column' : 'row',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: mobile ? '100%' : '50%',
            padding: mobile ? '40px 24px' : '56px 48px 56px 56px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              color: C.gold,
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 1,
                background: 'rgba(255,255,255,0.14)',
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 1,
                background: 'rgba(255,255,255,0.14)',
                zIndex: 1,
              }}
            />
            {gridStats.map((stat, i) => (
              <div
                key={i}
                style={{
                  padding: mobile ? '18px 14px' : '28px 22px',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {stat.value && (
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: mobile ? 28 : 40,
                      lineHeight: 1.1,
                      color: i === 0 || i === 3 ? C.goldLight : '#FFFFFF',
                      fontFamily: 'Red Hat Display, sans-serif',
                      margin: '0 0 10px',
                    }}
                  >
                    {stat.value}
                  </p>
                )}
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: mobile ? 14 : 18,
                    lineHeight: 1.3,
                    color: i === 0 || i === 3 ? C.gold : '#FFFFFF',
                    fontFamily: 'Red Hat Display, sans-serif',
                    margin: `0 0 ${stat.value ? 6 : 8}px`,
                  }}
                >
                  {stat.title}
                </p>
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: mobile ? 12 : 15,
                    lineHeight: 1.4,
                    color: 'rgba(255,255,255,0.9)',
                    margin: 0,
                    fontFamily: 'Red Hat Display, sans-serif',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: mobile ? '100%' : '50%',
            minHeight: mobile ? 280 : 610,
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
        </div>
      </div>
    </section>
  )
}
