import { ASSETS } from '../../constants/assets'

interface Props {
  mobile?: boolean
  wide?: boolean
  variant?: 'default' | 'categories' | 'testimonials'
}

export default function SectionDecorations({ mobile, wide, variant = 'default' }: Props) {
  return (
    <>
      <img
        src={ASSETS.orangeSparks}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          top: mobile ? '10px' : wide ? '61px' : '20px',
          left: mobile ? '10px' : wide ? '116px' : '20px',
          width: mobile ? '40px' : wide ? '50px' : '45px',
          height: 'auto',
          zIndex: 1,
          display: mobile ? 'none' : 'block',
        }}
      />
      <img
        src={ASSETS.heart}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          top: mobile ? '15px' : wide ? '116px' : '80px',
          right: mobile ? '15px' : wide ? '275px' : '30px',
          width: mobile ? '30px' : wide ? '22px' : '25px',
          height: 'auto',
          zIndex: 1,
          display: mobile ? 'none' : 'block',
          transform: variant === 'categories' ? 'rotate(20deg)' : undefined,
        }}
      />
      <img
        src={ASSETS.stringHand}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          top: variant === 'testimonials' ? '50px' : undefined,
          bottom: variant === 'testimonials' ? undefined : '16px',
          left: variant === 'categories' && mobile ? 'unset' : variant === 'testimonials' ? undefined : '0px',
          right: variant === 'categories' && mobile ? '0px' : variant === 'testimonials' ? '0px' : undefined,
          width: variant === 'testimonials' ? '111px' : '53px',
          height: variant === 'testimonials' ? '94px' : 'auto',
          zIndex: 1,
          display: variant === 'categories' ? 'block' : mobile ? 'block' : 'none',
          transform: variant === 'categories' ? (mobile ? 'scaleX(1)' : 'scaleX(-1)') : 'scaleX(-1)',
        }}
      />
    </>
  )
}
