import { Link } from 'react-router-dom'
import { BRAND, C } from '../constants/brand'
import {
  ABOUT_ACTIONS,
  ABOUT_APPROACH,
  ABOUT_FOCUS_POINTS,
  ABOUT_FOUNDER,
  ABOUT_GOVERNANCE,
  ABOUT_IMPACT_AREAS,
  ABOUT_INTRO,
  ABOUT_MANIFESTO,
  ABOUT_MISSION,
  ABOUT_PARTNER_VALUES,
  ABOUT_PHILOSOPHY,
  ABOUT_TESTIMONIALS,
  ABOUT_VISION,
} from '../constants/aboutContent'
import { creamSectionStyle } from '../constants/sectionStyles'
import { useBreakpoints } from '../hooks/useMediaQuery'
import PageHero from '../components/ui/PageHero'
import PageShell from '../components/ui/PageShell'
import SectionLabel from '../components/ui/SectionLabel'
import SectionTitle from '../components/ui/SectionTitle'
import { ASSETS } from '../constants/assets'

function BulletList({ items, mobile }: { items: string[]; mobile?: boolean }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: mobile ? 10 : 12 }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            fontSize: mobile ? 14 : 15,
            lineHeight: 1.6,
            color: C.textMuted,
          }}
        >
          <span style={{ color: C.gold, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ContentCard({
  children,
  mobile,
  style,
}: {
  children: React.ReactNode
  mobile?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        ...creamSectionStyle(mobile ?? false, {
          width: '100%',
          margin: 0,
          padding: mobile ? '24px 20px' : '32px 28px',
        }),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default function AboutPage() {
  const { mobile, tablet } = useBreakpoints()
  const twoCol = mobile ? '1fr' : 'repeat(2, 1fr)'
  const threeCol = mobile ? '1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'

  return (
    <>
      <div style={{ padding: '24px 0 0' }}>
        <PageHero
          label="About"
          title="Empowering Sustainable Humanitarian Change"
          description={ABOUT_INTRO}
        />
      </div>

      <PageShell bg={C.grayBg}>
        {/* Founder */}
        <ContentCard mobile={mobile} style={{ marginBottom: mobile ? 20 : 32 }}>
          <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 20 : 32, alignItems: 'center' }}>
            <div
              style={{
                width: mobile ? 88 : 112,
                height: mobile ? 88 : 112,
                borderRadius: '50%',
                background: BRAND.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              <img src={ASSETS.logo} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: mobile ? 'center' : 'left' }}>
              <SectionLabel mobile={mobile} center={mobile}>
                Leadership
              </SectionLabel>
              <h2 style={{ fontWeight: 800, fontSize: mobile ? 22 : 28, color: C.primary, margin: '8px 0 4px' }}>
                {ABOUT_FOUNDER.name}
              </h2>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.secondary }}>{ABOUT_FOUNDER.role}</p>
            </div>
            <div style={{ flex: 1, marginLeft: mobile ? 0 : 'auto' }}>
              <Link
                to="/contact"
                className="btn-secondary"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  width: mobile ? '100%' : 'auto',
                  textAlign: 'center',
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </ContentCard>

        {/* Vision & Mission */}
        <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: mobile ? 16 : 24, marginBottom: mobile ? 20 : 32 }}>
          <div
            style={{
              borderRadius: mobile ? 16 : 24,
              background: BRAND.gradient,
              padding: mobile ? '28px 22px' : '36px 32px',
              color: C.white,
            }}
          >
            <p style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 18, color: C.goldLight, margin: '0 0 8px' }}>Vision</p>
            <p style={{ margin: 0, fontSize: mobile ? 15 : 17, lineHeight: 1.65, opacity: 0.95 }}>{ABOUT_VISION}</p>
          </div>
          <ContentCard mobile={mobile}>
            <p style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 18, color: C.gold, margin: '0 0 12px' }}>Mission</p>
            <BulletList items={ABOUT_MISSION} mobile={mobile} />
          </ContentCard>
        </div>

        {/* Philosophy */}
        <div style={{ textAlign: 'center', marginBottom: mobile ? 20 : 32 }}>
          <SectionLabel mobile={mobile} center>
            Core Humanitarian Philosophy
          </SectionLabel>
          <div style={{ marginTop: 12, marginBottom: mobile ? 20 : 28 }}>
            <SectionTitle mobile={mobile} maxWidth={mobile ? '300px' : '820px'}>
              {ABOUT_PHILOSOPHY}
            </SectionTitle>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: mobile ? 16 : 24, textAlign: 'left' }}>
            <ContentCard mobile={mobile}>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: C.primary, margin: '0 0 14px' }}>Sanveda Focuses On</h3>
              <BulletList items={ABOUT_FOCUS_POINTS} mobile={mobile} />
            </ContentCard>
            <ContentCard mobile={mobile}>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: C.primary, margin: '0 0 14px' }}>Manifesto</h3>
              <BulletList items={ABOUT_MANIFESTO} mobile={mobile} />
            </ContentCard>
          </div>
        </div>

        {/* Approach */}
        <ContentCard mobile={mobile} style={{ marginBottom: mobile ? 20 : 32 }}>
          <div style={{ textAlign: 'center', marginBottom: mobile ? 20 : 28 }}>
            <SectionLabel mobile={mobile} center>
              Our Approach
            </SectionLabel>
            <div style={{ marginTop: 12 }}>
              <SectionTitle mobile={mobile} maxWidth={mobile ? '280px' : '560px'}>
                Built For Lasting Impact
              </SectionTitle>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: mobile ? 12 : 16 }}>
            {ABOUT_APPROACH.map((item) => (
              <div
                key={item.emphasis}
                style={{
                  background: C.white,
                  borderRadius: 12,
                  padding: mobile ? '16px' : '20px',
                  border: `1px solid ${C.border}`,
                }}
              >
                <p style={{ margin: 0, fontSize: mobile ? 14 : 15, lineHeight: 1.55, color: C.text }}>
                  <strong style={{ color: C.primary }}>{item.emphasis}</strong>
                  {' over '}
                  <span style={{ color: C.textMuted }}>{item.contrast}</span>
                </p>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Impact areas */}
        <div style={{ marginBottom: mobile ? 20 : 32 }}>
          <div style={{ textAlign: 'center', marginBottom: mobile ? 20 : 28 }}>
            <SectionLabel mobile={mobile} center>
              Impact In Action
            </SectionLabel>
            <div style={{ marginTop: 12 }}>
              <SectionTitle mobile={mobile}>Growing Community Impact</SectionTitle>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: mobile ? 12 : 16 }}>
            {ABOUT_IMPACT_AREAS.map((area) => (
              <div
                key={area.label}
                style={{
                  background: C.primary,
                  borderRadius: mobile ? 14 : 18,
                  padding: mobile ? '22px 18px' : '28px 24px',
                  textAlign: 'center',
                }}
              >
                <p style={{ margin: 0, fontSize: mobile ? 13 : 15, fontWeight: 600, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)' }}>
                  {area.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: threeCol, gap: mobile ? 16 : 24, marginBottom: mobile ? 20 : 32 }}>
          {ABOUT_ACTIONS.map((action) => (
            <ContentCard key={action.title} mobile={mobile} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontWeight: 800, fontSize: mobile ? 17 : 20, color: C.primary, margin: '0 0 10px', lineHeight: 1.3 }}>
                {action.title}
              </h3>
              <p style={{ margin: '0 0 20px', flex: 1, fontSize: 14, lineHeight: 1.6, color: C.textMuted }}>
                {action.description}
              </p>
              <Link
                to={action.path}
                className={action.cta === 'Donate Now' ? 'btn-primary' : 'btn-secondary'}
                style={{
                  display: 'inline-block',
                  padding: '12px 20px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                {action.cta}
              </Link>
            </ContentCard>
          ))}
        </div>

        {/* Partner values */}
        <ContentCard mobile={mobile} style={{ marginBottom: mobile ? 20 : 32 }}>
          <div style={{ textAlign: 'center', marginBottom: mobile ? 20 : 28 }}>
            <SectionLabel mobile={mobile} center>
              Value To Partners
            </SectionLabel>
            <div style={{ marginTop: 12 }}>
              <SectionTitle mobile={mobile} maxWidth={mobile ? '280px' : '640px'}>
                Ethical Collaboration & Transparent Impact
              </SectionTitle>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: mobile ? 10 : 12 }}>
            {ABOUT_PARTNER_VALUES.map((value) => (
              <div key={value} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <img src={ASSETS.tick} alt="" width={18} height={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: mobile ? 14 : 15, lineHeight: 1.5, color: C.textMuted }}>{value}</span>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Governance */}
        <div
          style={{
            borderRadius: mobile ? 16 : 24,
            background: C.primary,
            padding: mobile ? '28px 22px' : '40px 36px',
            textAlign: 'center',
            marginBottom: mobile ? 20 : 32,
          }}
        >
          <SectionLabel mobile={mobile} center>
            <span style={{ color: C.goldLight }}>Governance</span>
          </SectionLabel>
          <p style={{ margin: '16px auto 0', maxWidth: 760, fontSize: mobile ? 15 : 17, lineHeight: 1.65, color: 'rgba(255,255,255,0.9)' }}>
            {ABOUT_GOVERNANCE}
          </p>
        </div>

        {/* Testimonials */}
        <div style={{ marginBottom: mobile ? 28 : 40 }}>
          <div style={{ textAlign: 'center', marginBottom: mobile ? 20 : 28 }}>
            <SectionLabel mobile={mobile} center>
              Voices Of Impact
            </SectionLabel>
            <div style={{ marginTop: 12 }}>
              <SectionTitle mobile={mobile}>What People Say About Sanveda</SectionTitle>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: threeCol, gap: mobile ? 16 : 24 }}>
            {ABOUT_TESTIMONIALS.map((item) => (
              <div
                key={item.name}
                style={{
                  background: C.white,
                  borderRadius: mobile ? 14 : 18,
                  padding: mobile ? '22px 18px' : '28px 24px',
                  border: `1px solid ${C.border}`,
                  boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
                }}
              >
                <img src={ASSETS.quote} alt="" width={28} height={28} style={{ marginBottom: 14, opacity: 0.7 }} />
                <p style={{ margin: '0 0 18px', fontSize: mobile ? 14 : 15, lineHeight: 1.65, color: C.textMuted, fontStyle: 'italic' }}>
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: C.primary }}>{item.name}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: C.secondary, fontWeight: 600 }}>{item.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 20px', fontSize: mobile ? 15 : 17, lineHeight: 1.6, color: C.textMuted, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            {BRAND.name} is dedicated to creating meaningful and sustainable humanitarian impact across communities.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link to="/campaigns" className="btn-primary" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
              Explore Campaigns
            </Link>
            <Link to="/contact" className="btn-secondary" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>
              Get In Touch
            </Link>
          </div>
        </div>
      </PageShell>
    </>
  )
}
