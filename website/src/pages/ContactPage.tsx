import { useRef, useState } from 'react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import GetInTouchSection from '../components/contact/GetInTouchSection'
import { C } from '../constants/brand'
import { CONTACT_PAGE } from '../constants/contactContent'
import { submitEnquiry } from '../lib/enquiryService'
import { CONTACT_PHONE_ERROR, isValidContactPhone } from '../lib/phoneValidation'
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

const fieldErrorStyle: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: 13,
  fontWeight: 600,
  color: '#8B1E1E',
  lineHeight: 1.4,
}

const formBannerStyle: React.CSSProperties = {
  color: '#8B1E1E',
  background: '#FFF5F5',
  border: '1px solid #F5C2C2',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 14,
  margin: 0,
  fontWeight: 600,
}

export default function ContactPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const formRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const [formSent, setFormSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailNote, setEmailNote] = useState('')
  const [phone, setPhone] = useState('')

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    setPhoneError('')
    setEmailNote('')

    const form = e.currentTarget
    const data = new FormData(form)
    const phoneValue = String(data.get('phone') ?? phone).trim()

    if (!isValidContactPhone(phoneValue)) {
      setPhoneError(CONTACT_PHONE_ERROR)
      setFormError(CONTACT_PHONE_ERROR)
      phoneRef.current?.focus()
      setSubmitting(false)
      return
    }

    try {
      const result = await submitEnquiry({
        name: String(data.get('name') ?? ''),
        phone: phoneValue,
        email: String(data.get('email') ?? ''),
        subject: String(data.get('subject') ?? ''),
        message: String(data.get('message') ?? ''),
      })
      form.reset()
      setPhone('')
      setFormSent(true)
      if (result.notify && (!result.notify.userEmailSent || !result.notify.orgEmailSent)) {
        setEmailNote(
          'Your message was saved successfully. Email confirmation is temporarily unavailable, but our team can still see your enquiry in the admin panel.',
        )
      }
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (err) {
      setFormSent(false)
      const message =
        err instanceof Error ? err.message : 'Could not submit enquiry. Please try again.'
      setFormError(message)
      if (/phone/i.test(message)) {
        setPhoneError(message)
        phoneRef.current?.focus()
      }
    } finally {
      setSubmitting(false)
    }
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
            color: C.secondary,
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
          gridTemplateColumns: tablet ? '1fr' : 'minmax(300px, 1fr) minmax(360px, 1.35fr)',
          gap: mobile ? 28 : 40,
          alignItems: 'start',
        }}
      >
        <GetInTouchSection formRef={formRef} />

        <div
          ref={formRef}
          style={{
            background: C.white,
            borderRadius: 20,
            padding: mobile ? '24px 20px' : '32px 28px',
            border: `1px solid ${C.border}`,
            boxShadow: '0px 12px 32px rgba(4, 27, 77, 0.06)',
            boxSizing: 'border-box',
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

          {formSent ? (
            <div
              role="status"
              aria-live="polite"
              style={{
                borderRadius: 16,
                border: '1px solid #B7E4C7',
                background: '#F0FFF4',
                padding: mobile ? '20px 16px' : '28px 24px',
              }}
            >
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: mobile ? 18 : 22,
                  fontWeight: 800,
                  color: '#146C2E',
                }}
              >
                Message sent
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.6, color: C.text }}>
                Thank you. Your enquiry has been received and our team will get back to you within 2–3
                business days.
              </p>
              {emailNote && (
                <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.55, color: C.textMuted }}>
                  {emailNote}
                </p>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setFormSent(false)
                  setEmailNote('')
                  setFormError('')
                  setPhoneError('')
                }}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'Red Hat Display, sans-serif',
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {formError && (
                <p role="alert" style={formBannerStyle}>
                  {formError}
                </p>
              )}
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
                <input
                  ref={phoneRef}
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (phoneError) setPhoneError('')
                    if (formError) setFormError('')
                  }}
                  aria-invalid={phoneError ? true : undefined}
                  aria-describedby={phoneError ? 'contact-phone-error' : undefined}
                  placeholder="e.g. 9876543210"
                  style={{
                    ...inputStyle,
                    borderColor: phoneError ? '#C0392B' : C.border,
                  }}
                />
                {phoneError ? (
                  <p id="contact-phone-error" role="alert" style={fieldErrorStyle}>
                    {phoneError}
                  </p>
                ) : null}
              </div>
              <div>
                <label style={labelStyle} htmlFor="contact-email">
                  Email ID*
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  style={inputStyle}
                />
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
                disabled={submitting}
                style={{
                  marginTop: 4,
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: submitting ? 'wait' : 'pointer',
                  fontFamily: 'Red Hat Display, sans-serif',
                }}
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
