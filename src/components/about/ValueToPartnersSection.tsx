import {
  ABOUT_GOVERNANCE,
  ABOUT_PARTNERSHIP_NOTE,
  ABOUT_PARTNERS_INTRO,
  ABOUT_PARTNER_VALUES,
} from '../../constants/aboutContent'
import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'
import { creamSectionStyle } from '../../constants/sectionStyles'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import PartnerValueIcon from './PartnerValueIcon'

export default function ValueToPartnersSection() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const lg = useMediaQuery('(max-width: 1024px)')

  return (
    <div style={{ width: '100%', padding: lg ? '0 16px' : 0, boxSizing: 'border-box' }}>
      <section
        style={{
          ...creamSectionStyle(mobile, {
            width: '100%',
            maxWidth: 'none',
            margin: `${mobile ? 32 : 56}px 0 0`,
            padding: mobile ? '40px 20px 36px' : tablet ? '56px 32px 48px' : '64px 48px 56px',
            borderRadius: mobile ? 20 : 36,
            position: 'relative',
            overflow: 'hidden',
          }),
        }}
      >
        {/* Dot grid — top left */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: mobile ? 16 : 32,
            left: mobile ? 12 : 40,
            width: mobile ? 80 : 120,
            height: mobile ? 80 : 120,
            backgroundImage: 'radial-gradient(circle, rgba(212,164,55,0.35) 1.5px, transparent 1.5px)',
            backgroundSize: '14px 14px',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        {/* Decorative accents */}
        <img
          src={ASSETS.orangeSparks}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            top: mobile ? 20 : 48,
            right: mobile ? 16 : 80,
            width: mobile ? 36 : 48,
            opacity: 0.85,
            pointerEvents: 'none',
            display: mobile ? 'none' : 'block',
          }}
        />
        <img
          src={ASSETS.starIcon}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            top: mobile ? 28 : 56,
            right: mobile ? 48 : 160,
            width: mobile ? 14 : 18,
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        />
        <img
          src={ASSETS.greenRope}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            bottom: mobile ? 24 : 40,
            right: mobile ? -20 : 24,
            width: mobile ? 90 : 140,
            opacity: 0.35,
            pointerEvents: 'none',
            display: mobile ? 'none' : 'block',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: mobile ? 28 : 40 }}>
            <img
              src={ASSETS.aboutPeople}
              alt=""
              width={mobile ? 28 : 36}
              height={mobile ? 28 : 36}
              style={{ display: 'block', margin: '0 auto 12px' }}
            />
            <p
              style={{
                margin: '0 0 14px',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: mobile ? 11 : 14,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.gold,
              }}
            >
              {ABOUT_PARTNERS_INTRO.label}
            </p>
            <h2
              style={{
                margin: '0 auto 16px',
                maxWidth: 720,
                fontFamily: 'Red Hat Display, serif',
                fontWeight: 800,
                fontSize: mobile ? 24 : tablet ? 30 : 40,
                lineHeight: 1.2,
                color: C.primary,
              }}
            >
              {ABOUT_PARTNERS_INTRO.title}
            </h2>
            <p
              style={{
                margin: '0 auto',
                maxWidth: 640,
                fontSize: mobile ? 14 : 16,
                lineHeight: 1.65,
                color: C.textMuted,
              }}
            >
              {ABOUT_PARTNERS_INTRO.description}
            </p>
          </div>

          {/* Cards grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)',
              gap: mobile ? 14 : 20,
            }}
          >
            {ABOUT_PARTNER_VALUES.map((item) => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  gap: mobile ? 14 : 18,
                  alignItems: 'flex-start',
                  background: C.white,
                  borderRadius: 16,
                  padding: mobile ? '18px 16px' : '22px 20px',
                  boxShadow: '0px 8px 24px rgba(4, 27, 77, 0.06)',
                  border: '1px solid rgba(212, 164, 55, 0.12)',
                }}
              >
                <PartnerValueIcon type={item.icon} size={mobile ? 40 : 48} />
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      margin: '0 0 6px',
                      fontFamily: 'Red Hat Display, sans-serif',
                      fontWeight: 700,
                      fontSize: mobile ? 15 : 17,
                      lineHeight: 1.35,
                      color: C.primary,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: mobile ? 13 : 14,
                      lineHeight: 1.55,
                      color: C.textMuted,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Governance CTA banner */}
      <section
        style={{
          width: '100%',
          margin: `${mobile ? 24 : 32}px 0 ${mobile ? 32 : 48}px`,
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: mobile ? '24px 24px 20px 20px' : '32px 32px 28px 28px',
            overflow: 'hidden',
            backgroundColor: C.primary,
            padding: mobile ? '40px 24px' : '56px 48px',
            textAlign: 'center',
          }}
        >
          {/* Background imagery */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(135deg, rgba(4,27,77,0.92) 0%, rgba(14,79,168,0.85) 50%, rgba(4,27,77,0.92) 100%), url(${ASSETS.ourImpact})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.95,
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 20% 50%, rgba(212,164,55,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <img
              src={ASSETS.aboutPeople}
              alt=""
              width={mobile ? 32 : 40}
              height={mobile ? 32 : 40}
              style={{
                display: 'block',
                margin: '0 auto 20px',
                filter: 'brightness(0) saturate(100%) invert(76%) sepia(47%) saturate(522%) hue-rotate(6deg) brightness(95%) contrast(90%)',
              }}
            />
            <h3
              style={{
                margin: '0 auto 16px',
                maxWidth: 900,
                fontFamily: 'Red Hat Display, sans-serif',
                fontWeight: 800,
                fontSize: mobile ? 18 : tablet ? 22 : 28,
                lineHeight: 1.35,
                color: C.white,
              }}
            >
              {ABOUT_PARTNERSHIP_NOTE}
            </h3>
            <p
              style={{
                margin: 0,
                maxWidth: 760,
                marginLeft: 'auto',
                marginRight: 'auto',
                fontSize: mobile ? 14 : 16,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.88)',
              }}
            >
              {ABOUT_GOVERNANCE}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
