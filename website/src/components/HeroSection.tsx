import { ASSETS } from '../constants/assets'
import { HERO_BANNER_ASPECT, heroSectionStyle } from '../constants/sectionStyles'
import { useBreakpoints } from '../hooks/useMediaQuery'

export default function HeroSection() {
  const { mobile, tablet, xl } = useBreakpoints()
  const fixedHeight = xl ? 704 : !tablet ? 600 : undefined

  return (
    <section style={heroSectionStyle(mobile)} className="animate-hero-in">
      <div
        style={{
          width: '100%',
          height: fixedHeight,
          aspectRatio: fixedHeight ? undefined : HERO_BANNER_ASPECT,
          borderRadius: mobile ? 16 : 36,
          overflow: 'hidden',
          lineHeight: 0,
        }}
      >
        <img
          src={ASSETS.heroBanner}
          alt="Empowering Lives. Building a Better Tomorrow."
          width={1024}
          height={672}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>
    </section>
  )
}
