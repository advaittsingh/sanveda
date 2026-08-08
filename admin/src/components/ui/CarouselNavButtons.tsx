import type { ReactNode } from 'react'
import { ASSETS } from '../../constants/assets'

interface Props {
  mobile?: boolean
  canLeft: boolean
  canRight: boolean
  onPrev: () => void
  onNext: () => void
  children: ReactNode
  showNav?: boolean
  prevLabel?: string
  nextLabel?: string
}

const arrowFilter = (enabled: boolean) =>
  enabled
    ? 'brightness(0) saturate(100%) invert(28%) sepia(85%) saturate(2500%) hue-rotate(196deg) brightness(95%)'
    : 'brightness(0) saturate(100%) opacity(0.3)'

function NavButton({
  mobile,
  enabled,
  side,
  onClick,
  label,
}: {
  mobile: boolean
  enabled: boolean
  side: 'left' | 'right'
  onClick: () => void
  label: string
}) {
  const size = mobile ? 36 : 50
  const arrowSize = mobile ? 10 : 15

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      aria-label={label}
      style={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#FFFFFF',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: enabled ? '0px 4px 14px rgba(0, 0, 0, 0.12)' : '0px 2px 6px rgba(0, 0, 0, 0.06)',
        cursor: enabled ? 'pointer' : 'not-allowed',
        opacity: enabled ? 1 : 0.55,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <img
        src={ASSETS.leftArrow}
        alt=""
        width={arrowSize}
        style={{
          filter: arrowFilter(enabled),
          transform: side === 'right' ? 'rotate(180deg)' : undefined,
        }}
      />
    </button>
  )
}

export default function CarouselNavButtons({
  mobile = false,
  canLeft,
  canRight,
  onPrev,
  onNext,
  children,
  showNav = true,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}: Props) {
  if (!showNav) {
    return <div style={{ width: '100%' }}>{children}</div>
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: mobile ? 10 : 20,
      }}
    >
      <NavButton mobile={mobile} enabled={canLeft} side="left" onClick={onPrev} label={prevLabel} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      <NavButton mobile={mobile} enabled={canRight} side="right" onClick={onNext} label={nextLabel} />
    </div>
  )
}
