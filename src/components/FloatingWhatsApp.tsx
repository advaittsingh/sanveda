import { ASSETS } from '../constants/assets'
import { BRAND, toWhatsAppNumber } from '../constants/brand'

const WHATSAPP_MESSAGE =
  'Hello Sanveda, I would like to know more about your humanitarian initiatives and how I can support.'

export default function FloatingWhatsApp() {
  const phone = toWhatsAppNumber(BRAND.phone)

  const openWhatsApp = () => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
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
