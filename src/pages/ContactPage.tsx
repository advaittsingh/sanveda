import { useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { C } from '../constants/brand'
import { CONTACT_DETAILS, CONTACT_PAGE } from '../constants/contactContent'
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

export default function ContactPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const [formSent, setFormSent] = useState(false)
  const [newsletterSent, setNewsletterSent] = useState(false)

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSent(true)
  }

  const submitNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterSent(true)
  }

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
            {CONTACT_DETAILS.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  padding: mobile ? '20px 18px' : '24px 22px',
                  background: C.cream,
                  borderRadius: 16,
                  border: `1px solid rgba(14, 79, 168, 0.12)`,
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)',
                }}
              >
                <ContactInfoIcon type={item.icon} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.primary, marginBottom: 8 }}>{item.label}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: C.textMuted }}>{item.value}</div>
                </div>
              </div>
            ))}
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

      <section
        style={{
          width: '94.44%',
          maxWidth: 1440,
          margin: `${mobile ? 40 : 64}px auto 0`,
          padding: mobile ? '28px 20px' : '36px 40px',
          background: C.primary,
          borderRadius: mobile ? 20 : 28,
          display: 'flex',
          flexDirection: tablet ? 'column' : 'row',
          alignItems: tablet ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: mobile ? 20 : 32,
        }}
      >
        <div style={{ flex: tablet ? undefined : '1 1 40%' }}>
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: mobile ? 20 : 26,
              fontWeight: 800,
              color: C.white,
            }}
          >
            {CONTACT_PAGE.newsletterTitle}
          </h2>
          <p style={{ margin: 0, fontSize: mobile ? 14 : 15, color: C.goldLight, lineHeight: 1.5 }}>
            {CONTACT_PAGE.newsletterSubtitle}
          </p>
        </div>

        <form
          onSubmit={submitNewsletter}
          style={{
            flex: tablet ? undefined : '1 1 50%',
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            gap: 12,
            alignItems: mobile ? 'stretch' : 'center',
          }}
        >
          <input
            type="email"
            required
            placeholder={CONTACT_PAGE.newsletterPlaceholder}
            style={{
              ...inputStyle,
              flex: 1,
              border: 'none',
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '14px 28px',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'Red Hat Display, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Submit
          </button>
          {newsletterSent && (
            <p style={{ color: C.goldLight, fontSize: 13, margin: 0, fontWeight: 600, width: '100%' }}>
              Subscribed successfully!
            </p>
          )}
        </form>
      </section>
    </div>
  )
}
