import { ABOUT_FOUNDERS, ABOUT_FOUNDERS_INTRO } from '../../constants/aboutContent'
import { C } from '../../constants/brand'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import AboutSectionLabel from './AboutSectionLabel'

export default function FoundersSection() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')

  return (
    <section
      style={{
        marginBottom: mobile ? 40 : 80,
        padding: mobile ? '0 16px' : tablet ? '0 24px' : 0,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: mobile ? 24 : 40 }}>
        <AboutSectionLabel center>Our Founders</AboutSectionLabel>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)',
          gap: mobile ? 20 : 28,
          maxWidth: 960,
          margin: '0 auto',
          marginBottom: mobile ? 32 : 48,
        }}
      >
        {ABOUT_FOUNDERS.map((founder) => (
          <article
            key={founder.name}
            style={{
              background: C.cream,
              border: `1px solid rgba(14, 79, 168, 0.12)`,
              borderRadius: mobile ? 20 : 24,
              overflow: 'hidden',
              boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '4 / 5',
                overflow: 'hidden',
                background: '#E8EDF3',
              }}
            >
              <img
                src={founder.image}
                alt={founder.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
              />
            </div>
            <div style={{ padding: mobile ? '20px 18px 24px' : '24px 24px 28px', textAlign: 'center' }}>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: C.gold,
                }}
              >
                {founder.label}
              </p>
              <h3
                style={{
                  margin: '0 0 8px',
                  fontSize: mobile ? 20 : 24,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: C.primary,
                }}
              >
                {founder.name}
              </h3>
              <p style={{ margin: '0 0 6px', fontSize: mobile ? 14 : 15, fontWeight: 600, color: C.textMuted }}>
                {founder.role}
              </p>
              <p style={{ margin: 0, fontSize: mobile ? 13 : 14, fontWeight: 500, color: C.gold }}>
                {founder.organization}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div
        style={{
          maxWidth: 820,
          margin: '0 auto',
          textAlign: 'center',
          padding: mobile ? '28px 20px' : '36px 40px',
          background: C.primary,
          borderRadius: mobile ? 20 : 28,
        }}
      >
        <h2
          style={{
            margin: '0 0 10px',
            fontSize: mobile ? 18 : tablet ? 22 : 28,
            fontWeight: 800,
            lineHeight: 1.25,
            color: C.white,
          }}
        >
          {ABOUT_FOUNDERS_INTRO.organization}
        </h2>
        <p
          style={{
            margin: `0 0 ${mobile ? 16 : 20}px`,
            fontSize: mobile ? 14 : 16,
            fontWeight: 600,
            lineHeight: 1.5,
            color: C.goldLight,
          }}
        >
          {ABOUT_FOUNDERS_INTRO.tagline}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: mobile ? 13 : 14,
            fontWeight: 400,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          {ABOUT_FOUNDERS_INTRO.description}
        </p>
      </div>
    </section>
  )
}
