import { useEffect, useRef, useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { C } from '../../constants/brand'
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_PAGE,
  CONTACT_PHONE,
  getContactMapEmbedUrl,
} from '../../constants/contactContent'
import { useMediaQuery } from '../../hooks/useMediaQuery'

function ContactIcon({ type, size = 44 }: { type: 'location' | 'phone' | 'email'; size?: number }) {
  const iconSize = size <= 40 ? 18 : 20
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: C.secondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {type === 'location' && <MapPin size={iconSize} color={C.white} strokeWidth={2} />}
      {type === 'phone' && <Phone size={iconSize} color={C.white} strokeWidth={2} />}
      {type === 'email' && <Mail size={iconSize} color={C.white} strokeWidth={2} />}
    </div>
  )
}

function ContactRow({
  label,
  value,
  icon,
  href,
  nowrap,
}: {
  label: string
  value: string
  icon: 'location' | 'phone' | 'email'
  href?: string
  nowrap?: boolean
}) {
  const content = (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: C.primary, marginBottom: 6, letterSpacing: '0.01em' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          color: C.textMuted,
          whiteSpace: nowrap ? 'nowrap' : 'normal',
          overflow: nowrap ? 'hidden' : 'visible',
          textOverflow: nowrap ? 'ellipsis' : 'clip',
        }}
      >
        {value}
      </div>
    </div>
  )

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    padding: '16px 18px',
    background: C.white,
    borderRadius: 12,
    border: `1px solid rgba(14, 79, 168, 0.1)`,
    height: '100%',
    boxSizing: 'border-box',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  }

  if (href) {
    return (
      <a href={href} style={rowStyle} className="contact-info-link">
        <ContactIcon type={icon} size={40} />
        {content}
      </a>
    )
  }

  return (
    <div style={rowStyle}>
      <ContactIcon type={icon} size={40} />
      {content}
    </div>
  )
}

interface Props {
  formRef: React.RefObject<HTMLDivElement | null>
}

export default function GetInTouchSection({ formRef }: Props) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const panelRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const [mapHeight, setMapHeight] = useState(mobile ? 220 : 300)

  useEffect(() => {
    if (tablet) {
      setMapHeight(mobile ? 220 : 280)
      return
    }

    const update = () => {
      const form = formRef.current
      const info = infoRef.current
      const panel = panelRef.current
      if (!form || !info || !panel) return

      const formHeight = form.offsetHeight
      const titleEl = panel.querySelector('[data-touch-heading]') as HTMLElement | null
      const titleHeight = titleEl?.offsetHeight ?? 0
      const infoHeight = info.offsetHeight
      const gaps = 28 + 20 + 20
      const nextHeight = Math.max(240, formHeight - titleHeight - infoHeight - gaps)

      setMapHeight(nextHeight)
    }

    update()
    const ro = new ResizeObserver(update)
    if (formRef.current) ro.observe(formRef.current)
    if (infoRef.current) ro.observe(infoRef.current)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [formRef, tablet, mobile])

  const phoneHref = `tel:${CONTACT_PHONE.value.replace(/\s/g, '')}`
  const emailHref = `mailto:${CONTACT_EMAIL.value}`

  return (
    <div ref={panelRef} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2
        data-touch-heading
        style={{
          margin: `0 0 ${mobile ? 18 : 24}px`,
          fontSize: mobile ? 20 : 24,
          fontWeight: 800,
          color: C.primary,
          flexShrink: 0,
        }}
      >
        {CONTACT_PAGE.getInTouch}
      </h2>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: C.cream,
          borderRadius: 20,
          border: `1px solid rgba(14, 79, 168, 0.12)`,
          padding: mobile ? 16 : 20,
          boxShadow: '0px 10px 28px rgba(0, 0, 0, 0.04)',
          minHeight: 0,
        }}
      >
        <div ref={infoRef} style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              padding: '18px 18px',
              background: C.white,
              borderRadius: 12,
              border: `1px solid rgba(14, 79, 168, 0.1)`,
            }}
          >
            <ContactIcon type="location" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.primary, marginBottom: 8 }}>{CONTACT_LOCATION.label}</div>
              <div style={{ fontSize: 13, lineHeight: 1.65, color: C.textMuted }}>{CONTACT_LOCATION.value}</div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: mobile ? 'column' : 'row',
              gap: 12,
              alignItems: 'stretch',
            }}
          >
            <div style={{ flex: mobile ? undefined : '0 0 auto', width: mobile ? '100%' : 'auto', maxWidth: mobile ? '100%' : '38%' }}>
              <ContactRow label={CONTACT_PHONE.label} value={CONTACT_PHONE.value} icon="phone" href={phoneHref} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ContactRow label={CONTACT_EMAIL.label} value={CONTACT_EMAIL.value} icon="email" href={emailHref} nowrap />
            </div>
          </div>
        </div>

        <div
          style={{
            height: mapHeight,
            minHeight: mobile ? 220 : 240,
            borderRadius: 12,
            overflow: 'hidden',
            border: `1px solid rgba(14, 79, 168, 0.1)`,
            background: C.white,
          }}
        >
          <iframe
            title="Sanveda office location"
            src={getContactMapEmbedUrl()}
            style={{ border: 0, display: 'block', width: '100%', height: '100%' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>

      <style>{`
        .contact-info-link:hover {
          border-color: rgba(14, 79, 168, 0.28) !important;
          box-shadow: 0 6px 18px rgba(14, 79, 168, 0.08);
        }
      `}</style>
    </div>
  )
}
