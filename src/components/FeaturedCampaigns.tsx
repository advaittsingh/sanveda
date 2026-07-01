import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCMS, fetchFeaturedCampaigns, getCMSSection } from '../api'
import type { Campaign } from '../types'
import CampaignCard from './CampaignCard'
import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'
import { creamSectionStyle } from '../constants/sectionStyles'
import CarouselNavButtons from './ui/CarouselNavButtons'
import ViewAllButton from './ui/ViewAllButton'

export default function FeaturedCampaigns() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mobile, setMobile] = useState(false)
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
      <div style={{ marginBottom: mobile ? '8px' : '16px', position: 'relative', zIndex: 2 }}>
        <SectionLabel mobile={mobile}>Featured Campaigns</SectionLabel>
      </div>

      <div style={{ marginBottom: mobile ? '20px' : '38px', position: 'relative', zIndex: 2, width: '100%' }}>
        <SectionTitle mobile={mobile} maxWidth={mobile ? '280px' : '506px'}>
          {title}
        </SectionTitle>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          marginBottom: mobile ? '20px' : '32px',
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
            justifyContent: 'flex-start',
            gap: mobile ? '16px' : '24px',
            paddingLeft: mobile ? '16px' : '34px',
            paddingRight: mobile ? '16px' : '34px',
            overflowX: 'auto',
            alignItems: 'flex-start',
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

      <div style={{ position: 'relative', zIndex: 2 }}>
        <ViewAllButton text="View All Campaigns" mobile={mobile} onClick={() => navigate('/campaigns')} />
      </div>
    </div>
  )
}
