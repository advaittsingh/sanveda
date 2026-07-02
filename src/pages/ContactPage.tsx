import { useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { C } from '../constants/brand'
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_MAP_QUERY,
  CONTACT_PAGE,
  CONTACT_PHONE,
} from '../constants/contactContent'
import { useMediaQuery } from '../hooks/useMediaQuery'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  fontFamily: 'Red Hat Display, sans-serif',
  fontSize: 14,
  color: C.text,
  background: C.white,
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: C.primary,
  marginBottom: 8,
}

function ContactInfoIcon({ type }: { type: 'location' | 'phone' | 'email' }) {
  const iconProps = { size: 22, color: C.white, strokeWidth: 2 }
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: C.secondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {type === 'location' && <MapPin {...iconProps} />}
      {type === 'phone' && <Phone {...iconProps} />}
      {type === 'email' && <Mail {...iconProps} />}
    </div>
  )
}

function ContactInfoCard({
  label,
  value,
  icon,
  compact,
}: {
  label: string
  value: string
  icon: 'location' | 'phone' | 'email'
  compact?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: compact ? 12 : 16,
        alignItems: 'flex-start',
        padding: compact ? '18px 16px' : '24px 22px',
        background: C.cream,
        borderRadius: 16,
        border: `1px solid rgba(14, 79, 168, 0.12)`,
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <ContactInfoIcon type={icon} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: compact ? 14 : 15, color: C.primary, marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: compact ? 13 : 14, lineHeight: 1.6, color: C.textMuted, wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const [formSent, setFormSent] = useState(false)

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSent(true)
  }

  const mapSrc = `https://maps.google.com/maps?q=${CONTACT_MAP_QUERY}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: CONTACT_PAGE.breadcrumb, path: null }]} />

      <section
        style={{
          width: '94.44%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: mobile ? '8px 0 32px' : '16px 0 48px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: '0 0 12px',
            fontSize: mobile ? 14 : 18,
            fontWeight: 600,
            color: C.gold,
            fontFamily: 'Nunito, sans-serif',
            textTransform: 'capitalize',
          }}
        >
          {CONTACT_PAGE.label}
        </p>
        <h1
          style={{
            margin: `0 0 ${mobile ? 12 : 16}px`,
            fontSize: mobile ? 22 : tablet ? 28 : 42,
            fontWeight: 800,
            lineHeight: 1.2,
            color: C.primary,
            maxWidth: 720,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {CONTACT_PAGE.title}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: mobile ? 13 : 15,
            lineHeight: 1.65,
            color: C.textMuted,
            maxWidth: 640,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {CONTACT_PAGE.subtitle}
        </p>
      </section>

      <section
        style={{
          width: '94.44%',
          maxWidth: 1440,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: tablet ? '1fr' : 'minmax(280px, 1fr) minmax(360px, 1.35fr)',
          gap: mobile ? 28 : 40,
          alignItems: 'start',
        }}
      >
        <div>
          <h2
            style={{
              margin: `0 0 ${mobile ? 20 : 28}px`,
              fontSize: mobile ? 20 : 24,
              fontWeight: 800,
              color: C.primary,
            }}
          >
            {CONTACT_PAGE.getInTouch}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 16 : 20 }}>
            <ContactInfoCard
              label={CONTACT_LOCATION.label}
              value={CONTACT_LOCATION.value}
              icon={CONTACT_LOCATION.icon}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: mobile ? 12 : 20,
              }}
            >
              <ContactInfoCard
                label={CONTACT_PHONE.label}
                value={CONTACT_PHONE.value}
                icon={CONTACT_PHONE.icon}
                compact
              />
              <ContactInfoCard
                label={CONTACT_EMAIL.label}
                value={CONTACT_EMAIL.value}
                icon={CONTACT_EMAIL.icon}
                compact
              />
            </div>

            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid rgba(14, 79, 168, 0.12)`,
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)',
                background: C.cream,
              }}
            >
              <iframe
                title="Sanveda office location"
                src={mapSrc}
                width="100%"
                height={mobile ? 220 : 280}
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        <div
          style={{
            background: C.white,
            borderRadius: 20,
            padding: mobile ? '24px 20px' : '32px 28px',
            border: `1px solid ${C.border}`,
            boxShadow: '0px 12px 32px rgba(4, 27, 77, 0.06)',
          }}
        >
          <h2
            style={{
              margin: `0 0 ${mobile ? 20 : 24}px`,
              fontSize: mobile ? 20 : 24,
              fontWeight: 800,
              color: C.primary,
            }}
          >
            {CONTACT_PAGE.formTitle}
          </h2>

          <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="contact-name">
                Full Name*
              </label>
              <input id="contact-name" name="name" required placeholder="Enter your full name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="contact-phone">
                Contact number*
              </label>
              <input id="contact-phone" name="phone" type="tel" required placeholder="Enter your contact number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="contact-email">
                Email ID*
              </label>
              <input id="contact-email" name="email" type="email" required placeholder="Enter your email address" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="contact-subject">
                Subject*
              </label>
              <input id="contact-subject" name="subject" required placeholder="Enter subject" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="contact-message">
                Message*
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                placeholder="Write your message here"
                style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{
                marginTop: 4,
                padding: '14px 24px',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                fontFamily: 'Red Hat Display, sans-serif',
              }}
            >
              Submit
            </button>
            {formSent && (
              <p style={{ color: C.secondary, fontSize: 14, margin: 0, fontWeight: 600 }}>
                Thank you! We will get back to you soon.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  )
}
