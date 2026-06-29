import type { MonthlyDonation } from '../../types'
import type { CMSItem } from '../../types'
import { getCMSSection, getCMSSectionById, getMonthlyDonationImage, getMonthlyDonorsCount } from '../../api'
import { C } from '../../constants/brand'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import MonthlyProgramCard from './MonthlyProgramCard'

interface Props {
  cms: CMSItem[]
  programs: MonthlyDonation[]
  loading?: boolean
}

const ACCENT = C.gold

export default function MonthlyProgramsSection({ cms, programs, loading }: Props) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const medium = useMediaQuery('(min-width: 600px) and (max-width: 835px)')
  const tablet = useMediaQuery('(min-width: 835px) and (max-width: 950px)')
  const desktop = useMediaQuery('(min-width: 950px)')

  const section = getCMSSectionById(cms, 81) ?? getCMSSection(cms, 'Join Monthly donation')
  const title = section?.title?.trim() ?? 'Join Monthly Donation Programs'
  const description = section?.description?.trim() ?? ''

  const p = mobile
    ? progStyles.mobile
    : medium
      ? progStyles.medium
      : tablet
        ? progStyles.tablet
        : progStyles.desktop

  const cardVariant = mobile ? 'mobile' : medium ? 'medium' : tablet ? 'tablet' : 'desktop'

  return (
    <div
      id="monthly-donation-programs"
      style={{
        ...p.container,
        maxWidth: 1440,
        background: '#F7F7F7',
        margin: `${mobile ? 20 : 40}px auto ${mobile ? 30 : 60}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: mobile ? 8 : 10,
          alignSelf: 'flex-start',
          marginLeft: p.headerMl,
          marginBottom: p.headerMb,
        }}
      >
        <div style={{ width: mobile ? 6 : 8, height: mobile ? 6 : 8, borderRadius: '50%', backgroundColor: ACCENT }} />
        <span
          style={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 400,
            fontSize: p.headerSize,
            lineHeight: '100%',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: '#131313',
          }}
        >
          JOIN MONTH
        </span>
      </div>

      <h2
        style={{
          fontWeight: 700,
          fontSize: p.titleSize,
          lineHeight: p.titleLh,
          letterSpacing: p.titleSpacing,
          textTransform: 'capitalize',
          color: '#1D1D1B',
          paddingLeft: p.titlePl,
          alignSelf: 'flex-start',
          margin: `0 0 ${p.titleMb}px`,
          textAlign: 'left',
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          style={{
            fontWeight: 400,
            fontSize: p.descSize,
            lineHeight: p.descLh,
            letterSpacing: p.descSpacing,
            color: '#7D7D7D',
            maxWidth: mobile ? '100%' : 1161,
            textAlign: 'left',
            alignSelf: 'flex-start',
            paddingLeft: p.descPl,
            margin: `0 0 ${p.descMb}px`,
          }}
        >
          {description}
        </p>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: `3px solid ${C.border}`,
              borderTopColor: C.gold,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      ) : programs.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#7D7D7D', padding: 40 }}>
          No monthly donation programs available at the moment.
        </p>
      ) : mobile || medium ? (
        <div
          style={{
            display: 'flex',
            width: '100%',
            gap: mobile ? 16 : 18,
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: 10,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="monthly-scroll-hide"
        >
          {programs.map((item) => (
            <div key={item.id} style={{ flexShrink: 0 }}>
              <MonthlyProgramCard
                id={item.id}
                image={getMonthlyDonationImage(item)}
                taxBenefit={!!item.exemption_tag}
                title={item.title}
                peopleJoined={getMonthlyDonorsCount(item)}
                variant={cardVariant}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: desktop ? 'repeat(auto-fit, minmax(380px, 417px))' : 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: tablet ? 16 : 20,
            justifyContent: 'center',
            width: '100%',
            padding: tablet ? '0 12px' : '0 15px',
          }}
        >
          {programs.map((item) => (
            <MonthlyProgramCard
              key={item.id}
              id={item.id}
              image={getMonthlyDonationImage(item)}
              taxBenefit={!!item.exemption_tag}
              title={item.title}
              peopleJoined={getMonthlyDonorsCount(item)}
              variant={cardVariant}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const progStyles = {
  mobile: {
    container: { width: '100%', padding: '20px 16px', borderRadius: 0 },
    headerMl: 0, headerMb: 10, headerSize: 10,
    titleSize: 18, titleLh: '16.18px', titleSpacing: '-0.02em', titlePl: 0, titleMb: 10,
    descSize: 10, descLh: '19.42px', descSpacing: '-0.02em', descPl: 0, descMb: 20,
  },
  medium: {
    container: { width: '94.44%', borderRadius: 20, padding: '24px 20px 30px' },
    headerMl: 0, headerMb: 13, headerSize: 13,
    titleSize: 26, titleLh: undefined, titleSpacing: undefined, titlePl: 0, titleMb: 8,
    descSize: 14, descLh: '21px', descSpacing: undefined, descPl: 0, descMb: 28,
  },
  tablet: {
    container: { width: '94.44%', borderRadius: 24, padding: '28px 24px 40px' },
    headerMl: 0, headerMb: 14, headerSize: 13,
    titleSize: 30, titleLh: undefined, titleSpacing: undefined, titlePl: 0, titleMb: 8,
    descSize: 15, descLh: '22px', descSpacing: undefined, descPl: 0, descMb: 32,
  },
  desktop: {
    container: { width: '94.44%', borderRadius: 36, padding: '35px 0 50px' },
    headerMl: 40, headerMb: 16, headerSize: 14,
    titleSize: 36, titleLh: undefined, titleSpacing: undefined, titlePl: 40, titleMb: 10,
    descSize: 16, descLh: '24px', descSpacing: undefined, descPl: 40, descMb: 40,
  },
}
