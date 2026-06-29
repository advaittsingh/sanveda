import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCMS, fetchFeaturedCampaigns, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import type { Campaign } from '../types'
import CampaignCard from './CampaignCard'
import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'
import SectionDecorations from './ui/SectionDecorations'
import { creamSectionStyle } from '../constants/sectionStyles'
import ViewAllButton from './ui/ViewAllButton'

export default function FeaturedCampaigns() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mobile, setMobile] = useState(false)
  const [wide, setWide] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [title, setTitle] = useState('Featured Campaign That Urgently Need Your Support')
  const [loading, setLoading] = useState(true)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const cardStep = mobile ? 306 : 441

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setMobile(w < 600)
      setWide(w >= 1200)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'Featured Campaigns')
      if (section?.title) setTitle(section.title)
    }).catch(() => {})
    fetchFeaturedCampaigns()
      .then(setCampaigns)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 0)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    updateScroll()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateScroll)
    ro.observe(el)
    return () => ro.disconnect()
  }, [campaigns, loading, mobile])

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * cardStep, behavior: 'smooth' })
    setTimeout(updateScroll, 300)
  }

  return (
    <div
      style={{
        ...creamSectionStyle(mobile),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <SectionDecorations mobile={mobile} wide={wide} />

      <div style={{ marginBottom: mobile ? '8px' : '16px', position: 'relative', zIndex: 2 }}>
        <SectionLabel mobile={mobile}>Featured Campaigns</SectionLabel>
      </div>

      <div style={{ marginBottom: mobile ? '20px' : '38px', position: 'relative', zIndex: 2, width: '100%' }}>
        <SectionTitle mobile={mobile} maxWidth={mobile ? '280px' : '506px'}>
          {title}
        </SectionTitle>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScroll}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'flex-start',
          gap: mobile ? '16px' : '24px',
          marginBottom: mobile ? '20px' : '32px',
          paddingLeft: mobile ? '16px' : '34px',
          paddingRight: mobile ? '16px' : '34px',
          overflowX: 'auto',
          alignItems: 'flex-start',
          position: 'relative',
          zIndex: 2,
          scrollSnapType: mobile ? 'x mandatory' : undefined,
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: mobile ? 290 : 417,
                  minHeight: 480,
                  background: '#e8e8e8',
                  borderRadius: 16,
                  flexShrink: 0,
                  scrollSnapAlign: mobile ? 'start' : undefined,
                }}
              />
            ))
          : campaigns.map((c) => (
              <div
                key={c.id}
                style={{ flexShrink: 0, scrollSnapAlign: mobile ? 'start' : undefined }}
              >
                <CampaignCard campaign={c} mobile={mobile} />
              </div>
            ))}
      </div>

      {!loading && campaigns.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: mobile ? 10 : 20,
            marginBottom: mobile ? 20 : 32,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            aria-label="Previous campaigns"
            style={{
              width: mobile ? 32 : 50,
              height: mobile ? 32 : 50,
              borderRadius: '50%',
              background: canLeft ? C.secondary : '#B9B9B8',
              border: 'none',
              cursor: canLeft ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={ASSETS.leftArrow}
              alt=""
              width={mobile ? 10 : 15}
              style={{ filter: canLeft ? 'brightness(0) invert(1)' : 'none' }}
            />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canRight}
            aria-label="Next campaigns"
            style={{
              width: mobile ? 32 : 50,
              height: mobile ? 32 : 50,
              borderRadius: '50%',
              background: canRight ? C.secondary : '#B9B9B8',
              border: 'none',
              cursor: canRight ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(180deg)',
            }}
          >
            <img
              src={ASSETS.leftArrow}
              alt=""
              width={mobile ? 10 : 15}
              style={{ filter: canRight ? 'brightness(0) invert(1)' : 'none' }}
            />
          </button>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        <ViewAllButton text="View All Campaigns" mobile={mobile} onClick={() => navigate('/campaigns')} />
      </div>
    </div>
  )
}
