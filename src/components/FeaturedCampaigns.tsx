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
import { useBreakpoints } from '../hooks/useMediaQuery'
import { CAMPAIGN_CAROUSEL_GAP, campaignCarouselItemStyle, getCampaignCarouselStep } from '../lib/carousel'

export default function FeaturedCampaigns() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { mobile, md } = useBreakpoints()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [title, setTitle] = useState('Featured Campaign That Urgently Need Your Support')
  const [loading, setLoading] = useState(true)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

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
  }, [campaigns, loading, mobile])

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

      <div style={{ width: '100%', marginBottom: mobile ? '20px' : '32px', zIndex: 2 }}>
        <CarouselNavButtons
          mobile={mobile}
          canLeft={canLeft}
          canRight={canRight}
          onPrev={() => scroll(-1)}
          onNext={() => scroll(1)}
          showNav={!loading && campaigns.length > 0}
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
              justifyContent: 'flex-start',
              gap: mobile ? `${CAMPAIGN_CAROUSEL_GAP.mobile}px` : `${CAMPAIGN_CAROUSEL_GAP.desktop}px`,
              overflowX: 'auto',
              alignItems: 'flex-start',
              scrollSnapType: mobile || md ? 'x mandatory' : undefined,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...campaignCarouselItemStyle(mobile, md),
                      minHeight: 480,
                      background: '#e8e8e8',
                      borderRadius: mobile ? 12 : 16,
                    }}
                  />
                ))
              : campaigns.map((c) => (
                  <div key={c.id} style={campaignCarouselItemStyle(mobile, md)}>
                    <CampaignCard campaign={c} mobile={mobile} />
                  </div>
                ))}
          </div>
        </CarouselNavButtons>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <ViewAllButton text="View All Campaigns" mobile={mobile} onClick={() => navigate('/campaigns')} />
      </div>
    </div>
  )
}
