import { ABOUT_BANNER_MASKS, ASSETS, STRENGTH_ICONS } from '../constants/assets'
import { C } from '../constants/brand'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useAboutCMS } from '../hooks/useAboutCMS'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import AboutSectionLabel from '../components/about/AboutSectionLabel'
import DonateNowButton from '../components/about/DonateNowButton'
import ValueToPartnersSection from '../components/about/ValueToPartnersSection'

function maskImg(mask: string): React.CSSProperties {
  return {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    maskImage: `url(${mask})`,
    WebkitMaskImage: `url(${mask})`,
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  }
}

function AboutHeroBanner({ images, mobile, tablet }: { images: string[]; mobile: boolean; tablet: boolean }) {
  const bannerClasses = ['about-first', 'about-second about-banner-hide-sm', 'about-third', 'about-second about-banner-hide-sm', 'about-first']

  return (
    <div className="about-banner" style={{ marginTop: tablet ? 20 : -42 }}>
      {images.slice(0, 5).map((src, i) =>
        src ? (
          <div key={i} className={bannerClasses[i]}>
            <img src={src} alt={`aboutBanner${i + 1}`} style={maskImg(ABOUT_BANNER_MASKS[i])} />
          </div>
        ) : null,
      )}
      {images.length === 0 &&
        [0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={bannerClasses[i]} style={{ background: C.cream, minHeight: mobile ? 120 : 200, borderRadius: 12 }} />
        ))}
    </div>
  )
}

function WhoWeAreCollage({
  image1,
  image2,
  image3,
  mobile,
  tablet,
}: {
  image1: string
  image2: string
  image3: string
  mobile: boolean
  tablet: boolean
}) {
  const boxW = mobile ? 274 : tablet ? 350 : 505
  const boxH = mobile ? 231 : tablet ? 300 : 425

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ width: boxW, height: boxH, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img
          src={ASSETS.orangeSparks}
          alt=""
          style={{
            position: 'absolute',
            top: mobile ? 2 : 8,
            left: mobile ? -30 : -45,
            width: mobile ? 250 : tablet ? 300 : 358,
            height: mobile ? 220 : tablet ? 280 : 344,
            zIndex: 0,
          }}
        />
        {image1 && (
          <div
            style={{
              position: 'absolute',
              width: mobile ? 144 : tablet ? 185 : 265,
              height: mobile ? 176 : tablet ? 230 : 324,
              top: mobile ? 20 : tablet ? 25 : 50,
              left: 0,
              zIndex: 3,
            }}
          >
            <img src={image1} alt="Who We Are Image 1" style={maskImg(ASSETS.donateMonthlyMask1)} />
          </div>
        )}
        {image2 && (
          <div
            style={{
              position: 'absolute',
              width: mobile ? 100 : tablet ? 170 : 187,
              height: mobile ? 74 : tablet ? 95 : 139,
              top: mobile ? 39 : tablet ? 52 : 84,
              right: mobile ? 61 : tablet ? 55 : 110,
              zIndex: 2,
            }}
          >
            <img src={image2} alt="Who We Are Image 2" style={maskImg(ASSETS.donateMonthlyMask2)} />
          </div>
        )}
        {image3 && (
          <div
            style={{
              position: 'absolute',
              width: mobile ? 130 : tablet ? 125 : 240,
              height: mobile ? 84 : tablet ? 125 : 155,
              bottom: mobile ? 1 : tablet ? 5 : -13,
              left: mobile ? 80 : tablet ? 105 : 146,
              zIndex: 1,
            }}
          >
            <img src={image3} alt="Who We Are Image 3" style={maskImg(ASSETS.donateMonthlyMask3)} />
          </div>
        )}
      </div>
    </div>
  )
}

function VisionStatCard({ value, mobile, tablet }: { value: string; mobile: boolean; tablet: boolean }) {
  return (
    <div
      style={{
        border: `1px solid rgba(212, 164, 55, 0.25)`,
        background: C.cream,
        borderRadius: mobile ? 16 : 30,
        height: mobile ? 102 : 181,
        paddingInline: mobile ? 16 : 33,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <p style={{ fontWeight: 700, fontSize: mobile ? 16 : tablet ? 18 : 42, lineHeight: mobile ? '20px' : '42px', color: C.gold, margin: '0 0 16px' }}>
        {value}
      </p>
      <p style={{ fontWeight: 600, fontSize: mobile ? 12 : 18, lineHeight: mobile ? '20px' : '29px', color: C.textMuted, margin: 0 }}>
        Communities Reached
      </p>
    </div>
  )
}

export default function AboutPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const lg = useMediaQuery('(max-width: 1024px)')
  const md = useMediaQuery('(max-width: 960px)')

  const cms = useAboutCMS()

  const sectionLabelSize = mobile ? 16 : tablet ? 18 : 20
  const sectionLabelLine = mobile ? '20px' : '42px'
  const headingSize = mobile ? 18 : tablet ? 22 : 36
  const headingLine = mobile ? '28px' : tablet ? '40px' : '50px'

  return (
    <div style={{ background: C.white }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'About us', path: null }]} />

      <div style={{ width: '100%', paddingLeft: lg ? 0 : 40, paddingRight: lg ? 0 : 40 }}>
        {/* Hero */}
        <section style={{ marginBottom: mobile ? 30 : md ? 40 : 82, paddingLeft: lg ? 16 : 0, paddingRight: lg ? 16 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            {!mobile && (
              <h1 style={{ fontWeight: 600, color: C.gold, margin: '0 0 14px', fontSize: 18, lineHeight: 1.2, fontFamily: 'Nunito, sans-serif' }}>About Us</h1>
            )}
            {cms.heroTitle && (
              <h2
                style={{
                  fontWeight: 700,
                  color: C.primary,
                  fontSize: mobile ? 18 : tablet ? 22 : 42,
                  lineHeight: mobile ? '24px' : tablet ? 'normal' : '56px',
                  margin: `0 0 ${mobile ? 10 : 14}px`,
                  maxWidth: mobile ? 272 : 800,
                }}
              >
                {cms.heroTitle}
              </h2>
            )}
            <p style={{ fontWeight: 500, color: C.textMuted, fontSize: mobile ? 12 : 14, lineHeight: '22.652px', maxWidth: mobile ? 328 : 482, margin: 0 }}>
              {cms.heroDescription}
            </p>
          </div>
          <AboutHeroBanner images={cms.heroImages} mobile={mobile} tablet={tablet} />
        </section>

        {/* Who we are */}
        <section
          style={{
            backgroundColor: C.primary,
            display: 'flex',
            flexDirection: md ? 'column-reverse' : 'row',
            gap: lg ? 50 : 17,
            padding: lg ? '30px 16px' : '90px 0 70px 70px',
            borderRadius: md ? 0 : 30,
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}
        >
          <div style={{ maxWidth: md ? '100%' : tablet ? 467 : 667, width: '100%' }}>
            <div style={{ fontSize: sectionLabelSize, lineHeight: sectionLabelLine, marginBottom: md ? 10 : 30 }}>
              <AboutSectionLabel>Who we are</AboutSectionLabel>
            </div>
            <h2
              style={{
                fontWeight: 700,
                fontSize: headingSize,
                lineHeight: headingLine,
                color: C.white,
                margin: '0 0 20px',
                maxWidth: mobile ? 300 : 620,
                textTransform: 'capitalize',
              }}
            >
              {cms.whoWeAreTitle}
            </h2>
            <p style={{ fontWeight: 400, fontSize: 14, lineHeight: '24px', color: 'rgba(255,255,255,0.88)', paddingBottom: md ? 12 : 20, margin: 0, maxWidth: 667 }}>
              {cms.whoWeAreBaseDesc}
            </p>
            <p style={{ fontWeight: 400, fontSize: 14, lineHeight: '24px', color: 'rgba(255,255,255,0.88)', paddingBottom: md ? 20 : 30, margin: 0, maxWidth: 667 }}>
              {cms.whoWeAreSecondDesc}
            </p>
            <div style={{ textAlign: md ? 'center' : 'left', display: 'flex', justifyContent: mobile ? 'center' : 'flex-start' }}>
              <DonateNowButton />
            </div>
          </div>
          <WhoWeAreCollage image1={cms.whoWeAreImage1} image2={cms.whoWeAreImage2} image3={cms.whoWeAreImage3} mobile={mobile} tablet={tablet} />
        </section>

        {/* Vision */}
        <section
          style={{
            display: 'flex',
            flexDirection: md ? 'column' : 'row',
            gap: mobile ? 0 : 40,
            alignItems: 'center',
            marginTop: 80,
            justifyContent: 'space-evenly',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: mobile ? 16 : 30,
              padding: md ? '0 10px' : 0,
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 10 : 20 }}>
              <div
                style={{
                  width: '100%',
                  height: mobile ? 172 : 304,
                  borderRadius: 30,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {cms.visionImage1 && <img src={cms.visionImage1} alt="Vision Image 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <VisionStatCard value={cms.visionPoint1} mobile={mobile} tablet={tablet} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 10 : 20 }}>
              <VisionStatCard value={cms.visionPoint2} mobile={mobile} tablet={tablet} />
              <div style={{ width: '100%', height: mobile ? 172 : 304, borderRadius: 30, overflow: 'hidden' }}>
                {cms.visionImage2 && <img src={cms.visionImage2} alt="Vision Image 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            </div>
          </div>

          <div style={{ padding: lg ? '30px 16px' : 0, width: md ? '100%' : 'auto' }}>
            <div style={{ fontSize: sectionLabelSize, lineHeight: sectionLabelLine, marginBottom: md ? 10 : 30 }}>
              <AboutSectionLabel>Our Vision</AboutSectionLabel>
            </div>
            <h2
              style={{
                fontWeight: 800,
                fontSize: headingSize,
                lineHeight: headingLine,
                color: C.primary,
                margin: '0 0 20px',
                maxWidth: mobile ? 328 : 577,
                textTransform: 'capitalize',
              }}
            >
              {cms.visionTitle}
            </h2>
            <p style={{ fontWeight: 400, fontSize: 14, lineHeight: '24px', color: C.textMuted, paddingBottom: md ? 12 : 20, margin: 0, maxWidth: 667 }}>
              {cms.visionDesc1}
            </p>
            <p style={{ fontWeight: 400, fontSize: 14, lineHeight: '24px', color: C.textMuted, paddingBottom: md ? 20 : 30, margin: 0, maxWidth: 667 }}>
              {cms.visionDesc2}
            </p>
            <div style={{ textAlign: md ? 'center' : 'left', display: 'flex', justifyContent: mobile ? 'center' : 'flex-start' }}>
              <DonateNowButton />
            </div>
          </div>
        </section>

        {/* Mission */}
        <section
          style={{
            backgroundColor: C.primary,
            display: 'flex',
            flexDirection: md ? 'column-reverse' : 'row',
            gap: mobile ? 20 : tablet ? 80 : 119,
            padding: lg ? '30px 16px' : '90px 0 70px 70px',
            borderRadius: md ? 0 : 30,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            marginTop: mobile ? 0 : 70,
          }}
        >
          <div style={{ maxWidth: md ? '100%' : tablet ? 467 : 667, width: '100%' }}>
            <div style={{ fontSize: sectionLabelSize, lineHeight: sectionLabelLine, marginBottom: md ? 10 : 30 }}>
              <AboutSectionLabel>Our Mission</AboutSectionLabel>
            </div>
            <h2
              style={{
                fontWeight: 800,
                fontSize: headingSize,
                lineHeight: headingLine,
                color: C.white,
                margin: '0 0 20px',
                maxWidth: 577,
                textTransform: 'capitalize',
              }}
            >
              {cms.missionTitle}
            </h2>
            <p style={{ fontWeight: 400, fontSize: 14, lineHeight: '24px', color: 'rgba(255,255,255,0.88)', paddingBottom: md ? 12 : 20, margin: 0, maxWidth: 667 }}>
              {cms.missionBaseDesc}
            </p>
            <p style={{ fontWeight: 400, fontSize: 14, lineHeight: '24px', color: 'rgba(255,255,255,0.88)', paddingBottom: md ? 20 : 30, margin: 0, maxWidth: 667 }}>
              {cms.missionSecondDesc}
            </p>
            <div style={{ textAlign: md ? 'center' : 'left', display: 'flex', justifyContent: mobile ? 'center' : 'flex-start' }}>
              <DonateNowButton />
            </div>
          </div>

          {!md && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    width: tablet ? 235 : 265,
                    height: tablet ? 290 : 324,
                    top: -20,
                    left: -160,
                    transform: 'rotate(-25deg)',
                    zIndex: 2,
                  }}
                >
                  <img src={ASSETS.pinkMask} alt="" style={maskImg(ASSETS.pinkMask)} />
                </div>
                <div
                  style={{
                    width: tablet ? 303 : 393,
                    height: tablet ? 303 : 480,
                    borderRadius: 20,
                    overflow: 'hidden',
                    zIndex: 3,
                    position: 'relative',
                  }}
                >
                  {cms.missionImage && <img src={cms.missionImage} alt="Our Mission Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Strength */}
        <section style={{ marginTop: 70, marginBottom: mobile ? 20 : 70, padding: lg ? '0 16px' : 0 }}>
          <div style={{ fontSize: sectionLabelSize, lineHeight: sectionLabelLine, marginBottom: md ? 10 : 30, textAlign: 'center' }}>
            <AboutSectionLabel center>Our Strength</AboutSectionLabel>
          </div>
          <h2
            style={{
              fontWeight: 800,
              fontSize: headingSize,
              lineHeight: headingLine,
              color: C.primary,
              margin: '0 auto 20px',
              maxWidth: mobile ? 307 : 620,
              textAlign: 'center',
              textTransform: 'capitalize',
            }}
          >
            {cms.strengthTitle}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobile ? '1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 18,
              marginTop: mobile ? 24 : 40,
              justifyContent: 'center',
            }}
          >
            {cms.strengthItems.map((item, i) => (
              <div
                key={item.title}
                style={{
                  border: `1px solid rgba(212, 164, 55, 0.2)`,
                  background: C.cream,
                  display: 'flex',
                  alignItems: mobile ? 'center' : 'flex-start',
                  textAlign: mobile ? 'center' : 'left',
                  flexDirection: 'column',
                  borderRadius: 13.37,
                  padding: 20,
                  flex: 1,
                  boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  style={{
                    width: mobile ? 35 : 50,
                    height: mobile ? 36 : 50,
                    borderRadius: 8,
                    overflow: 'hidden',
                    backgroundColor: C.gold,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <img src={STRENGTH_ICONS[i]} alt="" style={{ width: mobile ? 20 : 'auto' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: mobile || tablet ? 14 : 16, lineHeight: mobile ? '14px' : '16px', color: C.primary, margin: '0 0 10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontWeight: 400, fontSize: 12, lineHeight: '22px', color: C.textMuted, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <ValueToPartnersSection />
      </div>
    </div>
  )
}
