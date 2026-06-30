import { Link, useNavigate } from 'react-router-dom'
import { ASSETS } from '../constants/assets'
import {
  ABOUT_ACTIONS,
  ABOUT_APPROACH,
  ABOUT_CLOSING,
  ABOUT_FOCUS_POINTS,
  ABOUT_FOUNDER,
  ABOUT_GOVERNANCE,
  ABOUT_HERO,
  ABOUT_MANIFESTO,
  ABOUT_MISSION,
  ABOUT_PARTNERSHIP_NOTE,
  ABOUT_PARTNER_VALUES,
  ABOUT_PHILOSOPHY,
  ABOUT_STATS,
  ABOUT_TESTIMONIALS,
  ABOUT_VISION,
} from '../constants/aboutContent'
import { SPONSORS } from '../constants/sponsors'
import { BRAND, C } from '../constants/brand'
import { creamSectionStyle, sectionShellStyle } from '../constants/sectionStyles'
import { useBreakpoints } from '../hooks/useMediaQuery'
import SectionDecorations from '../components/ui/SectionDecorations'
import SectionLabel from '../components/ui/SectionLabel'
import SectionTitle from '../components/ui/SectionTitle'
import ViewAllButton from '../components/ui/ViewAllButton'

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
      <div style={{ ...lineStyle, borderImageSource: 'linear-gradient(90deg, rgba(212,164,55,0.08) 0%, rgba(212,164,55,0.5) 100%)' }} />
      <h2 style={{ fontFamily: 'Red Hat Display, sans-serif', fontWeight: 800, fontSize: mobile ? 20 : 24, color: C.primary, margin: 0, whiteSpace: 'nowrap' }}>
        {title}
      </h2>
      <div style={{ ...lineStyle, borderImageSource: 'linear-gradient(90deg, rgba(212,164,55,0.5) 0%, rgba(212,164,55,0.08) 100%)' }} />
    </div>
  )
}

function BulletList({ items, mobile }: { items: string[]; mobile?: boolean }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: mobile ? 12 : 14 }}>
      {items.map((item) => (
        <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: mobile ? 14 : 16, lineHeight: 1.65, color: C.textMuted }}>
          <span style={{ color: C.gold, fontWeight: 800, flexShrink: 0, marginTop: 3 }}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function AboutSection({
  children,
  mobile,
  cream,
  decorations,
  wide,
}: {
  children: React.ReactNode
  mobile?: boolean
  cream?: boolean
  decorations?: boolean
  wide?: boolean
}) {
  return (
    <section
      style={{
        ...(cream ? creamSectionStyle(mobile ?? false) : sectionShellStyle(mobile ?? false)),
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {decorations && <SectionDecorations mobile={mobile} wide={wide} />}
      <div style={{ width: '100%', position: 'relative', zIndex: 2 }}>{children}</div>
    </section>
  )
}

export default function AboutPage() {
  const navigate = useNavigate()
  const { mobile, tablet, wide } = useBreakpoints()
  const twoCol = mobile ? '1fr' : 'repeat(2, 1fr)'
  const threeCol = mobile ? '1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'

  return (
    <div style={{ background: C.white, paddingTop: mobile ? 16 : 24 }}>
      {/* Hero */}
      <section
        style={{
          ...creamSectionStyle(mobile, { marginTop: 0, padding: mobile ? '32px 20px' : '56px 48px' }),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img src={ASSETS.orangeSparks} alt="" aria-hidden style={{ position: 'absolute', top: 24, left: mobile ? 16 : 48, width: 44, opacity: 0.9, display: mobile ? 'none' : 'block' }} />
        <img src={ASSETS.heart} alt="" aria-hidden style={{ position: 'absolute', top: 32, right: mobile ? 20 : 80, width: 22, display: mobile ? 'none' : 'block' }} />

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <SectionLabel mobile={mobile} center>{ABOUT_HERO.label}</SectionLabel>
          <div style={{ marginTop: 12, marginBottom: mobile ? 16 : 24 }}>
            <SectionTitle mobile={mobile} maxWidth={mobile ? '300px' : '760px'}>
              {ABOUT_HERO.title}
            </SectionTitle>
          </div>
          <p style={{ margin: '0 auto', maxWidth: 820, fontSize: mobile ? 14 : 17, lineHeight: 1.7, color: C.textMuted }}>
            {ABOUT_HERO.intro}
          </p>
          <div style={{ marginTop: mobile ? 24 : 32 }}>
            <ViewAllButton text="Contact Us" mobile={mobile} onClick={() => navigate('/contact')} />
          </div>
        </div>
      </section>

      {/* Founder */}
      <AboutSection mobile={mobile} cream>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'auto 1fr', gap: mobile ? 20 : 36, alignItems: 'center' }}>
          <div
            style={{
              width: mobile ? 100 : 140,
              height: mobile ? 100 : 140,
              margin: mobile ? '0 auto' : undefined,
              borderRadius: '50%',
              background: BRAND.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(4,27,77,0.18)',
            }}
          >
            <img src={ASSETS.logo} alt="" style={{ width: '68%', height: '68%', objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: mobile ? 'center' : 'left' }}>
            <SectionLabel mobile={mobile} center={mobile}>{ABOUT_FOUNDER.name}</SectionLabel>
            <h2 style={{ fontWeight: 800, fontSize: mobile ? 24 : 32, color: C.primary, margin: '10px 0 6px', lineHeight: 1.2 }}>
              {ABOUT_FOUNDER.role}
            </h2>
            <p style={{ margin: 0, fontSize: mobile ? 14 : 16, lineHeight: 1.65, color: C.textMuted, maxWidth: 640 }}>
              Leading Sanveda’s mission to build ethical, structured, and lasting humanitarian impact across communities.
            </p>
          </div>
        </div>
      </AboutSection>

      {/* Vision & Mission — Our Impact style split */}
      <section style={{ width: mobile ? 'calc(100% - 32px)' : '94.44%', maxWidth: 1440, margin: '0 auto 40px' }}>
        <div style={{ borderRadius: mobile ? 20 : 34, backgroundColor: C.primary, overflow: 'hidden', display: 'flex', flexDirection: mobile ? 'column' : 'row' }}>
          <div style={{ width: mobile ? '100%' : '50%', padding: mobile ? '36px 24px' : '56px 48px' }}>
            <p style={{ color: C.gold, fontWeight: 700, fontSize: mobile ? 12 : 18, margin: '0 0 10px', fontFamily: 'Nunito, sans-serif' }}>Vision</p>
            <h2 style={{ color: C.white, fontWeight: 800, fontSize: mobile ? 22 : 32, lineHeight: 1.25, margin: '0 0 20px' }}>Our Guiding Vision</h2>
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: mobile ? 14 : 16, lineHeight: 1.7, margin: 0 }}>{ABOUT_VISION}</p>
          </div>
          <div style={{ width: mobile ? '100%' : '50%', background: C.cream, padding: mobile ? '36px 24px' : '56px 48px', borderLeft: mobile ? 'none' : `4px solid ${C.gold}` }}>
            <p style={{ color: C.gold, fontWeight: 700, fontSize: mobile ? 12 : 18, margin: '0 0 10px', fontFamily: 'Nunito, sans-serif' }}>Mission</p>
            <h2 style={{ color: C.primary, fontWeight: 800, fontSize: mobile ? 22 : 32, lineHeight: 1.25, margin: '0 0 20px' }}>What We Stand For</h2>
            <BulletList items={ABOUT_MISSION} mobile={mobile} />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <AboutSection mobile={mobile} decorations wide={wide}>
        <div style={{ textAlign: 'center', marginBottom: mobile ? 28 : 40 }}>
          <SectionLabel mobile={mobile} center>Core Humanitarian Philosophy</SectionLabel>
          <div style={{ marginTop: 12, marginBottom: mobile ? 24 : 36 }}>
            <SectionTitle mobile={mobile} maxWidth={mobile ? '300px' : '860px'}>{ABOUT_PHILOSOPHY}</SectionTitle>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: mobile ? 16 : 24 }}>
          <div style={{ background: C.cream, borderRadius: mobile ? 16 : 24, padding: mobile ? '24px 20px' : '32px 28px', border: '1px solid rgba(212,164,55,0.2)' }}>
            <h3 style={{ fontWeight: 800, fontSize: mobile ? 18 : 22, color: C.primary, margin: '0 0 16px' }}>Sanveda Focuses On</h3>
            <BulletList items={ABOUT_FOCUS_POINTS} mobile={mobile} />
          </div>
          <div style={{ background: C.cream, borderRadius: mobile ? 16 : 24, padding: mobile ? '24px 20px' : '32px 28px', border: '1px solid rgba(212,164,55,0.2)' }}>
            <h3 style={{ fontWeight: 800, fontSize: mobile ? 18 : 22, color: C.primary, margin: '0 0 16px' }}>Manifesto Statement</h3>
            <BulletList items={ABOUT_MANIFESTO} mobile={mobile} />
          </div>
        </div>
      </AboutSection>

      {/* Approach */}
      <AboutSection mobile={mobile} cream>
        <div style={{ textAlign: 'center', marginBottom: mobile ? 24 : 36 }}>
          <SectionLabel mobile={mobile} center>Our Approach Is Based On</SectionLabel>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: mobile ? 14 : 20 }}>
          {ABOUT_APPROACH.map((item) => (
            <div key={item.emphasis} style={{ background: C.white, borderRadius: 16, padding: mobile ? '20px 18px' : '24px 22px', boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)' }}>
              <p style={{ margin: 0, fontSize: mobile ? 15 : 17, lineHeight: 1.55 }}>
                <strong style={{ color: C.primary, fontWeight: 800 }}>{item.emphasis}</strong>
                <span style={{ color: C.textMuted }}> over {item.contrast}</span>
              </p>
            </div>
          ))}
        </div>
      </AboutSection>

      {/* Impact in Action */}
      <AboutSection mobile={mobile} decorations wide={wide}>
        <div style={{ textAlign: 'center', marginBottom: mobile ? 28 : 40 }}>
          <SectionLabel mobile={mobile} center>Impact In Action</SectionLabel>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: mobile ? 12 : 16, marginBottom: mobile ? 28 : 40, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(4,27,77,0.08)', display: mobile ? 'none' : 'block' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(4,27,77,0.08)', display: mobile ? 'none' : 'block' }} />
          {ABOUT_STATS.map((stat, i) => (
            <div key={stat.label} style={{ background: i % 2 === 0 ? C.cream : C.white, borderRadius: 18, padding: mobile ? '24px 18px' : '32px 24px', textAlign: 'center', border: `1px solid ${C.border}`, position: 'relative', zIndex: 1 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: mobile ? 36 : 48, color: i % 2 === 0 ? C.gold : C.secondary, lineHeight: 1 }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: mobile ? 13 : 15, fontWeight: 600, lineHeight: 1.5, color: C.primary }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: threeCol, gap: mobile ? 16 : 24 }}>
          {ABOUT_ACTIONS.map((action) => (
            <div key={action.title} style={{ background: C.white, borderRadius: 16, padding: mobile ? '24px 20px' : '28px 24px', boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', height: '100%', border: `1px solid ${C.border}` }}>
              <h3 style={{ fontWeight: 800, fontSize: mobile ? 17 : 20, color: C.primary, margin: '0 0 12px', lineHeight: 1.3 }}>{action.title}</h3>
              <p style={{ margin: '0 0 24px', flex: 1, fontSize: 14, lineHeight: 1.65, color: C.textMuted }}>{action.description}</p>
              <ViewAllButton text={action.cta} mobile={mobile} onClick={() => navigate(action.path)} />
            </div>
          ))}
        </div>
      </AboutSection>

      {/* Value to Partners */}
      <AboutSection mobile={mobile} cream>
        <div style={{ textAlign: 'center', marginBottom: mobile ? 28 : 40 }}>
          <SectionLabel mobile={mobile} center>Value To Partners</SectionLabel>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: mobile ? 14 : 18 }}>
          {ABOUT_PARTNER_VALUES.map((value) => (
            <div key={value} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: C.white, borderRadius: 12, padding: mobile ? '14px 16px' : '16px 18px' }}>
              <img src={ASSETS.tick} alt="" width={20} height={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: mobile ? 14 : 15, lineHeight: 1.55, color: C.textMuted }}>{value}</span>
            </div>
          ))}
        </div>
      </AboutSection>

      {/* Governance */}
      <section style={{ width: mobile ? 'calc(100% - 32px)' : '94.44%', maxWidth: 1440, margin: '0 auto 40px' }}>
        <div style={{ borderRadius: mobile ? 20 : 34, background: BRAND.gradient, padding: mobile ? '32px 24px' : '48px 40px', textAlign: 'center' }}>
          <SectionLabel mobile={mobile} center>
            <span style={{ color: C.goldLight }}>Governance</span>
          </SectionLabel>
          <p style={{ margin: '20px auto 12px', maxWidth: 780, fontSize: mobile ? 15 : 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>
            {ABOUT_PARTNERSHIP_NOTE}
          </p>
          <p style={{ margin: 0, maxWidth: 780, fontSize: mobile ? 14 : 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.88)' }}>
            {ABOUT_GOVERNANCE}
          </p>
        </div>
      </section>

      {/* Testimonials — matches homepage */}
      <AboutSection mobile={mobile} decorations wide={wide}>
        <h2 style={{ fontFamily: 'Red Hat Display', fontWeight: 800, fontSize: mobile ? 20 : 36, textAlign: 'center', color: C.primary, marginBottom: mobile ? 24 : 48, maxWidth: 738, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.3, textTransform: 'capitalize' }}>
          Stories From Our Community
        </h2>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: mobile ? 16 : 24, overflowX: 'auto', width: '100%', padding: '4px 4px 8px', scrollSnapType: 'x mandatory' }}>
          {ABOUT_TESTIMONIALS.map((item) => (
            <div key={item.name} style={{ flexShrink: 0, width: mobile ? 280 : 360, scrollSnapAlign: 'start', background: C.white, borderRadius: 16, padding: 24, border: '1px solid #f1f1f1', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <img src={ASSETS.quote} alt="" width={32} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: mobile ? 13 : 14, color: C.textMuted, lineHeight: 1.65, marginBottom: 20 }}>{item.quote}</p>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: C.primary }}>{item.name}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: C.secondary, fontWeight: 600 }}>{item.role}</p>
            </div>
          ))}
        </div>
      </AboutSection>

      {/* Our Sponsor */}
      <AboutSection mobile={mobile} cream>
        <SectionDivider title="Our Sponsor" mobile={mobile} />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: mobile ? 24 : 40 }}>
          {SPONSORS.map((sponsor) => (
            <div key={sponsor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: mobile ? 120 : 160 }}>
              {sponsor.logo ? (
                <img src={sponsor.logo} alt={sponsor.name} style={{ maxHeight: mobile ? 56 : 70, maxWidth: mobile ? 140 : 180, objectFit: 'contain' }} />
              ) : (
                <span style={{ fontWeight: 700, fontSize: 14, color: C.primary, textAlign: 'center' }}>{sponsor.name}</span>
              )}
            </div>
          ))}
        </div>
      </AboutSection>

      {/* Closing */}
      <section style={{ width: mobile ? 'calc(100% - 32px)' : '94.44%', maxWidth: 1440, margin: '0 auto 48px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 28px', fontSize: mobile ? 15 : 18, lineHeight: 1.7, color: C.textMuted, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
          {ABOUT_CLOSING}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
          <ViewAllButton text="Explore Campaigns" mobile={mobile} onClick={() => navigate('/campaigns')} />
          <Link to="/contact" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
