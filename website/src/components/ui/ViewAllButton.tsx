import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'

interface Props {
  text: string
  onClick?: () => void
  mobile?: boolean
}

export default function ViewAllButton({ text, onClick, mobile }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: mobile ? '6px' : '10px',
        padding: mobile ? '10px 16px' : '13px 24px',
        borderRadius: '10px',
        backgroundColor: C.secondary,
        color: '#FFFFFF',
        boxShadow: '0 4px 0 0 #B9B9B8',
        fontFamily: 'Red Hat Display, sans-serif',
        fontSize: mobile ? '11px' : '14px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        minWidth: mobile ? '120px' : '183px',
        minHeight: mobile ? '36px' : 'auto',
        transition: 'all 0.3s ease',
      }}
    >
      {text}
      <img
        src={ASSETS.arrowUpRight}
        alt=""
        width={mobile ? 14 : 20}
        height={mobile ? 14 : 20}
        style={{ filter: 'brightness(0) invert(1)' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    </button>
  )
}
