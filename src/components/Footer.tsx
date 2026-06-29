import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCMS } from '../api'
import { ASSETS } from '../constants/assets'
import { BRAND, C } from '../constants/brand'
import { useMediaQuery } from '../hooks/useMediaQuery'

const quickLinks = [
  { name: 'Explore Campaigns', path: '/campaigns' },
  { name: 'Monthly Donation', path: '/monthly-donation' },
  { name: 'Start New Campaign', path: '/start-campaign' },
  { name: 'Blogs', path: '/blogs' },
  { name: 'Contact Us', path: '/contact' },
]

const infoLinks = [
  { name: 'About Us', path: '/about' },
  { name: 'Privacy Policy', path: '/privacy-policy' },
  { name: 'Terms & Conditions', path: '/terms-conditions' },
  { name: 'Refund and Cancellation Policy', path: '/refund-cancellation' },
  { name: 'Return Policy', path: '/return-policy' },
  { name: "FAQ's", path: '/faq-page' },
  { name: 'Documents', path: '/documents' },
]

const payments = [
  { name: 'MasterCard', src: ASSETS.mastercard },
  { name: 'Visa', src: ASSETS.visa },
  { name: 'UPI', src: ASSETS.upi },
  { name: 'American Express', src: ASSETS.americanExpress },
]

function SocialBtn({ src, alt, href }: { src: string; alt: string; href?: string }) {
  const Wrapper = href ? 'a' : 'button'
  return (
    <Wrapper
      {...(href
        ? { href, target: '_blank', rel: 'noopener noreferrer' }
        : { type: 'button' as const, disabled: true })}
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        background: C.white,
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: href ? 'pointer' : 'default',
        opacity: href ? 1 : 0.55,
        padding: 0,
        textDecoration: 'none',
      }}
    >
      <img
        src={src}
        alt={alt}
        width={24}
        height={24}
        style={{ filter: 'brightness(0) saturate(100%)', opacity: 0.75 }}
      />
    </Wrapper>
  )
}

export default function Footer() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const [social, setSocial] = useState<string[]>([])

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = cms.find((s) => s.id === 102)
      const links = (section?.relatedCMS ?? [])
        .filter((s) => s.status === 1 || s.status === true)
        .map((s) => s.link ?? '')
        .filter((l) => l.trim().length > 0)
      setSocial(links)
    }).catch(() => {})
  }, [])

  const linkStyle: React.CSSProperties = {
    color: C.textMuted,
    textDecoration: 'none',
    fontSize: mobile ? 14 : 16,
    fontFamily: 'Red Hat Display, sans-serif',
    display: 'block',
  }

  const headingStyle: React.CSSProperties = {
    color: C.primary,
    fontWeight: 700,
    marginBottom: mobile ? 16 : 24,
    fontSize: mobile ? 16 : 20,
    fontFamily: 'Red Hat Display, sans-serif',
    marginTop: 0,
  }

  const socialBtns = (
    <div style={{ display: 'flex', gap: tablet ? 12 : 16 }}>
      <SocialBtn src={ASSETS.footerFacebook} alt="Facebook" href={social[0]} />
      <SocialBtn src={ASSETS.footerLinkedin} alt="LinkedIn" href={social[1]} />
      <SocialBtn src={ASSETS.footerInstagram} alt="Instagram" href={social[2]} />
    </div>
  )

  const horizontalPad = mobile ? 16 : 50

  return (
    <footer
      style={{
        background: C.white,
        color: C.text,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        paddingBottom: 24,
        borderTop: `1px solid ${C.border}`,
        marginTop: 40,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          margin: 0,
          paddingTop: mobile ? 40 : 60,
          paddingLeft: horizontalPad,
          paddingRight: horizontalPad,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: tablet ? '1fr' : 'repeat(12, 1fr)',
            gap: tablet ? 28 : 32,
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <div style={{ gridColumn: tablet ? '1' : 'span 4' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: tablet ? 16 : 24 }}>
              <img src={ASSETS.logo} alt={BRAND.name} style={{ height: mobile ? 56 : 72, objectFit: 'contain' }} />
            </Link>
            <p style={{ color: C.textMuted, lineHeight: 1.6, marginBottom: tablet ? 16 : 24, fontSize: mobile ? 13 : 14, maxWidth: tablet ? undefined : 420 }}>
              {BRAND.name} is dedicated to fostering global humanitarian impact. Our platform connects compassionate donors with verified causes making a real difference worldwide.
            </p>
            {!tablet && socialBtns}
          </div>

          <div style={{ gridColumn: tablet ? '1' : 'span 2' }}>
            <h4 style={headingStyle}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 10 : 16 }}>
              {quickLinks.map((l) => (
                <Link key={l.path} to={l.path} style={linkStyle}>{l.name}</Link>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: tablet ? '1' : 'span 2' }}>
            <h4 style={headingStyle}>Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 10 : 16 }}>
              {infoLinks.map((l) => (
                <Link key={l.path} to={l.path} style={linkStyle}>{l.name}</Link>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: tablet ? '1' : 'span 4' }}>
            <h4 style={headingStyle}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 10 : 16, marginBottom: tablet ? 24 : 32 }}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...linkStyle, lineHeight: 1.5 }}
              >
                {BRAND.address}
              </a>
              <a href={`mailto:${BRAND.email}`} style={linkStyle}>{BRAND.email}</a>
              <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} style={linkStyle}>{BRAND.phone}</a>
              {tablet && socialBtns}
            </div>

            <h4 style={headingStyle}>We Accept</h4>
            <div style={{ display: 'flex', gap: mobile ? 12 : 20, flexWrap: 'wrap' }}>
              {payments.map((p) => (
                <div key={p.name} style={{ width: 45, height: 25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={p.src} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          margin: '24px 0 0',
          paddingLeft: horizontalPad,
          paddingRight: horizontalPad,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 12 }} />
        <p
          style={{
            textAlign: 'center',
            color: C.textMuted,
            fontSize: mobile ? 12 : 14,
            letterSpacing: '0.5px',
            margin: 0,
            paddingBottom: 8,
            fontFamily: 'Red Hat Display, sans-serif',
            lineHeight: 1.6,
          }}
        >
          © {new Date().getFullYear()} {BRAND.shortName} Global Humanitarian Foundation. All Rights Reserved.{' '}
          Developed by{' '}
          <a
            href="https://curvvtech.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: C.secondary, textDecoration: 'none', fontWeight: 600 }}
          >
            Curvvtech
          </a>
        </p>
      </div>
    </footer>
  )
}
