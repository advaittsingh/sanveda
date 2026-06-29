import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCMS, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import PageShell from '../components/ui/PageShell'
import ViewAllButton from '../components/ui/ViewAllButton'

export default function StartCampaignPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [points, setPoints] = useState<{ title: string; description: string }[]>([])

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'Start New Campaign')
      if (section?.title) setTitle(section.title)
      if (section?.description) setDescription(section.description)
      if (section?.image) setImage(section.image)
      setPoints(
        (section?.relatedCMS ?? [])
          .filter((s) => s.status === 1 || s.status === true)
          .map((s) => ({ title: s.title ?? '', description: s.description ?? s.sub_title ?? '' })),
      )
    }).catch(() => {})
  }, [])

  return (
    <PageShell bg={C.grayBg}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center', marginTop: 16 }}>
        <div>
          <p style={{ fontFamily: 'Caveat', fontWeight: 700, fontSize: 20, color: C.gold, margin: '0 0 8px' }}>Start New Campaign</p>
          <h1 style={{ fontWeight: 800, fontSize: 36, color: C.primary, margin: '0 0 16px', lineHeight: 1.2 }}>{title || 'Create Your Campaign'}</h1>
          <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.6, marginBottom: 28 }}>{description}</p>

          <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
            {points.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, background: C.white, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.gold, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: C.primary, margin: '0 0 4px' }}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>{p.description}</p>
                </div>
              </div>
            ))}
          </div>

          <ViewAllButton text="Start Your Campaign" onClick={() => navigate('/login')} />
        </div>

        <div style={{ position: 'relative' }}>
          <img
            src={image || ASSETS.startCampaign}
            alt="Start campaign"
            style={{ width: '100%', borderRadius: 24, objectFit: 'cover', maxHeight: 480, border: `3px solid ${C.gold}` }}
          />
        </div>
      </div>
    </PageShell>
  )
}
