import { useEffect, useState } from 'react'
import { fetchCMS, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'

export default function FloatingWhatsApp() {
  const [phone, setPhone] = useState('919216063278')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = cms.find((s) => s.id === 108) ?? getCMSSection(cms, 'Whatsapp first message')
      if (section?.title) {
        const digits = section.title.replace(/[^0-9]/g, '')
        if (digits) setPhone(digits)
      }
      if (section?.description) setMessage(section.description)
    }).catch(() => {})
  }, [])

  const openWhatsApp = () => {
    const url = message
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${phone}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={openWhatsApp}
      aria-label="Chat on WhatsApp"
      className="whatsapp-float"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 10,
        backgroundColor: '#25D366',
        borderRadius: 50,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
        zIndex: 1200,
      }}
    >
      <img src={ASSETS.whatsapp} alt="" width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
      <span className="whatsapp-label">
        <span style={{ color: '#fff', fontSize: 12, lineHeight: 1, display: 'block' }}>Chat with us on</span>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, lineHeight: 1, display: 'block' }}>WhatsApp</span>
      </span>
    </button>
  )
}
