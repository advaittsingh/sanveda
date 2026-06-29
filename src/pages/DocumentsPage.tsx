import { useEffect, useState } from 'react'
import { fetchCMS, getCMSSection } from '../api'
import { C } from '../constants/brand'
import PageHero from '../components/ui/PageHero'
import PageShell from '../components/ui/PageShell'
import { FileText, ExternalLink } from 'lucide-react'

export default function DocumentsPage() {
  const [docs, setDocs] = useState<{ title: string; image?: string | null; link?: string | null }[]>([])
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'Documents Section')
      if (section?.description) setDescription(section.description)
      setDocs(
        (section?.relatedCMS ?? [])
          .filter((s) => s.status === 1 || s.status === true)
          .map((s) => ({ title: s.title ?? '', image: s.image, link: s.link })),
      )
    }).catch(() => {})
  }, [])

  return (
    <>
      <div style={{ padding: '24px 0 0' }}>
        <PageHero label="Documents" title="Verified Documents" description={description || 'Access essential documents ensuring full transparency and trust.'} compact />
      </div>
      <PageShell bg={C.cream}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginTop: 32 }}>
          {docs.map((doc, i) => (
            <div key={i} style={{ background: C.white, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              {doc.image ? (
                <img src={doc.image} alt={doc.title} style={{ width: '100%', maxHeight: 160, objectFit: 'contain', marginBottom: 16 }} />
              ) : (
                <FileText size={48} color={C.gold} style={{ marginBottom: 16 }} />
              )}
              <h3 style={{ fontWeight: 700, fontSize: 15, color: C.primary, margin: '0 0 12px' }}>{doc.title}</h3>
              {doc.link && doc.link !== 'Optional' && (
                <a href={doc.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.secondary, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  View <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </PageShell>
    </>
  )
}
