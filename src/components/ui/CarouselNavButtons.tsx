import { ASSETS } from '../../constants/assets'

interface Props {
  mobile?: boolean
  canLeft: boolean
  canRight: boolean
  onPrev: () => void
  onNext: () => void
  prevLabel?: string
  nextLabel?: string
}

const arrowFilter = (enabled: boolean) =>
  enabled
    ? 'brightness(0) saturate(100%) invert(28%) sepia(85%) saturate(2500%) hue-rotate(196deg) brightness(95%)'
    : 'brightness(0) saturate(100%) opacity(0.3)'

function navButtonStyle(mobile: boolean, enabled: boolean, side: 'left' | 'right'): React.CSSProperties {
  const size = mobile ? 36 : 50
  const edge = mobile ? 22 : 34
  return {
    position: 'absolute',
    top: '50%',
    ...(side === 'left' ? { left: edge } : { right: edge }),
    transform: side === 'left' ? 'translate(-50%, -50%)' : 'translate(50%, -50%)',
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
    zIndex: 10,
    padding: 0,
  }
}

export default function CarouselNavButtons({
  mobile = false,
  canLeft,
  canRight,
  onPrev,
  onNext,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}: Props) {
  const arrowSize = mobile ? 10 : 15

  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canLeft}
        aria-label={prevLabel}
        style={navButtonStyle(mobile, canLeft, 'left')}
      >
        <img
          src={ASSETS.leftArrow}
          alt=""
          width={arrowSize}
          style={{ filter: arrowFilter(canLeft) }}
        />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canRight}
        aria-label={nextLabel}
        style={navButtonStyle(mobile, canRight, 'right')}
      >
        <img
          src={ASSETS.leftArrow}
          alt=""
          width={arrowSize}
          style={{ filter: arrowFilter(canRight), transform: 'rotate(180deg)' }}
        />
      </button>
    </>
  )
}
