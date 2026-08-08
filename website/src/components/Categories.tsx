import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCMS, fetchCampaigns, getCMSSection } from '../api'
import { campaignMatchesFocusArea, FOCUS_AREAS } from '../constants/focusAreas'
import type { Campaign } from '../types'
import CampaignCard from './CampaignCard'
import SectionTitle from './ui/SectionTitle'
import CarouselNavButtons from './ui/CarouselNavButtons'
import { C } from '../constants/brand'
import { sectionShellStyle } from '../constants/sectionStyles'
import ViewAllButton from './ui/ViewAllButton'
import { useBreakpoints } from '../hooks/useMediaQuery'
import { CAMPAIGN_CAROUSEL_GAP, campaignCarouselItemStyle, getCampaignCarouselStep } from '../lib/carousel'

export default function Categories() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { mobile, md } = useBreakpoints()
  const [title, setTitle] = useState('Behind every category lies a different story of suffering.')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeSlug, setActiveSlug] = useState(FOCUS_AREAS[0].slug)
  const [loading, setLoading] = useState(true)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const tabScroll = mobile || md

  const activeArea = FOCUS_AREAS.find((a) => a.slug === activeSlug) ?? FOCUS_AREAS[0]

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'Categories')
      if (section?.title) setTitle(section.title)
    }).catch(() => {})
    fetchCampaigns({ limit: 80 })
      .then(setCampaigns)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => campaigns.filter((c) => campaignMatchesFocusArea(c, activeArea)).slice(0, 8),
    [campaigns, activeArea],
  )

  const updateScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  useEffect(() => {
    updateScroll()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateScroll)
    ro.observe(el)
    return () => ro.disconnect()
  }, [filtered, loading, mobile, activeSlug])

  const scroll = (dir: number) => {
    const el = scrollRef.current
    if (!el) return
    const step = getCampaignCarouselStep(el, mobile, md)
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
    setTimeout(updateScroll, 350)
  }

  return (
    <div
      style={{
        ...sectionShellStyle(mobile),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ marginBottom: mobile ? '14px' : '38px', position: 'relative', zIndex: 2, width: '100%' }}>
        <SectionTitle mobile={mobile} maxWidth={mobile ? '269px' : '682px'}>
          {title}
        </SectionTitle>
      </div>

      <div
        style={{
          width: mobile ? 'calc(100% - 32px)' : 'calc(100% - 64px)',
          height: mobile ? '60px' : '68px',
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          className={tabScroll ? 'hide-scrollbar' : undefined}
          style={{
            display: 'flex',
            overflowX: tabScroll ? 'auto' : 'hidden',
            width: '100%',
            padding: tabScroll ? '12px 16px' : '8px',
            gap: tabScroll ? 8 : 4,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {FOCUS_AREAS.map((area) => {
            const selected = activeSlug === area.slug
            return (
              <button
                key={area.slug}
                type="button"
                onClick={() => setActiveSlug(area.slug)}
                style={{
                  flex: tabScroll ? '0 0 auto' : 1,
                  backgroundColor: selected ? C.secondary : 'transparent',
                  color: selected ? 'white' : '#4A4A49',
                  padding: tabScroll ? '10px 14px' : '16px 12px',
                  borderRadius: selected ? '10px' : '0',
                  fontSize: tabScroll ? '12px' : '14px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tabScroll ? '6px' : '8px',
                  minWidth: tabScroll ? undefined : 0,
                  fontFamily: 'Red Hat Display',
                }}
              >
                <img
                  src={area.icon}
                  alt=""
                  style={{ width: mobile ? 18 : 20, height: mobile ? 18 : 20, filter: selected ? 'brightness(0) invert(1)' : 'none' }}
                />
                {area.tabLabel}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ width: '100%', marginBottom: mobile ? '20px' : '48px', zIndex: 2 }}>
        <CarouselNavButtons
          mobile={mobile}
          canLeft={canLeft}
          canRight={canRight}
          onPrev={() => scroll(-1)}
          onNext={() => scroll(1)}
          showNav={!loading && filtered.length > 0}
          prevLabel="Previous campaigns"
          nextLabel="Next campaigns"
        >
          <div
            ref={scrollRef}
            onScroll={updateScroll}
            className="hide-scrollbar"
            style={{
              display: 'flex',
              width: '100%',
              gap: mobile ? `${CAMPAIGN_CAROUSEL_GAP.mobile}px` : `${CAMPAIGN_CAROUSEL_GAP.desktop}px`,
              overflowX: 'auto',
              scrollSnapType: mobile || md ? 'x mandatory' : undefined,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...campaignCarouselItemStyle(mobile, md),
                      height: 320,
                      background: '#e8e8e8',
                      borderRadius: 12,
                    }}
                  />
                ))
              : filtered.length
                ? filtered.map((c) => (
                    <div key={c.id} style={campaignCarouselItemStyle(mobile, md)}>
                      <CampaignCard campaign={c} mobile={mobile} />
                    </div>
                  ))
                : (
                  <p style={{ color: '#666', padding: '20px' }}>No campaigns in this focus area right now.</p>
                )}
          </div>
        </CarouselNavButtons>
      </div>

      <ViewAllButton
        text="View All Campaigns"
        mobile={mobile}
        onClick={() => navigate(`/focus-areas/${activeArea.slug}`)}
      />
    </div>
  )
}
