import { useNavigate } from 'react-router-dom'
import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export default function DonateNowButton({ text = 'Donate Now' }: { text?: string }) {
  const navigate = useNavigate()
  const mobile = useMediaQuery('(max-width: 600px)')

  return (
    <button
      type="button"
      onClick={() => navigate('/campaigns')}
      className="btn-donate"
      style={{
        padding: mobile ? '8px 16px' : '15px 24px',
        width: mobile ? 136 : 183,
        height: mobile ? 36 : 48,
        fontFamily: 'Red Hat Display, sans-serif',
        fontWeight: 700,
        fontSize: mobile ? 12 : 18,
        lineHeight: mobile ? '11px' : '14px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: mobile ? 4 : 8,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: C.secondary,
        color: C.white,
        boxShadow: `0px 4px 0px ${C.primary}`,
      }}
    >
      {text}
      <img
        src={ASSETS.arrowUpRight}
        alt=""
        width={mobile ? 14 : 20}
        height={mobile ? 14 : 20}
        style={{ filter: 'brightness(0) invert(1)' }}
      />
    </button>
  )
}
