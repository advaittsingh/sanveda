import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCMS, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'
import { useBreakpoints } from '../hooks/useMediaQuery'
import { C } from '../constants/brand'
import { creamSectionStyle } from '../constants/sectionStyles'
import ViewAllButton from './ui/ViewAllButton'

const STEP_ICONS = [ASSETS.tap, ASSETS.greenRupee, ASSETS.creditCard, ASSETS.notification] as const

const DEFAULT_STEPS = [
  'Choose a mission of your choice',
  'Choose the amount you would like to donate every month',
  'Your donations will automatically be deducted monthly',
  'You will receive regular updates about your donations',
]

function MaskedImage({ src, mask, style }: { src: string; mask: string; style: React.CSSProperties }) {
  return (
    <div
      style={{
        ...style,
        WebkitMaskImage: `url(${mask})`,
        WebkitMaskSize: '100% 100%',
        maskImage: `url(${mask})`,
        maskSize: '100% 100%',
        overflow: 'hidden',
      }}
    >
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

export default function DonateMonthly() {
  const navigate = useNavigate()
  const { mobile, md } = useBreakpoints()
  const [title, setTitle] = useState('How Can You Donate Monthly?')
  const [steps, setSteps] = useState(DEFAULT_STEPS)
  const [images, setImages] = useState({ image1: '', image2: '', image3: '' })
  const [link, setLink] = useState('/donate-monthly')

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'Donate Monthly')
      if (section?.title) setTitle(section.title)
      if (section?.link) setLink(section.link)
      const related = (section?.relatedCMS ?? []).filter((s) => s.status === 1 || s.status === true)
      const descriptions = related
        .slice(0, 4)
        .map((s) => s.description || s.sub_title || s.title || '')
        .filter(Boolean)
      if (descriptions.length) {
        setSteps(descriptions)
      }
      const imgItem = related.find((s) => s.image || s.image2 || s.image3)
      if (imgItem) {
        setImages({
          image1: imgItem.image || '',
          image2: imgItem.image2 || '',
          image3: imgItem.image3 || '',
        })
      }
    }).catch(() => {})
  }, [])

  const masks = [ASSETS.donateMonthlyMask1, ASSETS.donateMonthlyMask2, ASSETS.donateMonthlyMask3]
  const imgs = [images.image1, images.image2, images.image3]

  const labelRow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: mobile ? 12 : 11 }}>
      <span style={{ fontFamily: md ? 'Red Hat Display' : 'Caveat', fontWeight: 700, fontSize: mobile ? 12 : 18, color: C.gold }}>
        Donate Monthly
      </span>
      <div style={{ width: mobile ? 30 : 46, height: 2, background: C.gold }} />
    </div>
  )

  const imageCollage = (
    <div
      style={{
        position: 'relative',
        width: mobile ? '100%' : 520,
        maxWidth: mobile ? 360 : 520,
        height: mobile ? 320 : 480,
        flexShrink: 0,
        margin: mobile ? '0 auto 28px' : 0,
      }}
    >
      {imgs[0] && (
        <MaskedImage
          src={imgs[0]}
          mask={masks[0]}
          style={{
            position: 'absolute',
            top: mobile ? 24 : 36,
            left: 0,
            width: mobile ? 200 : 280,
            height: mobile ? 260 : 380,
            zIndex: 2,
          }}
        />
      )}
      {imgs[1] && (
        <MaskedImage
          src={imgs[1]}
          mask={masks[1]}
          style={{
            position: 'absolute',
            top: 0,
            right: mobile ? 0 : 10,
            width: mobile ? 140 : 200,
            height: mobile ? 100 : 140,
            zIndex: 3,
          }}
        />
      )}
      {imgs[2] && (
        <MaskedImage
          src={imgs[2]}
          mask={masks[2]}
          style={{
            position: 'absolute',
            bottom: mobile ? 10 : 30,
            right: mobile ? 10 : 24,
            width: mobile ? 130 : 170,
            height: mobile ? 100 : 130,
            zIndex: 3,
          }}
        />
      )}
    </div>
  )

  const stepsList = (
    <div style={{ position: 'relative', marginBottom: mobile ? 28 : 36 }}>
      {steps.length > 1 && (
        <div
          style={{
            position: 'absolute',
            left: mobile ? 27 : 29,
            top: 56,
            bottom: 56,
            width: 2,
            borderLeft: `2px dashed ${C.gold}`,
            zIndex: 0,
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 20 : 28 }}>
        {steps.slice(0, 4).map((description, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: mobile ? 14 : 18, position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: mobile ? 52 : 60,
                height: mobile ? 52 : 60,
                borderRadius: mobile ? 14 : 16,
                background: '#F5F8ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src={STEP_ICONS[idx] ?? STEP_ICONS[0]}
                alt=""
                style={{ width: mobile ? 26 : 30, height: mobile ? 26 : 30, objectFit: 'contain' }}
              />
            </div>
            <div style={{ paddingTop: mobile ? 4 : 6 }}>
              <p
                style={{
                  fontFamily: 'Red Hat Display, sans-serif',
                  fontWeight: 500,
                  fontSize: mobile ? 12 : 14,
                  lineHeight: '100%',
                  color: '#797E88',
                  margin: `0 0 ${mobile ? 4 : 6}px`,
                  textTransform: 'capitalize',
                }}
              >
                Step {idx + 1}
              </p>
              <p
                style={{
                  fontFamily: 'Red Hat Display, sans-serif',
                  fontWeight: 600,
                  fontSize: mobile ? 13 : 15,
                  lineHeight: mobile ? '20px' : '22px',
                  letterSpacing: '-0.02em',
                  color: '#1D1D1B',
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div
      style={{
        ...creamSectionStyle(mobile, {
          margin: mobile ? '48px auto' : '72px auto',
          padding: mobile ? '26px 16px' : '60px 50px',
        }),
      }}
    >
      {!md ? (
        <div style={{ display: 'flex', flexDirection: 'row', gap: mobile ? 0 : 65, alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {imageCollage}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {labelRow}
            <h2
              style={{
                fontWeight: 800,
                fontSize: mobile ? 24 : 36,
                lineHeight: 1.3,
                color: '#1F1F1F',
                margin: '0 0 28px',
                textTransform: 'capitalize',
                fontFamily: 'Red Hat Display, sans-serif',
              }}
            >
              {title}
            </h2>
            {stepsList}
            <ViewAllButton text="Donate Now Monthly" mobile={mobile} onClick={() => navigate(link)} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: mobile ? 'center' : 'flex-start' }}>
          {labelRow}
          <h2
            style={{
              fontWeight: 800,
              fontSize: mobile ? 20 : 28,
              lineHeight: 1.3,
              color: '#1F1F1F',
              margin: '0 0 24px',
              textAlign: mobile ? 'center' : 'left',
              width: '100%',
              textTransform: 'capitalize',
              fontFamily: 'Red Hat Display, sans-serif',
            }}
          >
            {title}
          </h2>
          {imageCollage}
          <div style={{ width: '100%' }}>{stepsList}</div>
          <ViewAllButton text="Donate Now Monthly" mobile onClick={() => navigate(link)} />
        </div>
      )}
    </div>
  )
}
