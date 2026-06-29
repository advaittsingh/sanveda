import { useEffect, useState } from 'react'
import { fetchCMS, getCMSSection } from '../api'
import { BRAND, C } from '../constants/brand'
import PageHero from '../components/ui/PageHero'
import PageShell from '../components/ui/PageShell'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function ContactPage() {
  const [info, setInfo] = useState({ title: '', email: '', address: '', description: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'contact us')
      if (section) {
        setInfo({
          title: section.title ?? BRAND.phone,
          email: section.sub_title ?? BRAND.email,
          address: section.description ?? '',
          description: section.section_title ?? 'We would love to hear from you.',
        })
      }
    }).catch(() => {})
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <div style={{ padding: '24px 0 0' }}>
        <PageHero label="Contact Us" title="Get In Touch" description="Reach out to the Sanveda team for support, partnerships, or general inquiries." compact />
      </div>
      <PageShell>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginTop: 32 }}>
          <div style={{ background: C.cream, borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: C.primary, margin: '0 0 24px' }}>Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <Phone size={20} color={C.secondary} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, color: C.primary, fontSize: 14 }}>Phone</div>
                  <div style={{ color: C.textMuted }}>{info.title || BRAND.phone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <Mail size={20} color={C.secondary} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, color: C.primary, fontSize: 14 }}>Email</div>
                  <div style={{ color: C.textMuted }}>{info.email || BRAND.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <MapPin size={20} color={C.secondary} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, color: C.primary, fontSize: 14 }}>Address</div>
                  <div style={{ color: C.textMuted, lineHeight: 1.5 }}>{info.address}</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={submit} style={{ background: C.white, borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: C.primary, margin: '0 0 20px' }}>Send a Message</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input required placeholder="Your name" style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }} />
              <input required type="email" placeholder="Email address" style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display' }} />
              <textarea required rows={5} placeholder="Your message" style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: 'Red Hat Display', resize: 'vertical' }} />
              <button type="submit" className="btn-secondary" style={{ padding: '14px 24px', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Red Hat Display' }}>
                Submit
              </button>
              {sent && <p style={{ color: C.secondary, fontSize: 14, margin: 0 }}>Thank you! We will get back to you soon.</p>}
            </div>
          </form>
        </div>
      </PageShell>
    </>
  )
}
