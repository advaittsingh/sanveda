import type { CSSProperties } from 'react'
import type { CMSItem } from '../../types'
import { getCMSSection, getCMSSectionById } from '../../api'
import { MONTHLY_STEP_ICONS } from '../../constants/assets'
import { C } from '../../constants/brand'
import { useMediaQuery } from '../../hooks/useMediaQuery'

interface Props {
  cms: CMSItem[]
}

const ACCENT = C.gold

export default function MonthlyStepsSection({ cms }: Props) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const narrow = useMediaQuery('(max-width: 640px)')
  const tablet = useMediaQuery('(min-width: 641px) and (max-width: 1350px)')
  const desktop = useMediaQuery('(min-width: 1351px)')

  const section = getCMSSectionById(cms, 83) ?? getCMSSection(cms, 'donate monthly steps')
  const related = (section?.relatedCMS ?? []).filter((s) => s.status === 1 || s.status === true)
  const stepTitles = related.slice(0, 4).map((s) => s.title ?? '')

  const steps = [
    { icon: MONTHLY_STEP_ICONS[0], step: 'Step 1', description: stepTitles[0] ?? '' },
    { icon: MONTHLY_STEP_ICONS[1], step: 'Step 2', description: stepTitles[1] ?? '' },
    { icon: MONTHLY_STEP_ICONS[2], step: 'Step 3', description: stepTitles[2] ?? '' },
    { icon: MONTHLY_STEP_ICONS[3], step: 'Step 4', description: stepTitles[3] ?? '' },
  ]

  const p = mobile
    ? stepStyles.mobile
    : narrow
      ? stepStyles.narrow
      : tablet
        ? stepStyles.tablet
        : stepStyles.desktop

  return (
    <div style={{ width: mobile ? '100%' : '94.44%', maxWidth: 1440, margin: '0 auto', padding: mobile ? '0 16px' : 0 }}>
      <h2
        style={{
          fontWeight: 700,
          textAlign: 'center',
          textTransform: 'capitalize',
          color: '#1D1D1B',
          fontSize: p.titleSize,
          lineHeight: p.titleLh,
          letterSpacing: p.titleSpacing,
          margin: `0 0 ${p.titleMb}px`,
        }}
      >
        {section?.title ?? 'How To Donate Monthly'}
      </h2>
      <p
        style={{
          fontWeight: 400,
          textAlign: 'center',
          color: '#7D7D7D',
          maxWidth: 844,
          margin: `0 auto ${p.subMb}px`,
          fontSize: p.subSize,
          lineHeight: p.subLh,
        }}
      >
        {section?.description ?? ''}
      </p>

      <div style={p.container as CSSProperties}>
        {(mobile || narrow) && steps.length > 1 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: p.lineTop,
              height: p.lineHeight,
              width: 2,
              borderLeft: `2px dashed ${ACCENT}`,
              transform: 'translateX(-50%)',
              zIndex: 1,
            }}
          />
        )}

        {steps.map((step, i) => (
          <div key={step.step} style={{ display: 'contents' }}>
            <div
              style={{
                width: p.cardW,
                height: p.cardH,
                borderRadius: p.cardRadius,
                border: '0.5px solid #CCCCCC',
                padding: p.cardPad,
                background: C.white,
                display: 'flex',
                alignItems: 'center',
                gap: p.cardGap,
                position: 'relative',
                zIndex: 2,
                flexShrink: desktop ? 0 : undefined,
              }}
            >
              <div
                style={{
                  width: p.iconBox,
                  height: p.iconBox,
                  borderRadius: p.iconRadius,
                  padding: p.iconPad,
                  backgroundColor: C.cream,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <img src={step.icon} alt="" style={{ width: p.iconSize, height: p.iconSize, objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, fontSize: p.stepSize, lineHeight: '100%', color: '#797E88', margin: `0 0 ${p.stepMb}px`, textTransform: 'capitalize' }}>
                  {step.step}
                </p>
                <p style={{ fontWeight: 600, fontSize: p.descSize, lineHeight: p.descLh, letterSpacing: '-0.02em', color: '#1D1D1B', margin: 0 }}>
                  {step.description}
                </p>
              </div>
            </div>

            {desktop && i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  borderTop: `1px dashed ${ACCENT}`,
                  alignSelf: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const stepStyles = {
  mobile: {
    titleSize: 18, titleLh: '140%', titleSpacing: '-0.01em', titleMb: 10,
    subSize: 12, subLh: '20px', subMb: 20,
    container: { display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' },
    cardW: '100%', cardH: 80, cardRadius: 8, cardPad: 12, cardGap: 12,
    iconBox: 48, iconRadius: 16, iconPad: 8, iconSize: 28,
    stepSize: 12, stepMb: 2, descSize: 12, descLh: '18px',
    lineTop: 40, lineHeight: 'calc(100% - 80px)',
  },
  narrow: {
    titleSize: 28, titleMb: 14, subSize: 15, subLh: '22px', subMb: 35, titleLh: undefined, titleSpacing: undefined,
    container: { display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', position: 'relative' },
    cardW: 280, cardH: 85, cardRadius: 10, cardPad: 12, cardGap: 12,
    iconBox: 52, iconRadius: 18, iconPad: 10, iconSize: 32,
    stepSize: 13, stepMb: 3, descSize: 13, descLh: '20px',
    lineTop: 42, lineHeight: 'calc(100% - 84px)',
  },
  tablet: {
    titleSize: 32, titleMb: 15, subSize: 15, subLh: '23px', subMb: 40, titleLh: undefined, titleSpacing: undefined,
    container: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, position: 'relative' },
    cardW: '100%', cardH: 90, cardRadius: 11, cardPad: 13, cardGap: 13,
    iconBox: 56, iconRadius: 19, iconPad: 11, iconSize: 34,
    stepSize: 13, stepMb: 3, descSize: 13, descLh: '21px',
    lineTop: 0, lineHeight: 0,
  },
  desktop: {
    titleSize: 36, titleMb: 16, subSize: 16, subLh: '24px', subMb: 40, titleLh: undefined, titleSpacing: undefined,
    container: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative' },
    cardW: 315, cardH: 98, cardRadius: 12, cardPad: 14, cardGap: 14,
    iconBox: 60, iconRadius: 20, iconPad: 12, iconSize: 36,
    stepSize: 14, stepMb: 4, descSize: 14, descLh: '22.65px',
    lineTop: 0, lineHeight: 0,
  },
}
