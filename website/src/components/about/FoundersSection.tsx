import { ABOUT_FOUNDERS, ABOUT_FOUNDERS_INTRO } from '../../constants/aboutContent'
import { C } from '../../constants/brand'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import AboutSectionLabel from './AboutSectionLabel'

function FounderCard({ founder, mobile }: { founder: (typeof ABOUT_FOUNDERS)[number]; mobile: boolean }) {
  return (
    <article
      style={{
        background: C.cream,
        border: `1px solid rgba(14, 79, 168, 0.12)`,
        borderRadius: mobile ? 20 : 24,
        overflow: 'hidden',
        boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 5',
          overflow: 'hidden',
          background: '#E8EDF3',
          flexShrink: 0,
        }}
      >
        <img
          src={founder.image}
          alt={founder.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
        />
      </div>
      <div style={{ padding: mobile ? '18px 16px 22px' : '20px 18px 24px', textAlign: 'center', flex: 1 }}>
        <h3
          style={{
            margin: '0 0 8px',
            fontSize: mobile ? 18 : 20,
            fontWeight: 800,
            lineHeight: 1.2,
            color: C.primary,
          }}
        >
          {founder.name}
        </h3>
        <p style={{ margin: '0 0 6px', fontSize: mobile ? 13 : 14, fontWeight: 600, color: C.textMuted }}>
          {founder.role}
        </p>
        <p style={{ margin: 0, fontSize: mobile ? 12 : 13, fontWeight: 500, color: C.secondary }}>
          {founder.organization}
        </p>
      </div>
    </article>
  )
}

export default function FoundersSection() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const stack = mobile || tablet

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
          display: 'flex',
          flexDirection: stack ? 'column' : 'row',
          gap: mobile ? 24 : 28,
          maxWidth: 1200,
          margin: '0 auto',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            flex: stack ? undefined : '1 1 46%',
            padding: mobile ? '28px 20px' : '40px 36px',
            background: C.primary,
            borderRadius: mobile ? 20 : 28,
            textAlign: stack ? 'center' : 'left',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
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
              color: C.secondaryLight,
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

        <div
          style={{
            flex: stack ? undefined : '1 1 54%',
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)',
            gap: mobile ? 20 : 20,
            alignItems: 'stretch',
          }}
        >
          {ABOUT_FOUNDERS.map((founder) => (
            <FounderCard key={founder.name} founder={founder} mobile={mobile} />
          ))}
        </div>
      </div>
    </section>
  )
}
