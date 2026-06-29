import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCMS, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'
import { useBreakpoints } from '../hooks/useMediaQuery'
import { C } from '../constants/brand'
import { creamSectionStyle } from '../constants/sectionStyles'
import ViewAllButton from './ui/ViewAllButton'

export default function StartCampaign() {
  const navigate = useNavigate()
  const { mobile, md } = useBreakpoints()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [points, setPoints] = useState<string[]>([])
  const [link, setLink] = useState('/start-campaign')

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'Start New Campaign')
      if (section?.title) setTitle(section.title)
      if (section?.description) setDescription(section.description)
      if (section?.image) setImage(section.image)
      if (section?.link) setLink(section.link)
      setPoints(
        (section?.relatedCMS ?? [])
          .filter((s) => s.status === 1 || s.status === true)
          .map((s) => s.description)
          .filter(Boolean) as string[],
      )
    }).catch(() => {})
  }, [])

  const labelRow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: mobile ? 12 : 11 }}>
      <span style={{ fontFamily: md ? 'Red Hat Display' : 'Caveat', fontWeight: 700, fontSize: mobile ? 12 : 18, color: C.gold }}>
        Start New Campaign
      </span>
      <div style={{ width: mobile ? 30 : 46, height: 2, background: C.gold }} />
    </div>
  )

  return (
    <div style={{ ...creamSectionStyle(mobile), padding: mobile ? '26px 16px' : '60px 50px', position: 'relative' }}>
      <img src={ASSETS.pinkHearts} alt="" aria-hidden style={{ position: 'absolute', top: 10, right: 100, width: 48, display: mobile ? 'none' : 'block' }} />
      <img src={ASSETS.orangeSparks} alt="" aria-hidden style={{ position: 'absolute', bottom: 40, right: 34, width: 60, display: mobile ? 'none' : 'block' }} />

      {!md ? (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 65, alignItems: 'stretch' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ width: 520, height: 528, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={ASSETS.maskRedBox} alt="" style={{ position: 'absolute', width: '80%', height: '80%', zIndex: 1 }} />
              {image && (
                <img
                  src={image}
                  alt="Start campaign"
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', zIndex: 2, position: 'relative',
                    WebkitMaskImage: `url(${ASSETS.monthlyMaskDesign})`, WebkitMaskSize: '100% 100%',
                    maskImage: `url(${ASSETS.monthlyMaskDesign})`, maskSize: '100% 100%',
                  }}
                />
              )}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {labelRow}
            <h2 style={{ fontWeight: 800, fontSize: 36, lineHeight: 1.3, color: '#1F1F1F', margin: '0 0 10px', textTransform: 'capitalize' }}>{title}</h2>
            <p style={{ color: '#4A4A49', fontSize: 14, lineHeight: '24px', marginBottom: 30 }}>{description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
              {points.map((pt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={ASSETS.tick} alt="" width={19} height={19} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1F1F1F' }}>{pt}</span>
                </div>
              ))}
            </div>
            <ViewAllButton text="Start Campaign" onClick={() => navigate(link)} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {labelRow}
          <h2 style={{ fontWeight: 800, fontSize: mobile ? 20 : 28, color: '#1F1F1F', margin: '0 0 12px', textAlign: mobile ? 'center' : 'left', width: '100%', textTransform: 'capitalize' }}>{title}</h2>
          <p style={{ color: '#4A4A49', fontSize: 13, marginBottom: 20, width: '100%', textAlign: mobile ? 'center' : 'left' }}>{description}</p>
          {image && (
            <img src={image} alt="" style={{ width: '100%', maxWidth: 320, marginBottom: 20, borderRadius: 12 }} />
          )}
          <div style={{ width: '100%', marginBottom: 24 }}>
            {points.map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <img src={ASSETS.tick} alt="" width={16} height={16} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{pt}</span>
              </div>
            ))}
          </div>
          <ViewAllButton text="Start Campaign" mobile onClick={() => navigate(link)} />
        </div>
      )}
    </div>
  )
}
