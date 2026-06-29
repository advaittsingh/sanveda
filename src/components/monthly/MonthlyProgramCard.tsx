import { useNavigate } from 'react-router-dom'
import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'
import SecondaryButton from '../ui/SecondaryButton'

interface Props {
  id: number
  image: string
  taxBenefit?: boolean
  title: string
  peopleJoined: number
  variant?: 'mobile' | 'medium' | 'tablet' | 'desktop'
}

export default function MonthlyProgramCard({
  id,
  image,
  taxBenefit,
  title,
  peopleJoined,
  variant = 'desktop',
}: Props) {
  const navigate = useNavigate()
  const s = cardSizes[variant]

  return (
    <div
      style={{
        width: s.cardW,
        height: s.cardH,
        borderRadius: s.cardRadius,
        padding: s.cardPad,
        paddingBottom: 0,
        background: C.white,
        boxShadow: '0px 10px 26px 0px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={image || ASSETS.fallBackCard}
          alt={title}
          style={{
            width: s.imgW,
            height: s.imgH,
            borderRadius: s.imgRadius,
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {taxBenefit && (
          <div
            style={{
              position: 'absolute',
              top: s.badgeTop,
              right: s.badgeRight,
              width: s.badgeW,
              height: s.badgeH,
              borderRadius: 4,
              background: C.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: s.badgeFont, lineHeight: '16px', color: C.white }}>
              Tax Benefit
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: s.titleSize,
            lineHeight: s.titleLh,
            textTransform: 'capitalize',
            color: '#1D1D1B',
            margin: `${s.titleMt}px 0 ${s.titleMb}px`,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </p>
        <div style={{ flex: 1 }} />
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: variant === 'mobile' ? 7 : 9,
              marginBottom: variant === 'mobile' ? 16 : 20,
            }}
          >
            <img
              src={ASSETS.people}
              alt=""
              style={{ width: s.peopleIcon, height: s.peopleIcon, objectFit: 'contain' }}
            />
            <span
              style={{
                fontWeight: 600,
                fontSize: s.peopleSize,
                lineHeight: s.peopleLh,
                textTransform: 'capitalize',
                color: '#4A4A49',
              }}
            >
              {peopleJoined} Peoples Joined In A Mission.
            </span>
          </div>
          <SecondaryButton
            fullWidth
            onClick={() => navigate(`/donate-monthly?id=${id}&title=${encodeURIComponent(title)}`)}
          >
            Subscribe Monthly
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}

const cardSizes = {
  mobile: {
    cardW: 280, cardH: 320, cardRadius: 12, cardPad: 12,
    imgW: 256, imgH: 144, imgRadius: 10,
    badgeW: 75, badgeH: 26, badgeFont: 10, badgeTop: 8, badgeRight: 8,
    titleSize: 14, titleLh: '18px', titleMt: 12, titleMb: 10,
    peopleIcon: 20, peopleSize: 12, peopleLh: '18px',
    btnRadius: 8, btnPadY: 12, btnPadX: 20, btnFont: 12, btnLh: '12px',
  },
  medium: {
    cardW: 320, cardH: 360, cardRadius: 13, cardPad: 13,
    imgW: 294, imgH: 165, imgRadius: 11,
    badgeW: 80, badgeH: 27, badgeFont: 10, badgeTop: 9, badgeRight: 9,
    titleSize: 14, titleLh: '19px', titleMt: 13, titleMb: 11,
    peopleIcon: 21, peopleSize: 12, peopleLh: '19px',
    btnRadius: 8, btnPadY: 12, btnPadX: 21, btnFont: 12, btnLh: '12px',
  },
  tablet: {
    cardW: 350, cardH: 370, cardRadius: 14, cardPad: 14,
    imgW: 322, imgH: 181, imgRadius: 12,
    badgeW: 85, badgeH: 28, badgeFont: 11, badgeTop: 9, badgeRight: 9,
    titleSize: 15, titleLh: '20px', titleMt: 14, titleMb: 12,
    peopleIcon: 22, peopleSize: 13, peopleLh: '20px',
    btnRadius: 9, btnPadY: 13, btnPadX: 22, btnFont: 13, btnLh: '13px',
  },
  desktop: {
    cardW: 417, cardH: 414, cardRadius: 16, cardPad: 16,
    imgW: 385, imgH: 216.56, imgRadius: 15.98,
    badgeW: 95, badgeH: 32, badgeFont: 12, badgeTop: 10, badgeRight: 10,
    titleSize: 16, titleLh: '22px', titleMt: 16, titleMb: 14,
    peopleIcon: 24, peopleSize: 14, peopleLh: '22px',
    btnRadius: 10, btnPadY: 15, btnPadX: 24, btnFont: 14, btnLh: '14px',
  },
}
