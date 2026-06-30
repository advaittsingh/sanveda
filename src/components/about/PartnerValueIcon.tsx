import type { PartnerValueItem } from '../../constants/aboutContent'
import { C } from '../../constants/brand'

const stroke = C.primary

function IconPaths({ type }: { type: PartnerValueItem['icon'] }) {
  switch (type) {
    case 'handshake':
      return (
        <>
          <path d="M6 14c0-2 2-3.5 4-3.5M18 14c0-2-2-3.5-4-3.5M8 11V9a2 2 0 114 0v2M14 11V9a2 2 0 114 0v2M10 14l2 2 4-4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )
    case 'community':
      return (
        <>
          <circle cx="9" cy="8" r="2.5" stroke={stroke} strokeWidth="1.6" fill="none" />
          <circle cx="15" cy="8" r="2.5" stroke={stroke} strokeWidth="1.6" fill="none" />
          <circle cx="12" cy="6" r="2.5" stroke={stroke} strokeWidth="1.6" fill="none" />
          <path d="M5 18c0-2.5 3-4 7-4s7 1.5 7 4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      )
    case 'award':
      return (
        <>
          <circle cx="12" cy="9" r="4" stroke={stroke} strokeWidth="1.6" fill="none" />
          <path d="M9 13l-1.5 5 4.5-2.5L16.5 18 15 13" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
        </>
      )
    case 'chart':
      return (
        <>
          <path d="M5 17V11M10 17V8M15 17V13M20 17V6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 17h17" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </>
      )
    case 'growth':
      return (
        <>
          <path d="M12 17V10M12 10l-3 3M12 10l3 3" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M8 17c0-3 2-6 4-8 2 2 4 5 4 8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      )
    case 'compliance':
      return (
        <>
          <circle cx="12" cy="12" r="7" stroke={stroke} strokeWidth="1.6" fill="none" />
          <path d="M8.5 12l2.5 2.5 5-5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )
    case 'shield':
      return (
        <>
          <path d="M12 4l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-3z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
          <path d="M9.5 12l1.8 1.8L15 10" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )
    case 'oversight':
      return (
        <>
          <circle cx="11" cy="11" r="5.5" stroke={stroke} strokeWidth="1.6" fill="none" />
          <path d="M16 16l4 4" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )
    case 'communication':
      return (
        <>
          <circle cx="9" cy="10" r="2.5" stroke={stroke} strokeWidth="1.6" fill="none" />
          <circle cx="15" cy="10" r="2.5" stroke={stroke} strokeWidth="1.6" fill="none" />
          <path d="M6 17c0-2 2.5-3.5 6-3.5s6 1.5 6 3.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      )
    case 'transparency':
      return (
        <>
          <rect x="6" y="5" width="12" height="14" rx="2" stroke={stroke} strokeWidth="1.6" fill="none" />
          <path d="M9 10h6M9 13h6M9 16h4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )
  }
}

export default function PartnerValueIcon({ type, size = 44 }: { type: PartnerValueItem['icon']; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(212, 164, 55, 0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" aria-hidden>
        <IconPaths type={type} />
      </svg>
    </div>
  )
}
