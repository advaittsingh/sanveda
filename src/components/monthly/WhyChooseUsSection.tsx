import type { CMSItem } from '../../types'
import { getCMSSection, getCMSSectionById } from '../../api'
import { WCU_ICONS } from '../../constants/assets'
import { C } from '../../constants/brand'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import WhyChooseUsCard from './WhyChooseUsCard'

interface Props {
  cms: CMSItem[]
}

const ACCENT = C.gold

export default function WhyChooseUsSection({ cms }: Props) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const medium = useMediaQuery('(min-width: 600px) and (max-width: 875px)')
  const tablet = useMediaQuery('(min-width: 875px) and (max-width: 950px)')

  const section = getCMSSectionById(cms, 84) ?? getCMSSection(cms, 'why choose us')
  const related = (section?.relatedCMS ?? []).filter((s) => s.status === 1 || s.status === true)
  const cards = related.slice(0, 6).map((item, i) => ({
    id: i + 1,
    icon: WCU_ICONS[i] ?? WCU_ICONS[0],
    title: item.title ?? '',
    description: item.description ?? '',
  }))

  const p = mobile
    ? wcuStyles.mobile
    : medium
      ? wcuStyles.medium
      : tablet
        ? wcuStyles.tablet
        : wcuStyles.desktop

  const cardVariant = mobile ? 'mobile' : medium ? 'medium' : tablet ? 'tablet' : 'desktop'

  return (
    <div
      style={{
        width: mobile ? '100%' : '94.44%',
        maxWidth: 1440,
        margin: `0 auto ${mobile ? 0 : 60}px`,
        padding: p.pad,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: mobile ? 8 : 10,
          alignSelf: 'flex-start',
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
          WHY CHOOSE US
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
          alignSelf: 'flex-start',
          margin: `0 0 ${p.titleMb}px`,
          maxWidth: mobile ? '100%' : 642,
          textAlign: 'left',
        }}
      >
        {section?.title?.trim() ?? 'Why Choose Us'}
      </h2>

      {section?.description && (
        <p
          style={{
            fontWeight: 400,
            fontSize: p.descSize,
            lineHeight: p.descLh,
            letterSpacing: p.descSpacing,
            color: '#7D7D7D',
            maxWidth: mobile ? '100%' : 1440,
            textAlign: 'left',
            alignSelf: 'flex-start',
            margin: `0 0 ${p.descMb}px`,
          }}
        >
          {section.description.trim()}
        </p>
      )}

      {mobile || medium ? (
        <div
          style={{
            display: 'flex',
            width: '100%',
            gap: mobile ? 16 : 18,
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: 10,
            scrollbarWidth: 'none',
          }}
          className="monthly-scroll-hide"
        >
          {cards.map((card) => (
            <div key={card.id} style={{ flexShrink: 0 }}>
              <WhyChooseUsCard {...card} variant={cardVariant} />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: tablet ? 16 : 20,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {cards.map((card) => (
            <WhyChooseUsCard key={card.id} {...card} variant={cardVariant} />
          ))}
        </div>
      )}
    </div>
  )
}

const wcuStyles = {
  mobile: {
    pad: '0 16px', headerMb: 10, headerSize: 14,
    titleSize: 18, titleLh: '26px', titleSpacing: '-0.02em', titleMb: 10,
    descSize: 10, descLh: '19.42px', descSpacing: '-0.02em', descMb: 20,
  },
  medium: {
    pad: '0 20px', headerMb: 22, headerSize: 13,
    titleSize: 26, titleLh: undefined, titleSpacing: undefined, titleMb: 18,
    descSize: 14, descLh: '21px', descSpacing: undefined, descMb: 28,
  },
  tablet: {
    pad: '0 24px', headerMb: 22, headerSize: 13,
    titleSize: 30, titleLh: undefined, titleSpacing: undefined, titleMb: 18,
    descSize: 15, descLh: '22px', descSpacing: undefined, descMb: 32,
  },
  desktop: {
    pad: 0, headerMb: 24, headerSize: 14,
    titleSize: 36, titleLh: undefined, titleSpacing: undefined, titleMb: 20,
    descSize: 16, descLh: '24px', descSpacing: undefined, descMb: 40,
  },
}
