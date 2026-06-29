import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCMS, getCMSSection } from '../api'
import { C } from '../constants/brand'
import PageHero from '../components/ui/PageHero'
import PageShell from '../components/ui/PageShell'
import HtmlContent from '../components/ui/HtmlContent'

export default function AboutPage() {
  const [hero, setHero] = useState({ title: '', subtitle: '', description: '', image: '' as string | null })
  const [sections, setSections] = useState<{ title: string; description: string; image?: string | null }[]>([])

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'about us hero section')
      if (section) {
        setHero({
          title: section.title ?? '',
          subtitle: section.sub_title ?? '',
          description: section.description ?? '',
          image: section.image ?? null,
        })
        setSections(
          (section.relatedCMS ?? [])
            .filter((s) => s.status === 1 || s.status === true)
            .map((s) => ({ title: s.title ?? '', description: s.description ?? s.sub_title ?? '', image: s.image })),
        )
      }
    }).catch(() => {})
  }, [])

  return (
    <>
      <div style={{ padding: '24px 0 0' }}>
        <PageHero title={hero.title || 'About Sanveda'} subtitle={hero.subtitle} description={hero.description} image={hero.image} />
      </div>
      <PageShell bg={C.white}>
        <div style={{ display: 'grid', gap: 32, marginTop: 32 }}>
          {sections.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: s.image ? '1fr 1fr' : '1fr',
                gap: 32,
                alignItems: 'center',
                background: i % 2 === 0 ? C.cream : C.grayBg,
                borderRadius: 20,
                padding: 32,
                border: `1px solid ${C.border}`,
              }}
            >
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 24, color: C.primary, margin: '0 0 12px' }}>{s.title}</h2>
                <HtmlContent html={s.description} />
              </div>
              {s.image && (
                <img src={s.image} alt={s.title} style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 280 }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/campaigns" className="btn-primary" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
            Explore Campaigns
          </Link>
        </div>
      </PageShell>
    </>
  )
}
