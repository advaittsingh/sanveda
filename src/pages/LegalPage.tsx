import { useEffect, useState } from 'react'
import { fetchCMS, getCMSSection } from '../api'
import type { CMSItem } from '../types'
import { C } from '../constants/brand'
import PageHero from '../components/ui/PageHero'
import PageShell from '../components/ui/PageShell'
import HtmlContent from '../components/ui/HtmlContent'

interface Props {
  sectionName: string
  pageTitle: string
}

export default function LegalPage({ sectionName, pageTitle }: Props) {
  const [section, setSection] = useState<CMSItem | null>(null)

  useEffect(() => {
    fetchCMS().then((cms) => {
      setSection(getCMSSection(cms, sectionName) ?? null)
    }).catch(() => {})
  }, [sectionName])

  const blocks = (section?.relatedCMS ?? []).filter((s) => s.status === 1 || s.status === true)

  return (
    <>
      <div style={{ padding: '24px 0 0' }}>
        <PageHero
          title={section?.title || pageTitle}
          subtitle={section?.sub_title}
          description={section?.description}
          compact
        />
      </div>
      <PageShell bg={C.white}>
        <div style={{ maxWidth: 800, margin: '32px auto 0', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {blocks.map((block) => (
            <div key={block.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 24 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: C.primary, margin: '0 0 16px' }}>{block.title}</h2>
              <HtmlContent html={block.description ?? ''} />
            </div>
          ))}
        </div>
      </PageShell>
    </>
  )
}
