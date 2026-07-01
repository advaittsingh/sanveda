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

export default function Categories() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mobile, setMobile] = useState(false)
  const [title, setTitle] = useState('Behind every category lies a different story of suffering.')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeSlug, setActiveSlug] = useState(FOCUS_AREAS[0].slug)
  const [loading, setLoading] = useState(true)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const cardStep = mobile ? 306 : 441

  const activeArea = FOCUS_AREAS.find((a) => a.slug === activeSlug) ?? FOCUS_AREAS[0]

  useEffect(() => {
    const check = () => {
      setMobile(window.innerWidth < 600)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
  }, [filtered, loading, mobile, activeSlug])

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * cardStep, behavior: 'smooth' })
    setTimeout(updateScroll, 300)
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
          className={mobile ? 'hide-scrollbar' : undefined}
          style={{
            display: 'flex',
            overflowX: mobile ? 'auto' : 'hidden',
            width: '100%',
            padding: mobile ? '16px' : '8px',
            gap: mobile ? 0 : 4,
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
                  flex: mobile ? '0 0 auto' : 1,
                  backgroundColor: selected ? C.secondary : 'transparent',
                  color: selected ? 'white' : '#4A4A49',
                  padding: mobile ? '12px 16px' : '16px 12px',
                  borderRadius: selected ? '10px' : '0',
                  fontSize: mobile ? '12px' : '14px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: mobile ? '6px' : '8px',
                  minWidth: mobile ? undefined : 0,
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

      <div
        style={{
          position: 'relative',
          width: '100%',
          marginBottom: mobile ? '20px' : '48px',
          zIndex: 2,
        }}
      >
        <div
          ref={scrollRef}
          onScroll={updateScroll}
          className="hide-scrollbar"
          style={{
            display: 'flex',
            width: '100%',
            gap: mobile ? '16px' : '24px',
            paddingLeft: mobile ? '16px' : '34px',
            paddingRight: mobile ? '16px' : '34px',
            overflowX: 'auto',
            scrollSnapType: mobile ? 'x mandatory' : undefined,
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ width: '300px', height: '320px', background: '#e8e8e8', borderRadius: '12px', flexShrink: 0 }} />
              ))
            : filtered.length
              ? filtered.map((c) => (
                  <div key={c.id} style={{ flexShrink: 0, scrollSnapAlign: mobile ? 'start' : undefined }}>
                    <CampaignCard campaign={c} mobile={mobile} />
                  </div>
                ))
              : (
                <p style={{ color: '#666', padding: '20px' }}>No campaigns in this focus area right now.</p>
              )}
        </div>

        {!loading && filtered.length > 0 && (
          <CarouselNavButtons
            mobile={mobile}
            canLeft={canLeft}
            canRight={canRight}
            onPrev={() => scroll(-1)}
            onNext={() => scroll(1)}
            prevLabel="Previous campaigns"
            nextLabel="Next campaigns"
          />
        )}
      </div>

      <ViewAllButton
        text="View All Campaigns"
        mobile={mobile}
        onClick={() => navigate(`/focus-areas/${activeArea.slug}`)}
      />
    </div>
  )
}
