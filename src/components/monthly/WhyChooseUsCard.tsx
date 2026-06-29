import { C } from '../../constants/brand'

interface Props {
  icon: string
  title: string
  description: string
  variant?: 'mobile' | 'medium' | 'tablet' | 'desktop'
}

export default function WhyChooseUsCard({ icon, title, description, variant = 'desktop' }: Props) {
  const s = sizes[variant]

  return (
    <div
      style={{
        width: s.cardW,
        ...(s.cardH ? { height: s.cardH } : {}),
        borderRadius: s.cardRadius,
        padding: s.cardPad,
        background: 'rgba(242, 243, 244, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: s.gap,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: s.iconBox,
          height: s.iconBox,
          borderRadius: s.iconRadius,
          padding: s.iconPad,
          background: C.gold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={icon} alt="" style={{ width: s.iconSize, height: s.iconSize, objectFit: 'contain' }} />
      </div>
      <p style={{ fontWeight: 700, fontSize: s.titleSize, lineHeight: '100%', color: '#1D1D1B', margin: 0 }}>
        {title}
      </p>
      <p style={{ fontWeight: 400, fontSize: s.descSize, lineHeight: s.descLh, color: '#7D7D7D', margin: 0 }}>
        {description}
      </p>
    </div>
  )
}

const sizes = {
  mobile: {
    cardW: 280, cardH: 172, cardRadius: 16, cardPad: 20, gap: 8,
    iconBox: 32, iconRadius: 10, iconPad: 6, iconSize: 20,
    titleSize: 14, descSize: 13, descLh: '18px',
  },
  medium: {
    cardW: 320, cardH: undefined as number | undefined, cardRadius: 18, cardPad: 24, gap: 9,
    iconBox: 36, iconRadius: 12, iconPad: 7, iconSize: 22,
    titleSize: 14, descSize: 12, descLh: '20px',
  },
  tablet: {
    cardW: 380, cardH: 250, cardRadius: 20, cardPad: 28, gap: 9,
    iconBox: 38, iconRadius: 12.5, iconPad: 7.5, iconSize: 23,
    titleSize: 15, descSize: 15, descLh: '22px',
  },
  desktop: {
    cardW: 426, cardH: 233, cardRadius: 24, cardPad: 32, gap: 10,
    iconBox: 40, iconRadius: 13.33, iconPad: 8, iconSize: 24,
    titleSize: 16, descSize: 16, descLh: '24px',
  },
}
