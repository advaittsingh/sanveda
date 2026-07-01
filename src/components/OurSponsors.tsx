import { useEffect, useState } from 'react'
import { fetchCMS, getCMSSection } from '../api'
import { SPONSORS, type Sponsor } from '../constants/sponsors'
import { C } from '../constants/brand'
import { creamSectionStyle } from '../constants/sectionStyles'
import { useBreakpoints } from '../hooks/useMediaQuery'
import type { CMSItem } from '../types'

function SectionDivider({ title, mobile }: { title: string; mobile?: boolean }) {
  const lineStyle: React.CSSProperties = {
    flex: 1,
    maxWidth: mobile ? 80 : 250,
    height: 0,
    borderTop: '2.5px solid',
    borderImageSlice: 1,
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: mobile ? 12 : 16, marginBottom: mobile ? 24 : 32 }}>
      <div style={{ ...lineStyle, borderImageSource: 'linear-gradient(90deg, rgba(14, 79, 168, 0.08) 0%, rgba(14, 79, 168, 0.45) 100%)' }} />
      <h2
        style={{
          fontFamily: 'Red Hat Display, sans-serif',
          fontWeight: 800,
          fontSize: mobile ? 20 : 24,
          color: C.primary,
          margin: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </h2>
      <div style={{ ...lineStyle, borderImageSource: 'linear-gradient(90deg, rgba(14, 79, 168, 0.45) 0%, rgba(14, 79, 168, 0.08) 100%)' }} />
    </div>
  )
}

function mapCmsToSponsors(items: CMSItem[]): Sponsor[] {
  return items
    .filter((s) => s.status === 1 || s.status === true)
    .map((s) => ({
      id: s.id,
      name: s.title || s.sub_title || 'Sponsor',
      logo: s.image || undefined,
      link: s.link || undefined,
    }))
}

export default function OurSponsors() {
  const { mobile } = useBreakpoints()
  const [sponsors, setSponsors] = useState<Sponsor[]>(SPONSORS)

  useEffect(() => {
    fetchCMS()
      .then((cms) => {
        const section =
          getCMSSection(cms, 'Our Sponsors') ??
          getCMSSection(cms, 'Sponsors Section') ??
          getCMSSection(cms, 'Sponsor Section')
        const fromCms = mapCmsToSponsors(section?.relatedCMS ?? [])
        if (fromCms.length) setSponsors(fromCms)
      })
      .catch(() => {})
  }, [])

  return (
    <section
      style={{
        ...creamSectionStyle(mobile, {
          width: mobile ? 'calc(100% - 32px)' : '94.44%',
          padding: mobile ? '32px 16px 24px' : '40px 34px 32px',
        }),
      }}
    >
      <SectionDivider title="Our Sponsors" mobile={mobile} />

      {sponsors.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: mobile ? 24 : 40,
            rowGap: mobile ? 28 : 36,
          }}
        >
          {sponsors.map((sponsor) => {
            const content = sponsor.logo ? (
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                style={{ maxHeight: mobile ? 56 : 70, maxWidth: mobile ? 140 : 180, objectFit: 'contain' }}
              />
            ) : (
              <span
                style={{
                  fontWeight: 700,
                  fontSize: mobile ? 13 : 15,
                  color: C.primary,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {sponsor.name}
              </span>
            )

            return sponsor.link ? (
              <a
                key={sponsor.id}
                href={sponsor.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: mobile ? 120 : 160, textDecoration: 'none' }}
              >
                {content}
              </a>
            ) : (
              <div key={sponsor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: mobile ? 120 : 160 }}>
                {content}
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: C.textMuted, fontSize: mobile ? 13 : 15, margin: 0 }}>
          Partner with us — sponsor logos coming soon.
        </p>
      )}
    </section>
  )
}
