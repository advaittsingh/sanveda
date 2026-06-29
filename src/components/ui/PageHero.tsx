import { BRAND, C } from '../../constants/brand'

interface Props {
  label?: string
  title: string
  subtitle?: string
  description?: string
  image?: string | null
  compact?: boolean
}

export default function PageHero({ label, title, subtitle, description, image, compact }: Props) {
  return (
    <section
      style={{
        width: '94.44%',
        maxWidth: 1440,
        margin: '0 auto',
        padding: compact ? '32px 16px' : '48px 24px',
        borderRadius: compact ? 20 : 34,
        background: image ? undefined : BRAND.gradient,
        backgroundImage: image ? `linear-gradient(135deg, rgba(4,27,77,0.85), rgba(14,79,168,0.75)), url(${image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: C.white,
        textAlign: image ? 'left' : 'center',
      }}
    >
      {label && (
        <p style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 18, color: C.goldLight, margin: '0 0 8px' }}>{label}</p>
      )}
      {subtitle && (
        <p style={{ fontSize: 14, fontWeight: 600, color: C.goldLight, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{subtitle}</p>
      )}
      <h1 style={{ fontWeight: 800, fontSize: compact ? 28 : 40, lineHeight: 1.2, margin: '0 0 16px', maxWidth: image ? 640 : 800, marginLeft: image ? 0 : 'auto', marginRight: image ? 0 : 'auto' }}>
        {title}
      </h1>
      {description && (
        <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.92, maxWidth: 720, margin: image ? 0 : '0 auto', color: 'rgba(255,255,255,0.9)' }}>
          {description}
        </p>
      )}
    </section>
  )
}
