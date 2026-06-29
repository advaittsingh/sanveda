import type { MonthlyDonation } from '../../types'
import type { CMSItem } from '../../types'
import { getCMSSection, getCMSSectionById } from '../../api'
import { C } from '../../constants/brand'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import SecondaryButton from '../ui/SecondaryButton'
import MonthlyDonationWidget from './MonthlyDonationWidget'

interface Props {
  cms: CMSItem[]
  programs: MonthlyDonation[]
  initialCauseId?: string
}

export default function MonthlyHeroSection({ cms, programs, initialCauseId }: Props) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 899px)')
  const medium = useMediaQuery('(min-width: 900px) and (max-width: 1200px)')

  const section = getCMSSectionById(cms, 82) ?? getCMSSection(cms, 'Monthly donation hero section')
  const heroTitle = section?.title ?? 'Monthly Donation'
  const heroSubtitle = section?.sub_title ?? ''
  const heroImage = section?.image ?? ''

  const scrollToPrograms = () => {
    document.getElementById('monthly-donation-programs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const p = mobile
    ? heroStyles.mobile
    : tablet
      ? heroStyles.tablet
      : medium
        ? heroStyles.medium
        : heroStyles.desktop

  return (
    <div>
      <div
        style={{
          width: mobile ? '94.44%' : '94.44%',
          height: p.height,
          borderRadius: 16,
          position: 'relative',
          overflow: 'hidden',
          margin: '0 auto',
          marginBottom: tablet ? 0 : 80,
        }}
      >
        {heroImage && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: 'scaleX(-1)',
              zIndex: 1,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(93.72deg, #141414 7.86%, rgba(20, 20, 20, 0) 60.82%)',
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: tablet ? 'flex-start' : 'space-between',
            alignItems: 'flex-end',
            padding: tablet ? 20 : '40px 0 0 40px',
          }}
        >
          <div style={{ maxWidth: p.leftMax, marginBottom: mobile ? 0 : 20, textAlign: 'left' }}>
            <h1
              style={{
                fontWeight: 700,
                fontSize: p.titleSize,
                lineHeight: p.titleLh,
                letterSpacing: p.titleSpacing,
                color: C.white,
                margin: `0 0 ${p.titleMb}px`,
                textTransform: 'capitalize',
              }}
            >
              {heroTitle}
            </h1>
            {heroSubtitle && (
              <p
                style={{
                  fontWeight: 400,
                  fontSize: p.descSize,
                  lineHeight: p.descLh,
                  color: 'rgba(255,255,255,0.82)',
                  margin: `0 0 ${p.descMb}px`,
                }}
              >
                {heroSubtitle}
              </p>
            )}
            <SecondaryButton onClick={scrollToPrograms} style={{ minWidth: p.btnW }}>
              {mobile ? 'Donate Monthly' : 'Donate Monthly Now'}
            </SecondaryButton>
          </div>

          {!tablet && (
            <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 20, marginRight: p.rightMargin }}>
              <MonthlyDonationWidget programs={programs} isMediumScreen={medium} initialCauseId={initialCauseId} />
            </div>
          )}
        </div>
      </div>

      {tablet && (
        <div style={{ width: '100%', padding: '20px 16px', backgroundColor: C.white }}>
          <MonthlyDonationWidget
            programs={programs}
            isMediumScreen={medium && !mobile}
            isSmallScreen={!mobile && tablet}
            initialCauseId={initialCauseId}
          />
        </div>
      )}
    </div>
  )
}

const heroStyles = {
  mobile: {
    height: 203, leftMax: '100%', titleSize: 18, titleLh: '29.12px', titleSpacing: '-0.01em',
    titleMb: 8, descSize: 14, descLh: '22px', descMb: 12, btnW: 181, btnH: 42, btnRadius: 10, rightMargin: 0,
  },
  tablet: {
    height: 400, leftMax: '100%', titleSize: 32, titleLh: '120%', titleSpacing: undefined,
    titleMb: 16, descSize: 14, descLh: '24px', descMb: 20, btnW: 180, btnH: 44, btnRadius: 10, rightMargin: 0,
  },
  medium: {
    height: 640, leftMax: 350, titleSize: 50, titleLh: '120%', titleSpacing: undefined,
    titleMb: 24, descSize: 16, descLh: '28px', descMb: 24, btnW: 180, btnH: 46, btnRadius: 10, rightMargin: 16,
  },
  desktop: {
    height: 640, leftMax: 463, titleSize: 72, titleLh: '120%', titleSpacing: undefined,
    titleMb: 30, descSize: 18, descLh: '30px', descMb: 30, btnW: 196, btnH: 50, btnRadius: 10, rightMargin: 20,
  },
}
