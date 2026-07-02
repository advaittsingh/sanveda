import { CD } from './campaignDetailTheme'

interface Props {
  title: string
  image: string
  mobile?: boolean
  tablet?: boolean
  onDonate: () => void
}

export default function CampaignDetailHero({ title, image, mobile, tablet, onDonate }: Props) {
  return (
    <div style={{ width: '100%', marginBottom: mobile ? 8 : 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: mobile ? 20 : 32,
          flexDirection: mobile ? 'column' : 'row',
          gap: mobile ? 16 : 0,
        }}
      >
        <h1
          style={{
            flex: 1,
            margin: 0,
            marginRight: mobile ? 0 : 40,
            fontWeight: 700,
            fontSize: mobile ? 18 : tablet ? 32 : 46,
            lineHeight: mobile ? '30px' : '150%',
            letterSpacing: '-0.01em',
            textTransform: 'capitalize',
            color: CD.textDark,
            width: '100%',
          }}
        >
          {title}
        </h1>
        {!mobile && (
          <button
            type="button"
            onClick={onDonate}
            className="btn-donate"
            style={{ flexShrink: 0, width: 160, height: 44 }}
          >
            Donate Now
          </button>
        )}
      </div>

      <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
        <img
          src={image}
          alt={title}
          style={{
            width: '100%',
            maxWidth: '100%',
            aspectRatio: '2.7 / 1',
            borderRadius: 16,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

export function DonateNowButton({
  onClick,
  mobile,
  fullWidth,
  amount,
}: {
  onClick: () => void
  mobile?: boolean
  fullWidth?: boolean
  amount?: number
}) {
  const label = amount ? `Donate ₹${amount.toLocaleString('en-IN')}` : 'Donate Now'
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-donate"
      style={{
        width: fullWidth ? '100%' : mobile ? 115 : 160,
        height: mobile ? 36 : 44,
        fontSize: mobile ? 11 : 14,
        padding: mobile ? '8px 16px' : '15px 24px',
      }}
    >
      {label}
    </button>
  )
}
