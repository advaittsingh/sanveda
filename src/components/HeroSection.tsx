import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCMS, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'
import { useBreakpoints } from '../hooks/useMediaQuery'
import type { CMSItem } from '../types'
import { BRAND, C } from '../constants/brand'

interface HeroSlide {
  id: number
  redText: string
  mainTitle: string
  mainTitleMobile: string
  description: string
  images: { image1: string; image2: string; image3: string }
  link: string | null
}

function splitTitle(title: string): string {
  if (!title) return ''
  if (title.includes('\n')) return title
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return title
  return `${words[0]}\n${words.slice(1).join(' ')}`
}

function buildSlides(section?: CMSItem): HeroSlide[] {
  return (section?.relatedCMS ?? [])
    .filter((s) => s.status === 1 || s.status === true)
    .map((a, i) => ({
      id: a.id ?? i,
      redText: a.stand_title || '',
      mainTitle: splitTitle(a.title || ''),
      mainTitleMobile: a.title || '',
      description: a.sub_title || '',
      images: { image1: a.image || '', image2: a.image3 || '', image3: a.image2 || '' },
      link: a.link || null,
    }))
}

const masks = [ASSETS.heroMask1, ASSETS.heroMask2, ASSETS.heroMask3]

export default function HeroSection() {
  const navigate = useNavigate()
  const { mobile, tablet, xl } = useBreakpoints()
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchCMS().then((cms) => setSlides(buildSlides(getCMSSection(cms, 'Hero Section')))).catch(() => {})
  }, [])

  const slide = slides[current]

  useEffect(() => {
    if (!slides.length) return
    const interval = setInterval(() => setProgress((p) => Math.min(p + 0.5, 100)), 30)
    const timeout = setTimeout(() => {
      setCurrent((c) => (c + 1) % slides.length)
      setProgress(0)
    }, 6000)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [current, slides.length])

  const goDonate = () => {
    if (!slide?.link) { navigate('/campaigns'); return }
    try {
      const url = new URL(slide.link)
      if (url.origin === window.location.origin) navigate(url.pathname)
      else window.location.href = slide.link
    } catch {
      navigate(slide.link!.startsWith('/') ? slide.link! : `/${slide.link}`)
    }
  }

  if (!slide) return null

  const img1 = slide.images.image1
  const img2 = slide.images.image2
  const img3 = slide.images.image3

  return (
    <section style={{ padding: tablet ? '0 16px' : '0', marginBottom: tablet ? 20 : 40 }}>
      <div
        style={{
          width: tablet ? '100%' : '94.44%',
          maxWidth: 1440,
          margin: '0 auto',
          borderRadius: 36,
          background: BRAND.gradient,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: tablet ? 'column' : 'row',
          alignItems: tablet ? 'center' : 'stretch',
          minHeight: xl ? 704 : tablet ? 'auto' : 600,
          padding: tablet ? '40px 20px 20px 14px' : '0',
          touchAction: 'pan-x pan-y',
        }}
      >
        {!tablet && (
          <>
            <button type="button" onClick={() => { setCurrent((c) => (c - 1 + slides.length) % slides.length); setProgress(0) }}
              style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: '#fff', border: '1px solid #979796', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={ASSETS.leftDoubleArrow} alt="Prev" width={19} height={19} />
            </button>
            <button type="button" onClick={() => { setCurrent((c) => (c + 1) % slides.length); setProgress(0) }}
              style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: '#fff', border: '1px solid #979796', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={ASSETS.rightDoubleArrow} alt="Next" width={19} height={19} />
            </button>
            <img src={ASSETS.greenRope} alt="" aria-hidden style={{ position: 'absolute', top: 85, left: 68, width: 78, zIndex: 4 }} />
            <img src={ASSETS.redOutlineHands} alt="" aria-hidden style={{ position: 'absolute', bottom: 0, left: 40, width: 165, zIndex: 4 }} />
          </>
        )}

        {/* Left text */}
        <div
          style={{
            width: tablet ? '100%' : '45%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: tablet ? 'center' : 'flex-end',
            textAlign: tablet ? 'center' : 'left',
            padding: tablet ? 0 : '40px 30px 40px 50px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{ maxWidth: 480, position: 'relative' }}>
            {!tablet && (
              <>
                <img src={ASSETS.greenHand} alt="" aria-hidden style={{ position: 'absolute', top: 30, left: 310, width: 42, zIndex: 4 }} />
                <img src={ASSETS.orangeSparks} alt="" aria-hidden style={{ position: 'absolute', top: -85, left: 350, width: 43, zIndex: 4 }} />
                <img src={ASSETS.heart} alt="" aria-hidden style={{ position: 'absolute', bottom: -50, left: 280, width: 18, zIndex: 4 }} />
              </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: mobile ? 12 : 15, justifyContent: tablet ? 'center' : 'flex-start' }}>
              <div style={{ width: mobile ? 11 : 38, height: mobile ? 1 : 2, background: C.accent }} />
              <span style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: mobile ? 14 : 21, color: C.goldLight, lineHeight: 1 }}>
                {slide.redText}
              </span>
            </div>

            {!tablet ? (
              <h1 style={{ fontWeight: 800, fontSize: xl ? 66 : 58, lineHeight: xl ? '66px' : '58px', color: C.white, margin: '0 0 17px', letterSpacing: '-0.01em' }}>
                {slide.mainTitle.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < slide.mainTitle.split('\n').length - 1 && <br />}</span>
                ))}
              </h1>
            ) : (
              <h1 style={{ fontWeight: 800, fontSize: mobile ? 32 : 58, lineHeight: mobile ? 1 : '58px', color: C.white, margin: '0 0 15px' }}>
                {slide.mainTitleMobile}
              </h1>
            )}

            <p style={{ fontWeight: 600, fontSize: mobile ? 14 : tablet ? 21 : 24, lineHeight: mobile ? 1 : '24px', color: 'rgba(255,255,255,0.9)', marginBottom: mobile ? 20 : 30 }}>
              {slide.description}
            </p>

            <button
              type="button"
              onClick={goDonate}
              className="btn-donate"
              style={{
                borderRadius: 10, padding: mobile ? '8px 16px' : '15px 24px',
                width: mobile ? 120 : 130, height: mobile ? 36 : 48,
                fontWeight: 800, fontSize: mobile ? 11 : 14, border: 'none', cursor: 'pointer', fontFamily: 'Red Hat Display',
              }}
            >
              Donate Now
            </button>
          </div>
        </div>

        {/* Right images */}
        <div style={{ width: tablet ? '100%' : '55%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              width: mobile ? 267 : tablet ? '100%' : xl ? 687 : 515,
              height: mobile ? 225 : tablet ? 'auto' : xl ? 700 : 525,
              maxWidth: tablet ? 515 : undefined,
              position: 'relative',
              aspectRatio: tablet && !mobile ? '1/1' : undefined,
            }}
          >
            {img1 && (
              <img
                src={img1}
                alt=""
                style={{
                  position: mobile || !tablet ? 'absolute' : tablet ? 'relative' : 'absolute',
                  top: mobile ? 0 : tablet ? 'auto' : 40,
                  left: mobile ? 20 : tablet ? 'auto' : 45,
                  width: mobile ? 177 : tablet ? '100%' : xl ? 461 : 346,
                  height: mobile ? 133 : tablet ? 'auto' : xl ? 347 : 261,
                  maxWidth: tablet ? 280 : undefined,
                  margin: tablet && !mobile ? '0 auto 20px' : undefined,
                  objectFit: 'cover',
                  WebkitMaskImage: `url(${masks[0]})`, WebkitMaskSize: '100% 100%',
                  maskImage: `url(${masks[0]})`, maskSize: '100% 100%',
                  display: 'block',
                }}
              />
            )}
            {img2 && (
              <img
                src={img2}
                alt=""
                style={{
                  position: 'absolute',
                  top: mobile ? 110 : tablet ? -60 : xl ? 320 : 255,
                  right: mobile ? 20 : tablet ? -115 : 55,
                  left: tablet && !mobile ? 'auto' : undefined,
                  width: mobile ? 122 : tablet ? 180 : xl ? 302 : 227,
                  height: mobile ? 87 : tablet ? 'auto' : xl ? 216 : 163,
                  objectFit: 'cover',
                  WebkitMaskImage: `url(${masks[1]})`, WebkitMaskSize: '100% 100%',
                  maskImage: `url(${masks[1]})`, maskSize: '100% 100%',
                }}
              />
            )}
            {img3 && (
              <img
                src={img3}
                alt=""
                style={{
                  position: 'absolute',
                  bottom: mobile ? 10 : 40,
                  left: mobile ? 0 : 0,
                  width: mobile ? 100 : xl ? 320 : 240,
                  height: mobile ? 77 : xl ? 247 : 185,
                  objectFit: 'cover',
                  WebkitMaskImage: `url(${masks[2]})`, WebkitMaskSize: '100% 100%',
                  maskImage: `url(${masks[2]})`, maskSize: '100% 100%',
                }}
              />
            )}
          </div>
        </div>

        {/* Mobile dots */}
        {tablet && slides.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'center', width: '100%' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setCurrent(i); setProgress(0) }}
                style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', padding: 0, background: i === current ? C.gold : 'rgba(255,255,255,0.4)', cursor: 'pointer', position: 'relative' }}
              >
                {i === current && (
                  <span style={{ position: 'absolute', bottom: -4, left: 0, height: 2, width: `${progress}%`, background: C.goldLight, transition: 'width 0.1s linear' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
