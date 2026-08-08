import { ASSETS } from '../../constants/assets'
import { useMediaQuery } from '../../hooks/useMediaQuery'

interface Props {
  title: string
  subtitle?: string
}

export default function SubPageBanner({ title, subtitle }: Props) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const wide = useMediaQuery('(min-width: 1200px)')

  return (
    <section className="sub-page-banner" aria-label={title}>
      <div className="sub-page-banner-overlay" aria-hidden />
      <img
        src={ASSETS.whiteHeart}
        alt=""
        aria-hidden
        className="sub-page-banner-heart"
        data-mobile={mobile}
        data-wide={wide}
      />
      <img
        src={ASSETS.redOutlineHands}
        alt=""
        aria-hidden
        className="sub-page-banner-hands"
        data-mobile={mobile}
      />
      <div className="sub-page-banner-content">
        <h1 className="sub-page-banner-title" data-mobile={mobile}>
          {title}
        </h1>
        {subtitle ? (
          <p className="sub-page-banner-subtitle" data-mobile={mobile}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  )
}
