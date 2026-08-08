import { useNavigate } from 'react-router-dom'
import { ASSETS } from '../constants/assets'
import type { FocusArea } from '../constants/focusAreas'
import SecondaryButton from './ui/SecondaryButton'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusAreaCard({ area, mobile }: Props) {
  const navigate = useNavigate()

  const goToArea = () => navigate(`/focus-areas/${area.slug}`)
  const onReadMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    goToArea()
  }

  return (
    <div
      onClick={goToArea}
      onKeyDown={(e) => e.key === 'Enter' && goToArea()}
      role="button"
      tabIndex={0}
      style={{
        width: mobile ? '100%' : '100%',
        maxWidth: mobile ? '100%' : 417,
        background: '#FFFFFF',
        boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
        borderRadius: mobile ? 12 : 16,
        overflow: 'visible',
        fontFamily: "'Red Hat Display', sans-serif",
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: mobile ? 12 : 16, paddingBottom: mobile ? 16 : 20 }}>
        <div
          style={{
            width: '100%',
            height: mobile ? 156 : 217,
            position: 'relative',
            borderRadius: mobile ? 12 : 16,
            overflow: 'hidden',
            marginBottom: mobile ? 14 : 18,
          }}
        >
          <img
            src={area.image || ASSETS.fallBackCard}
            alt={area.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>

        <h3
          style={{
            fontWeight: 700,
            fontSize: mobile ? 14 : 18,
            lineHeight: mobile ? '18px' : '26px',
            color: '#1D1D1B',
            margin: `0 0 ${mobile ? 8 : 10}px`,
            minHeight: mobile ? 36 : 52,
            maxHeight: mobile ? 36 : 52,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textTransform: 'capitalize',
          }}
        >
          {area.title}
        </h3>

        <p
          style={{
            fontWeight: 500,
            fontSize: mobile ? 12 : 14,
            lineHeight: mobile ? '18px' : '22px',
            color: '#686866',
            margin: `0 0 ${mobile ? 16 : 20}px`,
            minHeight: mobile ? 54 : 66,
            maxHeight: mobile ? 54 : 66,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {area.summary}
        </p>

        <div style={{ height: 1, background: '#E8E8E8', marginBottom: mobile ? 16 : 20 }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            height: mobile ? 32 : 44,
          }}
        >
          <SecondaryButton
            onClick={onReadMore}
            style={{
              borderRadius: 10,
              padding: mobile ? '8px 16px' : '15px 24px',
              width: mobile ? 115 : 160,
              height: mobile ? 36 : 44,
              fontSize: mobile ? 11 : 14,
              lineHeight: mobile ? '11px' : '14px',
              textTransform: 'none',
            }}
          >
            Read More
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}
